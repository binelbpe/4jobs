import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { verifyOtp } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { sendOtpApi } from '../../api/authapi';
import '../../styles/user/OtpVerification.css';

interface OtpVerificationProps {
  email: string;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const dispatch = useDispatch<AppDispatch>();

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

  const handleOtpVerification = async () => {
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
    } catch (error) {
      console.error('OTP verification failed:', error);
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

  return (
    <div className="otp-verification-container">
      <h3>OTP Verification</h3>
      <p>An OTP has been sent to {email}</p>
      <div className="otp-input-container">
        <label htmlFor="otp-input">Enter OTP</label>
        <input
          id="otp-input"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      </div>
      <button 
        onClick={handleOtpVerification}
        disabled={!isTimerActive}
        className={!isTimerActive ? 'button-disabled' : ''}
      >
        Verify OTP
      </button>
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

export default OtpVerification;