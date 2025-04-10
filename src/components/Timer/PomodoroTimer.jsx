import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Card, Alert, ButtonGroup, Button, FormControl, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import CircularProgress from './CircularProgress';
import TimerControls from './TimerControls';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const PomodoroTimer = ({ onCycleComplete }) => {
  const { currentUser } = useAuth();
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [alert, setAlert] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));
  const isMounted = useRef(false); // Flag to track if component is mounted

  useEffect(() => {
    let mounted = true; // Local mounted flag for cleanup
    const loadSettingsAndStats = async () => {
      if (!currentUser || !mounted) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && mounted) {
          const settings = userDoc.data().settings;
          setWorkDuration(settings.workDuration);
          setBreakDuration(settings.breakDuration);
          setTimeLeft(settings.workDuration);
          audioRef.current.muted = !settings.soundEnabled;
        }

        // Load existing stats for today
        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(db, 'users', currentUser.uid, 'stats', today);
        const statsDoc = await getDoc(statsRef);
        if (statsDoc.exists() && mounted) {
          setCycles(statsDoc.data().cycles || 0);
        }
      } catch (error) {
        console.error('Error loading settings or stats:', error.message);
      }
    };

    loadSettingsAndStats();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [currentUser]); // Only re-run when currentUser changes

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            audioRef.current.play().catch((err) => console.error('Audio play failed:', err));
            if (!isBreak) {
              setCycles((prev) => {
                const newCycles = prev + 1;
                saveCycle(newCycles);
                if (onCycleComplete && typeof onCycleComplete === 'function') {
                  onCycleComplete(newCycles); // Call parent callback safely
                }
                return newCycles;
              });
              setAlert({ type: 'success', message: 'Work session done! Take a break.' });
              setIsBreak(true);
              return breakDuration;
            } else {
              setAlert({ type: 'info', message: 'Break over! Back to work.' });
              setIsBreak(false);
              return workDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak, workDuration, breakDuration, onCycleComplete]);

  const saveCycle = async (cycleCount) => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'users', currentUser.uid, 'stats', today);
    const statsDoc = await getDoc(statsRef);
    const currentCycles = statsDoc.exists() ? statsDoc.data().cycles || 0 : 0;
    const newCycles = currentCycles + 1; // Increment the existing cycles

    if (statsDoc.exists()) {
      await updateDoc(statsRef, {
        cycles: newCycles,
        lastUpdated: new Date(),
      });
    } else {
      await setDoc(statsRef, {
        date: today,
        cycles: newCycles,
        workDuration: workDuration / 60,
        breakDuration: breakDuration / 60,
        createdAt: new Date(),
        lastUpdated: new Date(),
      });
    }
    if (isMounted.current) setCycles(newCycles); // Update state only if mounted
  };

  const startTimer = () => {
    setIsRunning(true);
    setAlert(null);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    setAlert(null);
  };

  const skipToBreak = () => {
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(breakDuration);
  };

  const skipToWork = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
  };

  const setCustomWorkTime = (seconds) => {
    if (!isRunning) {
      setWorkDuration(seconds);
      if (!isBreak) setTimeLeft(seconds);
      updateSettings({ workDuration: seconds });
    }
  };

  const setCustomBreakTime = (seconds) => {
    if (!isRunning) {
      setBreakDuration(seconds);
      if (isBreak) setTimeLeft(seconds);
      updateSettings({ breakDuration: seconds });
    }
  };

  const updateSettings = async (updates) => {
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        settings: { ...{ workDuration, breakDuration, soundEnabled: !audioRef.current.muted }, ...updates },
      });
    }
  };

  // Set mounted flag after initial render
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <Card sx={{ p: 3, borderRadius: 3, mb: 4 }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Pomodoro Technique
        </Typography>
        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={workDuration}
              onChange={(e) => setCustomWorkTime(e.target.value)}
              disabled={isRunning}
            >
              <MenuItem value={25 * 60}>25 min</MenuItem>
              <MenuItem value={30 * 60}>30 min</MenuItem>
              <MenuItem value={60 * 60}>1 hr</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={breakDuration}
              onChange={(e) => setCustomBreakTime(e.target.value)}
              disabled={isRunning}
            >
              <MenuItem value={5 * 60}>5 min</MenuItem>
              <MenuItem value={10 * 60}>10 min</MenuItem>
              <MenuItem value={15 * 60}>15 min</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <CircularProgress timeLeft={timeLeft} totalTime={isBreak ? breakDuration : workDuration} isBreak={isBreak} />
        <TimerControls
          isRunning={isRunning}
          isBreak={isBreak}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resetTimer={resetTimer}
          skipToBreak={skipToBreak}
          skipToWork={skipToWork}
          cycles={cycles}
        />
      </motion.div>
    </Card>
  );
};

export default PomodoroTimer;