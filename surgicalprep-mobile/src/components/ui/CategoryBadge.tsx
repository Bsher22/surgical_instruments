import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { InstrumentCategory, CATEGORY_CONFIG } from '../../types/instrument';

interface CategoryBadgeProps {
  category: InstrumentCategory;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function CategoryBadge({ category, size = 'medium', style }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  
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
