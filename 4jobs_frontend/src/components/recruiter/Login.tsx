import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { login, clearError } from '../../redux/slices/recruiterSlice'; 
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/recruiter/login.css'; 

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' }); 
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticatedRecruiter, isApproved } = useSelector((state: RootState) => state.recruiter);

  const validateForm = () => {
    const errors = { email: '', password: '' };

    if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
    ) {
      errors.password =
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  
    if (validateForm()) {
      if (error) {
        dispatch(clearError());
      }
      dispatch(login({ email, password }));
    }
  };

  useEffect(() => {
    if (isAuthenticatedRecruiter) {
      if (isApproved) {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/recruiter/dashboard');
      }
    }
  }, [isAuthenticatedRecruiter, isApproved, navigate]);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Recruiter Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {formErrors.email && <p className="error-message">{formErrors.email}</p>}
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {formErrors.password && <p className="error-message">{formErrors.password}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <div className="signup-link">
        <p>Don't have an account?</p>
        <Link to="/recruiter/signup">Sign up here</Link>
      </div>
    </div>
  );
};

export default Login;
