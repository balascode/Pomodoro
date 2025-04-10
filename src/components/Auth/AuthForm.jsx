import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error } from '@mui/icons-material';
import { motion } from 'framer-motion';

const AuthForm = ({ 
  title, 
  handleSubmit, 
  buttonText, 
  showNameField = false, 
  alternateText = '', 
  onAlternateClick = () => {},
  error = '',
  isLogin = false 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (!isLogin && newEmail) {
      if (!validateEmail(newEmail)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (!isLogin && newPassword) {
      if (!validatePassword(newPassword)) {
        setPasswordError('Password must be at least 8 characters long');
      } else {
        setPasswordError('');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // For signup, validate before submission
    if (!isLogin) {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      
      if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
    }
    
    setFormError('');
    setLoading(true);
    
    try {
      await handleSubmit(email, password, name);
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={6} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {title}
          </Typography>
          
          {(error || formError) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 2 }}>{error || formError}</Alert>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={onSubmit}>
            {showNameField && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                required
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  endAdornment: !isLogin && email && (
                    <InputAdornment position="end">
                      {emailError ? <Error color="error" /> : validateEmail(email) ? <CheckCircle color="success" /> : null}
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={handlePasswordChange}
                required
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {!isLogin && password && (
                        passwordError ? <Error color="error" /> : validatePassword(password) ? <CheckCircle color="success" /> : null
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large" 
                disabled={loading} 
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  buttonText
                )}
              </Button>
            </motion.div>
            
            {alternateText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Typography align="center" sx={{ mt: 2 }}>
                  {alternateText}
                  <Button onClick={onAlternateClick} color="primary">Click here</Button>
                </Typography>
              </motion.div>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AuthForm;