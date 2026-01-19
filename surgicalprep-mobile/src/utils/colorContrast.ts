// src/utils/colorContrast.ts
// WCAG color contrast utilities for accessibility

/**
 * Parse a hex color to RGB components
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-character hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export const getRelativeLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  
  const sRGB = [r, g, b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * WCAG contrast requirements
 */
export const WCAG_CONTRAST = {
  AA_NORMAL_TEXT: 4.5,
  AA_LARGE_TEXT: 3.0,
  AAA_NORMAL_TEXT: 7.0,
  AAA_LARGE_TEXT: 4.5,
  AA_UI_COMPONENTS: 3.0,
} as const;

/**
 * Check if contrast ratio meets WCAG AA for normal text
 */
export const meetsWCAG_AA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText ? WCAG_CONTRAST.AA_LARGE_TEXT : WCAG_CONTRAST.AA_NORMAL_TEXT;
  return ratio >= required;
};

/**
 * Check if contrast ratio meets WCAG AAA for normal text
 */
export const meetsWCAG_AAA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText ? WCAG_CONTRAST.AAA_LARGE_TEXT : WCAG_CONTRAST.AAA_NORMAL_TEXT;
  return ratio >= required;
};

/**
 * Check if color is "light" (high luminance)
 */
export const isLightColor = (hex: string): boolean => {
  return getRelativeLuminance(hex) > 0.5;
};

/**
 * Get a contrasting text color (black or white) for a background
 */
export const getContrastingTextColor = (background: string): string => {
  return isLightColor(background) ? '#000000' : '#FFFFFF';
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(
    rgb.r * factor,
    rgb.g * factor,
    rgb.b * factor
  );
};

/**
 * Suggest an accessible color that meets WCAG AA against a background
 * @param color - The color to adjust
 * @param background - The background color to contrast against
 * @param isLargeText - Whether this is for large text (lower requirement)
 */
export const suggestAccessibleColor = (
  color: string,
  background: string,
  isLargeText = false
): string => {
  // If already accessible, return as-is
  if (meetsWCAG_AA(color, background, isLargeText)) {
    return color;
  }

  const requiredRatio = isLargeText
    ? WCAG_CONTRAST.AA_LARGE_TEXT
    : WCAG_CONTRAST.AA_NORMAL_TEXT;

  const bgLuminance = getRelativeLuminance(background);
  const shouldLighten = bgLuminance < 0.5;

  // Binary search for accessible color
  let adjustedColor = color;
  let step = 5;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    const ratio = getContrastRatio(adjustedColor, background);
    
    if (ratio >= requiredRatio) {
      return adjustedColor;
    }

    adjustedColor = shouldLighten
      ? lightenColor(adjustedColor, step)
      : darkenColor(adjustedColor, step);
    
    attempts++;
  }

  // Fallback to black or white if we couldn't find a suitable color
  return shouldLighten ? '#FFFFFF' : '#000000';
};

/**
 * Get all contrast information for a color pair
 */
export const getContrastInfo = (foreground: string, background: string) => {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA_NormalText: ratio >= WCAG_CONTRAST.AA_NORMAL_TEXT,
    meetsAA_LargeText: ratio >= WCAG_CONTRAST.AA_LARGE_TEXT,
    meetsAAA_NormalText: ratio >= WCAG_CONTRAST.AAA_NORMAL_TEXT,
    meetsAAA_LargeText: ratio >= WCAG_CONTRAST.AAA_LARGE_TEXT,
    meetsUI: ratio >= WCAG_CONTRAST.AA_UI_COMPONENTS,
  };
};

export default {
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
};
