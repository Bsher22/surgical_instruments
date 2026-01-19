import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateRequired,
} from '../../src/utils/validation';
import { FormError } from '../../src/components/ui/FormError';
import { LogoHeader } from '../../src/components/ui/LogoHeader';
import { UserRole, ROLE_OPTIONS } from '../../src/types';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  institution?: string;
  general?: string;
}

export default function SignupScreen() {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [institution, setInstitution] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Auth hook
  const { signup } = useAuth();

  // Get display text for selected role
  const selectedRoleLabel = role
    ? ROLE_OPTIONS.find((r) => r.value === role)?.label || ''
    : '';

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!role) {
      newErrors.role = 'Please select your role';
    }

    // Institution is optional but if provided, validate it
    if (institution && institution.length < 2) {
      newErrors.institution = 'Institution name is too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSignup = async () => {
    // Clear previous general error
    setErrors((prev) => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role!,
        institution: institution.trim() || undefined,
      });
      
      // Navigate to main app after successful signup
      router.replace('/(tabs)/instruments');
    } catch (error: any) {
      const message = error?.message || 'Failed to create account. Please try again.';
      
      // Handle specific error cases
      if (message.includes('already exists') || message.includes('409')) {
        setErrors({ 
          email: 'An account with this email already exists',
          general: undefined,
        });
      } else if (message.includes('Network')) {
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear field-specific error when user starts typing
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Role selection modal
  const renderRoleModal = () => (
    <Modal
      visible={showRoleModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowRoleModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Your Role</Text>
          <FlatList
            data={ROLE_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === item.value && styles.roleOptionSelected,
                ]}
                onPress={() => {
                  setRole(item.value);
                  clearError('role');
                  setShowRoleModal(false);
                }}
              >
                <View style={styles.roleOptionContent}>
                  <Text
                    style={[
                      styles.roleOptionLabel,
                      role === item.value && styles.roleOptionLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.roleOptionDescription}>
                    {item.description}
                  </Text>
                </View>
                {role === item.value && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Header */}
          <LogoHeader
            title="Create Account"
            subtitle="Start mastering surgical instruments today"
          />

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* General Error */}
            {errors.general && (
              <FormError message={errors.general} style={styles.generalError} />
            )}

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Jane Doe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  clearError('name');
                }}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                editable={!isSubmitting}
                returnKeyType="next"
              />
              {errors.name && <FormError message={errors.name} />}
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isSubmitting}
                returnKeyType="next"
              />
              {errors.email && <FormError message={errors.email} />}
            </View>

            {/* Role Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdown, errors.role && styles.inputError]}
                onPress={() => setShowRoleModal(true)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !role && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedRoleLabel || 'Select your role'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              {errors.role && <FormError message={errors.role} />}
            </View>

            {/* Institution Field (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Institution <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.institution && styles.inputError]}
                placeholder="Hospital or school name"
                placeholderTextColor="#9CA3AF"
                value={institution}
                onChangeText={(text) => {
                  setInstitution(text);
                  clearError('institution');
                }}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="next"
              />
              {errors.institution && <FormError message={errors.institution} />}
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  editable={!isSubmitting}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && <FormError message={errors.password} />}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!isSubmitting}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
              {errors.confirmPassword && (
                <FormError message={errors.confirmPassword} />
              )}
            </View>

            {/* Terms Notice */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSignup}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Link to Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity disabled={isSubmitting}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Role Selection Modal */}
      {renderRoleModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 24,
  },
  generalError: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  optionalLabel: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  termsText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  termsLink: {
    color: '#0D9488',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#99D5D1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#0D9488',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  roleOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#0D9488',
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  roleOptionLabelSelected: {
    color: '#0D9488',
  },
  roleOptionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 8,
  },
});
