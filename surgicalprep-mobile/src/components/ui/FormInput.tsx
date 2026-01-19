// src/components/ui/FormInput.tsx
// Reusable text input component for forms

import React, { forwardRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  helpText?: string;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: object;
}

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      required = false,
      showCharCount = false,
      maxLength,
      helpText,
      clearable = false,
      onClear,
      containerStyle,
      editable = true,
      ...textInputProps
    },
    ref
  ) => {
    const handleClear = useCallback(() => {
      onChangeText('');
      onClear?.();
    }, [onChangeText, onClear]);

    const showClearButton = clearable && value.length > 0 && editable;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {showCharCount && maxLength && (
            <Text
              style={[
                styles.charCount,
                value.length > maxLength * 0.9 && styles.charCountWarning,
                value.length >= maxLength && styles.charCountError,
              ]}
            >
              {value.length}/{maxLength}
            </Text>
          )}
        </View>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              !editable && styles.inputDisabled,
              error && styles.inputError,
              showClearButton && styles.inputWithClear,
            ]}
            value={value}
            onChangeText={onChangeText}
            maxLength={maxLength}
            editable={editable}
            placeholderTextColor="#9CA3AF"
            {...textInputProps}
          />
          {showClearButton && (
            <Pressable
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Clear input"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

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
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#DC2626',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  charCountWarning: {
    color: '#F59E0B',
  },
  charCountError: {
    color: '#DC2626',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputWithClear: {
    paddingRight: 40,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
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
});

export default FormInput;
