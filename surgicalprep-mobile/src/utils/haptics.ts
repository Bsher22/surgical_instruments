// src/utils/haptics.ts
// Haptic feedback utility for SurgicalPrep

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

// Mapping of semantic haptic types to expo-haptics methods
const hapticMap: Record<HapticType, () => Promise<void>> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

// Check if haptics are available
let hapticsEnabled = true;

export const setHapticsEnabled = (enabled: boolean): void => {
  hapticsEnabled = enabled;
};

export const getHapticsEnabled = (): boolean => hapticsEnabled;

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback
 */
export const triggerHaptic = async (type: HapticType = 'light'): Promise<void> => {
  // Skip haptics if disabled or on web
  if (!hapticsEnabled || Platform.OS === 'web') {
    return;
  }

  try {
    await hapticMap[type]();
  } catch (error) {
    // Silently fail - haptics are non-essential
    if (__DEV__) {
      console.warn('[Haptics] Failed to trigger haptic:', error);
    }
  }
};

// Convenience functions
export const haptics = {
  /**
   * Light impact - tab selection, toggles, subtle interactions
   */
  light: () => triggerHaptic('light'),

  /**
   * Medium impact - button presses, card flips
   */
  medium: () => triggerHaptic('medium'),

  /**
   * Heavy impact - errors, important actions, drag end
   */
  heavy: () => triggerHaptic('heavy'),

  /**
   * Success notification - quiz correct, save complete
   */
  success: () => triggerHaptic('success'),

  /**
   * Warning notification - validation errors, limits reached
   */
  warning: () => triggerHaptic('warning'),

  /**
   * Error notification - failed actions, errors
   */
  error: () => triggerHaptic('error'),

  /**
   * Selection feedback - picker selection, checkbox toggle
   */
  selection: () => triggerHaptic('selection'),

  /**
   * Button press haptic (standard button feedback)
   */
  buttonPress: () => triggerHaptic('light'),

  /**
   * Tab press haptic
   */
  tabPress: () => triggerHaptic('light'),

  /**
   * Card swipe haptic
   */
  cardSwipe: () => triggerHaptic('medium'),

  /**
   * Quiz answer haptic
   */
  quizAnswer: (correct: boolean) => triggerHaptic(correct ? 'success' : 'error'),

  /**
   * Pull to refresh haptic
   */
  pullToRefresh: () => triggerHaptic('medium'),

  /**
   * Drag start haptic
   */
  dragStart: () => triggerHaptic('light'),

  /**
   * Drag end haptic
   */
  dragEnd: () => triggerHaptic('medium'),

  /**
   * Item delete haptic
   */
  delete: () => triggerHaptic('warning'),

  /**
   * Enable/disable haptics globally
   */
  setEnabled: setHapticsEnabled,

  /**
   * Check if haptics are enabled
   */
  isEnabled: getHapticsEnabled,
};

export default haptics;
