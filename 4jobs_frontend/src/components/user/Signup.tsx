import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import OtpVerification from './OtpVerification';
import '../../styles/user/SignupForm.css'

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);

  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth); // Added role

  useEffect(() => {
    if (isAuthenticated) {
   
        navigate('/dashboard');
      
    }
  }, [isAuthenticated, navigate]);

  const handleSignupSuccess = (signupEmail: string) => {
    setEmail(signupEmail);
    setIsOtpStep(true);
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {isOtpStep ? (
        <OtpVerification email={email} />
      ) : (
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Signup;
