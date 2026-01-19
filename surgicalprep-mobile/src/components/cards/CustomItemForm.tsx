/**
 * CustomItemForm Component
 * Inline expandable form for adding custom items not in the database
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { CustomItemFormData, ItemCategory, ItemValidationErrors } from '../../types/cardItems';
import { ITEM_CATEGORIES, getCategoryInfo } from '../../types/cardItems';
import { validateCustomItem, DEFAULT_CUSTOM_ITEM } from '../../utils/cardItemHelpers';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CustomItemFormProps {
  onSubmit: (data: CustomItemFormData) => { success: boolean; errors?: Record<string, string> };
  initiallyExpanded?: boolean;
}

export function CustomItemForm({
  onSubmit,
  initiallyExpanded = false,
}: CustomItemFormProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [formData, setFormData] = useState<CustomItemFormData>(DEFAULT_CUSTOM_ITEM);
  const [errors, setErrors] = useState<ItemValidationErrors>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const nameInputRef = useRef<TextInput>(null);
  const animatedHeight = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  // Animate expansion
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  // Focus name input when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);

  // Toggle expansion
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isExpanded) {
      // Collapse and reset
      setIsExpanded(false);
      setFormData(DEFAULT_CUSTOM_ITEM);
      setErrors({});
      setShowCategoryPicker(false);
    } else {
      setIsExpanded(true);
    }
  };

  // Handle form field change
  const updateField = <K extends keyof CustomItemFormData>(
    field: K,
    value: CustomItemFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ItemValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle quantity change
  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(999, formData.quantity + delta));
    if (newQuantity !== formData.quantity) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateField('quantity', newQuantity);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    const validationErrors = validateCustomItem(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const result = onSubmit(formData);
    
    if (result.success) {
      // Reset form after successful submission
      setFormData(DEFAULT_CUSTOM_ITEM);
      setErrors({});
      // Keep expanded for quick successive additions
      nameInputRef.current?.focus();
    } else if (result.errors) {
      setErrors(result.errors as ItemValidationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const currentCategoryInfo = getCategoryInfo(formData.category);

  return (
    <View style={styles.container}>
      {/* Toggle button */}
      <Pressable
        style={[styles.toggleButton, isExpanded && styles.toggleButtonExpanded]}
        onPress={toggleExpanded}
      >
        <View style={styles.toggleIconContainer}>
          <Ionicons
            name={isExpanded ? 'close' : 'add-circle-outline'}
            size={24}
            color={isExpanded ? '#6B7280' : '#3B82F6'}
          />
        </View>
        <Text style={[styles.toggleText, isExpanded && styles.toggleTextExpanded]}>
          {isExpanded ? 'Cancel' : 'Add Custom Item'}
        </Text>
      </Pressable>

      {/* Expandable form */}
      {isExpanded && (
        <View style={styles.form}>
          {/* Name field */}
          <View style={styles.field}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              ref={nameInputRef}
              style={[styles.textInput, errors.name && styles.textInputError]}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="Enter item name"
              placeholderTextColor="#9CA3AF"
              maxLength={200}
              returnKeyType="next"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Quantity and Size row */}
          <View style={styles.row}>
            {/* Quantity */}
            <View style={[styles.field, styles.quantityField]}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.quantityControl}>
                <Pressable
                  style={[styles.quantityButton, formData.quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => adjustQuantity(-1)}
                  disabled={formData.quantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={formData.quantity <= 1 ? '#D1D5DB' : '#1F2937'} />
                </Pressable>
                <TextInput
                  style={styles.quantityInput}
                  value={String(formData.quantity)}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num >= 1 && num <= 999) {
                      updateField('quantity', num);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                />
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(1)}
                >
                  <Ionicons name="add" size={18} color="#1F2937" />
                </Pressable>
              </View>
            </View>

            {/* Size */}
            <View style={[styles.field, styles.sizeField]}>
              <Text style={styles.label}>Size</Text>
              <TextInput
                style={styles.textInput}
                value={formData.size}
                onChangeText={(text) => updateField('size', text)}
                placeholder="e.g., Large"
                placeholderTextColor="#9CA3AF"
                maxLength={50}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              style={styles.categorySelector}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCategoryPicker(!showCategoryPicker);
              }}
            >
              <View style={[styles.categoryIndicator, { backgroundColor: currentCategoryInfo.color }]} />
              <Text style={styles.categoryText}>{currentCategoryInfo.label}</Text>
              <Ionicons
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                size={18}
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
                      formData.category === cat.value && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField('category', cat.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.categoryIndicator, { backgroundColor: cat.color }]} />
                    <Text style={[
                      styles.categoryOptionText,
                      formData.category === cat.value && styles.categoryOptionTextSelected,
                    ]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={formData.notes}
              onChangeText={(text) => updateField('notes', text)}
              placeholder="Any special instructions..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Submit button */}
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Add Item</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  toggleButtonExpanded: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  toggleIconContainer: {
    marginRight: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  toggleTextExpanded: {
    color: '#6B7280',
  },
  form: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  notesInput: {
    minHeight: 60,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityField: {
    flex: 0,
    minWidth: 130,
  },
  sizeField: {
    flex: 1,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  quantityButton: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  categoryIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  categoryPicker: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
