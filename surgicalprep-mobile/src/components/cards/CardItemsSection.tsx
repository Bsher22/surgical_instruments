/**
 * CardItemsSection Component
 * Groups and displays card items by category with collapsible sections
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardItemRow } from './CardItemRow';
import { colors, spacing, typography } from '../../utils/theme';
import type { PreferenceCardItem } from '../../types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CardItemsSectionProps {
  items: PreferenceCardItem[];
  onItemPress?: (itemId: string, instrumentId?: string) => void;
}

interface CategoryConfig {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  { key: 'instrument', label: 'Instruments', icon: 'cut-outline', color: colors.categoryInstrument },
  { key: 'supply', label: 'Supplies', icon: 'cube-outline', color: colors.categorySupply },
  { key: 'suture', label: 'Sutures', icon: 'git-commit-outline', color: colors.categorySuture },
  { key: 'implant', label: 'Implants/Special', icon: 'hardware-chip-outline', color: colors.categoryImplant },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: colors.categoryOther },
];

export function CardItemsSection({ items, onItemPress }: CardItemsSectionProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, PreferenceCardItem[]> = {};
    
    items.forEach((item) => {
      const category = item.category?.toLowerCase() || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    // Sort items within each group by order_index
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });

    return groups;
  }, [items]);

  const toggleSection = useCallback((category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="layers-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Items</Text>
        <Text style={styles.emptyMessage}>
          This card doesn't have any items yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Items ({items.length})
      </Text>

      {CATEGORY_CONFIG.map((config) => {
        const categoryItems = groupedItems[config.key];
        if (!categoryItems || categoryItems.length === 0) return null;

        const isCollapsed = collapsedSections.has(config.key);

        return (
          <View key={config.key} style={styles.categoryContainer}>
            <Pressable
              style={styles.categoryHeader}
              onPress={() => toggleSection(config.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: !isCollapsed }}
              accessibilityLabel={`${config.label}, ${categoryItems.length} items`}
            >
              <View style={styles.categoryTitleRow}>
                <View style={[styles.categoryIcon, { backgroundColor: config.color + '20' }]}>
                  <Ionicons name={config.icon} size={18} color={config.color} />
                </View>
                <Text style={styles.categoryLabel}>{config.label}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{categoryItems.length}</Text>
                </View>
              </View>
              <Ionicons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            {!isCollapsed && (
              <View style={styles.itemsList}>
                {categoryItems.map((item, index) => (
                  <CardItemRow
                    key={item.id}
                    item={item}
                    onPress={onItemPress}
                    showDivider={index < categoryItems.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  itemsList: {
    paddingVertical: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
