// src/hooks/index.ts
// Barrel exports for all hooks

// Network
export { useNetworkStatus } from './useNetworkStatus';
export type { NetworkStatus } from './useNetworkStatus';

// Accessibility
export { useFocus, useFocusOnMount, useFocusRestoration, useFocusTrap } from './useFocus';
export { useReduceMotion, useAnimationDuration, useAnimationConfig } from './useReduceMotion';
export {
  useFontScale,
  useDynamicFontSize,
  useScaledTypography,
  useIsLargeText,
  useIsBoldText,
  useDynamicFontWeight,
  useAccessibleTextStyle,
  getFontScale,
} from './useDynamicFontSize';

// Re-export keyboard hook from UI
export { useKeyboardVisible } from '../components/ui/KeyboardAvoidingWrapper';

// Auth
export { useAuth, usePremiumStatus } from './useAuth';

// Instruments
export {
  useInstruments,
  useInfiniteInstruments,
  useInstrument,
  useInstrumentSearch,
  useCategories,
  usePopularInstruments,
  useRelatedInstruments,
  useInstrumentsByIds,
  instrumentKeys,
} from './useInstruments';
