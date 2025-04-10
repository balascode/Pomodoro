import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './AuthForm';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (email, password, name) => {
    await signup(email, password, name);
    navigate('/dashboard');
  };

  return (
    <AuthForm
      title="Create Account"
      handleSubmit={handleSignUp}
      buttonText="Sign Up"
      showNameField
      alternateText="Already have an account?"
      onAlternateClick={() => navigate('/login')}
    />
  );
};

export default SignUp;