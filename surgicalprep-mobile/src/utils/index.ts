// src/utils/index.ts
// Barrel exports for all utilities

// Haptic feedback
export {
  triggerHaptic,
  haptics,
  setHapticsEnabled,
  getHapticsEnabled,
} from './haptics';
export type { HapticType } from './haptics';

// Retry logic
export {
  withRetry,
  createRetryable,
  isRetryableError,
  calculateDelay,
  RetryQueue,
  Retryable,
} from './retry';
export type { RetryConfig } from './retry';

// Accessibility utilities
export {
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
} from './accessibility';

// Color contrast utilities
export {
  hexToRgb,
  rgbToHex,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  isLightColor,
  getContrastingTextColor,
  lightenColor,
  darkenColor,
  suggestAccessibleColor,
  getContrastInfo,
  WCAG_CONTRAST,
} from './colorContrast';
