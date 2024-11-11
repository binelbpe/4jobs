import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import SignupForm from "./SignupForm";
import OtpVerification from "./OtpVerification";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);

  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSignupSuccess = (signupEmail: string) => {
    setEmail(signupEmail);
    setIsOtpStep(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="bg-purple-600 p-12 md:w-2/5">
            <div className="text-8xl font-bold text-white opacity-50">4</div>
            <div className="mt-4 text-4xl font-semibold text-white">JOBS</div>
          </div>
          <div className="p-12 md:w-3/5">
            <h2 className="mb-8 text-3xl font-semibold text-purple-600">
              Sign Up
            </h2>
            {isOtpStep ? (
              <OtpVerification email={email} />
            ) : (
              <SignupForm onSignupSuccess={handleSignupSuccess} />
            )}
            {loading && (
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            )}
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
