import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';

interface TagListProps {
  tags: string[];
  variant?: 'default' | 'primary' | 'subtle';
  size?: 'small' | 'medium';
  onTagPress?: (tag: string) => void;
  maxVisible?: number;
  style?: ViewStyle;
}

export function TagList({
  tags,
  variant = 'default',
  size = 'medium',
  onTagPress,
  maxVisible,
  style,
}: TagListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const remainingCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: '#DBEAFE',
          text: '#1D4ED8',
          border: '#93C5FD',
        };
      case 'subtle':
        return {
          bg: '#F8FAFC',
          text: '#64748B',
          border: '#E2E8F0',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#475569',
          border: '#E2E8F0',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = size === 'small' 
    ? { paddingH: 8, paddingV: 4, fontSize: 11 }
    : { paddingH: 12, paddingV: 6, fontSize: 13 };

  const TagComponent = onTagPress ? Pressable : View;

  return (
    <View style={[styles.container, style]}>
      {visibleTags.map((tag, index) => (
        <TagComponent
          key={`${tag}-${index}`}
          onPress={onTagPress ? () => onTagPress(tag) : undefined}
          style={({ pressed }: any) => [
            styles.tag,
            {
              backgroundColor: variantStyles.bg,
              borderColor: variantStyles.border,
              paddingHorizontal: sizeStyles.paddingH,
              paddingVertical: sizeStyles.paddingV,
            },
            onTagPress && pressed && styles.tagPressed,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              {
                color: variantStyles.text,
                fontSize: sizeStyles.fontSize,
              },
            ]}
          >
            {tag}
          </Text>
        </TagComponent>
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.tag,
            styles.moreTag,
            {
              paddingHorizontal: sizeStyles.paddingH,
              paddingVertical: sizeStyles.paddingV,
            },
          ]}
        >
          <Text style={[styles.tagText, styles.moreTagText, { fontSize: sizeStyles.fontSize }]}>
            +{remainingCount} more
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 8,
    borderWidth: 1,
  },
  tagPressed: {
    opacity: 0.7,
  },
  tagText: {
    fontWeight: '500',
  },
  moreTag: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  moreTagText: {
    color: '#64748B',
  },
});
