// app/(tabs)/profile/settings.tsx
// Settings screen example with legal links and analytics integration

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useAuthStore } from '@/stores/authStore';
import { analytics } from '@/services/analytics';
import {
  MedicalDisclaimerModal,
  DisclaimerBanner,
  resetDisclaimerAcceptance,
} from '@/components/MedicalDisclaimer';

// Legal URLs - replace with your actual URLs
const LEGAL_URLS = {
  privacy: 'https://surgicalprep.app/privacy',
  terms: 'https://surgicalprep.app/terms',
  disclaimer: 'https://surgicalprep.app/disclaimer',
  support: 'mailto:support@surgicalprep.app',
};

const SettingsScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // App version from config
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

  // Handle analytics toggle
  const handleAnalyticsToggle = useCallback(async (value: boolean) => {
    setAnalyticsEnabled(value);
    if (value) {
      await analytics.initialize();
    } else {
      await analytics.disable();
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  // Open URL handler
  const openURL = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
      Alert.alert('Error', 'Could not open link');
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Medical Disclaimer Banner */}
      <DisclaimerBanner onPress={() => setShowDisclaimer(true)} />

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <SettingRow
          icon="analytics"
          title="Analytics"
          subtitle="Help improve SurgicalPrep"
          right={
            <Switch
              value={analyticsEnabled}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ true: '#0A5C6B' }}
            />
          }
        />
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <SettingRow
          icon="document-text"
          title="Privacy Policy"
          onPress={() => openURL(LEGAL_URLS.privacy)}
          showChevron
        />

        <SettingRow
          icon="document"
          title="Terms of Service"
          onPress={() => openURL(LEGAL_URLS.terms)}
          showChevron
        />

        <SettingRow
          icon="medical"
          title="Medical Disclaimer"
          onPress={() => setShowDisclaimer(true)}
          showChevron
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <SettingRow
          icon="mail"
          title="Contact Support"
          subtitle="support@surgicalprep.app"
          onPress={() => openURL(LEGAL_URLS.support)}
          showChevron
        />

        <SettingRow
          icon="star"
          title="Rate SurgicalPrep"
          subtitle="Help us reach more surgical techs"
          onPress={() => {
            // Platform-specific store links
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/app/id[YOUR_APP_ID]',
              android: 'https://play.google.com/store/apps/details?id=com.yourname.surgicalprep',
            });
            if (storeUrl) openURL(storeUrl);
          }}
          showChevron
        />
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <SettingRow
          icon="log-out"
          title="Log Out"
          titleStyle={styles.logoutText}
          onPress={handleLogout}
        />
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SurgicalPrep v{appVersion} ({buildNumber})
        </Text>
        <Text style={styles.footerText}>
          © 2026 SurgicalPrep. All rights reserved.
        </Text>
        <Text style={styles.footerDisclaimer}>
          For educational purposes only.
        </Text>
      </View>

      {/* Medical Disclaimer Modal */}
      {showDisclaimer && (
        <MedicalDisclaimerModal
          required={false}
          onAccept={() => setShowDisclaimer(false)}
          onDismiss={() => setShowDisclaimer(false)}
        />
      )}
    </ScrollView>
  );
};

// Reusable setting row component
interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  titleStyle?: object;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  title,
  subtitle,
  titleStyle,
  onPress,
  right,
  showChevron,
}) => {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color="#0A5C6B" />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, titleStyle]}>{title}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        {right}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc3545',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerDisclaimer: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

// Need to import Platform
import { Platform } from 'react-native';

export default SettingsScreen;
