/**
 * ItemEditModal Component
 * Bottom sheet modal for editing item details (quantity, size, notes, category)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { CardItem, ItemCategory } from '../../types/cardItems';
import { getItemDisplayName, getCategoryInfo, ITEM_CATEGORIES } from '../../types/cardItems';
import { BottomSheet } from '../ui/BottomSheet';

interface ItemEditModalProps {
  visible: boolean;
  item: CardItem | null;
  onClose: () => void;
  onSave: (id: string, updates: {
    quantity: number;
    size: string | null;
    notes: string | null;
    category: ItemCategory;
  }) => void;
  onDelete: (id: string) => void;
}

export function ItemEditModal({
  visible,
  item,
  onClose,
  onSave,
  onDelete,
}: ItemEditModalProps) {
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ItemCategory>('instruments');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setSize(item.size || '');
      setNotes(item.notes || '');
      setCategory(item.category);
      setShowCategoryPicker(false);
    }
  }, [item]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!item) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(item.id, {
      quantity: Math.max(1, quantity),
      size: size.trim() || null,
      notes: notes.trim() || null,
      category,
    });
    onClose();
  }, [item, quantity, size, notes, category, onSave, onClose]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!item) return;
    onDelete(item.id);
    onClose();
  }, [item, onDelete, onClose]);

  // Quantity controls
  const decrementQuantity = () => {
    if (quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(q => q - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 999) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(q => q + 1);
    }
  };

  if (!item) return null;

  const displayName = getItemDisplayName(item);
  const thumbnailUrl = item.instrument?.thumbnail_url;
  const currentCategoryInfo = getCategoryInfo(category);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      height={520}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with item info */}
        <View style={styles.header}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnailPlaceholder, { backgroundColor: `${currentCategoryInfo.color}20` }]}>
              <Ionicons
                name={item.instrument_id ? 'medical-outline' : 'cube-outline'}
                size={28}
                color={currentCategoryInfo.color}
              />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {displayName}
            </Text>
            {item.instrument?.aliases && item.instrument.aliases.length > 0 && (
              <Text style={styles.itemAliases} numberOfLines={1}>
                aka: {item.instrument.aliases.join(', ')}
              </Text>
            )}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.quantityControl}>
            <Pressable
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? '#D1D5DB' : '#1F2937'} />
            </Pressable>
            <TextInput
              style={styles.quantityInput}
              value={String(quantity)}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num) && num >= 1 && num <= 999) {
                  setQuantity(num);
                } else if (text === '') {
                  setQuantity(1);
                }
              }}
              keyboardType="number-pad"
              maxLength={3}
              selectTextOnFocus
            />
            <Pressable
              style={[styles.quantityButton, quantity >= 999 && styles.quantityButtonDisabled]}
              onPress={incrementQuantity}
              disabled={quantity >= 999}
            >
              <Ionicons name="add" size={20} color={quantity >= 999 ? '#D1D5DB' : '#1F2937'} />
            </Pressable>
          </View>
        </View>

        {/* Size/Specification */}
        <View style={styles.field}>
          <Text style={styles.label}>Size / Specification</Text>
          <TextInput
            style={styles.textInput}
            value={size}
            onChangeText={setSize}
            placeholder="e.g., 10mm, Large, #3"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <Pressable
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <View style={[styles.categoryIndicator, { backgroundColor: currentCategoryInfo.color }]} />
            <Text style={styles.categoryText}>{currentCategoryInfo.label}</Text>
            <Ionicons
              name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </Pressable>
          
          {showCategoryPicker && (
            <View style={styles.categoryPicker}>
              {ITEM_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(cat.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={[styles.categoryIndicator, { backgroundColor: cat.color }]} />
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.value && styles.categoryOptionTextSelected,
                  ]}>
                    {cat.label}
                  </Text>
                  {category === cat.value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Special instructions, preferences, etc."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Remove</Text>
          </Pressable>

          <View style={styles.primaryActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemAliases: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityInput: {
    width: 60,
    height: 44,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  categoryPicker: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  categoryOptionTextSelected: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  actions: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
