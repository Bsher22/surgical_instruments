// src/hooks/useSettingsSync.ts
// Hook for syncing local settings to the backend

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserSettings, updateUserSettings } from '../api/user';
import {
  useSettingsStore,
  getSettingsForSync,
  needsSync,
} from '../stores/settingsStore';
import type { UserSettings, UpdateSettingsRequest } from '../types/user';

// Debounce time for auto-sync (in milliseconds)
const SYNC_DEBOUNCE_MS = 2000;

/**
 * Hook that handles bidirectional sync between local settings store and backend
 */
export const useSettingsSync = () => {
  const queryClient = useQueryClient();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<string | null>(null);
  
  const hydrateFromServer = useSettingsStore((state) => state.hydrateFromServer);
  const markSynced = useSettingsStore((state) => state.markSynced);
  const pendingSync = useSettingsStore((state) => state.pendingSync);
  
  // Fetch settings from server
  const { data: serverSettings, isLoading: isFetching } = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  
  // Mutation for updating settings on server
  const { mutate: syncToServer, isPending: isSyncing } = useMutation({
    mutationFn: (settings: UpdateSettingsRequest) => updateUserSettings(settings),
    onSuccess: () => {
      markSynced();
      queryClient.invalidateQueries({ queryKey: ['user', 'settings'] });
    },
    onError: (error) => {
      console.error('Failed to sync settings:', error);
      // Keep pendingSync = true so it will retry
    },
  });
  
  // Hydrate local store from server on initial load
  useEffect(() => {
    if (serverSettings && !lastSyncRef.current) {
      // First time receiving server settings - hydrate local store
      hydrateFromServer({
        darkMode: serverSettings.dark_mode,
        textSize: serverSettings.text_size,
        hapticFeedback: serverSettings.haptic_feedback_enabled,
        quizQuestionCount: serverSettings.quiz_question_count,
        quizTimerEnabled: serverSettings.quiz_timer_enabled,
        quizTimerSeconds: serverSettings.quiz_timer_seconds,
        preferredCategories: serverSettings.preferred_categories,
        studyRemindersEnabled: serverSettings.study_reminders_enabled,
        reminderTime: serverSettings.reminder_time || null,
      });
      lastSyncRef.current = new Date().toISOString();
    }
  }, [serverSettings, hydrateFromServer]);
  
  // Debounced sync to server when local settings change
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      if (needsSync()) {
        const localSettings = getSettingsForSync();
        syncToServer({
          dark_mode: localSettings.darkMode,
          text_size: localSettings.textSize,
          haptic_feedback_enabled: localSettings.hapticFeedback,
          quiz_question_count: localSettings.quizQuestionCount,
          quiz_timer_enabled: localSettings.quizTimerEnabled,
          quiz_timer_seconds: localSettings.quizTimerSeconds,
          preferred_categories: localSettings.preferredCategories,
          study_reminders_enabled: localSettings.studyRemindersEnabled,
          reminder_time: localSettings.reminderTime || undefined,
        });
      }
    }, SYNC_DEBOUNCE_MS);
  }, [syncToServer]);
  
  // Watch for settings changes and trigger debounced sync
  useEffect(() => {
    if (pendingSync && lastSyncRef.current) {
      // Only auto-sync after initial hydration
      debouncedSync();
    }
  }, [pendingSync, debouncedSync]);
  
  // Sync when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && needsSync()) {
        // Sync immediately when going to background
        const localSettings = getSettingsForSync();
        syncToServer({
          dark_mode: localSettings.darkMode,
          text_size: localSettings.textSize,
          haptic_feedback_enabled: localSettings.hapticFeedback,
          quiz_question_count: localSettings.quizQuestionCount,
          quiz_timer_enabled: localSettings.quizTimerEnabled,
          quiz_timer_seconds: localSettings.quizTimerSeconds,
          preferred_categories: localSettings.preferredCategories,
          study_reminders_enabled: localSettings.studyRemindersEnabled,
          reminder_time: localSettings.reminderTime || undefined,
        });
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncToServer]);
  
  // Manual sync function
  const forceSync = useCallback(() => {
    const localSettings = getSettingsForSync();
    syncToServer({
      dark_mode: localSettings.darkMode,
      text_size: localSettings.textSize,
      haptic_feedback_enabled: localSettings.hapticFeedback,
      quiz_question_count: localSettings.quizQuestionCount,
      quiz_timer_enabled: localSettings.quizTimerEnabled,
      quiz_timer_seconds: localSettings.quizTimerSeconds,
      preferred_categories: localSettings.preferredCategories,
      study_reminders_enabled: localSettings.studyRemindersEnabled,
      reminder_time: localSettings.reminderTime || undefined,
    });
  }, [syncToServer]);
  
  return {
    isFetching,
    isSyncing,
    pendingSync,
    forceSync,
  };
};

export default useSettingsSync;
