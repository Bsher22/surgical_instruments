// src/components/cards/CardFormHeader.tsx
// Header component for card create/edit forms with save/cancel actions

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardFormHeaderProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  canSave?: boolean;
}

export const CardFormHeader: React.FC<CardFormHeaderProps> = memo(
  ({
    title,
    onCancel,
    onSave,
    isSaving = false,
    isDirty = false,
    canSave = true,
  }) => {
    const saveDisabled = isSaving || !canSave;

    return (
      <View style={styles.container}>
        {/* Cancel Button */}
        <Pressable
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSaving}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.cancelText,
              isSaving && styles.cancelTextDisabled,
            ]}
          >
            Cancel
          </Text>
        </Pressable>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isDirty && !isSaving && (
            <View style={styles.unsavedBadge}>
              <Text style={styles.unsavedText}>Unsaved</Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            saveDisabled && styles.saveButtonDisabled,
          ]}
          onPress={onSave}
          disabled={saveDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Save card"
          accessibilityRole="button"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name="checkmark"
                size={18}
                color={saveDisabled ? '#9CA3AF' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.saveText,
                  saveDisabled && styles.saveTextDisabled,
                ]}
              >
                Save
              </Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }
);

CardFormHeader.displayName = 'CardFormHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  cancelTextDisabled: {
    color: '#D1D5DB',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  unsavedBadge: {
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unsavedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D97706',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    gap: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveTextDisabled: {
    color: '#9CA3AF',
  },
});

export default CardFormHeader;
