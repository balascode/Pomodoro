import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { AccessTime, BarChart, EmojiEvents, LocalFireDepartment } from '@mui/icons-material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card sx={{ bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.100`,
              color: `${color}.main`,
              mr: 1,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="medium">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Stats = ({ todayCycles, weekCycles, totalCycles, streak }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard title="Today's Cycles" value={todayCycles} icon={<AccessTime />} color="primary" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="This Week" value={weekCycles} icon={<BarChart />} color="success" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Total Cycles" value={totalCycles} icon={<EmojiEvents />} color="warning" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Day Streak" value={streak} icon={<LocalFireDepartment />} color="error" />
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Stats;