// app/(tabs)/profile/change-password.tsx
// Change password screen with form validation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useChangePassword } from '../../../src/hooks/useUser';
import { useSettingsStore } from '../../../src/stores/settingsStore';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ChangePasswordScreen() {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const changePassword = useChangePassword();
  
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must include uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await changePassword.mutateAsync({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      const message = error?.response?.data?.detail || 'Failed to change password';
      
      if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        Alert.alert('Error', message);
      }
    }
  };
  
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  
  const isFormValid = formData.currentPassword && formData.newPassword && formData.confirmPassword;
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Change Password',
          headerBackTitle: 'Settings',
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Info Text */}
            <Text style={styles.infoText}>
              Choose a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
            </Text>
            
            {/* Current Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Current Password</Text>
              <View style={[styles.inputContainer, errors.currentPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={formData.currentPassword}
                  onChangeText={(text) => updateField('currentPassword', text)}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  autoComplete="password"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>
            
            {/* New Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={formData.newPassword}
                  onChangeText={(text) => updateField('newPassword', text)}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoComplete="password-new"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <PasswordStrengthIndicator password={formData.newPassword} />
              )}
            </View>
            
            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                <View style={styles.matchIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.matchText}>Passwords match</Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, (!isFormValid || changePassword.isPending) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isFormValid || changePassword.isPending}
              activeOpacity={0.8}
            >
              {changePassword.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// Password strength indicator component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (): { level: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 4) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score <= 5) return { level: 3, label: 'Good', color: '#10B981' };
    return { level: 4, label: 'Strong', color: '#059669' };
  };
  
  const strength = getStrength();
  
  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.bars}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              strengthStyles.bar,
              {
                backgroundColor: level <= strength.level ? strength.color : '#E5E7EB',
              },
            ]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color: strength.color }]}>
        {strength.label}
      </Text>
    </View>
  );
};

const strengthStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingRight: 8,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  matchText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
