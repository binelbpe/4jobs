import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyOtp } from "../../redux/slices/authSlice";
import { AppDispatch } from "../../redux/store";
import { sendOtpApi } from "../../api/authapi";


interface OtpVerificationProps {
  email: string;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email }) => {
  const [otp, setOtp] = useState("");
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
      console.error("OTP verification failed:", error);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtpApi(email);
      setIsTimerActive(true);
      setTimer(30);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h3 className="mb-4 text-2xl font-semibold text-purple-600 text-center">
          OTP Verification
        </h3>
        <p className="mb-6 text-gray-700 text-center">
          An OTP has been sent to {email}
        </p>

        <div className="mb-4">
          <label
            htmlFor="otp-input"
            className="block text-sm font-semibold text-gray-700"
          >
            Enter OTP
          </label>
          <input
            id="otp-input"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOtpVerification}
          disabled={!isTimerActive}
          className={`w-full rounded-md py-2 text-sm font-semibold text-white transition duration-200 ${
            isTimerActive
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Verify OTP
        </button>

        <div className="mt-4 text-center">
          {isTimerActive ? (
            <p className="text-gray-700">Resend OTP in {timer} seconds</p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="mt-2 rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition duration-200"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
