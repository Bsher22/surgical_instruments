// src/api/errorInterceptor.ts
// Centralized API error handling for SurgicalPrep

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import { router } from 'expo-router';

// Error types for consistent handling
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// HTTP status code handlers
const STATUS_HANDLERS: Record<number, (error: AxiosError<ApiError>) => void> = {
  400: (error) => {
    const message = error.response?.data?.message || 'Invalid request';
    showToast('error', message);
  },
  
  401: async (error) => {
    const authStore = useAuthStore.getState();
    
    // Try to refresh the token
    const refreshed = await authStore.refreshToken();
    
    if (!refreshed) {
      // Clear auth state and redirect to login
      authStore.logout();
      router.replace('/(auth)/login');
      showToast('warning', 'Session expired. Please log in again.');
    }
  },
  
  403: (error) => {
    const message = error.response?.data?.message || 'Access denied';
    
    // Check if it's a premium feature restriction
    if (error.response?.data?.code === 'PREMIUM_REQUIRED') {
      // Navigate to upgrade screen
      router.push('/(tabs)/profile/upgrade');
      showToast('info', 'This feature requires a premium subscription');
    } else {
      showToast('error', message);
    }
  },
  
  404: (error) => {
    const message = error.response?.data?.message || 'Resource not found';
    showToast('error', message);
  },
  
  409: (error) => {
    const message = error.response?.data?.message || 'Conflict with existing data';
    showToast('error', message);
  },
  
  422: (error) => {
    // Validation errors
    const details = error.response?.data?.details;
    if (details) {
      const firstError = Object.values(details)[0]?.[0];
      showToast('error', firstError || 'Validation failed');
    } else {
      showToast('error', error.response?.data?.message || 'Validation failed');
    }
  },
  
  429: (error) => {
    showToast('warning', 'Too many requests. Please wait a moment.');
  },
  
  500: (error) => {
    showToast('error', 'Server error. Please try again later.');
    logError(error);
  },
  
  502: (error) => {
    showToast('error', 'Service temporarily unavailable.');
    logError(error);
  },
  
  503: (error) => {
    showToast('error', 'Service under maintenance. Please try again later.');
    logError(error);
  },
  
  504: (error) => {
    showToast('error', 'Request timed out. Please check your connection.');
  },
};

// Helper to show toast
const showToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string
) => {
  const { addToast } = useToastStore.getState();
  addToast({ type, message });
};

// Error logging (can be connected to Sentry, etc.)
const logError = (error: AxiosError<ApiError>) => {
  if (__DEV__) {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
  
  // TODO: Send to error monitoring service
  // Sentry.captureException(error);
};

// Parse validation errors into a usable format
export const parseValidationErrors = (
  error: AxiosError<ApiError>
): ValidationError[] => {
  const details = error.response?.data?.details;
  if (!details) return [];
  
  return Object.entries(details).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message }))
  );
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Network error
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out';
      }
      return 'Network error. Please check your connection.';
    }
    
    // API error
    return error.response.data?.message || 'Something went wrong';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Request interceptor
export const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  // Add auth token if available
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request ID for tracking
  config.headers['X-Request-ID'] = generateRequestId();
  
  return config;
};

// Response interceptor for successful responses
export const responseInterceptor = (
  response: AxiosResponse
): AxiosResponse => {
  // You can add logging or transform responses here
  return response;
};

// Error interceptor
export const errorInterceptor = async (
  error: AxiosError<ApiError>
): Promise<never> => {
  const status = error.response?.status;
  
  // Handle specific status codes
  if (status && STATUS_HANDLERS[status]) {
    STATUS_HANDLERS[status](error);
  } else if (status && status >= 500) {
    // Generic server error handling
    STATUS_HANDLERS[500](error);
  } else if (!error.response) {
    // Network error (no response)
    showToast('error', 'Network error. Please check your connection.');
  }
  
  // Always log errors in development
  if (__DEV__) {
    logError(error);
  }
  
  // Re-throw for React Query to handle
  return Promise.reject(error);
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Utility to check if error is retryable
export const isRetryableError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  
  // No response = network error, retryable
  if (!status) return true;
  
  // Specific retryable status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
};

// Utility to check if error is auth-related
export const isAuthError = (error: AxiosError): boolean => {
  return error.response?.status === 401;
};

// Utility to check if error is premium-required
export const isPremiumRequired = (error: AxiosError<ApiError>): boolean => {
  return (
    error.response?.status === 403 &&
    error.response?.data?.code === 'PREMIUM_REQUIRED'
  );
};

export default {
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
  parseValidationErrors,
  getErrorMessage,
  isRetryableError,
  isAuthError,
  isPremiumRequired,
};
