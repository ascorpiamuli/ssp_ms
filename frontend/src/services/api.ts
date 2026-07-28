// services/api.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types/auth.types';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sspmis.pasbestventures.com';
const API_VERSION = 'v1';

// ─── Token Management ───
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Check both storages
  let token = localStorage.getItem('token');
  if (token) {
    return token;
  }

  token = sessionStorage.getItem('token');
  if (token) {
    return token;
  }

  return null;
};

const setToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;

  try {
    // Always save to both storages for redundancy
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

// ─── Check if token is expired ───
const isTokenExpired = (token: string): boolean => {
  try {
    // Sanctum tokens: {id}|{hash} - no client-side expiration
    if (token.includes('|')) {
      return false;
    }
    // JWT tokens: 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false;
  }
};

// ─── Private API Client ───
const privateApiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
  withCredentials: true,
});

privateApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && !isTokenExpired(token) && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Public API Client ───
const publicApiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
  withCredentials: true,
});

publicApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

publicApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => Promise.reject(error)
);

// ─── Extract Data Helper ───
function extractData<T>(response: any): T {
  // If response has data property, unwrap it
  if (response && typeof response === 'object' && 'data' in response) {
    const data = response.data;
    // If the data also has data property (nested), unwrap again
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data as T;
    }
    return data as T;
  }

  // If response is already the data with success property
  if (response && typeof response === 'object' && 'success' in response) {
    return response as T;
  }

  // If response is undefined or null
  if (!response) {
    return {} as T;
  }

  // Default - return as-is
  return response as T;
}

// ─── Private API Methods ───
export const privateApi = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await privateApiClient.get(url, config);
    return extractData<T>(response.data);
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await privateApiClient.post(url, data, config);
    return extractData<T>(response.data);
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await privateApiClient.put(url, data, config);
    return extractData<T>(response.data);
  },
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await privateApiClient.patch(url, data, config);
    return extractData<T>(response.data);
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await privateApiClient.delete(url, config);
    return extractData<T>(response.data);
  },
  upload: async <T = any>(url: string, file: File, fieldName: string = 'file', config?: AxiosRequestConfig): Promise<T> => {
    const formData = new FormData();
    formData.append(fieldName, file);
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
    };
    const response = await privateApiClient.post(url, formData, uploadConfig);
    return extractData<T>(response.data);
  },
  getClient: (): AxiosInstance => privateApiClient,
};

// ─── Public API Methods ───
export const publicApi = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicApiClient.get(url, config);
    return extractData<T>(response.data);
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicApiClient.post(url, data, config);
    return extractData<T>(response.data);
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicApiClient.put(url, data, config);
    return extractData<T>(response.data);
  },
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicApiClient.patch(url, data, config);
    return extractData<T>(response.data);
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicApiClient.delete(url, config);
    return extractData<T>(response.data);
  },
  getClient: (): AxiosInstance => publicApiClient,
};

// ─── CSRF Helper ───
export const csrf = {
  getCookie: async (): Promise<void> => {
    try {
      const csrfClient = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      await csrfClient.get('/sanctum/csrf-cookie');
    } catch (error) {
      console.error('Failed to get CSRF cookie:', error);
      throw error;
    }
  },
};

// ─── Token Manager ───
export const tokenManager = {
  get: getToken,
  set: setToken,
  remove: removeToken,
};

export const api = privateApi;
export default privateApiClient;
