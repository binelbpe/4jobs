import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { verifyOtp } from "../../redux/slices/recruiterSlice";
import { sendOtpApi } from "../../api/recruiterApi";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const { error, isAuthenticatedRecruiter } = useSelector(
    (state: RootState) => state.recruiter
  );
  const email = location.state?.email || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyOtp({ email, otp }));
    } catch (error) {
      console.error("Error verifying OTP:", error);
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
    if (isAuthenticatedRecruiter) {
      navigate("/recruiter/dashboard");
    }
  }, [isAuthenticatedRecruiter, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl p-8">
        <h2 className="mb-6 text-3xl font-semibold text-purple-600 text-center">
          Verify OTP
        </h2>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            name="otp"
            value={otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!isTimerActive}
            className={`w-full rounded-md py-2 text-sm font-semibold text-white transition duration-200 ${
              isTimerActive
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Verify OTP
          </button>

          {error && (
            <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
          )}
        </form>

        <div className="mt-6 text-center">
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

export default VerifyOtp;
