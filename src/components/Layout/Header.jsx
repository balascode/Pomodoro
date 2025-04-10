import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  Badge,
  Tooltip,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  Menu as MenuIcon, 
  Dashboard, 
  History, 
  Logout,
  Timer,
  Notifications,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { darkMode, toggleTheme } = useTheme();
  const theme = useMuiTheme();
  const { currentUser, logout, userName } = useAuth();
  const navigate = useNavigate();
  
  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileDrawerOpen(!mobileDrawerOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleClose();
    setMobileDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ width: 250, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List>
        <ListItem button onClick={() => { navigate('/dashboard'); setMobileDrawerOpen(false); }}>
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => { navigate('/history'); setMobileDrawerOpen(false); }}>
          <ListItemIcon><History /></ListItemIcon>
          <ListItemText primary="History" />
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={0}
      sx={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: darkMode 
          ? 'rgba(31, 41, 55, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2, md: 3 }, 
          py: { xs: 0.5, sm: 1 },
          minHeight: { xs: 56, sm: 64, md: 72 }
        }}>
          {(isXs || isSm) && currentUser && (
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              flexShrink: 0
            }}
            onClick={() => navigate('/')}
          >
            <Avatar 
              sx={{ 
                background: darkMode 
                  ? 'linear-gradient(45deg, #93C5FD 0%, #2563EB 100%)' 
                  : 'linear-gradient(45deg, #2563EB 0%, #1E40AF 100%)', 
                width: { xs: 32, sm: 36 }, 
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                mr: { xs: 1, sm: 1.5 }
              }}
            >
              <Timer sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            {!isXs &&(
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 'bold', 
                background: darkMode 
                  ? 'linear-gradient(90deg, #E5E7EB 0%, #93C5FD 100%)' 
                  : 'linear-gradient(90deg, #1E40AF 0%, #2563EB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              }}
            >
              Pomodoro Pro
            </Typography>

)}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {isMd && currentUser && (
            <Box sx={{ 
              display: 'flex', 
              mr: 2,
              gap: { md: 1, lg: 2 }
            }}>
              <Button 
                color="inherit" 
                startIcon={<Dashboard />} 
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  px: { md: 1.5, lg: 2 },
                  fontSize: { md: '0.875rem', lg: '1rem' }
                }}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                startIcon={<History />} 
                onClick={() => navigate('/history')}
                sx={{ 
                  px: { md: 1.5, lg: 2 },
                  fontSize: { md: '0.875rem', lg: '1rem' }
                }}
              >
                History
              </Button>
            </Box>
          )}

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1 }
          }}>
            <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                sx={{ 
                  borderRadius: 1.5,
                  p: { xs: 0.5, sm: 1 },
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'rotate(12deg)' }
                }}
              >
                {darkMode ? 
                  <LightMode sx={{ fontSize: { xs: 20, sm: 24 } }} /> : 
                  <DarkMode sx={{ fontSize: { xs: 20, sm: 24 } }} />}
              </IconButton>
            </Tooltip>

            {currentUser ? (
              <>
                {/* <Tooltip title="Notifications">
                  <IconButton sx={{ 
                    borderRadius: 1.5,
                    p: { xs: 0.5, sm: 1 }
                  }}>
                    <Badge badgeContent={2} color="error">
                      <Notifications sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </Badge>
                  </IconButton>
                </Tooltip> */}

                <Tooltip title="Account menu">
                  <IconButton 
                    onClick={handleMenu} 
                    sx={{ 
                      p: { xs: 0.25, sm: 0.5 },
                      border: `2px solid ${theme.palette.primary.main}`,
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: { xs: 28, sm: 32 }, 
                        height: { xs: 28, sm: 32 }, 
                        bgcolor: theme.palette.primary.main,
                        fontWeight: 'bold',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {userName?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu 
                  anchorEl={anchorEl} 
                  open={Boolean(anchorEl)} 
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { 
                      mt: 1.5, 
                      borderRadius: 2,
                      minWidth: { xs: 160, sm: 180 },
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      {userName || 'User'}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                      color: theme.palette.error.main,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate('/signup')} 
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {(isXs || isSm) && currentUser && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: darkMode ? 'grey.900' : 'white',
              width: { xs: '80%', sm: 250 },
              maxWidth: 250,
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </AppBar>
  );
};

export default Header;