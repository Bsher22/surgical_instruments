// src/api/client.ts
// API client with error interceptor and retry logic integrated

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Platform } from 'react-native';
import {
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
} from './errorInterceptor';
import { withRetry, RetryConfig } from '../utils/retry';

// Platform-aware storage helper
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    try {
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

// Environment configuration
const getApiBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  // Ensure URL has protocol
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};
const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = 30000; // 30 seconds

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add request interceptor
  client.interceptors.request.use(
    requestInterceptor,
    (error) => Promise.reject(error)
  );

  // Add response interceptor
  client.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  );

  return client;
};

// Singleton instance
let apiClientInstance: AxiosInstance | null = null;

export const getApiClient = (): AxiosInstance => {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient();
  }
  return apiClientInstance;
};

// Token management
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await secureStorage.setItem(TOKEN_KEY, token);
  },

  async removeToken(): Promise<void> {
    await secureStorage.deleteItem(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await secureStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  async removeRefreshToken(): Promise<void> {
    await secureStorage.deleteItem(REFRESH_TOKEN_KEY);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      secureStorage.deleteItem(TOKEN_KEY),
      secureStorage.deleteItem(REFRESH_TOKEN_KEY),
    ]);
  },
};

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// API request helpers with retry support
export const api = {
  /**
   * GET request with optional retry
   */
  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const client = getApiClient();
    
    if (retryConfig) {
      return withRetry(
        () => client.get<T>(url, config).then((res) => res.data),
        retryConfig
      );
    }
    
    const response = await client.get<T>(url, config);
    return response.data;
  },

  /**
   * POST request with optional retry
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const client = getApiClient();
    
    if (retryConfig) {
      return withRetry(
        () => client.post<T>(url, data, config).then((res) => res.data),
        retryConfig
      );
    }
    
    const response = await client.post<T>(url, data, config);
    return response.data;
  },

  /**
   * PUT request with optional retry
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const client = getApiClient();
    
    if (retryConfig) {
      return withRetry(
        () => client.put<T>(url, data, config).then((res) => res.data),
        retryConfig
      );
    }
    
    const response = await client.put<T>(url, data, config);
    return response.data;
  },

  /**
   * PATCH request with optional retry
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const client = getApiClient();
    
    if (retryConfig) {
      return withRetry(
        () => client.patch<T>(url, data, config).then((res) => res.data),
        retryConfig
      );
    }
    
    const response = await client.patch<T>(url, data, config);
    return response.data;
  },

  /**
   * DELETE request with optional retry
   */
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
    retryConfig?: RetryConfig
  ): Promise<T> {
    const client = getApiClient();
    
    if (retryConfig) {
      return withRetry(
        () => client.delete<T>(url, config).then((res) => res.data),
        retryConfig
      );
    }
    
    const response = await client.delete<T>(url, config);
    return response.data;
  },

  /**
   * Upload file with progress tracking
   */
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const client = getApiClient();
    
    const response = await client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    
    return response.data;
  },
};

// Export the client instance for direct use if needed
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => getApiClient().get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => getApiClient().post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => getApiClient().put<T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => getApiClient().patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => getApiClient().delete<T>(url, config),
};

export default getApiClient;
