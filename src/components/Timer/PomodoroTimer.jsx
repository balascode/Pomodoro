import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Card, Alert, FormControl, Select, MenuItem, Grid, useTheme, useMediaQuery, InputLabel } from '@mui/material';
import { motion } from 'framer-motion';
import CircularProgress from './CircularProgress';
import TimerControls from './TimerControls';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const PomodoroTimer = ({ onCycleComplete }) => {
  const { currentUser } = useAuth();
  const [workDuration, setWorkDuration] = useState(() => 25 * 60); // Seconds
  const [breakDuration, setBreakDuration] = useState(() => 5 * 60); // Seconds
  const [timeLeft, setTimeLeft] = useState(() => 25 * 60); // Seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [alert, setAlert] = useState(null);
  const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null); // Tracks when the timer started
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const audioBufferRef = useRef(null);
  const audioElementRef = useRef(new Audio('/notification.mp3'));
  const isMounted = useRef(false);
  const lastPlayTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Format time from seconds to MM:SS (like graph.html)
  const formatTime = useCallback((seconds) => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secondsStr = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${secondsStr}`;
  }, []);

  // Save cycle to Firebase
  const saveCycle = useCallback(async (cycleCount) => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'users', currentUser.uid, 'stats', today);

    try {
      const statsDoc = await getDoc(statsRef);
      const currentCycles = statsDoc.exists() ? statsDoc.data().cycles || 0 : 0;
      const newCycles = currentCycles + 1;

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

      if (isMounted.current) {
        setCycles(newCycles);
        setGraphRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving cycle:', error);
    }
  }, [currentUser, workDuration, breakDuration]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (isPlayingRef.current) {
      console.log('Sound already playing, skipping');
      return;
    }
    isPlayingRef.current = true;
    lastPlayTimeRef.current = Date.now();
    console.log('Attempting to play sound...');

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('New AudioContext created, state:', audioContextRef.current.state);
        if (audioBufferRef.current) {
          fetch('/notification.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
            .then(buffer => {
              audioBufferRef.current = buffer;
              playBufferedSound();
            })
            .catch(error => {
              console.error('Error reloading audio buffer:', error);
              playFallbackSound();
            });
          return;
        }
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
          .then(() => {
            console.log('AudioContext resumed');
            playBufferedSound();
          })
          .catch(err => {
            console.error('Failed to resume AudioContext:', err);
            playFallbackSound();
          });
        return;
      }

      if (audioBufferRef.current) {
        playBufferedSound();
      } else {
        playFallbackSound();
      }
    } catch (error) {
      console.error('Error in playNotificationSound:', error);
      playFallbackSound();
    }

    function playBufferedSound() {
      try {
        audioSourceRef.current = audioContextRef.current.createBufferSource();
        audioSourceRef.current.buffer = audioBufferRef.current;
        audioSourceRef.current.connect(audioContextRef.current.destination);
        console.log('Starting buffered sound, duration:', audioBufferRef.current.duration, 'AudioContext state:', audioContextRef.current.state);
        audioSourceRef.current.start(0);
        audioSourceRef.current.onended = () => {
          console.log('Buffered sound playback completed naturally');
          isPlayingRef.current = false;
          audioSourceRef.current = null;
        };
      } catch (error) {
        console.error('Error playing buffered sound:', error);
        isPlayingRef.current = false;
        playFallbackSound();
      }
    }

    function playFallbackSound() {
      console.log('Attempting to play fallback audio');
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.play()
          .then(() => {
            console.log('Fallback audio playing, duration:', audioElementRef.current.duration);
            audioElementRef.current.onended = () => {
              console.log('Fallback audio playback completed');
              isPlayingRef.current = false;
            };
          })
          .catch(err => {
            console.error('Fallback audio play failed:', err);
            isPlayingRef.current = false;
          });
      } else {
        console.warn('No audio buffer or fallback available');
        isPlayingRef.current = false;
      }
    }
  }, []);

  // Timer logic (inspired by graph.html)
  useEffect(() => {
    if (!isRunning) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const durationMs = (isBreak ? breakDuration : workDuration) * 1000;
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const remainingSeconds = Math.floor(remainingMs / 1000); // Ensure integer seconds

      setTimeLeft(remainingSeconds);

      if (remainingMs <= 0) {
        clearInterval(timerRef.current);
        setIsRunning(false);

        if (!isBreak) {
          // Work session ended
          setCycles(prev => {
            const newCycles = prev + 1;
            saveCycle(newCycles);
            if (onCycleComplete && typeof onCycleComplete === 'function') {
              setTimeout(() => onCycleComplete(newCycles, graphRefreshTrigger), 0);
            }
            return newCycles;
          });
          setAlert({ type: 'success', message: 'Work session done! Take a break.' });
          setIsBreak(true);
          setTimeLeft(breakDuration);
          console.log('Work session completed, starting break');
          playNotificationSound();
        } else {
          // Break ended
          setAlert({ type: 'info', message: 'Break over! Back to work.' });
          setIsBreak(false);
          setTimeLeft(workDuration);
          console.log('Break completed, starting work');
          playNotificationSound();
        }
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak, workDuration, breakDuration, saveCycle, onCycleComplete, graphRefreshTrigger, playNotificationSound]);

  // Load settings and stats
  useEffect(() => {
    let mounted = true;
    const loadSettingsAndStats = async () => {
      if (!currentUser || !mounted) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && mounted) {
          const settings = userDoc.data().settings || {};
          const newWorkDuration = settings.workDuration || 25 * 60;
          const newBreakDuration = settings.breakDuration || 5 * 60;
          setWorkDuration(newWorkDuration);
          setBreakDuration(newBreakDuration);
          setTimeLeft(isBreak ? newBreakDuration : newWorkDuration);
        }
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

    return () => {
      mounted = false;
    };
  }, [currentUser, isBreak]);

  // Mount/unmount cleanup
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      clearInterval(timerRef.current);

      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
        audioSourceRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().then(() => {
          console.log('AudioContext closed on unmount');
        }).catch(err => {
          console.error('Error closing audio context on unmount:', err);
        });
      }
    };
  }, []);

  // Load audio
  useEffect(() => {
    let mounted = true;
    const loadAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          console.log('AudioContext created, state:', audioContextRef.current.state);
        }
        const response = await fetch('/notification.mp3');
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        console.log('Audio buffer loaded successfully, size:', audioBufferRef.current.length, 'duration:', audioBufferRef.current.duration);
        audioElementRef.current.preload = 'auto';
        await new Promise((resolve) => {
          const canPlayHandler = () => {
            resolve();
            audioElementRef.current.removeEventListener('canplaythrough', canPlayHandler);
          };
          audioElementRef.current.addEventListener('canplaythrough', canPlayHandler);
          audioElementRef.current.load();
        });
        console.log('Fallback audio element ready, duration:', audioElementRef.current.duration);
        if (mounted) setAudioLoaded(true);
      } catch (error) {
        console.error('Error loading audio:', error);
        try {
          audioElementRef.current.preload = 'auto';
          await audioElementRef.current.load();
          console.log('Fallback audio element preloaded and loaded, duration:', audioElementRef.current.duration);
          if (mounted) setAudioLoaded(true);
        } catch (fallbackError) {
          console.error('Fallback audio loading also failed:', fallbackError);
        }
      }
    };

    loadAudio();

    return () => {
      mounted = false;
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
        audioSourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().then(() => {
          console.log('AudioContext closed');
        }).catch(err => {
          console.error('Error closing AudioContext:', err);
        });
      }
    };
  }, []);

  // Timer control functions
  const startTimer = () => {
    if (!isRunning) {
      clearInterval(timerRef.current);
      startTimeRef.current = Date.now();
      setIsRunning(true);
      setAlert(null);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('Audio context resumed on start');
        }).catch(err => {
          console.error('Failed to resume audio context on start:', err);
        });
      }
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      const elapsedMs = Date.now() - startTimeRef.current;
      const durationMs = (isBreak ? breakDuration : workDuration) * 1000;
      const remainingSeconds = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
      setTimeLeft(remainingSeconds);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    setAlert(null);
    startTimeRef.current = null;
  };

  const skipToBreak = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(breakDuration);
    startTimeRef.current = null;
    setAlert(null);
  };

  const skipToWork = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    startTimeRef.current = null;
    setAlert(null);
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
        settings: { ...{ workDuration, breakDuration, soundEnabled: true }, ...updates },
      });
    }
  };

  return (
    <Card sx={{ p: isMobile ? 2 : 3, borderRadius: 3, mb: 4 }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} align="center" gutterBottom>
          Pomodoro Technique
        </Typography>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel id="work-duration-label">Work</InputLabel>
              <Select
                labelId="work-duration-label"
                value={workDuration || 25 * 60}
                label="Work"
                onChange={(e) => setCustomWorkTime(Number(e.target.value) || 25 * 60)}
                disabled={isRunning}
              >
                <MenuItem value={25 * 60}>25 min</MenuItem>
                <MenuItem value={30 * 60}>30 min</MenuItem>
                <MenuItem value={60 * 60}>1 hr</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel id="break-duration-label">Break</InputLabel>
              <Select
                labelId="break-duration-label"
                value={breakDuration || 5 * 60}
                label="Break"
                onChange={(e) => setCustomBreakTime(Number(e.target.value) || 5 * 60)}
                disabled={isRunning}
              >
                <MenuItem value={5 * 60}>5 min</MenuItem>
                <MenuItem value={10 * 60}>10 min</MenuItem>
                <MenuItem value={15 * 60}>15 min</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <CircularProgress
          timeLeft={timeLeft} // For progress calculations
          formattedTime={formatTime(timeLeft)} // For display (MM:SS)
          totalTime={isBreak ? breakDuration : workDuration}
          isBreak={isBreak}
        />

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