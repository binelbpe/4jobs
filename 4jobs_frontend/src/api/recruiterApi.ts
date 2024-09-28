import axios from 'axios';
import {  CreateBasicJobPostParams, UpdateBasicJobPostParams } from '../types/jobPostTypes';
import { FetchUsersResponse, FetchUserDetailsResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/recruiter';

// Function to handle API requests
const apiRequest = async (method: 'POST' | 'GET' | 'DELETE' | 'PUT', endpoint: string, data: any = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

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

// API functions
export const registerRecruiterApi = async (recruiterData: FormData) => {
  console.log('Attempting recruiter registration with file:', recruiterData);
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

export const fetchRecruiterProfileApi = async (recruiterId: string) => {
  console.log(`Fetching profile for recruiter ID: ${recruiterId}`);
  return apiRequest('GET', `/profile/${recruiterId}`);
};

export const updateRecruiterProfileApi = async (recruiterId: string, profileData: any) => {
  console.log(`Updating profile for recruiter ID: ${recruiterId}`);
  return apiRequest('PUT', `/update-profile/${recruiterId}`, profileData);
};
export const getJobPosts = async (recruiterId: string) => {
  if (!recruiterId) {
    throw new Error('Recruiter ID is required to fetch job posts');
  }
  try {
    const response = await apiRequest('GET', `/recruiters/${recruiterId}/job-posts`);
    console.log('Job posts fetched:', response); // Add this line for debugging
    return response;
  } catch (error) {
    console.error('Error fetching job posts:', error);
    throw error;
  }
};

export const createJobPost = async (params: CreateBasicJobPostParams) => {
  const { recruiterId, postData } = params;
  return apiRequest('POST', `/create-jobpost/${recruiterId}`, postData);
};

export const updateJobPost = async (params: UpdateBasicJobPostParams) => {
  if (!params.id) {
    throw new Error('Job post ID is required to update the job post');
  }
  console.log('Updating job post with ID:', params.id);
  console.log('Update data:', params.postData);
  try {
    const result = await apiRequest('PUT', `/update-jobpost/${params.id}`, params.postData);
    console.log('Update result:', result);
    return result;
  } catch (error) {
    console.error('Error updating job post:', error);
    throw error;
  }
};

export const deleteJobPost = async (id: string) => {
  if (!id) {
    throw new Error('Job post ID is required to delete the job post');
  }
  return apiRequest('DELETE', `/jobpost-delete/${id}`);
};

export const fetchJobApplicants = async (jobId: string, page: number = 1): Promise<FetchUsersResponse> => {
  console.log("job",jobId,page)
  return apiRequest('GET', `/job-applicants/${jobId}?page=${page}`);
};

export const fetchUserDetails = async (userId: string): Promise<FetchUserDetailsResponse> => {
  return apiRequest('GET', `/applicants/${userId}`);
};