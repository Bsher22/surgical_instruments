import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { InstrumentCategory, CATEGORY_CONFIG } from '../../types/instrument';

interface CategoryBadgeProps {
  category: InstrumentCategory | string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// Default fallback config for unknown categories
const DEFAULT_CATEGORY_CONFIG = { label: 'Unknown', color: '#6B7280', bgColor: '#F3F4F6' };

export function CategoryBadge({ category, size = 'medium', style }: CategoryBadgeProps) {
  // Use category config if exists, otherwise use raw category as label with fallback styling
  const knownConfig = CATEGORY_CONFIG[category as InstrumentCategory];
  const config = knownConfig || {
    ...DEFAULT_CATEGORY_CONFIG,
    label: category || 'Unknown'
  };
  
  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 12, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 16, paddingVertical: 6, fontSize: 14 },
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
