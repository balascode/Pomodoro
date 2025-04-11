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
  const [workDuration, setWorkDuration] = useState(() => 25 * 60); // Ensure initial value
  const [breakDuration, setBreakDuration] = useState(() => 5 * 60); // Ensure initial value
  const [timeLeft, setTimeLeft] = useState(() => 25 * 60); // Initialize with default
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [alert, setAlert] = useState(null);
  const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null); // For Web Audio API
  const audioSourceRef = useRef(null); // For audio source
  const audioBufferRef = useRef(null); // For preloaded audio data
  const audioElementRef = useRef(new Audio('/notification.mp3')); // Fallback audio element
  const isMounted = useRef(false);
  const startTimeRef = useRef(null); // Track when the timer started
  const lastPlayTimeRef = useRef(0); // To debounce play calls
  const isPlayingRef = useRef(false); // Lock to prevent concurrent plays
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const loadAudio = async () => {
      try {
        // Create AudioContext if needed
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          console.log('AudioContext created, state:', audioContextRef.current.state);
        }
        
        // Load audio into buffer with primary method
        const response = await fetch('/notification.mp3');
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        console.log('Audio buffer loaded successfully, size:', audioBufferRef.current.length, 'duration:', audioBufferRef.current.duration);
        
        // Also set up fallback audio element
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
        
        setAudioLoaded(true);
      } catch (error) {
        console.error('Error loading audio:', error);
        // If Web Audio API fails, rely solely on audio element
        try {
          audioElementRef.current.preload = 'auto';
          await audioElementRef.current.load();
          console.log('Fallback audio element preloaded and loaded, duration:', audioElementRef.current.duration);
          setAudioLoaded(true);
        } catch (fallbackError) {
          console.error('Fallback audio loading also failed:', fallbackError);
        }
      }
    };

    loadSettingsAndStats();
    loadAudio();

    // Cleanup
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
    };
  }, [currentUser, isBreak]);

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

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    if (isPlayingRef.current || now - lastPlayTimeRef.current < 2000) return; // Increased debounce to 2s
    isPlayingRef.current = true;
    lastPlayTimeRef.current = now;

    console.log('Attempting to play sound...');
    
    try {
      // Create AudioContext if it doesn't exist or if it was closed
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
      
      // Resume AudioContext if it's suspended
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
      
      // Play sound with primary method if buffer exists
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
        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.stop();
            console.log('Stopped previous audio source');
          } catch (err) {
            console.log('No previous audio source to stop or already stopped');
          }
        }
        
        audioSourceRef.current = audioContextRef.current.createBufferSource();
        audioSourceRef.current.buffer = audioBufferRef.current;
        audioSourceRef.current.connect(audioContextRef.current.destination);
        audioSourceRef.current.start(0);
        console.log('Playing sound with buffer, duration:', audioBufferRef.current.duration, 'AudioContext state:', audioContextRef.current.state);
        // Unlock playing state after duration
        setTimeout(() => { isPlayingRef.current = false; }, audioBufferRef.current.duration * 1000);
      } catch (error) {
        console.error('Error playing buffered sound:', error);
        isPlayingRef.current = false;
        playFallbackSound();
      }
    }
    
    function playFallbackSound() {
      console.log('Attempting to play fallback audio');
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = 0; // Reset to start
        audioElementRef.current.play()
          .then(() => {
            console.log('Fallback audio playing, duration:', audioElementRef.current.duration);
            setTimeout(() => { isPlayingRef.current = false; }, audioElementRef.current.duration * 1000);
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        clearInterval(timerRef.current);
        startTimeRef.current = Date.now() - ((workDuration + breakDuration - timeLeft) * 1000);
        console.log('Tab hidden, timer paused');
      } else if (isRunning && startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newTimeLeft = Math.max(0, (isBreak ? breakDuration : workDuration) - elapsed);
        setTimeLeft(newTimeLeft);
        console.log('Tab visible, elapsed:', elapsed, 'newTimeLeft:', newTimeLeft);

        if (newTimeLeft <= 0) {
          playNotificationSound();
          if (!isBreak) {
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
          } else {
            setAlert({ type: 'info', message: 'Break over! Back to work.' });
            setIsBreak(false);
            setTimeLeft(workDuration);
            console.log('Break completed, starting work');
          }
        }

        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              playNotificationSound();
              if (!isBreak) {
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
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            playNotificationSound();
            if (!isBreak) {
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timerRef.current);
    };
  }, [isRunning, isBreak, workDuration, breakDuration, onCycleComplete, saveCycle, graphRefreshTrigger, playNotificationSound]);

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
          audioContextRef.current = null;
        }).catch(err => {
          console.error('Error closing audio context on unmount:', err);
        });
      }
    };
  }, []);

  const startTimer = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - ((workDuration + breakDuration - timeLeft) * 1000);
      setIsRunning(true);
      setAlert(null);
      // Removed playNotificationSound call here
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('Audio context resumed on start');
        }).catch(err => {
          console.error('Failed to resume audio context on start:', err);
        });
      }
    }
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    setAlert(null);
    startTimeRef.current = null;
  };

  const skipToBreak = () => {
    setIsRunning(false);
    setIsBreak(true);
    setTimeLeft(breakDuration);
    startTimeRef.current = null;
  };

  const skipToWork = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    startTimeRef.current = null;
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
                value={workDuration || 25 * 60} // Fallback to default if undefined
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
                value={breakDuration || 5 * 60} // Fallback to default if undefined
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
          timeLeft={timeLeft} 
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