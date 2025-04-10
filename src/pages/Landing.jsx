import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Stack,
  useTheme
} from '@mui/material';
import { 
  Timer, 
  BarChart, 
  Devices, 
  HistoryToggleOff, 
  CloudDone, 
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        p: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[4],
          '& .MuiSvgIcon-root': {
            transform: 'scale(1.1) rotate(5deg)',
            color: theme.palette.primary.main
          }
        }
      }}
    >
      <CardContent>
        <Box 
          sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 80
          }}
        >
          {React.cloneElement(icon, { 
            sx: { 
              fontSize: 56, 
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
              opacity: 0.9,
              transition: 'all 0.3s ease'
            } 
          })}
        </Box>
        <Typography variant="h6" component="h3" gutterBottom align="center" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      } 
    }
  };

  const features = [
    {
      icon: <Timer />,
      title: "Pomodoro Timer",
      description: "Stay focused with customizable work and break intervals based on the proven Pomodoro Technique."
    },
    {
      icon: <BarChart />,
      title: "Track Progress",
      description: "View detailed analytics of your productivity sessions and track improvements over time."
    },
    {
      icon: <Devices />,
      title: "Multi-Device",
      description: "Access your Pomodoro sessions and stats from any device with our cloud synchronization."
    },
    {
      icon: <HistoryToggleOff />,
      title: "Session History",
      description: "Review past productivity sessions with detailed timing and task completion data."
    },
    {
      icon: <CloudDone />,
      title: "Cloud Sync",
      description: "Your progress and settings are automatically synchronized across all your devices."
    }
  ];

  return (
    <Box 
      sx={{ 
        pt: { xs: 10, sm: 12 }, 
        pb: 8,
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)` 
          : `linear-gradient(180deg, #F0F7FF 0%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Container maxWidth="lg">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <Grid container spacing={4} alignItems="center" sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 2, 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(90deg, #FFFFFF 30%, #93C5FD 100%)' 
                      : 'linear-gradient(90deg, #1E40AF 30%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                  }}
                >
                  Boost Your Productivity
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ mb: 4, lineHeight: 1.5, fontWeight: 400 }}
                >
                  Master your time with Pomodoro Pro. Focus better, work smarter, and accomplish more with our advanced productivity tools.
                </Typography>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/signup')}
                    endIcon={<ArrowForward />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ py: 1.5 }}
                  >
                    Log In
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div 
                variants={itemVariants}
                style={{ overflow: 'hidden', borderRadius: 16 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 400 },
                    width: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[4],
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  {/* This would be your app screenshot or illustration */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: `0 0 0 15px ${theme.palette.primary.main}40`,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            boxShadow: `0 0 0 0 ${theme.palette.primary.main}70`,
                          },
                          '70%': {
                            boxShadow: `0 0 0 15px ${theme.palette.primary.main}00`,
                          },
                          '100%': {boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
                        },
                      },
                    }}
                  >
                    <Typography variant="h3" color="white" fontWeight="bold">
                      25:00
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mt: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
                    Focus Session
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #FFFFFF 30%, #93C5FD 100%)' 
                  : 'linear-gradient(90deg, #1E40AF 30%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Powerful Features
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              align="center" 
              sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
            >
              Everything you need to maximize your productivity and achieve your goals
            </Typography>
          </motion.div>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <FeatureCard 
                    icon={feature.icon} 
                    title={feature.title} 
                    description={feature.description} 
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials or Stats */}
        {/* <motion.div variants={itemVariants}>
          <Box 
            sx={{ 
              py: 6, 
              px: 3, 
              borderRadius: 4, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(37, 99, 235, 0.03)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(37, 99, 235, 0.1)'}`,
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 700, mb: 5 }}
            >
              Why Users Love Pomodoro Pro
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h2" 
                    component="p" 
                    color="primary" 
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    45%
                  </Typography>
                  <Typography variant="h6" component="p" sx={{ mb: 1 }}>
                    Productivity Boost
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average increase in productivity reported by our users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h2" 
                    component="p" 
                    color="primary" 
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    10K+
                  </Typography>
                  <Typography variant="h6" component="p" sx={{ mb: 1 }}>
                    Active Users
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Join our growing community of productive professionals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h2" 
                    component="p" 
                    color="primary" 
                    sx={{ fontWeight: 'bold', mb: 1 }}
                  >
                    4.8/5
                  </Typography>
                  <Typography variant="h6" component="p" sx={{ mb: 1 }}>
                    User Rating
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average rating from thousands of satisfied users
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div> */}

        {/* CTA Section */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                maxWidth: 700, 
                mx: 'auto',
                lineHeight: 1.3
              }}
            >
              Ready to Transform Your Productivity?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Start using Pomodoro Pro today and see the difference in your focus and productivity.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{ px: 5, py: 1.5, borderRadius: 2 }}
            >
              Get Started For Free
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No credit card required. Free forever.
            </Typography>
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  </Box>
);
};

export default Landing;