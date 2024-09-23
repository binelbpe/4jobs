import axios from 'axios';
import { LoginCredentials, SignupCredentials, OtpVerificationCredentials, Certificate } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000';

const apiRequest = async (
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  endpoint: string,
  data: any = {},
  headers: Record<string, string> = {}
) => {
  const token = localStorage.getItem('token');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token if present
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const mergedHeaders = { ...defaultHeaders, ...headers };

  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers: mergedHeaders,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Handle API errors based on status codes
        if (error.response.status === 401) {
          console.error('Unauthorized - Token might be expired');
          localStorage.removeItem('token'); // Remove invalid token
          window.location.href = '/login';  // Redirect to login
        } else {
          console.error('API Error:', error.response.data.error);
          throw new Error(error.response.data.error);
        }
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

export const sendOtpApi = async (email: string) => {
  return apiRequest('POST', '/send-otp', { email });
};

export const verifyOtpApi = async (credentials: OtpVerificationCredentials) => {
  return apiRequest('POST', '/verify-otp', credentials);
};

export const loginUserApi = async (credentials: LoginCredentials) => {
  return apiRequest('POST', '/login', credentials);
};

export const signupUserApi = async (credentials: SignupCredentials) => {
  return apiRequest('POST', '/signup', credentials);
};

export const googleLoginApi = async (googleToken: string) => {
  return apiRequest('POST', '/auth/google/callback', { googleToken });
};

export const fetchUserProfileApi = async (userId: string, token: string) => {
  return apiRequest('GET', `/profile/${userId}`, {}, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateUserProfileApi = async (userId: string, formData: FormData) => {
  return apiRequest('PUT', `/edit-profile/${userId}`, formData, {
    'Content-Type': 'multipart/form-data',
  });
};

export const updateUserProjectsApi = async (userId: string, projects: any[]) => {
  return apiRequest('PUT', `/edit-projects/${userId}`, { projects });
};

export const updateUserCertificatesApi = async (
  userId: string,
  certificates: { file: File | null; details: Omit<Certificate, 'file'> }[]
) => {
  const formData = new FormData();
  
  // Append the certificate details
  formData.append('certificateDetails', JSON.stringify(certificates.map(cert => cert.details)));

  // If you only need one image per certificate, append the file correctly
  certificates.forEach((cert, index) => {
    if (cert.file) {
      formData.append(`certificateImage`, cert.file, cert.file.name); // Use a consistent key for the image
    }
  });

  return apiRequest('PUT', `/edit-certificates/${userId}`, formData, {
    'Content-Type': 'multipart/form-data',
  });
};


export const updateUserExperiencesApi = async (userId: string, experiences: any[]) => {
  return apiRequest('PUT', `/edit-experiences/${userId}`, { experiences });
};

export const updateUserResumeApi = async (userId: string, resume: File) => {
  const formData = new FormData();
  formData.append('resume', resume);
  return apiRequest('PUT', `/edit-resume/${userId}`, formData, {
    'Content-Type': 'multipart/form-data',
  });
};
