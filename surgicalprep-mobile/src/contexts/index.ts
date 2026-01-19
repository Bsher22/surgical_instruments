// src/contexts/index.ts
// Barrel exports for contexts

export {
  ThemeProvider,
  useTheme,
  useColors,
  useIsDark,
  useThemedStyles,
  lightColors,
  darkColors,
} from './ThemeContext';
export type { ThemeColors } from './ThemeContext';
