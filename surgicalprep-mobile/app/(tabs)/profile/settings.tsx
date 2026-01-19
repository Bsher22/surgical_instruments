// app/(tabs)/profile/settings.tsx
// Settings screen with quiz preferences, display options, and account actions

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Application from 'expo-application';

import { SettingsSection, SettingsRow } from '../../../src/components/profile';
import {
  useSettingsStore,
  useQuizSettings,
} from '../../../src/stores/settingsStore';
import { useAuthStore } from '../../../src/stores/authStore';
import type { DarkModeOption, TextSizeOption } from '../../../src/types/user';
import { DARK_MODE_OPTIONS, TEXT_SIZE_OPTIONS } from '../../../src/types/user';

// Category options for quiz preferences
const QUIZ_CATEGORIES = [
  { id: 'cutting', label: 'Cutting & Dissecting' },
  { id: 'grasping', label: 'Grasping & Holding' },
  { id: 'clamping', label: 'Clamping & Occluding' },
  { id: 'retracting', label: 'Retracting & Exposing' },
  { id: 'suturing', label: 'Suturing & Stapling' },
  { id: 'specialty', label: 'Specialty Instruments' },
];

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);
  
  // Settings store
  const {
    darkMode,
    textSize,
    hapticFeedback,
    quizQuestionCount,
    quizTimerEnabled,
    quizTimerSeconds,
    preferredCategories,
    setDarkMode,
    setTextSize,
    setHapticFeedback,
    setQuizQuestionCount,
    setQuizTimerEnabled,
    toggleCategory,
    resetToDefaults,
  } = useSettingsStore();
  
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // App version
  const appVersion = Application.nativeApplicationVersion || '1.0.0';
  const buildNumber = Application.nativeBuildVersion || '1';
  
  const handleHaptic = useCallback(() => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticFeedback]);
  
  // Navigation handlers
  const handleChangePassword = () => {
    handleHaptic();
    router.push('/profile/change-password');
  };
  
  const handleDeleteAccount = () => {
    handleHaptic();
    router.push('/profile/delete-account');
  };
  
  // External link handlers
  const handlePrivacyPolicy = () => {
    handleHaptic();
    Linking.openURL('https://surgicalprep.app/privacy');
  };
  
  const handleTermsOfService = () => {
    handleHaptic();
    Linking.openURL('https://surgicalprep.app/terms');
  };
  
  const handleContactSupport = () => {
    handleHaptic();
    Linking.openURL('mailto:support@surgicalprep.app?subject=SurgicalPrep Support');
  };
  
  const handleRateApp = () => {
    handleHaptic();
    // Open app store for rating
    // iOS: itms-apps://itunes.apple.com/app/idXXXXXXXXX?action=write-review
    // Android: market://details?id=com.yourname.surgicalprep
    Alert.alert('Rate SurgicalPrep', 'Thanks for your support! App store links will be available after launch.');
  };
  
  // Settings action handlers
  const handleDarkModePress = () => {
    handleHaptic();
    Alert.alert(
      'Appearance',
      'Choose your preferred theme',
      Object.entries(DARK_MODE_OPTIONS).map(([value, label]) => ({
        text: label,
        onPress: () => setDarkMode(value as DarkModeOption),
        style: value === darkMode ? 'default' : undefined,
      }))
    );
  };
  
  const handleTextSizePress = () => {
    handleHaptic();
    Alert.alert(
      'Text Size',
      'Choose your preferred text size',
      Object.entries(TEXT_SIZE_OPTIONS).map(([value, label]) => ({
        text: label,
        onPress: () => setTextSize(value as TextSizeOption),
        style: value === textSize ? 'default' : undefined,
      }))
    );
  };
  
  const handleCategoriesPress = () => {
    handleHaptic();
    setShowCategoryPicker(true);
    // In a real implementation, you'd show a modal with checkboxes
    Alert.alert(
      'Preferred Categories',
      'Select categories to focus on',
      [
        ...QUIZ_CATEGORIES.map((cat) => ({
          text: `${preferredCategories.includes(cat.id) ? '✓ ' : '  '}${cat.label}`,
          onPress: () => toggleCategory(cat.id),
        })),
        { text: 'Done', style: 'cancel' },
      ]
    );
  };
  
  const handleLogout = () => {
    handleHaptic();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };
  
  const handleResetSettings = () => {
    handleHaptic();
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            if (hapticFeedback) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerBackTitle: 'Profile',
        }}
      />
      
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quiz Preferences */}
          <SettingsSection title="Quiz Preferences">
            <SettingsRow
              type="slider"
              icon="help-circle-outline"
              iconColor="#6366F1"
              label="Default Questions"
              subtitle="Number of questions per quiz"
              value={quizQuestionCount}
              minimumValue={5}
              maximumValue={50}
              step={5}
              onValueChange={setQuizQuestionCount}
              formatValue={(v) => `${v} questions`}
            />
            <SettingsRow
              type="toggle"
              icon="timer-outline"
              iconColor="#F59E0B"
              label="Timer"
              subtitle="Enable countdown timer for questions"
              value={quizTimerEnabled}
              onValueChange={setQuizTimerEnabled}
            />
            <SettingsRow
              type="select"
              icon="albums-outline"
              iconColor="#10B981"
              label="Preferred Categories"
              subtitle="Focus your study sessions"
              value={
                preferredCategories.length === 0
                  ? 'All'
                  : `${preferredCategories.length} selected`
              }
              onPress={handleCategoriesPress}
              isLast
            />
          </SettingsSection>
          
          {/* Display */}
          <SettingsSection title="Display">
            <SettingsRow
              type="select"
              icon="moon-outline"
              iconColor="#6366F1"
              label="Appearance"
              value={DARK_MODE_OPTIONS[darkMode]}
              onPress={handleDarkModePress}
            />
            <SettingsRow
              type="select"
              icon="text-outline"
              iconColor="#8B5CF6"
              label="Text Size"
              value={TEXT_SIZE_OPTIONS[textSize]}
              onPress={handleTextSizePress}
            />
            <SettingsRow
              type="toggle"
              icon="phone-portrait-outline"
              iconColor="#EC4899"
              label="Haptic Feedback"
              subtitle="Vibration feedback on actions"
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              isLast
            />
          </SettingsSection>
          
          {/* About */}
          <SettingsSection title="About">
            <SettingsRow
              type="value"
              icon="information-circle-outline"
              iconColor="#6B7280"
              label="Version"
              value={`${appVersion} (${buildNumber})`}
            />
            <SettingsRow
              type="link"
              icon="shield-checkmark-outline"
              iconColor="#10B981"
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
            <SettingsRow
              type="link"
              icon="document-text-outline"
              iconColor="#3B82F6"
              label="Terms of Service"
              onPress={handleTermsOfService}
            />
            <SettingsRow
              type="link"
              icon="mail-outline"
              iconColor="#F59E0B"
              label="Contact Support"
              onPress={handleContactSupport}
            />
            <SettingsRow
              type="link"
              icon="star-outline"
              iconColor="#EF4444"
              label="Rate the App"
              onPress={handleRateApp}
              isLast
            />
          </SettingsSection>
          
          {/* Account */}
          <SettingsSection title="Account">
            <SettingsRow
              type="link"
              icon="key-outline"
              iconColor="#6366F1"
              label="Change Password"
              onPress={handleChangePassword}
            />
            <SettingsRow
              type="link"
              icon="refresh-outline"
              iconColor="#6B7280"
              label="Reset Settings"
              onPress={handleResetSettings}
            />
            <SettingsRow
              type="link"
              icon="trash-outline"
              iconColor="#EF4444"
              label="Delete Account"
              destructive
              onPress={handleDeleteAccount}
              isLast
            />
          </SettingsSection>
          
          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              SurgicalPrep © {new Date().getFullYear()}
            </Text>
            <Text style={styles.footerText}>
              Made with ❤️ for surgical professionals
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
