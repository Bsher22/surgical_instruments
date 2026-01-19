// src/components/ui/FormPicker.tsx
// Dropdown/picker component for forms with platform-specific behavior

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PickerOption {
  value: string;
  label: string;
}

interface FormPickerProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  containerStyle?: object;
  allowClear?: boolean;
}

export const FormPicker: React.FC<FormPickerProps> = memo(
  ({
    label,
    value,
    options,
    onValueChange,
    placeholder = 'Select an option',
    error,
    required = false,
    helpText,
    disabled = false,
    containerStyle,
    allowClear = true,
  }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption?.label ?? placeholder;

    const handlePress = useCallback(() => {
      if (disabled) return;

      if (Platform.OS === 'ios') {
        // Use ActionSheet on iOS for better native feel
        const optionLabels = options.map((opt) => opt.label);
        if (allowClear && value) {
          optionLabels.push('Clear Selection');
        }
        optionLabels.push('Cancel');

        const cancelButtonIndex = optionLabels.length - 1;
        const destructiveButtonIndex = allowClear && value 
          ? optionLabels.length - 2 
          : undefined;

        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: optionLabels,
            cancelButtonIndex,
            destructiveButtonIndex,
            title: label,
          },
          (buttonIndex) => {
            if (buttonIndex === cancelButtonIndex) return;
            if (allowClear && value && buttonIndex === optionLabels.length - 2) {
              onValueChange('');
              return;
            }
            onValueChange(options[buttonIndex].value);
          }
        );
      } else {
        // Use Modal on Android
        setModalVisible(true);
      }
    }, [disabled, options, value, label, onValueChange, allowClear]);

    const handleOptionSelect = useCallback(
      (optionValue: string) => {
        onValueChange(optionValue);
        setModalVisible(false);
      },
      [onValueChange]
    );

    const handleClear = useCallback(() => {
      onValueChange('');
      setModalVisible(false);
    }, [onValueChange]);

    const renderOption = useCallback(
      ({ item }: { item: PickerOption }) => (
        <Pressable
          style={[
            styles.option,
            item.value === value && styles.optionSelected,
          ]}
          onPress={() => handleOptionSelect(item.value)}
          android_ripple={{ color: '#E5E7EB' }}
        >
          <Text
            style={[
              styles.optionText,
              item.value === value && styles.optionTextSelected,
            ]}
          >
            {item.label}
          </Text>
          {item.value === value && (
            <Ionicons name="checkmark" size={20} color="#2563EB" />
          )}
        </Pressable>
      ),
      [value, handleOptionSelect]
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>

        {/* Picker Button */}
        <Pressable
          style={[
            styles.pickerButton,
            disabled && styles.pickerButtonDisabled,
            error && styles.pickerButtonError,
          ]}
          onPress={handlePress}
          disabled={disabled}
          accessibilityLabel={`${label}: ${displayText}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <Text
            style={[
              styles.pickerText,
              !selectedOption && styles.pickerPlaceholder,
              disabled && styles.pickerTextDisabled,
            ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? '#9CA3AF' : '#6B7280'}
          />
        </Pressable>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Help text */}
        {helpText && !error && (
          <Text style={styles.helpText}>{helpText}</Text>
        )}

        {/* Android Modal */}
        {Platform.OS === 'android' && (
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </Pressable>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={renderOption}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                />

                {allowClear && value && (
                  <Pressable
                    style={styles.clearButton}
                    onPress={handleClear}
                    android_ripple={{ color: '#FEE2E2' }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    <Text style={styles.clearButtonText}>Clear Selection</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </Modal>
        )}
      </View>
    );
  }
);

FormPicker.displayName = 'FormPicker';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  pickerButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  pickerButtonError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  pickerTextDisabled: {
    color: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  // Modal styles (Android)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'android' ? 24 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  optionTextSelected: {
    color: '#2563EB',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default FormPicker;
