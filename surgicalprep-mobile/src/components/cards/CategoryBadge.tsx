/**
 * CategoryBadge Component
 * Displays a colored badge for item categories
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { ItemCategory } from '../../types/cardItems';
import { getCategoryInfo, ITEM_CATEGORIES } from '../../types/cardItems';

interface CategoryBadgeProps {
  category: ItemCategory;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  selected?: boolean;
}

export function CategoryBadge({
  category,
  size = 'small',
  onPress,
  selected = false,
}: CategoryBadgeProps) {
  const categoryInfo = getCategoryInfo(category);
  
  const badgeStyles = [
    styles.badge,
    styles[size],
    { backgroundColor: `${categoryInfo.color}15` },
    { borderColor: categoryInfo.color },
    selected && styles.selected,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    { color: categoryInfo.color },
  ];

  const content = (
    <View style={badgeStyles}>
      <Text style={textStyles}>{categoryInfo.label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {content}
      </Pressable>
    );
  }

  return content;
}

interface CategoryChipsProps {
  selectedCategory: ItemCategory | null;
  onSelectCategory: (category: ItemCategory | null) => void;
  showAll?: boolean;
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
  showAll = true,
}: CategoryChipsProps) {
  return (
    <View style={styles.chipsContainer}>
      {showAll && (
        <Pressable
          style={[
            styles.chip,
            selectedCategory === null && styles.chipSelected,
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text
            style={[
              styles.chipText,
              selectedCategory === null && styles.chipTextSelected,
            ]}
          >
            All
          </Text>
        </Pressable>
      )}
      
      {ITEM_CATEGORIES.map((cat) => (
        <Pressable
          key={cat.value}
          style={[
            styles.chip,
            { borderColor: cat.color },
            selectedCategory === cat.value && {
              backgroundColor: cat.color,
            },
          ]}
          onPress={() => onSelectCategory(cat.value)}
        >
          <Text
            style={[
              styles.chipText,
              { color: cat.color },
              selectedCategory === cat.value && styles.chipTextSelected,
            ]}
          >
            {cat.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  selected: {
    borderWidth: 2,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
