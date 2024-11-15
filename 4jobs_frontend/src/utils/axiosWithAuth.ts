import axios, { AxiosInstance } from 'axios';
import { TokenService } from '../services/tokenService';

export const createAuthenticatedApi = (
  baseURL: string,
  type: 'user' | 'recruiter' | 'admin'
): AxiosInstance => {
  const api = axios.create({
    baseURL,
    withCredentials: true
  });

  api.interceptors.request.use(
    (config) => {
      const tokens = TokenService.getTokens(type);
      
      if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      
      if (tokens.csrfToken) {
        config.headers['x-csrf-token'] = tokens.csrfToken;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      const newCsrfToken = response.headers['x-csrf-token'];
      if (newCsrfToken) {
        const currentTokens = TokenService.getTokens(type);
        if (currentTokens.accessToken && currentTokens.refreshToken) {
          TokenService.setTokens(type, {
            accessToken: currentTokens.accessToken,
            refreshToken: currentTokens.refreshToken,
            csrfToken: newCsrfToken
          });
        }
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const tokens = TokenService.getTokens(type);
          const response = await axios.post(`${baseURL}/refresh-token`, {
            refreshToken: tokens.refreshToken
          });

          const { accessToken, refreshToken, csrfToken } = response.data;
          TokenService.setTokens(type, { accessToken, refreshToken, csrfToken });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          if (csrfToken) {
            originalRequest.headers['x-csrf-token'] = csrfToken;
          }

          return api(originalRequest);
        } catch (refreshError) {
          TokenService.clearTokens(type);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}; 