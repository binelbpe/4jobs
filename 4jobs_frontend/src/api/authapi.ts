import axios from "axios";
import {
  LoginCredentials,
  SignupCredentials,
  OtpVerificationCredentials,
  Certificate,
} from "../types/auth";
import { BasicJobPost } from "../types/jobPostTypes";
import {
  CreatePostData,
  LikePostData,
  CommentPostData,
  Post,
  PostsApiResponse,
} from "../types/postTypes";
import { Message } from "../types/messageType";
import { User, UserConnection } from "../types/auth";
import { URMessage, URConversation } from "../types/userRecruiterMessage";
import { ResumeData } from '../types/resumeTypes';
import  store  from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { JobSearchFilters } from '../types/jobSearchTypes';

export interface FetchJobPostsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  filter?: any;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("API_BASE_URL",API_BASE_URL,"  process.env.REACT_APP_API_BASE_URL ",process.env.REACT_APP_API_BASE_URL)



const apiRequest = async (
  method: "POST" | "GET" | "PUT" | "DELETE",
  endpoint: string,
  data: any = {},
  headers: Record<string, string> = {}
) => {
  const token = localStorage.getItem("token");
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
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
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Token is invalid or expired
        store.dispatch(logout());
        throw new Error('Authentication failed. Please log in again.');
      }
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.error || "Server Error");
    } else if (axios.isAxiosError(error) && error.request) {
      console.error("No response received:", error.request);
      throw new Error("No response from the server");
    }
    console.error("Unexpected error:", error);
    throw new Error("An unknown error occurred");
  }
};

const apiUploadRequest = async (
  method: "POST" | "PUT",
  endpoint: string,
  formData: FormData
) => {
  const token = localStorage.getItem("token");
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
        console.error("API Error:", error.response.data);
        throw new Error(error.response.data.error || "Server Error");
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("No response from the server");
      }
    }
    console.error("Unexpected error:", error);
    throw new Error("An unknown error occurred");
  }
};

export const sendOtpApi = async (email: string) => {
  return apiRequest("POST", "/send-otp", { email });
};

export const verifyOtpApi = async (credentials: OtpVerificationCredentials) => {
  return apiRequest("POST", "/verify-otp", credentials);
};

export const loginUserApi = async (credentials: LoginCredentials) => {
  return apiRequest("POST", "/login", credentials);
};

export const signupUserApi = async (credentials: SignupCredentials) => {
  return apiRequest("POST", "/signup", credentials);
};

export const googleLoginApi = async (googleToken: string) => {
  return apiRequest("POST", "/auth/google/callback", { googleToken });
};

export const fetchUserProfileApi = async (userId: string, token: string) => {
  return apiRequest(
    "GET",
    `/profile/${userId}`,
    {},
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

export const updateUserProfileApi = async (
  userId: string,
  formData: FormData
) => {
  return apiRequest("PUT", `/edit-profile/${userId}`, formData, {
    "Content-Type": "multipart/form-data",
  });
};

export const updateUserProjectsApi = async (
  userId: string,
  projects: any[]
) => {
  return apiRequest("PUT", `/edit-projects/${userId}`, { projects });
};

export const updateUserCertificatesApi = async (
  userId: string,
  certificates: { file: File | null; details: Omit<Certificate, "file"> }[]
) => {
  const formData = new FormData();

  formData.append(
    "certificateDetails",
    JSON.stringify(certificates.map((cert) => cert.details))
  );

  certificates.forEach((cert, index) => {
    if (cert.file) {
      formData.append(`certificateImage`, cert.file, cert.file.name);
    }
  });

  return apiRequest("PUT", `/edit-certificates/${userId}`, formData, {
    "Content-Type": "multipart/form-data",
  });
};

export const updateUserExperiencesApi = async (
  userId: string,
  experiences: any[]
) => {
  return apiRequest("PUT", `/edit-experiences/${userId}`, { experiences });
};

export const updateUserResumeApi = async (userId: string, resume: File) => {
  const formData = new FormData();
  formData.append("resume", resume);
  return apiRequest("PUT", `/edit-resume/${userId}`, formData, {
    "Content-Type": "multipart/form-data",
  });
};

export const fetchJobPostsuser = async (
  params: FetchJobPostsParams = {}
): Promise<{
  jobPosts: BasicJobPost[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}> => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filter = {},
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
    filter: JSON.stringify(filter),
  });

  return apiRequest("GET", `/jobs?${queryParams.toString()}`);
};

export const applyForJob = async (
  userId: string,
  jobId: string
): Promise<void> => {
  return apiRequest("POST", `/jobs/${jobId}/apply`, { userId });
};

export const fetchJobPostApi = async (jobId: string): Promise<BasicJobPost> => {
  return apiRequest("GET", `/jobs/${jobId}`);
};

export const fetchPostsAPI = async (
  page: number,
  limit: number = 10
): Promise<Post[]> => {
  return apiRequest("GET", `/posts?page=${page}&limit=${limit}`);
};

export const fetchPostsByUserIdAPI = async (
  userId: string,
  page: number,
  limit: number
): Promise<PostsApiResponse> => {
  const response = await apiRequest(
    "GET",
    `/posts/user/${userId}?page=${page}&limit=${limit}`
  );
  return {
    posts: Array.isArray(response.posts) ? response.posts : [],
    totalPages: response.totalPages || 1,
    currentPage: response.currentPage || page,
  };
};

export const createPostAPI = async (
  postData: CreatePostData,
  userId: string
): Promise<Post> => {
  const formData = new FormData();

  if (postData.content) {
    formData.append("content", postData.content);
  }

  if (postData.image instanceof File) {
    formData.append("image", postData.image, postData.image.name);
  }

  if (postData.video instanceof File) {
    formData.append("video", postData.video, postData.video.name);
  }
 

  return apiUploadRequest("POST", `/posts/${userId}`, formData);
};

export const likePostAPI = async (likeData: LikePostData): Promise<Post> => {
  const response = await apiRequest("POST", `/posts/${likeData.postId}/like`, {
    userId: likeData.userId,
  });
  return response;
};

export const dislikePostAPI = async (
  dislikeData: LikePostData
): Promise<Post> => {
  const response = await apiRequest(
    "POST",
    `/posts/${dislikeData.postId}/dislike`,
    { userId: dislikeData.userId }
  );
  return response;
};

export const commentOnPostAPI = async (
  commentData: CommentPostData
): Promise<Post> => {
  const response = await apiRequest(
    "POST",
    `/posts/${commentData.postId}/comment`,
    {
      userId: commentData.userId,
      content: commentData.content,
      userName: commentData.userName,
      userProfileImage: commentData.userProfileImage,
    }
  );
  return response;
};

export const deletePostAPI = async (postId: string): Promise<void> => {
  return apiRequest("DELETE", `/posts/delete/${postId}`);
};

export const editPostAPI = async (
  postId: string,
  userId: string,
  postData: Partial<CreatePostData>
): Promise<Post> => {
  const formData = new FormData();

  if (postData.content) {
    formData.append("content", postData.content);
  }

  if (postData.image instanceof File) {
    formData.append("image", postData.image, postData.image.name);
  }

  if (postData.video instanceof File) {
    formData.append("video", postData.video, postData.video.name);
  }

  return apiUploadRequest("PUT", `/posts/edit/${postId}/${userId}`, formData);
};

export const reportJobApi = async (
  userId: string,
  jobId: string,
  reason: string
): Promise<void> => {
  return apiRequest("POST", `/jobs/${jobId}/report`, { userId, reason });
};

export const fetchNotificationsApi = async (userId: string) => {
  return apiRequest("GET", `/notifications/${userId}`);
};

export const fetchRecommendationsApi = async (userId: string) => {
  return apiRequest("GET", `/connections/recommendations/${userId}`);
};

export const sendConnectionRequestApi = async (
  senderId: string,
  recipientId: string
) => {
  return apiRequest("POST", "/connections/request", { senderId, recipientId });
};

export const fetchConnectionProfileApi = async (userId: string) => {
  return apiRequest("GET", `/connections/profile/${userId}`);
};
export const fetchConnectionRequestsApi = async (userId: string) => {
  const response = await apiRequest("GET", `/connections/requests/${userId}`);
  return response;
};

export const acceptConnectionRequestApi = async (
  requestId: string,
  userId: string
) => {
  return apiRequest("POST", `/connections/accept/${requestId}`, { userId });
};

export const rejectConnectionRequestApi = async (
  requestId: string,
  userId: string
) => {
  return apiRequest("POST", `/connections/reject/${requestId}`, { userId });
};

export const fetchConnectionsApi = async (userId: string) => {
  return apiRequest("GET", `/connections/${userId}`);
};

export const searchConnectionsApi = async (userId: string, query: string) => {
  return apiRequest("GET", `/connections/${userId}/search?query=${query}`);
};

export const getConversationApi = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  return apiRequest("GET", `/messages/${userId1}/${userId2}`);
};

export const markMessageAsReadApi = async (
  messageId: string
): Promise<string> => {
  return apiRequest("PUT", `/messages/${messageId}/read`);
};

export const getUnreadMessageCountApi = async (
  userId: string
): Promise<number> => {
  return apiRequest("GET", `/messages/unread/${userId}`);
};

export const fetchConnectionsMessageApi = async (
  userId: string
): Promise<{ user: User; lastMessage: Message; isOnline: boolean }[]> => {
  return apiRequest("GET", `/connections/message/${userId}`);
};

export const searchConnectionsMessageApi = async (
  userId: string,
  query: string
): Promise<UserConnection[]> => {
  return apiRequest("GET", `/connections/${userId}/search?query=${query}`);
};

export const fetchUserConversationsApi = async (
  userId: string
): Promise<URConversation[]> => {
  return apiRequest("GET", `/user-conversations/${userId}`);
};

export const fetchUserMessagesApi = async (
  conversationId: string
): Promise<URMessage[]> => {
  return apiRequest("GET", `/user-messages/${conversationId}`);
};

export const sendUserMessageApi = async (
  conversationId: string,
  content: string,
  senderId: string
): Promise<URMessage> => {
  return apiRequest("POST", `/user-messages/${conversationId}`, {
    content,
    senderId,
  });
};

export const searchUsersAndJobsApi = async (query: string, userId: string) => {
  return apiRequest(
    "GET",
    `/search?query=${encodeURIComponent(query)}&userId=${userId}`
  );
};

export const deleteCommentAPI = async (
  postId: string,
  commentId: string
): Promise<Post> => {
  return apiRequest("DELETE", `/posts/${postId}/comments/${commentId}`);
};

export const generateResumeApi = async (resumeData: ResumeData): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-resume`, resumeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data && response.data.pdfData) {
      // Convert base64 to blob
      const byteCharacters = atob(response.data.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const fileURL = URL.createObjectURL(blob);
      return fileURL;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error("Error generating resume:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(`Server error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from the server');
      } else {
        console.error('Error setting up request:', error.message);
        throw new Error('Error setting up request');
      }
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

// Add these new functions to the existing file

export const sendForgotPasswordOtpApi = async (email: string) => {
  return apiRequest("POST", "/forgot-password", { email });
};

export const verifyForgotPasswordOtpApi = async (email: string, otp: string) => {
  return apiRequest("POST", "/verify-forgot-password-otp", { email, otp });
};

// Add this new function
export const resetPasswordApi = async (email: string, newPassword: string, otp: string) => {
  return apiRequest("POST", "/reset-password", { email, newPassword, otp });
};

export const refreshTokenApi = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await axios.post(`${API_BASE_URL}/refresh-token`, { refreshToken });
  return response.data.token;
};

export const removeConnectionApi = async (userId: string, connectionId: string) => {
  return apiRequest("DELETE", `/connections/${userId}/remove/${connectionId}`);
};

// Add this function to the existing authapi.ts
export const advancedJobSearchApi = async (
  filters: JobSearchFilters,
  page: number = 1,
  limit: number = 10
): Promise<{
  exactMatches: BasicJobPost[];
  similarMatches: BasicJobPost[];
  totalPages: number;
  currentPage: number;
  totalExactCount: number;
  totalSimilarCount: number;
}> => {
  return apiRequest("POST", "/jobs/advanced-search", {
    filters,
    page,
    limit
  });
};

