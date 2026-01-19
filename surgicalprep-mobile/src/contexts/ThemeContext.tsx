// src/contexts/ThemeContext.tsx
// Theme context for dark mode support throughout the app

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import type { DarkModeOption } from '../types/user';

// =============================================================================
// Theme Colors
// =============================================================================

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  card: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI Elements
  border: string;
  divider: string;
  inputBackground: string;
  placeholder: string;
  
  // Special
  overlay: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  // Backgrounds
  background: '#F9FAFB',
  backgroundSecondary: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Brand
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryDark: '#4F46E5',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // UI Elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  inputBackground: '#FFFFFF',
  placeholder: '#9CA3AF',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  // Backgrounds
  background: '#111827',
  backgroundSecondary: '#1F2937',
  card: '#1F2937',
  
  // Text
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  // Brand
  primary: '#818CF8',
  primaryLight: '#312E81',
  primaryDark: '#6366F1',
  
  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // UI Elements
  border: '#374151',
  divider: '#374151',
  inputBackground: '#374151',
  placeholder: '#6B7280',
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',
};

// =============================================================================
// Theme Context
// =============================================================================

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (mode: DarkModeOption) => void;
  currentTheme: DarkModeOption;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// =============================================================================
// Theme Provider
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const darkModeSetting = useSettingsStore((state) => state.darkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  
  // Determine if we should use dark mode
  const isDark = useMemo(() => {
    if (darkModeSetting === 'system') {
      return systemColorScheme === 'dark';
    }
    return darkModeSetting === 'dark';
  }, [darkModeSetting, systemColorScheme]);
  
  // Get the appropriate color scheme
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);
  
  const value: ThemeContextValue = {
    isDark,
    colors,
    setTheme: setDarkMode,
    currentTheme: darkModeSetting,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// =============================================================================
// Hook
// =============================================================================

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to get just the colors
 */
export const useColors = (): ThemeColors => {
  const { colors } = useTheme();
  return colors;
};

/**
 * Hook to check if dark mode is active
 */
export const useIsDark = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

/**
 * Hook to create themed styles
 */
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark, createStyles]);
};

// =============================================================================
// Exports
// =============================================================================

export { lightColors, darkColors };
export default ThemeProvider;
