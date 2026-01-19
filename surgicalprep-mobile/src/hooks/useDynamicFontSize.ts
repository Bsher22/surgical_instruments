// src/hooks/useDynamicFontSize.ts
// Hook for respecting user's font size preference

import { useState, useEffect, useMemo } from 'react';
import { PixelRatio, Dimensions, AccessibilityInfo, Platform } from 'react-native';
import { theme } from '../theme';

// Maximum scale factor to prevent layout issues
const MAX_FONT_SCALE = 1.5;
const MIN_FONT_SCALE = 0.8;

/**
 * Get the current font scale factor
 */
export const getFontScale = (): number => {
  const scale = PixelRatio.getFontScale();
  return Math.max(MIN_FONT_SCALE, Math.min(scale, MAX_FONT_SCALE));
};

/**
 * Hook that returns the current font scale
 * Updates when the user changes their system font size
 */
export const useFontScale = (): number => {
  const [fontScale, setFontScale] = useState(getFontScale());

  useEffect(() => {
    // Listen for dimension changes (includes font scale on Android)
    const subscription = Dimensions.addEventListener('change', () => {
      setFontScale(getFontScale());
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return fontScale;
};

/**
 * Scale a font size value based on user's font scale preference
 * @param size - Base font size
 * @param maxScale - Maximum scale factor (defaults to MAX_FONT_SCALE)
 */
export const useDynamicFontSize = (
  size: number,
  maxScale: number = MAX_FONT_SCALE
): number => {
  const fontScale = useFontScale();
  const clampedScale = Math.min(fontScale, maxScale);
  return Math.round(size * clampedScale);
};

/**
 * Get all typography sizes scaled based on user preference
 */
export const useScaledTypography = () => {
  const fontScale = useFontScale();

  return useMemo(() => {
    const scale = (size: number) => Math.round(size * fontScale);

    return {
      sizes: {
        xxs: scale(theme.typography.sizes.xxs),
        xs: scale(theme.typography.sizes.xs),
        sm: scale(theme.typography.sizes.sm),
        md: scale(theme.typography.sizes.md),
        lg: scale(theme.typography.sizes.lg),
        xl: scale(theme.typography.sizes.xl),
        xxl: scale(theme.typography.sizes.xxl),
        xxxl: scale(theme.typography.sizes.xxxl),
        display: scale(theme.typography.sizes.display),
      },
      // Line heights should scale proportionally
      lineHeights: theme.typography.lineHeights,
    };
  }, [fontScale]);
};

/**
 * Check if large text is enabled (font scale > 1.0)
 */
export const useIsLargeText = (): boolean => {
  const fontScale = useFontScale();
  return fontScale > 1.0;
};

/**
 * Check if bold text is enabled (iOS only)
 */
export const useIsBoldText = (): boolean => {
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isBoldTextEnabled().then(setIsBold);

      const subscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        setIsBold
      );

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return isBold;
};

/**
 * Get font weight based on bold text preference
 */
export const useDynamicFontWeight = (
  baseWeight: keyof typeof theme.typography.weights
): string => {
  const isBold = useIsBoldText();

  if (!isBold) {
    return theme.typography.weights[baseWeight];
  }

  // Increase weight when bold text is enabled
  const weightMap: Record<string, string> = {
    normal: theme.typography.weights.medium,
    medium: theme.typography.weights.semibold,
    semibold: theme.typography.weights.bold,
    bold: theme.typography.weights.bold,
  };

  return weightMap[baseWeight] || theme.typography.weights.bold;
};

/**
 * Hook that provides all accessibility-aware text styles
 */
export const useAccessibleTextStyle = (
  baseSize: keyof typeof theme.typography.sizes,
  baseWeight: keyof typeof theme.typography.weights = 'normal'
) => {
  const scaledTypography = useScaledTypography();
  const fontWeight = useDynamicFontWeight(baseWeight);

  return useMemo(
    () => ({
      fontSize: scaledTypography.sizes[baseSize],
      fontWeight,
    }),
    [scaledTypography, baseSize, fontWeight]
  );
};

export default useDynamicFontSize;
