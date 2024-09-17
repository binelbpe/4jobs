import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store';
import { verifyOtp } from '../../redux/slices/recruiterSlice';
import { sendOtpApi } from '../../api/recruiterApi'; 
import '../../styles/recruiter/otpVerification.css';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30); 
  const [isTimerActive, setIsTimerActive] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { error, isAuthenticated } = useSelector((state: RootState) => state.recruiter);
  const email = location.state?.email || '';


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyOtp({ email, otp }));
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };


  const handleResendOtp = async () => {
    try {
      await sendOtpApi(email); 
      setIsTimerActive(true); 
      setTimer(30); 
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      countdown = setTimeout(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearTimeout(countdown);
  }, [isTimerActive, timer]);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/recruiter/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="verify-otp-container">
      <form onSubmit={handleVerifyOtp} className="verify-otp-form">
        <h2>Verify OTP</h2>
        <input
          name="otp"
          value={otp}
          onChange={handleChange}
          placeholder="Enter OTP"
          required
        />
        <button type="submit" disabled={!isTimerActive} className={!isTimerActive ? 'button-disabled' : ''}>
          Verify OTP
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="otp-resend-container">
        {isTimerActive ? (
          <p>Resend OTP in {timer} seconds</p>
        ) : (
          <button onClick={handleResendOtp}>Resend OTP</button>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
