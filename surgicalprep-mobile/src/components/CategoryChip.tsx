import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

export function CategoryChip({ label, selected, onPress, count }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label} category${count !== undefined ? `, ${count} items` : ''}`}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
          <Text style={[styles.countText, selected && styles.countTextSelected]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface CategoryChipListProps {
  categories: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  showAllOption?: boolean;
  allLabel?: string;
}

export function CategoryChipList({
  categories,
  selectedIds,
  onToggle,
  showAllOption = true,
  allLabel = 'All',
}: CategoryChipListProps) {
  const isAllSelected = selectedIds.length === 0;

  const handleAllPress = () => {
    // Clear all selections
    selectedIds.forEach((id) => onToggle(id));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showAllOption && (
          <CategoryChip
            label={allLabel}
            selected={isAllSelected}
            onPress={handleAllPress}
          />
        )}
        
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.label}
            selected={selectedIds.includes(category.id)}
            onPress={() => onToggle(category.id)}
            count={category.count}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
});

export default CategoryChip;
