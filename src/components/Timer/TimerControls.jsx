import React from 'react';
import { Box, Button, ButtonGroup, Chip, useTheme, useMediaQuery } from '@mui/material';
import { PlayArrow, Pause, Refresh, Coffee, TimerOutlined } from '@mui/icons-material';

const TimerControls = ({ isRunning, isBreak, startTimer, pauseTimer, resetTimer, skipToBreak, skipToWork, cycles }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* On mobile, stack buttons vertically */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {!isRunning ? (
            <Button 
              onClick={startTimer} 
              startIcon={<PlayArrow />} 
              color="success" 
              variant="contained" 
              size="large"
              fullWidth
            >
              Start
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              startIcon={<Pause />} 
              color="warning" 
              variant="contained" 
              size="large"
              fullWidth
            >
              Pause
            </Button>
          )}
          <Button 
            onClick={resetTimer} 
            startIcon={<Refresh />} 
            color="error" 
            variant="contained" 
            size="large"
            fullWidth
          >
            Reset
          </Button>
          {isBreak ? (
            <Button 
              onClick={skipToWork} 
              startIcon={<TimerOutlined />} 
              variant="contained" 
              size="large"
              fullWidth
            >
              Skip to Work
            </Button>
          ) : (
            <Button 
              onClick={skipToBreak} 
              startIcon={<Coffee />} 
              variant="contained" 
              size="large"
              fullWidth
            >
              Skip to Break
            </Button>
          )}
        </Box>
      ) : (
        /* On desktop, use ButtonGroup */
        <ButtonGroup 
          variant="contained" 
          size="large" 
          sx={{ mb: 2 }}
        >
          {!isRunning ? (
            <Button onClick={startTimer} startIcon={<PlayArrow />} color="success">
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} startIcon={<Pause />} color="warning">
              Pause
            </Button>
          )}
          <Button onClick={resetTimer} startIcon={<Refresh />} color="error">
            Reset
          </Button>
          {isBreak ? (
            <Button onClick={skipToWork} startIcon={<TimerOutlined />}>
              Skip to Work
            </Button>
          ) : (
            <Button onClick={skipToBreak} startIcon={<Coffee />}>
              Skip to Break
            </Button>
          )}
        </ButtonGroup>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Chip
          label={isBreak ? 'Break Time' : 'Work Time'}
          color={isBreak ? 'secondary' : 'primary'}
          icon={isBreak ? <Coffee /> : <TimerOutlined />}
        />
        <Chip label={`Cycles: ${cycles}`} variant="outlined" />
      </Box>
    </Box>
  );
};

export default TimerControls;