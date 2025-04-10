import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, FormControl, Select, MenuItem, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';

const MonthlyGraph = ({ year: propYear }) => {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(propYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [availableYears, setAvailableYears] = useState([]);
  const [unsubscribe, setUnsubscribe] = useState(null);
  
  const theme = useTheme();
  const isExtraSmall = useMediaQuery('(max-width: 400px)');
  const isSmall = useMediaQuery('(max-width: 600px)');
  const isMedium = useMediaQuery('(max-width: 900px)');

  useEffect(() => {
    const fetchYears = async () => {
      if (!currentUser) {
        setAvailableYears([]);
        return;
      }
      try {
        const statsRef = collection(db, 'users', currentUser.uid, 'stats');
        const snapshot = await getDocs(query(statsRef, orderBy('date', 'asc')));
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
    if (unsubscribe) unsubscribe(); // Unsubscribe from previous listener
    if (!currentUser) return;

    const fetchData = () => {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      const statsRef = collection(db, 'users', currentUser.uid, 'stats');
      const q = query(statsRef, where('date', '>=', startDateString), where('date', '<=', endDateString), orderBy('date', 'asc'));

      const unsubscribeFunc = onSnapshot(q, (snapshot) => {
        const data = [];
        const dateRange = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dateRange.push(new Date(currentDate).toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const existingData = {};
        snapshot.forEach((doc) => {
          existingData[doc.data().date] = doc.data().cycles || 0;
        });

        dateRange.forEach((date) => {
          const day = new Date(date).getDate();
          data.push({ date, day, cycles: existingData[date] || 0 });
        });

        setChartData(data);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching real-time data:', error.message);
        setChartData([]);
        setLoading(false);
      });

      setUnsubscribe(() => unsubscribeFunc);
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, selectedYear, selectedMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getTickInterval = () => {
    // Dynamically adjust tick display based on screen size and days in month
    if (isExtraSmall) return Math.ceil(chartData.length / 4);
    if (isSmall) return Math.ceil(chartData.length / 6);
    if (isMedium) return Math.ceil(chartData.length / 10);
    return 'preserveEnd';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={isSmall ? 32 : 40} />
      </Box>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          borderRadius: { xs: 2, sm: 3 }, 
          mt: { xs: 1, sm: 2 }, 
          p: { xs: 1, sm: 2 }, 
          boxShadow: 1,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {/* Filter Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 2 },
              mb: { xs: 1.5, sm: 2 },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <FormControl 
              size="small" 
              sx={{ 
                width: { xs: '100%', sm: '40%', md: 120 },
                minWidth: { xs: 'auto', sm: 120 }
              }}
            >
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                variant="outlined"
                MenuProps={{ 
                  PaperProps: { 
                    sx: { maxHeight: 300 } 
                  } 
                }}
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl 
              size="small" 
              sx={{ 
                width: { xs: '100%', sm: '60%', md: 140 },
                minWidth: { xs: 'auto', sm: 140 }
              }}
            >
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                variant="outlined"
                MenuProps={{ 
                  PaperProps: { 
                    sx: { maxHeight: 300 } 
                  } 
                }}
                sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                {monthNames.map((name, index) => (
                  <MenuItem key={index} value={index}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Title */}
          <Typography
            variant="h6"
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, 
              textAlign: 'center',
              mb: { xs: 1.5, sm: 2 },
              fontWeight: 600
            }}
          >
            {monthNames[selectedMonth]} {selectedYear} Overview
          </Typography>
          
          {/* Chart or Empty State */}
          {chartData.length > 0 ? (
            <Box 
              sx={{ 
                height: { xs: 220, sm: 280, md: 350, lg: 400 },
                width: '100%',
                mt: { xs: 1, sm: 2 }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData}
                  margin={{
                    top: 5,
                    right: isExtraSmall ? 5 : 20,
                    left: isExtraSmall ? -15 : 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} vertical={!isExtraSmall} />
                  <XAxis
                    dataKey="day"
                    tick={{ 
                      fontSize: isExtraSmall ? 9 : isSmall ? 10 : 12,
                      fill: theme.palette.text.primary
                    }}
                    tickFormatter={(value) => isExtraSmall && value % 2 !== 0 ? '' : value}
                    interval={getTickInterval()}
                    padding={{ left: 10, right: 10 }}
                    domain={[1, new Date(selectedYear, selectedMonth + 1, 0).getDate()]}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ 
                      fontSize: isExtraSmall ? 9 : isSmall ? 10 : 12,
                      fill: theme.palette.text.primary 
                    }}
                    width={isExtraSmall ? 20 : 30}
                    tickCount={isExtraSmall ? 3 : isSmall ? 4 : 5}
                  />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
                     border: `1px solid ${theme.palette.divider}`,
                     borderRadius: '8px',
                     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                     padding: '8px'
                   }}
                   itemStyle={{
                     backgroundColor: 'transparent',
                     padding: '4px',
                     color: theme.palette.text.primary
                   }}
                   labelStyle={{
                     backgroundColor: 'transparent',
                     color: theme.palette.text.primary,
                     fontWeight: 'bold'
                   }}
                   formatter={(value, name) => [`${value}`, name]}
                   separator=": "
                 />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: isExtraSmall ? '0.7rem' : isSmall ? '0.8rem' : '0.9rem',
                      marginTop: 8
                    }}
                  />
                  <Bar
                    dataKey="cycles"
                    name="Completed Cycles"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                    barSize={isExtraSmall ? 6 : isSmall ? 10 : isMedium ? 15 : 20}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: { xs: 150, sm: 200, md: 250 },
                bgcolor: theme.palette.action.hover,
                borderRadius: 2,
                p: 3,
                mt: { xs: 1, sm: 2 }
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ 
                  textAlign: 'center', 
                  fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                  fontWeight: 500
                }}
              >
                No data available for this month
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MonthlyGraph;