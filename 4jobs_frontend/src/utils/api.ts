import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosRequestHeaders
} from "axios";
import { getCsrfToken, setCsrfToken, clearCsrfToken } from "./csrf";
import { refreshTokenApi } from "../api/authapi";

// Define error response type
interface ErrorResponse {
  message?: string;
  error?: string;
  status?: string;
}

const createApiInstance = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      const csrfToken = getCsrfToken();

      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      if (csrfToken) {
        config.headers.set("x-csrf-token", csrfToken);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      const newCsrfToken = response.headers["x-csrf-token"];
      if (newCsrfToken) {
        setCsrfToken(newCsrfToken);
      }
      return response;
    },
    async (error: AxiosError<ErrorResponse>) => {
      const originalRequest = error.config;

      if (error.response?.status === 401) {
        try {
          const newToken = await refreshTokenApi();
          localStorage.setItem("token", newToken);

          if (originalRequest) {
            if (!originalRequest.headers) {
              originalRequest.headers = new AxiosHeaders();
            }
            if (originalRequest.headers instanceof AxiosHeaders) {
              originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            } else {
              const headers = new AxiosHeaders();
              Object.entries(originalRequest.headers as Record<string, string>).forEach(
                ([key, value]) => headers.set(key, value)
              );
              headers.set("Authorization", `Bearer ${newToken}`);
              originalRequest.headers = headers;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          clearCsrfToken();
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403 && error.response.data?.message?.includes("CSRF")) {
        clearCsrfToken();
        // Try to get a new CSRF token
        try {
          const response = await api.get('/csrf-token');
          const newToken = response.headers['x-csrf-token'];
          if (newToken) {
            setCsrfToken(newToken);
            if (originalRequest) {
              return api(originalRequest);
            }
          }
        } catch (csrfError) {
          console.error('Failed to refresh CSRF token:', csrfError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export const api = createApiInstance(process.env.REACT_APP_API_BASE_URL!);
export const adminApi = createApiInstance(
  process.env.REACT_APP_API_BASE_URL_ADMIN!
);
export const recruiterApi = createApiInstance(
  process.env.REACT_APP_API_BASE_URL_RECRUITER!
);

// Export types for use in other files
export type { ErrorResponse };
