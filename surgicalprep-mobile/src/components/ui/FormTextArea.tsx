// src/components/ui/FormTextArea.tsx
// Multi-line text input component for forms

import React, { forwardRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormTextAreaProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  helpText?: string;
  minHeight?: number;
  maxHeight?: number;
  autoGrow?: boolean;
  containerStyle?: object;
}

export const FormTextArea = forwardRef<TextInput, FormTextAreaProps>(
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
      minHeight = 100,
      maxHeight = 200,
      autoGrow = true,
      containerStyle,
      editable = true,
      ...textInputProps
    },
    ref
  ) => {
    const [inputHeight, setInputHeight] = useState(minHeight);

    const handleContentSizeChange = useCallback(
      (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        if (autoGrow) {
          const { height } = event.nativeEvent.contentSize;
          const newHeight = Math.min(Math.max(height + 20, minHeight), maxHeight);
          setInputHeight(newHeight);
        }
      },
      [autoGrow, minHeight, maxHeight]
    );

    const charCountPercentage = maxLength ? (value.length / maxLength) * 100 : 0;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>

        {/* Text Area */}
        <TextInput
          ref={ref}
          style={[
            styles.textArea,
            { height: autoGrow ? inputHeight : minHeight },
            !editable && styles.textAreaDisabled,
            error && styles.textAreaError,
          ]}
          value={value}
          onChangeText={onChangeText}
          onContentSizeChange={handleContentSizeChange}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          editable={editable}
          placeholderTextColor="#9CA3AF"
          {...textInputProps}
        />

        {/* Footer with char count and error */}
        <View style={styles.footer}>
          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : helpText ? (
            <Text style={styles.helpText}>{helpText}</Text>
          ) : (
            <View />
          )}

          {/* Character count */}
          {showCharCount && maxLength && (
            <Text
              style={[
                styles.charCount,
                charCountPercentage > 90 && styles.charCountWarning,
                charCountPercentage >= 100 && styles.charCountError,
              ]}
            >
              {value.length.toLocaleString()}/{maxLength.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Progress bar for character count */}
        {showCharCount && maxLength && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(charCountPercentage, 100)}%` },
                charCountPercentage > 90 && styles.progressBarWarning,
                charCountPercentage >= 100 && styles.progressBarError,
              ]}
            />
          </View>
        )}
      </View>
    );
  }
);

FormTextArea.displayName = 'FormTextArea';

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
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  textAreaDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  textAreaError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
    minHeight: 20,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  progressBarWarning: {
    backgroundColor: '#F59E0B',
  },
  progressBarError: {
    backgroundColor: '#DC2626',
  },
});

export default FormTextArea;
