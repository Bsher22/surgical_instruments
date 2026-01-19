/**
 * Card Form Auto-Save Hook
 * 
 * Automatically saves form state to AsyncStorage after changes,
 * with debouncing to prevent excessive writes.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useCardFormStore } from '../stores/cardFormStore';

/**
 * Default debounce delay in milliseconds
 */
const DEFAULT_DEBOUNCE_MS = 2000;

/**
 * Options for the auto-save hook
 */
interface UseCardFormAutoSaveOptions {
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when draft is saved */
  onSave?: () => void;
  /** Callback when save fails */
  onError?: (error: Error) => void;
}

/**
 * Hook that automatically saves card form state to AsyncStorage
 * 
 * Features:
 * - Debounced saving (2 second default)
 * - Saves on blur/background
 * - Clears timeout on unmount
 * - Only saves when dirty
 * 
 * @example
 * ```tsx
 * function CardEditScreen() {
 *   const { lastSavedAt } = useCardFormAutoSave({
 *     onSave: () => console.log('Draft saved'),
 *   });
 * 
 *   return (
 *     <View>
 *       {lastSavedAt && <Text>Saved at {lastSavedAt.toLocaleTimeString()}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export function useCardFormAutoSave(options: UseCardFormAutoSaveOptions = {}) {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    enabled = true,
    onSave,
    onError,
  } = options;

  // Get store state and actions
  const formData = useCardFormStore((state) => state.formData);
  const isDirty = useCardFormStore((state) => state.isDirty);
  const draftKey = useCardFormStore((state) => state.draftKey);
  const lastSavedAt = useCardFormStore((state) => state.lastSavedAt);
  const saveDraft = useCardFormStore((state) => state.saveDraft);

  // Ref to track the debounce timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track if we're currently saving
  const isSavingRef = useRef(false);

  // Ref to track the previous form data for comparison
  const prevFormDataRef = useRef(formData);

  /**
   * Clear the debounce timeout
   */
  const clearDebounceTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Save draft immediately
   */
  const saveNow = useCallback(async () => {
    if (!enabled || !draftKey || isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      await saveDraft();
      onSave?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, draftKey, saveDraft, onSave, onError]);

  /**
   * Schedule a debounced save
   */
  const scheduleSave = useCallback(() => {
    clearDebounceTimeout();
    timeoutRef.current = setTimeout(saveNow, debounceMs);
  }, [clearDebounceTimeout, saveNow, debounceMs]);

  /**
   * Effect to trigger auto-save when form data changes
   */
  useEffect(() => {
    if (!enabled || !isDirty || !draftKey) {
      clearDebounceTimeout();
      return;
    }

    // Check if form data actually changed
    if (formData === prevFormDataRef.current) {
      return;
    }
    prevFormDataRef.current = formData;

    // Schedule debounced save
    scheduleSave();

    return () => {
      clearDebounceTimeout();
    };
  }, [formData, isDirty, draftKey, enabled, scheduleSave, clearDebounceTimeout]);

  /**
   * Effect to save when app goes to background
   */
  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Save immediately when going to background
        if (isDirty && draftKey) {
          clearDebounceTimeout();
          saveNow();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enabled, isDirty, draftKey, clearDebounceTimeout, saveNow]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      clearDebounceTimeout();
    };
  }, [clearDebounceTimeout]);

  return {
    /** Last time the draft was saved */
    lastSavedAt,
    /** Force an immediate save */
    saveNow,
    /** Whether auto-save is currently enabled */
    isEnabled: enabled && !!draftKey,
  };
}

/**
 * Format the last saved time for display
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) {
    return 'Just saved';
  } else if (diffSeconds < 60) {
    return `Saved ${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `Saved ${diffMinutes}m ago`;
  } else {
    return `Saved at ${date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`;
  }
}
