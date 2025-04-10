import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { motion } from "framer-motion";

const DailyGraph = ({ days = 30, refreshTrigger }) => {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCycles, setMaxCycles] = useState(0);
  const [maxDay, setMaxDay] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split("T")[0];
    const endDateString = endDate.toISOString().split("T")[0];

    try {
      const statsRef = collection(db, "users", currentUser.uid, "stats");
      const q = query(
        statsRef,
        where("date", ">=", startDateString),
        where("date", "<=", endDateString),
        orderBy("date", "asc")
      );
      const snapshot = await getDocs(q);

      const data = [];
      let maxCyclesFound = 0;
      let maxDayFound = null;
      const dateRange = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        dateRange.push(new Date(d).toISOString().split("T")[0]);
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
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          month: isMobile ? "2-digit" : "short",
          day: "numeric",
        });
        data.push({
          date,
          displayDate: formattedDate,
          cycles: existingData[date] || 0,
        });
      });

      setChartData(data);
      setMaxCycles(maxCyclesFound);
      setMaxDay(maxDayFound);
    } catch (error) {
      console.error("Error fetching stats data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, days, isMobile]);

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when cycles update or refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchData();
    }
  }, [refreshTrigger, fetchData]);

  // Listen for realtime updates to today's data
  useEffect(() => {
    if (!currentUser) return;

    const today = new Date().toISOString().split("T")[0];
    const todayStatsRef = collection(db, "users", currentUser.uid, "stats");
    const q = query(todayStatsRef, where("date", "==", today));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        fetchData();
      }
    });

    return () => unsubscribe();
  }, [currentUser, fetchData]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;
  }

  // Determine chart height based on screen size
  const chartHeight = isMobile ? 200 : isMedium ? 250 : 300;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: isMobile ? 1 : 2 }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
            Daily Progress (Last {days} Days)
          </Typography>
          {chartData.length > 0 ? (
            <>
              <Box sx={{ height: chartHeight, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: isMobile ? 5 : 20,
                      left: isMobile ? -15 : 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={isMobile ? "preserveStartEnd" : 0}
                      angle={isMobile ? -45 : 0}
                      height={isMobile ? 60 : 30}
                      textAnchor={isMobile ? "end" : "middle"}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.background.paper
                            : "#fff",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        padding: "8px",
                      }}
                      itemStyle={{
                        backgroundColor: "transparent",
                        padding: "4px",
                        color: theme.palette.text.primary,
                      }}
                      labelStyle={{
                        backgroundColor: "transparent",
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                      }}
                      formatter={(value, name) => [`${value}`, name]}
                      separator=": "
                    />
                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Line
                      type="monotone"
                      dataKey="cycles"
                      name="Cycles"
                      stroke="#1976d2"
                      strokeWidth={2}
                      activeDot={{ r: isMobile ? 6 : 8 }}
                      dot={{
                        stroke: "#fff",
                        strokeWidth: 2,
                        r: isMobile ? 3 : 4,
                      }}
                    />
                    {maxDay && (
                      <ReferenceLine
                        x={
                          chartData.find((item) => item.date === maxDay)
                            ?.displayDate
                        }
                        stroke="#28a745"
                        strokeDasharray="3 3"
                        label={
                          isMobile
                            ? null
                            : {
                                value: "Best Day",
                                position: "top",
                                fill: "#28a745",
                                fontSize: 12,
                              }
                        }
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              {maxDay && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  }}
                >
                  Best day:{" "}
                  {new Date(maxDay).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  with {maxCycles} cycles
                </Typography>
              )}
            </>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No data available
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyGraph;
