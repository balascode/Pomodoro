import React from 'react';
import { Box, Button, ButtonGroup, Chip } from '@mui/material';
import { PlayArrow, Pause, Refresh, Coffee, TimerOutlined } from '@mui/icons-material';

const TimerControls = ({ isRunning, isBreak, startTimer, pauseTimer, resetTimer, skipToBreak, skipToWork, cycles }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <ButtonGroup variant="contained" size="large" sx={{ mb: 2 }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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