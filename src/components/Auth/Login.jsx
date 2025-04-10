import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
      setError('');
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
    }
  };

  return (
    <AuthForm
      title="Welcome Back"
      handleSubmit={handleLogin}
      buttonText="Login"
      alternateText="Don't have an account?"
      onAlternateClick={() => navigate('/signup')}
      error={error}
    />
  );
};

export default Login;