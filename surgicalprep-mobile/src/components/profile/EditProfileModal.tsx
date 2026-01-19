// src/components/profile/EditProfileModal.tsx
// Modal for editing user profile information

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import type { UserProfile, UserRole, UpdateProfileRequest } from '../../types/user';
import { USER_ROLES } from '../../types/user';
import { useSettingsStore } from '../../stores/settingsStore';

interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
  isLoading?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  
  const [fullName, setFullName] = useState(profile.full_name);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [institution, setInstitution] = useState(profile.institution || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setFullName(profile.full_name);
      setRole(profile.role);
      setInstitution(profile.institution || '');
      setErrors({});
    }
  }, [visible, profile]);
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validate()) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await onSave({
        full_name: fullName.trim(),
        role,
        institution: institution.trim() || null,
      });
      
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      onClose();
    } catch (error) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  const handleClose = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };
  
  const hasChanges =
    fullName !== profile.full_name ||
    role !== profile.role ||
    institution !== (profile.institution || '');
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.headerButton}
            disabled={isLoading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Text style={[
                styles.saveText,
                (!hasChanges) && styles.saveTextDisabled,
              ]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Email (read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{profile.email}</Text>
              <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
            </View>
            <Text style={styles.helperText}>
              Email cannot be changed for security reasons
            </Text>
          </View>
          
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) {
                  setErrors((prev) => ({ ...prev, fullName: '' }));
                }
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>
          
          {/* Role */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(value) => setRole(value as UserRole)}
                enabled={!isLoading}
                style={styles.picker}
              >
                {Object.entries(USER_ROLES).map(([value, label]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Institution */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Institution (Optional)</Text>
            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Hospital, school, or organization"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
});

export default EditProfileModal;
