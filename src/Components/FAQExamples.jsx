import React, { useState, useEffect } from "react";
import { TEXT, CHAT_LEFT_PANEL_BACKGROUND, primary_50 } from "../utilities/constants";
import { useLanguage } from "../utilities/LanguageContext"; // Adjust the import path
import { Box, Button, Grid, Typography} from "@mui/material";
import Glass from "../Assets/search_glass.png";
import Phone from "../Assets/phone.png";
import Card from "../Assets/card.png";
import Clock from "../Assets/clock.png";
import People from "../Assets/people.png";
import Cog from "../Assets/cog.png";


const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const FAQExamples = ({ onPromptClick }) => {
  const { language } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    // Shuffle FAQs on initial render
    const shuffledFAQs = shuffleArray([...TEXT[language].FAQS]).slice(0, 6);
    const shuffledIcons = shuffleArray([Glass, Phone, Card, Clock, People, Cog]).slice(0, 6);
    setFaqs(shuffledFAQs);
    setIcons(shuffledIcons);
  }, [language]);

  // Utility function to darken a hex color
const darkenColor = (hex, percent) => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each channel
  r = Math.floor(r * (1 - percent / 100));
  g = Math.floor(g * (1 - percent / 100));
  b = Math.floor(b * (1 - percent / 100));
  
  // Convert back to hex
  r = r.toString(16).padStart(2, '0');
  g = g.toString(16).padStart(2, '0');
  b = b.toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
};

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-end" minHeight="65vh">
      <Grid container spacing={2} maxWidth="1100px">
        {faqs.map((prompt, index) => (
          <Grid item key={index} xs={12} sm={4}>
            <Button
              variant="contained"
              size="large"
              onClick={() => onPromptClick(prompt)}
              sx={{
                width: "100%",
                height: "140px",
                textTransform: "none",
                backgroundColor: CHAT_LEFT_PANEL_BACKGROUND,
                color: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "stretch",
                padding: "16px",
                position: "relative",
                '&:hover': {
                  backgroundColor: darkenColor(CHAT_LEFT_PANEL_BACKGROUND, 15),
                },
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    textAlign: 'left', 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    paddingRight: '40px', // Make space for the icon
                  }}
                >
                  {prompt}
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 32,
                    height: 32,
                  }}
                >
                  <img 
                    src={icons[index]} 
                    alt={`icon`} 
                    style={{ 
                      width: '115%', 
                      height: '115%', 
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              </Box>
              <Box sx={{
                backgroundColor: darkenColor(primary_50, 7), //TODO change
                padding: '8px 12px',
                borderRadius: '8px',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: 'auto'
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                  }}
                >
                  Chat with Horizon
                </Typography>
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FAQExamples;
