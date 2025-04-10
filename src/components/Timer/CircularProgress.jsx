import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const CircularProgress = ({ timeLeft, totalTime, isBreak }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progress = 1 - timeLeft / totalTime;
  
  // Adjust sizes based on screen size
  const size = isMobile ? 180 : 200;
  const radius = isMobile ? 80 : 90;
  const strokeWidth = isMobile ? 12 : 15;
  const fontSize = isMobile ? 'h5' : 'h4';
  
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const progressColor = isBreak ? theme.palette.secondary.main : theme.palette.primary.main;
  
  return (
    <Box sx={{ 
      position: 'relative', 
      width: size, 
      height: size, 
      margin: 'auto', 
      mb: 2 
    }}>
      <motion.svg
        width={size}
        height={size}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={theme.palette.mode === 'dark' ? '#333' : '#eee'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
      <Typography
        variant={fontSize}
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          fontWeight: 'bold'
        }}
      >
        {timeString}
      </Typography>
    </Box>
  );
};

export default CircularProgress;