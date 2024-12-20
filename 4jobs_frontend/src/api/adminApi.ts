import axios from "axios";
import store from "../redux/store";
import { setLogoutAdmin } from "../redux/slices/adminSlice";
import { getCsrfToken, setCsrfToken, clearCsrfToken } from "../utils/csrf";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL_ADMIN;

const apiRequest = async (
  method: "POST" | "GET" | "DELETE" | "PATCH",
  endpoint: string,
  data: any = {}
) => {
  const token = localStorage.getItem("adminToken");
  const csrfToken = getCsrfToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers,
      withCredentials: true,
    });

    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      setCsrfToken(newCsrfToken);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      clearCsrfToken();
    }
    throw error;
  }
};

export const adminLoginApi = async (email: string, password: string) => {
  return apiRequest("POST", "/login", { email, password });
};

export const fetchAdminDashboardDataApi = async () => {
  return apiRequest("GET", "/dashboard");
};

export const fetchRecruitersApi = async () => {
  const response = apiRequest("GET", "/recruiters");
  return response;
};

export const approveRecruiterApi = async (recruiterId: string) => {
  return apiRequest("PATCH", `/recruiters/${recruiterId}/approve`);
};

export const fetchUsersApi = async () => {
  return apiRequest("GET", `/users`);
};

export const blockUserApi = async (userId: string) => {
  return apiRequest("PATCH", `/users/${userId}/block`);
};

export const unblockUserApi = async (userId: string) => {
  return apiRequest("PATCH", `/users/${userId}/unblock`);
};

export const fetchJobPostsApi = async () => {
  return apiRequest("GET", "/job-posts");
};

export const blockJobPostApi = async (postId: string) => {
  return apiRequest("PATCH", `/job-posts/${postId}/block`);
};

export const unblockJobPostApi = async (postId: string) => {
  return apiRequest("PATCH", `/job-posts/${postId}/unblock`);
};

export const fetchDashboardDataApi = async () => {
  return apiRequest("GET", "/dashboard");
};

export const fetchSubscriptionsApi = async (page: number, limit: number) => {
  const response = await apiRequest(
    "GET",
    `/subscriptions?page=${page}&limit=${limit}`
  );
  return {
    subscriptions: response.subscriptions,
    totalPages: response.totalPages,
    currentPage: response.currentPage,
  };
};

export const cancelSubscriptionApi = async (subscriptionId: string) => {
  return apiRequest("POST", `/subscriptions/${subscriptionId}/cancel`);
};

export const fetchUserPostsApi = async (page: number, limit: number) => {
  const response = await apiRequest(
    "GET",
    `/user-posts?page=${page}&limit=${limit}`
  );
  return {
    userPosts: response.userPosts,
    totalPages: response.totalPages,
    currentPage: response.currentPage,
  };
};

export const blockUserPostApi = async (postId: string) => {
  return apiRequest("POST", `/user-posts/${postId}/toggle-block`);
};

export const refreshAdminTokenApi = async () => {
  return apiRequest("POST", "/refresh-token");
};
