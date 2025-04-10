import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PomodoroTimer from '../components/Timer/PomodoroTimer';
import DailyGraph from '../components/Analytics/DailyGraph';
import MonthlyGraph from '../components/Analytics/MonthlyGraph';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { userName } = useAuth();
  const [todayCycles, setTodayCycles] = useState(0);

  return (
    <Box sx={{
      mt: 6,
    }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {userName}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <PomodoroTimer onCycleComplete={setTodayCycles} />
          </Grid>
          <Grid item xs={12} md={12}>
            <DailyGraph days={30} />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Dashboard;