/**
 * Unsaved Changes Guard Hook
 * 
 * Prevents accidental navigation away from a form with unsaved changes
 * by showing a confirmation dialog.
 */

import { useEffect, useCallback, useRef } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useCardFormStore } from '../stores/cardFormStore';

/**
 * Options for the unsaved changes guard
 */
interface UseUnsavedChangesGuardOptions {
  /** Whether the guard is enabled (default: true) */
  enabled?: boolean;
  /** Custom title for the confirmation dialog */
  title?: string;
  /** Custom message for the confirmation dialog */
  message?: string;
  /** Custom text for the discard button */
  discardButtonText?: string;
  /** Custom text for the cancel button */
  cancelButtonText?: string;
  /** Callback when user confirms discard */
  onDiscard?: () => void;
  /** Callback when user cancels discard */
  onCancel?: () => void;
}

/**
 * Default dialog text
 */
const DEFAULT_TITLE = 'Discard Changes?';
const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to discard them?';
const DEFAULT_DISCARD_TEXT = 'Discard';
const DEFAULT_CANCEL_TEXT = 'Keep Editing';

/**
 * Hook that guards against accidental navigation when form has unsaved changes
 * 
 * Features:
 * - Intercepts hardware back button (Android)
 * - Integrates with Expo Router navigation
 * - Shows confirmation dialog before discarding
 * - Provides imperative methods for custom triggers
 * 
 * @example
 * ```tsx
 * function CardEditScreen() {
 *   const { confirmDiscard, canNavigate } = useUnsavedChangesGuard({
 *     onDiscard: () => router.back(),
 *   });
 * 
 *   const handleCancel = () => {
 *     if (canNavigate()) {
 *       router.back();
 *     } else {
 *       confirmDiscard();
 *     }
 *   };
 * 
 *   return (
 *     <View>
 *       <Button title="Cancel" onPress={handleCancel} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useUnsavedChangesGuard(
  options: UseUnsavedChangesGuardOptions = {}
) {
  const {
    enabled = true,
    title = DEFAULT_TITLE,
    message = DEFAULT_MESSAGE,
    discardButtonText = DEFAULT_DISCARD_TEXT,
    cancelButtonText = DEFAULT_CANCEL_TEXT,
    onDiscard,
    onCancel,
  } = options;

  const router = useRouter();
  const navigation = useNavigation();
  const isDirty = useCardFormStore((state) => state.isDirty);
  const clearDraft = useCardFormStore((state) => state.clearDraft);
  const reset = useCardFormStore((state) => state.reset);

  // Track if we're in the process of navigating after confirmation
  const isNavigatingRef = useRef(false);

  /**
   * Check if it's safe to navigate (no unsaved changes or guard disabled)
   */
  const canNavigate = useCallback(() => {
    return !enabled || !isDirty || isNavigatingRef.current;
  }, [enabled, isDirty]);

  /**
   * Show confirmation dialog and handle response
   */
  const confirmDiscard = useCallback(
    (navigateCallback?: () => void) => {
      Alert.alert(
        title,
        message,
        [
          {
            text: cancelButtonText,
            style: 'cancel',
            onPress: () => {
              onCancel?.();
            },
          },
          {
            text: discardButtonText,
            style: 'destructive',
            onPress: async () => {
              isNavigatingRef.current = true;
              
              // Clear the draft when discarding
              try {
                await clearDraft();
              } catch (error) {
                console.error('Failed to clear draft on discard:', error);
              }
              
              // Reset form state
              reset();
              
              // Execute navigation callback or onDiscard
              if (navigateCallback) {
                navigateCallback();
              } else {
                onDiscard?.();
              }
              
              isNavigatingRef.current = false;
            },
          },
        ],
        { cancelable: true }
      );
    },
    [
      title,
      message,
      cancelButtonText,
      discardButtonText,
      onDiscard,
      onCancel,
      clearDraft,
      reset,
    ]
  );

  /**
   * Handle the attempt to navigate away
   */
  const handleNavigationAttempt = useCallback(
    (navigateCallback: () => void) => {
      if (canNavigate()) {
        navigateCallback();
      } else {
        confirmDiscard(navigateCallback);
      }
    },
    [canNavigate, confirmDiscard]
  );

  /**
   * Intercept Android hardware back button
   */
  useEffect(() => {
    if (!enabled) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!isDirty || isNavigatingRef.current) {
          // Allow default back behavior
          return false;
        }

        // Show confirmation dialog
        confirmDiscard(() => router.back());
        
        // Prevent default back behavior
        return true;
      }
    );

    return () => backHandler.remove();
  }, [enabled, isDirty, confirmDiscard, router]);

  /**
   * Intercept React Navigation's beforeRemove event
   * This handles gestures and programmatic navigation
   */
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty || isNavigatingRef.current) {
        // Allow navigation
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Show confirmation dialog
      Alert.alert(
        title,
        message,
        [
          {
            text: cancelButtonText,
            style: 'cancel',
            onPress: () => {
              onCancel?.();
            },
          },
          {
            text: discardButtonText,
            style: 'destructive',
            onPress: async () => {
              isNavigatingRef.current = true;
              
              try {
                await clearDraft();
              } catch (error) {
                console.error('Failed to clear draft on discard:', error);
              }
              
              reset();
              
              // Continue with the blocked navigation
              navigation.dispatch(e.data.action);
              
              isNavigatingRef.current = false;
            },
          },
        ],
        { cancelable: true }
      );
    });

    return unsubscribe;
  }, [
    enabled,
    isDirty,
    navigation,
    title,
    message,
    cancelButtonText,
    discardButtonText,
    onCancel,
    clearDraft,
    reset,
  ]);

  return {
    /** Check if it's safe to navigate without confirmation */
    canNavigate,
    /** Show confirmation dialog (optionally with custom navigation callback) */
    confirmDiscard,
    /** Handle navigation attempt with automatic confirmation if needed */
    handleNavigationAttempt,
    /** Current dirty state */
    isDirty,
  };
}

/**
 * Hook for simpler use cases where you just want to block navigation
 * without custom handlers
 */
export function useBlockNavigation(enabled: boolean = true) {
  return useUnsavedChangesGuard({ enabled });
}
