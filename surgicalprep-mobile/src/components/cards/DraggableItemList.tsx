/**
 * DraggableItemList Component
 * Drag-to-reorder list for preference card items
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { CardItem, ItemCategory } from '../../types/cardItems';
import { getCategoryInfo, ITEM_CATEGORIES } from '../../types/cardItems';
import { groupItemsByCategory } from '../../utils/cardItemHelpers';
import { CardItemRow, CardItemRowCompact } from './CardItemRow';
import { CustomItemForm } from './CustomItemForm';

interface DraggableItemListProps {
  items: CardItem[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onEditItem: (item: CardItem) => void;
  onDeleteItem: (item: CardItem) => void;
  onAddInstrument: () => void;
  onAddCustomItem: (data: any) => { success: boolean; errors?: Record<string, string> };
  groupByCategory?: boolean;
  showAddButtons?: boolean;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
}

export function DraggableItemList({
  items,
  onReorder,
  onEditItem,
  onDeleteItem,
  onAddInstrument,
  onAddCustomItem,
  groupByCategory = false,
  showAddButtons = true,
  emptyStateTitle = 'No Items Yet',
  emptyStateMessage = 'Add instruments from the database or create custom items.',
}: DraggableItemListProps) {
  // Track if we're currently dragging
  const [isDragging, setIsDragging] = useState(false);

  // Render individual item for draggable list
  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<CardItem>) => {
      return (
        <ScaleDecorator>
          <CardItemRow
            item={item}
            onPress={onEditItem}
            onDelete={onDeleteItem}
            isDragging={isActive}
            drag={drag}
          />
        </ScaleDecorator>
      );
    },
    [onEditItem, onDeleteItem]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      setIsDragging(false);
      if (from !== to) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onReorder(from, to);
      }
    },
    [onReorder]
  );

  // Handle drag start
  const handleDragBegin = useCallback(() => {
    setIsDragging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  // Key extractor
  const keyExtractor = useCallback((item: CardItem) => item.id, []);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyStateTitle}>{emptyStateTitle}</Text>
      <Text style={styles.emptyStateMessage}>{emptyStateMessage}</Text>
    </View>
  );

  // Render add buttons header
  const renderHeader = () => {
    if (!showAddButtons) return null;

    return (
      <View style={styles.addButtonsContainer}>
        <Pressable
          style={styles.addFromDatabaseButton}
          onPress={onAddInstrument}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.addFromDatabaseText}>Add from Database</Text>
        </Pressable>
        
        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <CustomItemForm onSubmit={onAddCustomItem} />
      </View>
    );
  };

  // Render footer with item count
  const renderFooter = () => {
    if (items.length === 0) return null;

    return (
      <View style={styles.footer}>
        <Text style={styles.itemCount}>
          {items.length} item{items.length !== 1 ? 's' : ''} total
        </Text>
        
        {/* Category breakdown */}
        <View style={styles.categoryBreakdown}>
          {ITEM_CATEGORIES.map(cat => {
            const count = items.filter(i => i.category === cat.value).length;
            if (count === 0) return null;
            return (
              <View key={cat.value} style={styles.categoryCount}>
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Text style={styles.categoryCountText}>
                  {count} {cat.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // If grouping by category, render grouped list
  if (groupByCategory && items.length > 0) {
    return (
      <GestureHandlerRootView style={styles.container}>
        {renderHeader()}
        <GroupedItemList
          items={items}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
        {renderFooter()}
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onDragEnd={handleDragEnd}
        onDragBegin={handleDragBegin}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        activationDistance={10}
      />
    </GestureHandlerRootView>
  );
}

// Grouped list (non-draggable, organized by category)
interface GroupedItemListProps {
  items: CardItem[];
  onEditItem: (item: CardItem) => void;
  onDeleteItem: (item: CardItem) => void;
}

function GroupedItemList({
  items,
  onEditItem,
  onDeleteItem,
}: GroupedItemListProps) {
  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);

  return (
    <View style={styles.groupedContainer}>
      {ITEM_CATEGORIES.map(cat => {
        const categoryItems = groupedItems.get(cat.value) || [];
        if (categoryItems.length === 0) return null;

        return (
          <View key={cat.value} style={styles.categorySection}>
            <View style={styles.categorySectionHeader}>
              <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
              <Text style={styles.categorySectionTitle}>{cat.label}</Text>
              <Text style={styles.categorySectionCount}>({categoryItems.length})</Text>
            </View>
            
            <View style={styles.categorySectionItems}>
              {categoryItems.map(item => (
                <CardItemRowCompact
                  key={item.id}
                  item={item}
                  onPress={onEditItem}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Summary view for compact display
interface ItemsSummaryProps {
  items: CardItem[];
  maxVisible?: number;
  onPress?: () => void;
}

export function ItemsSummary({
  items,
  maxVisible = 5,
  onPress,
}: ItemsSummaryProps) {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  if (items.length === 0) {
    return (
      <Pressable style={styles.summaryEmpty} onPress={onPress}>
        <Ionicons name="add-circle-outline" size={24} color="#9CA3AF" />
        <Text style={styles.summaryEmptyText}>Add items</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.summaryContainer} onPress={onPress}>
      <View style={styles.summaryItems}>
        {visibleItems.map((item) => (
          <CardItemRowCompact key={item.id} item={item} />
        ))}
        
        {remainingCount > 0 && (
          <View style={styles.summaryMore}>
            <Text style={styles.summaryMoreText}>
              +{remainingCount} more item{remainingCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.summaryFooter}>
        <Text style={styles.summaryTotal}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  addButtonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  addFromDatabaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
  },
  addFromDatabaseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 13,
    color: '#9CA3AF',
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Grouped list styles
  groupedContainer: {
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categorySectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categorySectionItems: {
    gap: 8,
  },
  // Summary styles
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    paddingVertical: 24,
    gap: 8,
  },
  summaryEmptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  summaryItems: {
    gap: 4,
    padding: 8,
  },
  summaryMore: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryMoreText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  summaryTotal: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
});
