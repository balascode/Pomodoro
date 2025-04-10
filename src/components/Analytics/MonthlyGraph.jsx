import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, FormControl, Select, MenuItem } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore'; // Added getDocs
import { db } from '../../firebase';
import { motion } from 'framer-motion';

const MonthlyGraph = ({ year: propYear }) => {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(propYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [availableYears, setAvailableYears] = useState([]);
  const [unsubscribe, setUnsubscribe] = useState(null); // To store the unsubscribe function

  useEffect(() => {
    const fetchYears = async () => {
      if (!currentUser) {
        setAvailableYears([]);
        return;
      }
      try {
        const statsRef = collection(db, 'users', currentUser.uid, 'stats');
        const snapshot = await getDocs(query(statsRef, orderBy('date', 'asc'))); // Now works with getDocs
        const years = new Set();
        snapshot.forEach((doc) => {
          years.add(new Date(doc.data().date).getFullYear());
        });
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (error) {
        console.error('Error fetching years:', error.message);
        setAvailableYears([]);
      }
    };
    fetchYears();
  }, [currentUser]);

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (!currentUser || unsubscribe) unsubscribe(); // Unsubscribe from previous listener

    const fetchData = () => {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      const statsRef = collection(db, 'users', currentUser.uid, 'stats');
      const q = query(statsRef, where('date', '>=', startDateString), where('date', '<=', endDateString), orderBy('date', 'asc'));

      const unsubscribeFunc = onSnapshot(q, (snapshot) => {
        console.log('Real-time Query Snapshot:', snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));

        const data = [];
        const dateRange = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dateRange.push(new Date(currentDate).toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        console.log('Date Range:', dateRange);

        const existingData = {};
        snapshot.forEach((doc) => {
          existingData[doc.data().date] = doc.data().cycles || 0;
        });

        dateRange.forEach((date) => {
          const day = new Date(date).getDate();
          data.push({ date, day, cycles: existingData[date] || 0 });
        });

        console.log('Chart Data:', data);
        setChartData(data);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching real-time data:', error.message);
        setChartData([]);
        setLoading(false);
      });

      setUnsubscribe(() => unsubscribeFunc); // Store the unsubscribe function
    };

    fetchData();

    // Cleanup on unmount or dependency change
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, selectedYear, selectedMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card sx={{ borderRadius: 3, mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {monthNames.map((name, index) => (
                  <MenuItem key={index} value={index}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="h6" gutterBottom>
            {monthNames[selectedMonth]} {selectedYear} Overview
          </Typography>
          {chartData.length > 0 ? (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} domain={[1, new Date(selectedYear, selectedMonth + 1, 0).getDate()]} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cycles" name="Cycles" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MonthlyGraph;