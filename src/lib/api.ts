import axios, { AxiosError } from 'axios';

import { clearAuthToken, getAuthToken } from './storage';

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
}

export const apiV0Client = axios.create({
  baseURL: `${getApiBaseUrl()}/v0`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Platform: 'web',
  },
});

apiV0Client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

apiV0Client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  },
);
