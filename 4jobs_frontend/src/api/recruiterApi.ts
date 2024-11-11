import axios from "axios";
import {
  BasicJobPost,
  CreateBasicJobPostParams,
  UpdateBasicJobPostParams,
} from "../types/jobPostTypes";
import { FetchUsersResponse, FetchUserDetailsResponse } from "../types/auth";
import { Conversation, Message } from "../types/recruiterMessageType";
import store from "../redux/store";
import { logout } from "../redux/slices/recruiterSlice";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL_RECRUITER;

const apiRequest = async (
  method: "POST" | "GET" | "DELETE" | "PUT",
  endpoint: string,
  data: any = {}
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
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          store.dispatch(logout());
          throw new Error("Authentication failed. Please log in again.");
        }
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

export const registerRecruiterApi = async (recruiterData: FormData) => {
  return apiRequest("POST", "/register", recruiterData);
};

export const loginRecruiterApi = async (loginData: any) => {
  return apiRequest("POST", "/login", loginData);
};

export const verifyOtpApi = async (otpData: any) => {
  return apiRequest("POST", "/verify-otp", otpData);
};

export const sendOtpApi = async (email: string) => {
  return apiRequest("POST", "/send-otp", { email });
};

export const fetchRecruiterProfileApi = async (recruiterId: string) => {
  return apiRequest("GET", `/profile/${recruiterId}`);
};

export const updateRecruiterProfileApi = async (
  recruiterId: string,
  profileData: any
) => {
  return apiRequest("PUT", `/update-profile/${recruiterId}`, profileData);
};
export const getJobPosts = async (recruiterId: string) => {
  if (!recruiterId) {
    throw new Error("Recruiter ID is required to fetch job posts");
  }
  try {
    const response = await apiRequest(
      "GET",
      `/recruiters/${recruiterId}/job-posts`
    );
    return response;
  } catch (error) {
    console.error("Error fetching job posts:", error);
    throw error;
  }
};

export const createJobPost = async (params: CreateBasicJobPostParams) => {
  const { recruiterId, postData } = params;
  return apiRequest("POST", `/create-jobpost/${recruiterId}`, postData);
};

export const updateJobPost = async (params: UpdateBasicJobPostParams) => {
  if (!params.id) {
    throw new Error("Job post ID is required to update the job post");
  }

  try {
    const result = await apiRequest(
      "PUT",
      `/update-jobpost/${params.id}`,
      params.postData
    );
    return result;
  } catch (error) {
    console.error("Error updating job post:", error);
    throw error;
  }
};

export const deleteJobPost = async (id: string) => {
  if (!id) {
    throw new Error("Job post ID is required to delete the job post");
  }
  return apiRequest("DELETE", `/jobpost-delete/${id}`);
};

export const fetchJobApplicants = async (
  jobId: string,
  page: number = 1
): Promise<FetchUsersResponse> => {
  return apiRequest("GET", `/job-applicants/${jobId}?page=${page}`);
};

export const fetchUserDetails = async (
  userId: string
): Promise<FetchUserDetailsResponse> => {
  return apiRequest("GET", `/applicants/${userId}`);
};

export const fetchConversationsApi = async (
  recruiterId: string
): Promise<{ data: Conversation[] }> => {
  return apiRequest("GET", `/conversations/${recruiterId}`);
};

export const fetchMessagesApi = async (
  conversationId: string
): Promise<{ data: Message[] }> => {
  const response = await apiRequest(
    "GET",
    `/conversations/${conversationId}/messages`
  );
  return { data: Array.isArray(response.data) ? response.data : response };
};

export const sendMessageApi = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  try {
    const response = await apiRequest(
      "POST",
      `/conversations/${conversationId}/messages`,
      { content }
    );
    if (response && typeof response === "object" && "id" in response) {
      return response as Message;
    } else if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      typeof response.data === "object" &&
      "id" in response.data
    ) {
      return response.data as Message;
    } else {
      console.error(
        "Invalid response structure from sendMessageApi:",
        response
      );
      throw new Error("Invalid response structure from server");
    }
  } catch (error) {
    console.error("Error in sendMessageApi:", error);
    throw error;
  }
};

export const startConversationApi = async (
  applicantId: string,
  recruiterId: string
): Promise<{ data: Conversation }> => {
  return apiRequest("POST", "/conversations", { applicantId, recruiterId });
};

export const updateSubscriptionApi = async (
  recruiterId: string,
  subscriptionData: any
) => {
  return apiRequest(
    "PUT",
    `/update-subscription/${recruiterId}`,
    subscriptionData
  );
};

export const searchUsers = async (query: string) => {
  const response = await apiRequest("GET", `/search-users?query=${query}`);
  return response;
};

export const fetchJobDetails = async (jobId: string): Promise<BasicJobPost> => {
  return apiRequest("GET", `/job-details/${jobId}`);
};

export const getAllJobPosts = async () => {
  try {
    const response = await apiRequest("GET", "/all-job-posts");
    return response;
  } catch (error) {
    console.error("Error fetching all job posts:", error);
    throw error;
  }
};

export const fetchFilteredApplicants = async (
  jobId: string
): Promise<FetchUsersResponse> => {
  const response = await apiRequest("GET", `/filtered-applicants/${jobId}`);
  return response;
};

export const refreshRecruiterTokenApi = async () => {
  return apiRequest("POST", "/refresh-token");
};
