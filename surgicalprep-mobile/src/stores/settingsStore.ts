// src/stores/settingsStore.ts
// Zustand store for user settings with AsyncStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DarkModeOption, TextSizeOption } from '../types/user';

// =============================================================================
// Types
// =============================================================================

interface SettingsState {
  // Display settings (local only)
  darkMode: DarkModeOption;
  textSize: TextSizeOption;
  hapticFeedback: boolean;
  
  // Quiz preferences (synced to backend)
  quizQuestionCount: number;
  quizTimerEnabled: boolean;
  quizTimerSeconds: number;
  preferredCategories: string[];
  
  // Study reminders
  studyRemindersEnabled: boolean;
  reminderTime: string | null; // HH:mm format
  
  // Onboarding / First-time user flags
  hasSeenOnboarding: boolean;
  hasSeenQuizTutorial: boolean;
  hasSeenFlashcardTutorial: boolean;
  hasSeenCardCreationTips: boolean;
  
  // Sync state
  lastSyncedAt: string | null;
  pendingSync: boolean;
}

interface SettingsActions {
  // Display actions
  setDarkMode: (mode: DarkModeOption) => void;
  setTextSize: (size: TextSizeOption) => void;
  setHapticFeedback: (enabled: boolean) => void;
  
  // Quiz preference actions
  setQuizQuestionCount: (count: number) => void;
  setQuizTimerEnabled: (enabled: boolean) => void;
  setQuizTimerSeconds: (seconds: number) => void;
  setPreferredCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  
  // Reminder actions
  setStudyRemindersEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string | null) => void;
  
  // Onboarding actions
  markOnboardingSeen: () => void;
  markQuizTutorialSeen: () => void;
  markFlashcardTutorialSeen: () => void;
  markCardCreationTipsSeen: () => void;
  resetOnboardingFlags: () => void;
  
  // Sync actions
  markSynced: () => void;
  markPendingSync: () => void;
  
  // Bulk actions
  updateMultiple: (settings: Partial<SettingsState>) => void;
  resetToDefaults: () => void;
  hydrateFromServer: (serverSettings: Partial<SettingsState>) => void;
}

type SettingsStore = SettingsState & SettingsActions;

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_SETTINGS: SettingsState = {
  // Display
  darkMode: 'system',
  textSize: 'medium',
  hapticFeedback: true,
  
  // Quiz
  quizQuestionCount: 20,
  quizTimerEnabled: false,
  quizTimerSeconds: 30,
  preferredCategories: [],
  
  // Reminders
  studyRemindersEnabled: false,
  reminderTime: null,
  
  // Onboarding
  hasSeenOnboarding: false,
  hasSeenQuizTutorial: false,
  hasSeenFlashcardTutorial: false,
  hasSeenCardCreationTips: false,
  
  // Sync
  lastSyncedAt: null,
  pendingSync: false,
};

// =============================================================================
// Store Definition
// =============================================================================

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      
      // Display actions
      setDarkMode: (mode) => {
        set({ darkMode: mode, pendingSync: true });
      },
      
      setTextSize: (size) => {
        set({ textSize: size, pendingSync: true });
      },
      
      setHapticFeedback: (enabled) => {
        set({ hapticFeedback: enabled, pendingSync: true });
      },
      
      // Quiz preference actions
      setQuizQuestionCount: (count) => {
        const validCount = Math.min(Math.max(count, 5), 50);
        set({ quizQuestionCount: validCount, pendingSync: true });
      },
      
      setQuizTimerEnabled: (enabled) => {
        set({ quizTimerEnabled: enabled, pendingSync: true });
      },
      
      setQuizTimerSeconds: (seconds) => {
        const validSeconds = Math.min(Math.max(seconds, 10), 120);
        set({ quizTimerSeconds: validSeconds, pendingSync: true });
      },
      
      setPreferredCategories: (categories) => {
        set({ preferredCategories: categories, pendingSync: true });
      },
      
      toggleCategory: (category) => {
        const current = get().preferredCategories;
        const newCategories = current.includes(category)
          ? current.filter((c) => c !== category)
          : [...current, category];
        set({ preferredCategories: newCategories, pendingSync: true });
      },
      
      // Reminder actions
      setStudyRemindersEnabled: (enabled) => {
        set({ studyRemindersEnabled: enabled, pendingSync: true });
      },
      
      setReminderTime: (time) => {
        set({ reminderTime: time, pendingSync: true });
      },
      
      // Onboarding actions
      markOnboardingSeen: () => {
        set({ hasSeenOnboarding: true });
      },
      
      markQuizTutorialSeen: () => {
        set({ hasSeenQuizTutorial: true });
      },
      
      markFlashcardTutorialSeen: () => {
        set({ hasSeenFlashcardTutorial: true });
      },
      
      markCardCreationTipsSeen: () => {
        set({ hasSeenCardCreationTips: true });
      },
      
      resetOnboardingFlags: () => {
        set({
          hasSeenOnboarding: false,
          hasSeenQuizTutorial: false,
          hasSeenFlashcardTutorial: false,
          hasSeenCardCreationTips: false,
        });
      },
      
      // Sync actions
      markSynced: () => {
        set({
          lastSyncedAt: new Date().toISOString(),
          pendingSync: false,
        });
      },
      
      markPendingSync: () => {
        set({ pendingSync: true });
      },
      
      // Bulk actions
      updateMultiple: (settings) => {
        set({ ...settings, pendingSync: true });
      },
      
      resetToDefaults: () => {
        set({
          ...DEFAULT_SETTINGS,
          // Preserve onboarding flags
          hasSeenOnboarding: get().hasSeenOnboarding,
          hasSeenQuizTutorial: get().hasSeenQuizTutorial,
          hasSeenFlashcardTutorial: get().hasSeenFlashcardTutorial,
          hasSeenCardCreationTips: get().hasSeenCardCreationTips,
          pendingSync: true,
        });
      },
      
      hydrateFromServer: (serverSettings) => {
        set({
          ...serverSettings,
          lastSyncedAt: new Date().toISOString(),
          pendingSync: false,
        });
      },
    }),
    {
      name: 'surgicalprep-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        darkMode: state.darkMode,
        textSize: state.textSize,
        hapticFeedback: state.hapticFeedback,
        quizQuestionCount: state.quizQuestionCount,
        quizTimerEnabled: state.quizTimerEnabled,
        quizTimerSeconds: state.quizTimerSeconds,
        preferredCategories: state.preferredCategories,
        studyRemindersEnabled: state.studyRemindersEnabled,
        reminderTime: state.reminderTime,
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenQuizTutorial: state.hasSeenQuizTutorial,
        hasSeenFlashcardTutorial: state.hasSeenFlashcardTutorial,
        hasSeenCardCreationTips: state.hasSeenCardCreationTips,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// =============================================================================
// Selectors (for performance optimization)
// =============================================================================

export const selectDarkMode = (state: SettingsStore) => state.darkMode;
export const selectTextSize = (state: SettingsStore) => state.textSize;
export const selectHapticFeedback = (state: SettingsStore) => state.hapticFeedback;
export const selectQuizSettings = (state: SettingsStore) => ({
  questionCount: state.quizQuestionCount,
  timerEnabled: state.quizTimerEnabled,
  timerSeconds: state.quizTimerSeconds,
  preferredCategories: state.preferredCategories,
});
export const selectReminderSettings = (state: SettingsStore) => ({
  enabled: state.studyRemindersEnabled,
  time: state.reminderTime,
});
export const selectOnboardingFlags = (state: SettingsStore) => ({
  onboarding: state.hasSeenOnboarding,
  quizTutorial: state.hasSeenQuizTutorial,
  flashcardTutorial: state.hasSeenFlashcardTutorial,
  cardCreationTips: state.hasSeenCardCreationTips,
});
export const selectSyncState = (state: SettingsStore) => ({
  lastSyncedAt: state.lastSyncedAt,
  pendingSync: state.pendingSync,
});

// =============================================================================
// Hooks for specific settings
// =============================================================================

export const useDarkMode = () => useSettingsStore(selectDarkMode);
export const useTextSize = () => useSettingsStore(selectTextSize);
export const useHapticFeedback = () => useSettingsStore(selectHapticFeedback);
export const useQuizSettings = () => useSettingsStore(selectQuizSettings);
export const useReminderSettings = () => useSettingsStore(selectReminderSettings);
export const useOnboardingFlags = () => useSettingsStore(selectOnboardingFlags);
export const useSyncState = () => useSettingsStore(selectSyncState);

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get settings that should be synced to the server
 */
export const getSettingsForSync = (): Partial<SettingsState> => {
  const state = useSettingsStore.getState();
  return {
    darkMode: state.darkMode,
    textSize: state.textSize,
    hapticFeedback: state.hapticFeedback,
    quizQuestionCount: state.quizQuestionCount,
    quizTimerEnabled: state.quizTimerEnabled,
    quizTimerSeconds: state.quizTimerSeconds,
    preferredCategories: state.preferredCategories,
    studyRemindersEnabled: state.studyRemindersEnabled,
    reminderTime: state.reminderTime,
  };
};

/**
 * Check if settings need to be synced
 */
export const needsSync = (): boolean => {
  return useSettingsStore.getState().pendingSync;
};

/**
 * Clear all settings (used on logout)
 */
export const clearSettings = async (): Promise<void> => {
  useSettingsStore.getState().resetToDefaults();
  await AsyncStorage.removeItem('surgicalprep-settings');
};
