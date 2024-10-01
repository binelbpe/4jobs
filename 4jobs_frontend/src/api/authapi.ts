import axios from 'axios';
import { LoginCredentials, SignupCredentials, OtpVerificationCredentials, Certificate } from '../types/auth';
import { BasicJobPost } from '../types/jobPostTypes';
import { CreatePostData, LikePostData, CommentPostData, Post } from '../types/postTypes';

export interface FetchJobPostsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  filter?: any;
}

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

const apiUploadRequest = async (
  method: 'POST' | 'PUT',
  endpoint: string,
  formData: FormData,
) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data: formData,
      headers: headers,
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
    console.log("cert.file",cert.file)
  });

  console.log("form data",formData)

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

export const fetchJobPostsuser = async (params: FetchJobPostsParams = {}): Promise<{ jobPosts: BasicJobPost[], currentPage: number, totalPages: number, totalCount: number }> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    filter = {}
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
    filter: JSON.stringify(filter)
  });

  return apiRequest('GET', `/jobs?${queryParams.toString()}`);
};


export const applyForJob = async (userId: string, jobId: string): Promise<void> => {
  return apiRequest('POST', `/jobs/${jobId}/apply`, { userId });
};


export const fetchJobPostApi = async (jobId: string): Promise<BasicJobPost> => {
  return apiRequest('GET', `/jobs/${jobId}`);
};



/* ------------------ Post APIs ------------------ */

export const fetchPostsAPI = async (page: number, limit: number = 10): Promise<Post[]> => {
  return apiRequest('GET', `/posts?page=${page}&limit=${limit}`);
};

// Fetch posts by user ID
export const fetchPostsByUserIdAPI = async (userId: string, page: number, limit: number): Promise<Post[]> => {
  return apiRequest('GET', `/posts/user/${userId}?page=${page}&limit=${limit}`);
};

// Create a new post
export const createPostAPI = async (postData: CreatePostData, userId: string): Promise<Post> => {
  const formData = new FormData();
  
  if (postData.content) {
    formData.append('content', postData.content);
  }
  
  if (postData.image instanceof File) {
    formData.append('image', postData.image, postData.image.name);
  }
  
  if (postData.video instanceof File) {
    formData.append('video', postData.video, postData.video.name);
  }

  // Log FormData entries
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value instanceof File ? value.name : value}`);
  }

  return apiUploadRequest('POST', `/posts/${userId}`, formData);
};

// Like a post
export const likePostAPI = async (likeData: LikePostData): Promise<Post> => {
  return apiRequest('POST', `/posts/${likeData.postId}/like`, { userId: likeData.userId });
};

// Comment on a post
export const commentOnPostAPI = async (commentData: CommentPostData): Promise<Post> => {
  return apiRequest('POST', `/posts/${commentData.postId}/comment`, {
    userId: commentData.userId,
    content: commentData.content,
  });
};

export const deletePostAPI = async (postId: string): Promise<void> => {
  return apiRequest('DELETE', `/posts/delete/${postId}`);
};

export const editPostAPI = async (postId: string,userId:string, postData: Partial<CreatePostData>): Promise<Post> => {
  const formData = new FormData();
  
  if (postData.content) {
    formData.append('content', postData.content);
  }
  
  if (postData.image instanceof File) {
    formData.append('image', postData.image, postData.image.name);
  }
  
  if (postData.video instanceof File) {
    formData.append('video', postData.video, postData.video.name);
  }

  return apiUploadRequest('PUT', `/posts/edit/${postId}/${userId}`, formData);
};

export const reportJobApi = async (userId: string, jobId: string): Promise<void> => {
  return apiRequest('POST', `/jobs/${jobId}/report`, { userId });
};

export const fetchConnectionProfileApi = async (userId: string) => {
  return apiRequest('GET', `/connections/profile/${userId}`);
};

export const fetchNotificationsApi = async (userId: string) => {
  return apiRequest('GET', `/notifications/${userId}`);
};

// Add the new function to fetch recommendations
export const fetchRecommendationsApi = async (userId: string) => {
  return apiRequest('GET', `/connections/recommendations/${userId}`);
};

// Add the new function to send a connection request
export const sendConnectionRequestApi = async (senderId: string, recipientId: string) => {
  return apiRequest('POST', '/connections/request', { senderId, recipientId });
};
