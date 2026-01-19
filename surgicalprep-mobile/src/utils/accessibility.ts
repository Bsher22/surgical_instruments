// src/utils/accessibility.ts
// Accessibility utilities and helpers for SurgicalPrep

import { AccessibilityInfo, Platform, findNodeHandle } from 'react-native';
import { RefObject } from 'react';

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Set accessibility focus on a component
 * @param ref - React ref to the component
 */
export const setAccessibilityFocus = (ref: RefObject<any>): void => {
  if (ref.current) {
    const node = findNodeHandle(ref.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }
};

/**
 * Generate an accessibility label from multiple items
 * @param items - Array of label parts (falsy values are filtered out)
 */
export const generateAccessibilityLabel = (
  items: (string | undefined | null | false)[]
): string => {
  return items.filter(Boolean).join(', ');
};

/**
 * Combine multiple accessibility hints
 * @param hints - Array of hint parts
 */
export const combineAccessibilityHints = (
  hints: (string | undefined | null)[]
): string => {
  return hints.filter(Boolean).join('. ');
};

/**
 * Format text for screen reader announcement
 * @param text - The text to format
 * @param type - The type of content
 */
export const formatForScreenReader = (
  text: string,
  type?: 'heading' | 'button' | 'link' | 'image' | 'list'
): string => {
  switch (type) {
    case 'heading':
      return `${text}, heading`;
    case 'button':
      return `${text}, button`;
    case 'link':
      return `${text}, link`;
    case 'image':
      return `Image: ${text}`;
    case 'list':
      return `${text}, list`;
    default:
      return text;
  }
};

/**
 * Format a number for screen reader (e.g., "5 of 10")
 * @param current - Current position
 * @param total - Total count
 */
export const formatProgress = (current: number, total: number): string => {
  return `${current} of ${total}`;
};

/**
 * Format a percentage for screen reader
 * @param value - Percentage value (0-100)
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)} percent`;
};

/**
 * Format a date for screen reader
 * @param date - Date to format
 */
export const formatDateForScreenReader = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time duration for screen reader
 * @param seconds - Duration in seconds
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isReduceMotionEnabled();
};

/**
 * Check if bold text is enabled (iOS only)
 */
export const isBoldTextEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return await AccessibilityInfo.isBoldTextEnabled();
  }
  return false;
};

/**
 * Get accessibility action handlers for swipeable items
 */
export const getSwipeAccessibilityActions = (
  onEdit?: () => void,
  onDelete?: () => void
) => {
  const actions = [];
  
  if (onEdit) {
    actions.push({
      name: 'edit',
      label: 'Edit',
    });
  }
  
  if (onDelete) {
    actions.push({
      name: 'delete',
      label: 'Delete',
    });
  }
  
  return {
    accessibilityActions: actions,
    onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
      switch (event.nativeEvent.actionName) {
        case 'edit':
          onEdit?.();
          break;
        case 'delete':
          onDelete?.();
          break;
      }
    },
  };
};

/**
 * Minimum touch target size (44x44 points as per Apple HIG)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Calculate hit slop for small touch targets
 * @param width - Element width
 * @param height - Element height
 */
export const calculateHitSlop = (
  width: number,
  height: number
): { top: number; bottom: number; left: number; right: number } => {
  const horizontalSlop = Math.max(0, (MIN_TOUCH_TARGET - width) / 2);
  const verticalSlop = Math.max(0, (MIN_TOUCH_TARGET - height) / 2);
  
  return {
    top: verticalSlop,
    bottom: verticalSlop,
    left: horizontalSlop,
    right: horizontalSlop,
  };
};

/**
 * Accessibility role mappings for React Native
 */
export const accessibilityRoles = {
  button: 'button' as const,
  link: 'link' as const,
  header: 'header' as const,
  image: 'image' as const,
  text: 'text' as const,
  search: 'search' as const,
  tab: 'tab' as const,
  checkbox: 'checkbox' as const,
  radio: 'radio' as const,
  switch: 'switch' as const,
  slider: 'adjustable' as const,
  progressBar: 'progressbar' as const,
  alert: 'alert' as const,
  menu: 'menu' as const,
  menuItem: 'menuitem' as const,
};

export default {
  announceForAccessibility,
  setAccessibilityFocus,
  generateAccessibilityLabel,
  combineAccessibilityHints,
  formatForScreenReader,
  formatProgress,
  formatPercentage,
  formatDateForScreenReader,
  formatDuration,
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  isBoldTextEnabled,
  getSwipeAccessibilityActions,
  calculateHitSlop,
  accessibilityRoles,
  MIN_TOUCH_TARGET,
};
