// ============================================================================
// Stage 6C: Theme Utility
// ============================================================================

import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Primary brand colors
  primary: '#0066CC',
  primaryLight: '#3388DD',
  primaryDark: '#004499',
  onPrimary: '#FFFFFF',
  
  // Secondary colors
  secondary: '#6B7280',
  secondaryLight: '#9CA3AF',
  secondaryDark: '#4B5563',
  
  // Background colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  
  // Status colors
  success: '#22C55E',
  successLight: '#86EFAC',
  successDark: '#16A34A',
  
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoDark: '#2563EB',
  
  // UI elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Category colors (for instrument categories)
  categories: {
    cutting: '#EF4444',
    grasping: '#3B82F6',
    clamping: '#8B5CF6',
    retracting: '#10B981',
    suturing: '#F59E0B',
    specialty: '#EC4899',
    other: '#6B7280',
  },
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Subtitles
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  // Captions and labels
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
} as const;

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ============================================================================
// Shadows
// ============================================================================

export const shadows: Record<string, ViewStyle> = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// ============================================================================
// Animation Durations
// ============================================================================

export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// ============================================================================
// Z-Index
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// ============================================================================
// Common Component Styles
// ============================================================================

export const commonStyles = {
  // Card container
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  } as ViewStyle,
  
  // Screen container
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  // Centered content
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  // Space between row
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
} as const;

// ============================================================================
// Theme Export
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  durations,
  zIndex,
  commonStyles,
} as const;

export default theme;
