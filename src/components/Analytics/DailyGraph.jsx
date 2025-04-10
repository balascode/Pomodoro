import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';

const DailyGraph = ({ days = 30 }) => {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCycles, setMaxCycles] = useState(0);
  const [maxDay, setMaxDay] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      const statsRef = collection(db, 'users', currentUser.uid, 'stats');
      const q = query(statsRef, where('date', '>=', startDateString), where('date', '<=', endDateString), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);

      const data = [];
      let maxCyclesFound = 0;
      let maxDayFound = null;
      const dateRange = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d).toISOString().split('T')[0]);
      }

      const existingData = {};
      snapshot.forEach((doc) => {
        const docData = doc.data();
        existingData[docData.date] = docData.cycles;
        if (docData.cycles > maxCyclesFound) {
          maxCyclesFound = docData.cycles;
          maxDayFound = docData.date;
        }
      });

      dateRange.forEach((date) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({ date, displayDate: formattedDate, cycles: existingData[date] || 0 });
      });

      setChartData(data);
      setMaxCycles(maxCyclesFound);
      setMaxDay(maxDayFound);
      setLoading(false);
    };
    fetchData();
  }, [currentUser, days]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Progress (Last {days} Days)
          </Typography>
          {chartData.length > 0 ? (
            <>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cycles"
                      name="Cycles"
                      stroke="#1976d2"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      dot={{ stroke: '#fff', strokeWidth: 2, r: 4 }}
                    />
                    {maxDay && (
                      <ReferenceLine
                        x={chartData.find((item) => item.date === maxDay)?.displayDate}
                        stroke="#28a745"
                        strokeDasharray="3 3"
                        label={{ value: 'Best Day', position: 'top', fill: '#28a745' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              {maxDay && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Best day: {new Date(maxDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} with {maxCycles} cycles
                </Typography>
              )}
            </>
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

export default DailyGraph;