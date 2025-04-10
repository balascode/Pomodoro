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
  Container
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  Menu as MenuIcon, 
  Dashboard, 
  History, 
  Logout,
  Timer,
  Notifications
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleMobileMenu = (event) => setMobileMenuAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchorEl(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleClose();
  };

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
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
          {isMobile && currentUser && (
            <>
              <IconButton 
                edge="start" 
                color="inherit" 
                onClick={handleMobileMenu}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMobileMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    mt: 1.5, 
                    minWidth: 200,
                    borderRadius: 2,
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { navigate('/dashboard'); handleMobileMenuClose(); }}>
                  <Dashboard sx={{ mr: 1.5, fontSize: 20 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigate('/history'); handleMobileMenuClose(); }}>
                  <History sx={{ mr: 1.5, fontSize: 20 }} /> History
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          )}

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer' 
            }}
            onClick={() => navigate('/')}
          >
            <Avatar 
              sx={{ 
                background: darkMode 
                  ? 'linear-gradient(45deg, #93C5FD 0%, #2563EB 100%)' 
                  : 'linear-gradient(45deg, #2563EB 0%, #1E40AF 100%)', 
                width: 36, 
                height: 36,
                borderRadius: 1.5,
                mr: 1.5
              }}
            >
              <Timer />
            </Avatar>
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
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Pomodoro Pro
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && currentUser && (
            <Box sx={{ display: 'flex', mr: 2 }}>
              <Button 
                color="inherit" 
                startIcon={<Dashboard />} 
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 1 }}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                startIcon={<History />} 
                onClick={() => navigate('/history')}
              >
                History
              </Button>
            </Box>
          )}

          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              sx={{ 
                borderRadius: 1.5,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'rotate(12deg)' }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {currentUser ? (
            <>
              {/* <Tooltip title="Notifications">
                <IconButton sx={{ ml: 1, borderRadius: 1.5 }}>
                  <Badge badgeContent={2} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip> */}
              <Box sx={{ ml: 1.5 }}>
                <Tooltip title="Account menu">
                  <IconButton 
                    onClick={handleMenu} 
                    sx={{ 
                      p: 0.5,
                      border: `2px solid ${theme.palette.primary.main}`,
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.primary.main,
                        fontWeight: 'bold',
                        fontSize: '1rem'
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
                      minWidth: 180,
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
                    <Typography variant="subtitle1" fontWeight="bold">
                      {userName || 'User'}
                    </Typography>
                    {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Premium Member
                    </Typography> */}
                  </Box>
                  <Divider />
                  {/* <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                    My Profile
                  </MenuItem> */}
                  {/* <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                    Settings
                  </MenuItem> */}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                    <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 500 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/signup')} 
                sx={{ ml: 1 }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;