import React, { useState, useEffect, useRef } from "react";
import { Grid, Avatar, Typography } from "@mui/material";
import BotAvatar from "../Assets/BotAvatar.svg";
import { WEBSOCKET_API, ALLOW_MARKDOWN_BOT } from "../utilities/constants";
import ReactMarkdown from "react-markdown";

const StreamingMessage = ({ 
  initialMessage, 
  setProcessing, 
  messageList, 
  setMessageList,
  language = "auto" // Add default language parameter
}) => {
  console.log("Start of message stream");
  console.log(initialMessage);
  const [responses, setResponses] = useState([]);
  const ws = useRef(null);
  const messageBuffer = useRef(""); // Buffer to hold incomplete JSON strings
  const fullMessage = useRef(""); // Ref to hold the full message

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket(WEBSOCKET_API);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      console.log(initialMessage);
      
      // Format history to match Svelte implementation's format
      const formattedHistory = messageList.reduce((acc, message, index, array) => {
        // Skip every other message to pair user/bot messages
        if (index % 2 === 0 && index < array.length - 1) {
          acc.push({
            user: message.message,
            bot: array[index + 1].message
          });
        }
        return acc;
      }, []);
      
      // Send with updated format to match Svelte implementation
      ws.current.send(JSON.stringify({
        action: "sendMessage",
        prompt: initialMessage,
        language: language, // Add language parameter
        chatHistory: formattedHistory // Renamed and reformatted history
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        messageBuffer.current += event.data; // Append new data to buffer
        const parsedData = JSON.parse(messageBuffer.current); // Try to parse the full buffer

        // Add handling for start messages
        if (parsedData.type === "start" || parsedData.type === "content_block_start") {
          // Reset the message accumulation when a new message starts
          fullMessage.current = "";
          setResponses([]);
        }

        if (parsedData.type === "delta") {
          setResponses((prev) => {
            const newResponses = [...prev, parsedData.text];
            fullMessage.current = newResponses.join(""); // Update the full message
            return newResponses;
          });
        }

        // Handle both end message types
        if (parsedData.type === "end" || parsedData.type === "content_block_stop") {
          setProcessing(false); // Set processing to false when parsing is complete
          console.log("end of conversation");
          // Update the state of messages from "PROCESSING" to "SENT"
          setMessageList(prevMessageList =>
            prevMessageList.map(msg =>
              msg.state === "PROCESSING" ?
                {
                  ...msg,
                  state: "FINISHED",
                  message: fullMessage.current // Use the full message stored in the ref
                } : msg
            )
          );
        }

        // Update the previous data type
        messageBuffer.current = ""; // Clear buffer on successful parse
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log("Received incomplete JSON, waiting for more data...");
        } else {
          console.error("Error processing message: ", e);
          messageBuffer.current = ""; // Clear buffer if error is not related to JSON parsing
        }
      }
    };

    ws.current.onerror = (error) => {
      console.log("WebSocket Error: ", error);
    };

    ws.current.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.log("WebSocket Disconnected unexpectedly");
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [initialMessage, setProcessing, messageList, setMessageList, language]);

  return (
    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
      <Grid item>
        <Avatar alt="Bot Avatar" src={BotAvatar} />
      </Grid>
      {ALLOW_MARKDOWN_BOT ? (
        <Grid item className="botMessage" sx={{ backgroundColor: (theme) => theme.palette.background.botMessage }}>
          <ReactMarkdown>{responses.join("")}</ReactMarkdown>
        </Grid>
      ) : (
        <Grid item className="botMessage" sx={{ backgroundColor: (theme) => theme.palette.background.botMessage }}>
          <Typography variant="body2">{responses.join("")}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default StreamingMessage;