import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const CircularProgress = ({ timeLeft, totalTime, isBreak }) => {
  const theme = useTheme();
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progress = 1 - timeLeft / totalTime;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const progressColor = isBreak ? theme.palette.secondary.main : theme.palette.primary.main;

  return (
    <Box sx={{ position: 'relative', width: 200, height: 200, margin: 'auto', mb: 2 }}>
      <motion.svg
        width="200"
        height="200"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={theme.palette.mode === 'dark' ? '#333' : '#eee'}
          strokeWidth="15"
          fill="none"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke={progressColor}
          strokeWidth="15"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>
      <Typography
        variant="h4"
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        {timeString}
      </Typography>
    </Box>
  );
};

export default CircularProgress;