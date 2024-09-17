import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store';
import { register, clearError } from '../../redux/slices/recruiterSlice'; 
import '../../styles/recruiter/register.css'; 

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', 
    companyName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({ email: '', phone: '', password: '' });

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading, isAuthenticated } = useSelector((state: RootState) => state.recruiter);

  useEffect(() => {
    if (isAuthenticated) {
        navigate('/recruiter/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = { email: '', phone: '', password: '' };

    if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number with 10 digits.';
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)
    ) {
      errors.password =
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    setFormErrors(errors);
    return !errors.email && !errors.phone && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (error) {
        dispatch(clearError()); 
      }
      try {
        await dispatch(register(formData));
        navigate('/recruiter/verify-otp', { state: { email: formData.email } });
      } catch (err) {
        console.error('Error registering:', err);
      }
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Recruiter Registration</h2>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name"
          required
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
        {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
        
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />
        {formErrors.email && <p className="error-message">{formErrors.email}</p>}

        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
        />
        {formErrors.password && <p className="error-message">{formErrors.password}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
