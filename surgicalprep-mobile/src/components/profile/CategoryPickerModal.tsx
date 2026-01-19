// src/components/profile/CategoryPickerModal.tsx
// Modal for selecting preferred quiz categories

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../stores/settingsStore';

// Quiz category definitions
export const QUIZ_CATEGORIES = [
  {
    id: 'cutting',
    label: 'Cutting & Dissecting',
    icon: 'cut-outline' as const,
    color: '#EF4444',
    description: 'Scalpels, scissors, and dissecting instruments',
  },
  {
    id: 'grasping',
    label: 'Grasping & Holding',
    icon: 'hand-left-outline' as const,
    color: '#F59E0B',
    description: 'Forceps, clamps, and tissue holders',
  },
  {
    id: 'clamping',
    label: 'Clamping & Occluding',
    icon: 'git-merge-outline' as const,
    color: '#10B981',
    description: 'Hemostats, vessel clamps, and occluding tools',
  },
  {
    id: 'retracting',
    label: 'Retracting & Exposing',
    icon: 'expand-outline' as const,
    color: '#3B82F6',
    description: 'Retractors and exposure instruments',
  },
  {
    id: 'suturing',
    label: 'Suturing & Stapling',
    icon: 'git-commit-outline' as const,
    color: '#8B5CF6',
    description: 'Needle holders, staplers, and suture tools',
  },
  {
    id: 'specialty',
    label: 'Specialty Instruments',
    icon: 'medical-outline' as const,
    color: '#EC4899',
    description: 'Orthopedic, neuro, and specialized tools',
  },
];

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
  selectedCategories,
  onCategoriesChange,
}) => {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedCategories);
  
  useEffect(() => {
    if (visible) {
      setLocalSelection(selectedCategories);
    }
  }, [visible, selectedCategories]);
  
  const handleToggle = (categoryId: string) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setLocalSelection((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleSelectAll = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelection(QUIZ_CATEGORIES.map((c) => c.id));
  };
  
  const handleClearAll = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelection([]);
  };
  
  const handleSave = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onCategoriesChange(localSelection);
    onClose();
  };
  
  const handleCancel = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLocalSelection(selectedCategories);
    onClose();
  };
  
  const allSelected = localSelection.length === QUIZ_CATEGORIES.length;
  const noneSelected = localSelection.length === 0;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Categories</Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>
            {noneSelected
              ? 'All categories will be included in quizzes'
              : `${localSelection.length} of ${QUIZ_CATEGORIES.length} categories selected`}
          </Text>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, allSelected && styles.quickActionButtonActive]}
            onPress={handleSelectAll}
          >
            <Text style={[styles.quickActionText, allSelected && styles.quickActionTextActive]}>
              Select All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, noneSelected && styles.quickActionButtonActive]}
            onPress={handleClearAll}
          >
            <Text style={[styles.quickActionText, noneSelected && styles.quickActionTextActive]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Category List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {QUIZ_CATEGORIES.map((category) => {
            const isSelected = localSelection.includes(category.id);
            
            return (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                  pressed && styles.categoryItemPressed,
                ]}
                onPress={() => handleToggle(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
                
                <View style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                  isSelected && { backgroundColor: category.color, borderColor: category.color },
                ]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    textAlign: 'right',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quickActionButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  quickActionTextActive: {
    color: '#6366F1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#FAFAFA',
  },
  categoryItemPressed: {
    opacity: 0.8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
});

export default CategoryPickerModal;
