// src/hooks/useUser.ts
// React Query hooks for user profile, settings, and account management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getUserStats,
  getStreakInfo,
  getUserSettings,
  updateUserSettings,
  resetSettings,
  changePassword,
  deleteAccount,
  getSubscriptionInfo,
  getSubscriptionPortalUrl,
  checkFeatureAccess,
  requestDataExport,
  getDataExportStatus,
} from '../api/user';
import type {
  UserProfile,
  UpdateProfileRequest,
  UserStats,
  UserSettings,
  UpdateSettingsRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  SubscriptionInfo,
} from '../types/user';

// =============================================================================
// Query Keys
// =============================================================================

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  streak: () => [...userKeys.all, 'streak'] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  subscription: () => [...userKeys.all, 'subscription'] as const,
  featureAccess: (feature: string) => [...userKeys.all, 'access', feature] as const,
  dataExport: () => [...userKeys.all, 'export'] as const,
};

// =============================================================================
// Profile Hooks
// =============================================================================

/**
 * Fetch the current user's profile
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
  });
};

/**
 * Update the current user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });
      
      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(userKeys.profile());
      
      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(userKeys.profile(), {
          ...previousProfile,
          ...newData,
          updated_at: new Date().toISOString(),
        });
      }
      
      return { previousProfile };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.profile(), context.previousProfile);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

/**
 * Upload a new avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageUri: string) => uploadAvatar(imageUri),
    onSuccess: (data) => {
      // Update profile with new avatar URL
      const profile = queryClient.getQueryData<UserProfile>(userKeys.profile());
      if (profile) {
        queryClient.setQueryData<UserProfile>(userKeys.profile(), {
          ...profile,
          avatar_url: data.avatar_url,
        });
      }
    },
  });
};

/**
 * Delete the current avatar
 */
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      // Remove avatar URL from profile
      const profile = queryClient.getQueryData<UserProfile>(userKeys.profile());
      if (profile) {
        queryClient.setQueryData<UserProfile>(userKeys.profile(), {
          ...profile,
          avatar_url: null,
        });
      }
    },
  });
};

// =============================================================================
// Statistics Hooks
// =============================================================================

/**
 * Fetch user statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: getUserStats,
    staleTime: 60 * 1000, // Consider fresh for 1 minute
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetch streak information
 */
export const useStreakInfo = () => {
  return useQuery({
    queryKey: userKeys.streak(),
    queryFn: getStreakInfo,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================================================
// Settings Hooks
// =============================================================================

/**
 * Fetch user settings
 */
export const useUserSettings = () => {
  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Update user settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => updateUserSettings(data),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: userKeys.settings() });
      
      const previousSettings = queryClient.getQueryData<UserSettings>(userKeys.settings());
      
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(userKeys.settings(), {
          ...previousSettings,
          ...newSettings,
        });
      }
      
      return { previousSettings };
    },
    onError: (err, newData, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(userKeys.settings(), context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings() });
    },
  });
};

/**
 * Reset settings to defaults
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: resetSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.settings(), data);
    },
  });
};

// =============================================================================
// Account Management Hooks
// =============================================================================

/**
 * Change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};

/**
 * Delete account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DeleteAccountRequest) => deleteAccount(data),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// =============================================================================
// Subscription Hooks
// =============================================================================

/**
 * Fetch subscription information
 */
export const useSubscriptionInfo = () => {
  return useQuery({
    queryKey: userKeys.subscription(),
    queryFn: getSubscriptionInfo,
    staleTime: 60 * 1000, // Check frequently for subscription changes
  });
};

/**
 * Get Stripe portal URL for subscription management
 */
export const useGetSubscriptionPortal = () => {
  return useMutation({
    mutationFn: getSubscriptionPortalUrl,
  });
};

/**
 * Check if a feature is accessible
 */
export const useFeatureAccess = (feature: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userKeys.featureAccess(feature),
    queryFn: () => checkFeatureAccess(feature),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

// =============================================================================
// Data Export Hooks
// =============================================================================

/**
 * Request data export
 */
export const useRequestDataExport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: requestDataExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.dataExport() });
    },
  });
};

/**
 * Get data export status
 */
export const useDataExportStatus = () => {
  return useQuery({
    queryKey: userKeys.dataExport(),
    queryFn: getDataExportStatus,
    staleTime: 30 * 1000, // Check frequently when waiting for export
    refetchInterval: (query) => {
      // Poll every 30 seconds if export is pending/processing
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') {
        return 30 * 1000;
      }
      return false;
    },
  });
};

// =============================================================================
// Combined Hooks
// =============================================================================

/**
 * Fetch all user data needed for the profile screen
 */
export const useProfileData = () => {
  const profile = useCurrentUser();
  const stats = useUserStats();
  const subscription = useSubscriptionInfo();
  
  return {
    profile: profile.data,
    stats: stats.data,
    subscription: subscription.data,
    isLoading: profile.isLoading || stats.isLoading || subscription.isLoading,
    isError: profile.isError || stats.isError || subscription.isError,
    error: profile.error || stats.error || subscription.error,
    refetch: async () => {
      await Promise.all([
        profile.refetch(),
        stats.refetch(),
        subscription.refetch(),
      ]);
    },
  };
};

/**
 * Invalidate all user-related queries (useful after logout)
 */
export const useInvalidateUserQueries = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };
};

/**
 * Clear all user-related queries (useful after logout)
 */
export const useClearUserQueries = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.removeQueries({ queryKey: userKeys.all });
  };
};
