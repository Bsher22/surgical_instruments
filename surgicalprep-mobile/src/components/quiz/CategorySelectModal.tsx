// ============================================================================
// Category Selection Modal Component
// ============================================================================

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Category } from '../../types/quiz';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface CategorySelectModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryIds: string[];
  isLoading?: boolean;
  onToggleCategory: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onToggle: () => void;
}

// ============================================================================
// Category Item Component
// ============================================================================

const CategoryItem = React.memo(function CategoryItem({
  category,
  isSelected,
  onToggle,
}: CategoryItemProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <TouchableOpacity
      style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${category.name}, ${category.instrumentCount} instruments`}
    >
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
          {category.name}
        </Text>
        <Text style={styles.categoryCount}>
          {category.instrumentCount} instrument{category.instrumentCount === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        )}
      </View>
    </TouchableOpacity>
  );
});

// ============================================================================
// Category Selection Modal Component
// ============================================================================

export function CategorySelectModal({
  visible,
  categories,
  selectedCategoryIds,
  isLoading = false,
  onToggleCategory,
  onSelectAll,
  onClearAll,
  onConfirm,
  onClose,
}: CategorySelectModalProps) {
  // Memoize selection state
  const selectionState = useMemo(() => {
    const allSelected = selectedCategoryIds.length === categories.length;
    const noneSelected = selectedCategoryIds.length === 0;
    const someSelected = !allSelected && !noneSelected;
    
    return { allSelected, noneSelected, someSelected };
  }, [selectedCategoryIds.length, categories.length]);

  // Memoize total instruments count
  const totalInstruments = useMemo(() => {
    if (selectedCategoryIds.length === 0) {
      return categories.reduce((sum, cat) => sum + cat.instrumentCount, 0);
    }
    return categories
      .filter((cat) => selectedCategoryIds.includes(cat.id))
      .reduce((sum, cat) => sum + cat.instrumentCount, 0);
  }, [categories, selectedCategoryIds]);

  // Render category item
  const renderCategoryItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryItem
        category={item}
        isSelected={selectedCategoryIds.includes(item.id)}
        onToggle={() => onToggleCategory(item.id)}
      />
    ),
    [selectedCategoryIds, onToggleCategory]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Category) => item.id, []);

  // Handle confirm with haptic
  const handleConfirm = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Categories</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Selection Actions */}
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={[styles.selectionButton, selectionState.allSelected && styles.selectionButtonActive]}
            onPress={onSelectAll}
            accessibilityRole="button"
            accessibilityLabel="Select all categories"
          >
            <Ionicons
              name={selectionState.allSelected ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={selectionState.allSelected ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.selectionButtonText, selectionState.allSelected && styles.selectionButtonTextActive]}>
              Select All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionButton, selectionState.noneSelected && styles.selectionButtonActive]}
            onPress={onClearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all selections"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={selectionState.noneSelected ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.selectionButtonText, selectionState.noneSelected && styles.selectionButtonTextActive]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            {selectedCategoryIds.length === 0
              ? `All ${totalInstruments} instruments will be included`
              : `${totalInstruments} instrument${totalInstruments === 1 ? '' : 's'} from ${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? 'y' : 'ies'}`}
          </Text>
        </View>

        {/* Categories List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No categories available</Text>
              </View>
            }
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Start quiz with ${selectedCategoryIds.length === 0 ? 'all' : selectedCategoryIds.length} categories`}
          >
            <Text style={styles.confirmButtonText}>
              {selectedCategoryIds.length === 0
                ? 'Start with All Categories'
                : `Start with ${selectedCategoryIds.length} Categor${selectedCategoryIds.length === 1 ? 'y' : 'ies'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },

  // Selection Actions
  selectionActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  selectionButtonActive: {
    backgroundColor: `${colors.primary}15`,
  },
  selectionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  selectionButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.info}10`,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.info,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Category Item
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  categoryNameSelected: {
    color: colors.primary,
  },
  categoryCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});

export default CategorySelectModal;
