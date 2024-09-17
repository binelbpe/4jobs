import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/recruiter';

const apiRequest = async (method: 'POST' | 'GET' | 'DELETE', endpoint: string, data: any = {}) => {
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
        console.error('API Error:', error.response.data);
        throw new Error(error.response.data.error || 'Server Error');
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from the server');
      }
    }
    console.error('Unexpected error:', error);
    throw new Error('An unknown error occurred');
  }
};


export const registerRecruiterApi = async (recruiterData: any) => {
  console.log('Attempting recruiter registration:', recruiterData);
  return apiRequest('POST', '/register', recruiterData);
};

export const loginRecruiterApi = async (loginData: any) => {
  console.log('Attempting recruiter login with:', loginData);
  return apiRequest('POST', '/login', loginData);
};


export const verifyOtpApi = async (otpData: any) => {
  console.log('Attempting OTP verification:', otpData);
  return apiRequest('POST', '/verify-otp', otpData);
};

export const sendOtpApi = async (email: string) => {
  console.log('Attempting to send OTP to:', email);
  return apiRequest('POST', '/send-otp', { email });
};

