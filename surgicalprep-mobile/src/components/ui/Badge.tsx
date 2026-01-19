import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/utils/constants';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', size = 'md', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  primary: {
    backgroundColor: `${COLORS.primary}20`,
  },
  secondary: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  success: {
    backgroundColor: `${COLORS.success}20`,
  },
  warning: {
    backgroundColor: `${COLORS.warning}20`,
  },
  error: {
    backgroundColor: `${COLORS.error}20`,
  },
  neutral: {
    backgroundColor: COLORS.border,
  },
  text: {
    fontWeight: '500',
  },
  text_sm: {
    fontSize: 11,
  },
  text_md: {
    fontSize: 12,
  },
  text_primary: {
    color: COLORS.primary,
  },
  text_secondary: {
    color: COLORS.accent,
  },
  text_success: {
    color: COLORS.success,
  },
  text_warning: {
    color: COLORS.warning,
  },
  text_error: {
    color: COLORS.error,
  },
  text_neutral: {
    color: COLORS.textSecondary,
  },
});
