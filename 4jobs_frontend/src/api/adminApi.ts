import axios from "axios";
import store from "../redux/store";
import { setLogoutAdmin } from "../redux/slices/adminSlice";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL_ADMIN;

const apiRequest = async (
  method: "POST" | "GET" | "DELETE" | "PATCH",
  endpoint: string,
  data: any = {}
) => {
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!token) {
    console.error("no token");
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
        if (error.response.status === 401) {
          store.dispatch(setLogoutAdmin());
          throw new Error("Authentication failed. Please log in again.");
        }
        console.error(
          "API Error:",
          error.response.data.error || "Unknown error from API"
        );
        throw new Error(error.response.data.error || "Server Error");
      } else if (error.request) {
        console.error("No response received from API:", error.request);
        throw new Error("No response from the server");
      }
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unknown error occurred");
    }
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
