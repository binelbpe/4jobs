import axios from 'axios';
import { LoginCredentials, SignupCredentials, OtpVerificationCredentials } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000';

const apiRequest = async (method: 'POST' | 'GET' | 'PUT' | 'DELETE', endpoint: string, data: any = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('API Error:', error.response.data.error);
        throw new Error(error.response.data.error);
      } else if (error.request) {
        console.error('No response received from API:', error.request);
        throw new Error('No response from the server');
      }
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred');
    }
  }
};

// API for sending OTP
export const sendOtpApi = async (email: string) => {
  return apiRequest('POST', '/send-otp', { email });
};

// API for verifying OTP
export const verifyOtpApi = async (credentials: OtpVerificationCredentials) => {
  return apiRequest('POST', '/verify-otp', credentials);
};

// API for user login
export const loginUserApi = async (credentials: LoginCredentials) => {
  return apiRequest('POST', '/login', credentials);
};

// API for recruiter login
export const loginRecruiterApi = async (credentials: LoginCredentials) => {
  return apiRequest('POST', '/recruiters/login', credentials);
};

// API for admin login
export const loginAdminApi = async (credentials: LoginCredentials) => {
  return apiRequest('POST', '/admin/login', credentials);
};

// API for user signup
export const signupUserApi = async (credentials: SignupCredentials) => {
  return apiRequest('POST', '/signup', credentials);
};

// API for recruiter signup
export const signupRecruiterApi = async (credentials: SignupCredentials) => {
  return apiRequest('POST', '/recruiters/signup', credentials);
};

// API for admin signup (If needed)
export const signupAdminApi = async (credentials: SignupCredentials) => {
  return apiRequest('POST', '/admin/signup', credentials);
};

export const googleLoginApi = async (googleToken: string) => {
  return apiRequest('POST', '/auth/google/callback', { googleToken });
};