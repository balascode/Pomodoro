import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (email, password, name) => {
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try another one.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      throw err; // Throw the error to trigger form error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Account"
      handleSubmit={handleSignUp}
      buttonText="Sign Up"
      showNameField
      alternateText="Already have an account?"
      onAlternateClick={() => navigate('/login')}
      error={error}
      isLogin={false}
    />
  );
};

export default SignUp;