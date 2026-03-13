import axios, { AxiosError } from 'axios';

import { getApiBaseUrl } from '../config/appConfig';
import { clearAuthToken, getAuthToken } from '../lib/storage';
import { store } from '../redux/store';

export const apiV0Client = axios.create({
  baseURL: '', // set per-request from Redux mode
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Platform: 'web',
  },
});

apiV0Client.interceptors.request.use((config) => {
  const mode = store.getState().mode.mode;
  config.baseURL = `${getApiBaseUrl(mode)}/v0`;
  // /auth is the token exchange endpoint; it does not require an existing bearer token.
  if (config.url !== '/auth') {
    const token = getAuthToken();
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
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

