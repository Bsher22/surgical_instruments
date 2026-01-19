import { apiClient } from './client';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
} from '../types';

/**
 * Auth API
 *
 * Authentication-related API calls.
 * All endpoints are public (no auth required).
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Create new user account
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * Logout current session
   * Invalidates the current access token on the server
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/auth/me', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  /**
   * Delete account
   */
  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete('/auth/me', {
      data: { password },
    });
  },
};
