import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    let formErrors: { email?: string; password?: string } = {};

    if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      formErrors.email = 'Please enter a valid email address.';
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      formErrors.password =
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };

  const handleGoogleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      dispatch(googleLogin(response.credential));
    } else {
      console.error('Google login response does not contain a credential');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login error occurred');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="bg-purple-600 p-12 md:w-2/5">
              <div className="text-8xl font-bold text-white opacity-50">4</div>
              <div className="mt-4 text-4xl font-semibold text-white">JOBS</div>
            </div>
            <div className="p-12 md:w-3/5">
              <h2 className="mb-8 text-3xl font-semibold text-purple-600">Log In</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <input
                    type="email"
                    placeholder="Username"
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="mb-8">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-purple-600 py-3 text-lg font-semibold text-white transition duration-200 hover:bg-purple-700 focus:outline-none"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Submit'}
                </button>
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <Link to="/forgot-password" className="block text-sm text-purple-600 hover:underline mt-2">
                  Forgot Password?
                </Link>
              </form>
              <p className="mt-6 text-base">
                Don't have an account? <Link to="/signup" className="text-purple-600 hover:underline">Sign up</Link>
              </p>
              <div className="mt-8">
                <p className="mb-3 text-base text-gray-600">Or log in with</p>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  type="standard"
                  theme="outline"
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
