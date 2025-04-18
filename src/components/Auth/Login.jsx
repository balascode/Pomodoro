import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
      throw new Error('Invalid email or password'); // Throw error to trigger form error state
    } finally {
      setLoading(false);
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
      isLogin={true}
    />
  );
};

export default Login;