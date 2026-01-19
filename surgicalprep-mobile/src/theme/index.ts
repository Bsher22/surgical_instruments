// src/theme/index.ts
// Comprehensive design system for SurgicalPrep

import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base spacing unit (4px)
const BASE_SPACING = 4;

// Color palette
export const colors = {
  // Primary colors (medical teal/blue)
  primary: '#0891B2',
  primaryLight: '#22D3EE',
  primaryDark: '#0E7490',
  primaryMuted: '#0891B215',

  // Secondary colors
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',

  // Semantic colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic grays
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',

  // Category colors (for instruments)
  categoryColors: {
    cutting: '#EF4444',
    grasping: '#F59E0B',
    clamping: '#8B5CF6',
    retracting: '#10B981',
    suturing: '#3B82F6',
    specialty: '#EC4899',
    other: '#6B7280',
  },

  // Quiz colors
  quizCorrect: '#10B981',
  quizIncorrect: '#EF4444',
  quizSkipped: '#6B7280',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
} as const;

// Dark mode colors (for future implementation)
export const darkColors = {
  ...colors,
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  border: '#374151',
  borderLight: '#4B5563',
  divider: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textDisabled: '#4B5563',
} as const;

// Spacing scale
export const spacing = {
  xxs: BASE_SPACING * 0.5, // 2
  xs: BASE_SPACING, // 4
  sm: BASE_SPACING * 2, // 8
  md: BASE_SPACING * 4, // 16
  lg: BASE_SPACING * 6, // 24
  xl: BASE_SPACING * 8, // 32
  xxl: BASE_SPACING * 12, // 48
  xxxl: BASE_SPACING * 16, // 64
} as const;

// Typography
export const typography = {
  families: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Border radii
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Animation durations
export const animation = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    // These are for reference - actual implementation uses Reanimated's Easing
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// Touch target sizes (accessibility)
export const touchTargets = {
  minimum: 44, // Apple's HIG minimum
  small: 32,
  medium: 44,
  large: 56,
} as const;

// Screen breakpoints
export const breakpoints = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 768,
} as const;

// Layout helpers
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < breakpoints.md,
  isLargeScreen: SCREEN_WIDTH >= breakpoints.xl,
  contentPadding: spacing.md,
  cardPadding: spacing.md,
  listItemHeight: 72,
  headerHeight: 56,
  tabBarHeight: Platform.select({ ios: 83, android: 64 }) || 64,
} as const;

// Combined theme object
export const theme = {
  colors,
  darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  zIndex,
  touchTargets,
  breakpoints,
  layout,
} as const;

// Type exports
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Shadows = typeof shadows;

export default theme;
