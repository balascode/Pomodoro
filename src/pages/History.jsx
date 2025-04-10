import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import MonthlyGraph from '../components/Analytics/MonthlyGraph';
import { motion } from 'framer-motion';

const History = () => {
  const { currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchAvailableData = async () => {
      if (!currentUser) return;
      const statsRef = collection(db, 'users', currentUser.uid, 'stats');
      const statsQuery = query(statsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(statsQuery);
      const years = new Set();
      snapshot.forEach((doc) => {
        const year = new Date(doc.data().date).getFullYear();
        years.add(year);
      });
      setAvailableYears(Array.from(years).sort((a, b) => b - a));
    };
    fetchAvailableData();
  }, [currentUser]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{
            mt: 6,
          }}>
        <Typography variant="h4" component="h1" gutterBottom>
          History & Statistics
        </Typography>
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={6}>
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={handleYearChange} label="Year">
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12}>
            <MonthlyGraph year={selectedYear} />
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default History;