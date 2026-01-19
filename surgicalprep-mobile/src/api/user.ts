// src/api/user.ts
// User profile, settings, and account management API functions

import { apiClient } from './client';
import type {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserStats,
  UserSettings,
  UpdateSettingsRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  SubscriptionInfo,
} from '../types/user';

// =============================================================================
// Profile Endpoints
// =============================================================================

/**
 * Get the current authenticated user's profile
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/api/users/me');
  return response.data;
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.put<UpdateProfileResponse>('/api/users/me', data);
  return response.data.user;
};

/**
 * Upload a new avatar image
 * @param imageUri - Local URI of the image to upload
 */
export const uploadAvatar = async (imageUri: string): Promise<{ avatar_url: string }> => {
  const formData = new FormData();
  
  // Extract filename and type from URI
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type,
  } as any);
  
  const response = await apiClient.post<{ avatar_url: string }>(
    '/api/users/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

/**
 * Delete the current user's avatar
 */
export const deleteAvatar = async (): Promise<void> => {
  await apiClient.delete('/api/users/me/avatar');
};

// =============================================================================
// Statistics Endpoints
// =============================================================================

/**
 * Get the current user's usage statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get<UserStats>('/api/users/me/stats');
  return response.data;
};

/**
 * Get study streak information
 */
export const getStreakInfo = async (): Promise<{
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  streak_maintained_today: boolean;
}> => {
  const response = await apiClient.get('/api/users/me/streak');
  return response.data;
};

// =============================================================================
// Settings Endpoints
// =============================================================================

/**
 * Get the current user's settings
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>('/api/users/me/settings');
  return response.data;
};

/**
 * Update the current user's settings
 */
export const updateUserSettings = async (data: UpdateSettingsRequest): Promise<UserSettings> => {
  const response = await apiClient.put<UserSettings>('/api/users/me/settings', data);
  return response.data;
};

/**
 * Reset settings to defaults
 */
export const resetSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.post<UserSettings>('/api/users/me/settings/reset');
  return response.data;
};

// =============================================================================
// Authentication & Account Endpoints
// =============================================================================

/**
 * Change the current user's password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>('/api/auth/change-password', data);
  return response.data;
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

/**
 * Delete the current user's account
 * This is a destructive action that cannot be undone
 */
export const deleteAccount = async (data: DeleteAccountRequest): Promise<DeleteAccountResponse> => {
  const response = await apiClient.delete<DeleteAccountResponse>('/api/users/me', { data });
  return response.data;
};

/**
 * Logout from all devices (invalidate all tokens)
 */
export const logoutAllDevices = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/api/auth/logout-all');
  return response.data;
};

// =============================================================================
// Subscription Endpoints
// =============================================================================

/**
 * Get the current user's subscription information
 */
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo> => {
  const response = await apiClient.get<SubscriptionInfo>('/api/users/me/subscription');
  return response.data;
};

/**
 * Get the Stripe customer portal URL for subscription management
 */
export const getSubscriptionPortalUrl = async (): Promise<{ url: string }> => {
  const response = await apiClient.post('/api/subscriptions/portal');
  return response.data;
};

/**
 * Check if a feature is available based on subscription
 */
export const checkFeatureAccess = async (feature: string): Promise<{
  allowed: boolean;
  reason?: string;
  upgrade_required: boolean;
}> => {
  const response = await apiClient.get(`/api/users/me/access/${feature}`);
  return response.data;
};

// =============================================================================
// Data Export Endpoints
// =============================================================================

/**
 * Request a data export (GDPR compliance)
 */
export const requestDataExport = async (): Promise<{ message: string; estimated_time: string }> => {
  const response = await apiClient.post('/api/users/me/export');
  return response.data;
};

/**
 * Get the status of a data export request
 */
export const getDataExportStatus = async (): Promise<{
  status: 'pending' | 'processing' | 'ready' | 'expired' | 'none';
  download_url?: string;
  expires_at?: string;
}> => {
  const response = await apiClient.get('/api/users/me/export/status');
  return response.data;
};
