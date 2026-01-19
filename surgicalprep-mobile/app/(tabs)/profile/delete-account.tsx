// app/(tabs)/profile/delete-account.tsx
// Delete account confirmation screen with safety checks

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

import { useDeleteAccount } from '../../../src/hooks/useUser';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSettingsStore, clearSettings } from '../../../src/stores/settingsStore';

const CONFIRMATION_TEXT = 'DELETE';

export default function DeleteAccountScreen() {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useDeleteAccount();
  
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmation?: string }>({});
  
  const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;
  const isFormValid = password && isConfirmationValid;
  
  const handleDelete = async () => {
    const newErrors: typeof errors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (!isConfirmationValid) {
      newErrors.confirmation = `Please type "${CONFIRMATION_TEXT}" to confirm`;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Final confirmation
    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. Your account and all associated data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };
  
  const performDelete = async () => {
    try {
      await deleteAccount.mutateAsync({
        password,
        confirmation: CONFIRMATION_TEXT,
      });
      
      // Clear all local data
      await clearSettings();
      await logout();
      
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted. We\'re sorry to see you go.',
        [{ text: 'OK', onPress: () => router.replace('/signup') }]
      );
    } catch (error: any) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      const message = error?.response?.data?.detail || 'Failed to delete account';
      
      if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong')) {
        setErrors({ password: 'Password is incorrect' });
      } else {
        Alert.alert('Error', message);
      }
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Delete Account',
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
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={32} color="#EF4444" />
              <Text style={styles.warningTitle}>Delete Your Account?</Text>
              <Text style={styles.warningText}>
                This action is permanent and cannot be undone. All your data will be deleted immediately.
              </Text>
            </View>
            
            {/* Consequences List */}
            <View style={styles.consequencesContainer}>
              <Text style={styles.consequencesTitle}>What will be deleted:</Text>
              
              <ConsequenceItem
                icon="albums"
                text="All your preference cards"
              />
              <ConsequenceItem
                icon="bar-chart"
                text="Study progress and statistics"
              />
              <ConsequenceItem
                icon="checkmark-circle"
                text="Quiz history and scores"
              />
              <ConsequenceItem
                icon="bookmark"
                text="Bookmarked instruments"
              />
              <ConsequenceItem
                icon="card"
                text="Subscription (no refunds for remaining time)"
              />
              <ConsequenceItem
                icon="person"
                text="Your profile and account"
              />
            </View>
            
            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm Your Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
            
            {/* Confirmation Text Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Type <Text style={styles.confirmText}>{CONFIRMATION_TEXT}</Text> to confirm
              </Text>
              <TextInput
                style={[styles.inputSingle, errors.confirmation && styles.inputError]}
                value={confirmationText}
                onChangeText={(text) => {
                  setConfirmationText(text.toUpperCase());
                  if (errors.confirmation) {
                    setErrors((prev) => ({ ...prev, confirmation: undefined }));
                  }
                }}
                placeholder={CONFIRMATION_TEXT}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {errors.confirmation && (
                <Text style={styles.errorText}>{errors.confirmation}</Text>
              )}
              {confirmationText && isConfirmationValid && (
                <View style={styles.confirmIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.confirmIndicatorText}>Confirmed</Text>
                </View>
              )}
            </View>
            
            {/* Alternative Option */}
            <View style={styles.alternativeContainer}>
              <Text style={styles.alternativeTitle}>Changed your mind?</Text>
              <Text style={styles.alternativeText}>
                If you're having issues, consider contacting support instead. We're here to help!
              </Text>
              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => {
                  if (hapticEnabled) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  Alert.alert('Contact Support', 'Email us at support@surgicalprep.app');
                }}
              >
                <Ionicons name="mail-outline" size={18} color="#6366F1" />
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Delete Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deleteButton, (!isFormValid || deleteAccount.isPending) && styles.deleteButtonDisabled]}
              onPress={handleDelete}
              disabled={!isFormValid || deleteAccount.isPending}
              activeOpacity={0.8}
            >
              {deleteAccount.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// Consequence item component
const ConsequenceItem: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string }> = ({
  icon,
  text,
}) => (
  <View style={styles.consequenceItem}>
    <Ionicons name={icon} size={18} color="#EF4444" />
    <Text style={styles.consequenceText}>{text}</Text>
  </View>
);

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
  warningBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
  },
  consequencesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  consequenceText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
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
  confirmText: {
    color: '#EF4444',
    fontWeight: '700',
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
  inputSingle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
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
  confirmIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  confirmIndicatorText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  alternativeContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  alternativeText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
