// src/components/MedicalDisclaimer.tsx
// Medical disclaimer component for in-app display

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const DISCLAIMER_ACCEPTED_KEY = '@surgicalprep/disclaimer_accepted';
const DISCLAIMER_VERSION = '1.0'; // Increment to re-show after updates

interface MedicalDisclaimerProps {
  /** Whether the disclaimer is required (blocks app usage until accepted) */
  required?: boolean;
  /** Callback when disclaimer is accepted */
  onAccept?: () => void;
  /** Callback when disclaimer is dismissed (only for non-required) */
  onDismiss?: () => void;
}

/**
 * Medical Disclaimer Modal
 * Shows on first app launch and can be triggered from settings
 */
export const MedicalDisclaimerModal: React.FC<MedicalDisclaimerProps> = ({
  required = false,
  onAccept,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  const handleAccept = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        DISCLAIMER_ACCEPTED_KEY,
        JSON.stringify({
          accepted: true,
          version: DISCLAIMER_VERSION,
          timestamp: new Date().toISOString(),
        })
      );
      setVisible(false);
      onAccept?.();
    } catch (error) {
      console.error('Failed to save disclaimer acceptance:', error);
    }
  }, [onAccept]);

  const handleDismiss = useCallback(() => {
    if (!required) {
      setVisible(false);
      onDismiss?.();
    }
  }, [required, onDismiss]);

  const openFullDisclaimer = useCallback(() => {
    // Replace with your actual URL
    Linking.openURL('https://surgicalprep.app/disclaimer');
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="warning" size={32} color="#dc3545" />
            <Text style={styles.headerTitle}>Important Medical Disclaimer</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>SurgicalPrep is designed for educational purposes only.</Text>
            </Text>

            <Text style={styles.paragraph}>
              This application is not intended to replace:
            </Text>

            <View style={styles.bulletList}>
              <BulletPoint text="Professional medical training and accredited educational programs" />
              <BulletPoint text="Your facility's policies, procedures, and institutional protocols" />
              <BulletPoint text="Manufacturer instructions for use (IFU) for instruments and equipment" />
              <BulletPoint text="Direct supervision by qualified surgical professionals" />
              <BulletPoint text="Clinical judgment of licensed healthcare providers" />
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={20} color="#dc3545" />
              <Text style={styles.warningText}>
                Always follow your facility's policies and procedures. The information 
                in this app should not be used as the sole basis for clinical decision-making.
              </Text>
            </View>

            <Text style={styles.paragraph}>
              By using this app, you acknowledge that:
            </Text>

            <View style={styles.bulletList}>
              <BulletPoint text="You understand this app is for educational purposes only" />
              <BulletPoint text="You will verify information with authoritative sources before clinical application" />
              <BulletPoint text="You will consult with supervisors and qualified professionals when needed" />
              <BulletPoint text="You accept responsibility for how you apply the information" />
            </View>

            <TouchableOpacity 
              onPress={openFullDisclaimer}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Read Full Medical Disclaimer</Text>
              <Ionicons name="open-outline" size={16} color="#0A5C6B" />
            </TouchableOpacity>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {!required && (
              <TouchableOpacity 
                style={styles.dismissButton}
                onPress={handleDismiss}
              >
                <Text style={styles.dismissButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>
                I Understand and Accept
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Bullet point component
 */
const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.bulletItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/**
 * Check if disclaimer has been accepted
 */
export const checkDisclaimerAccepted = async (): Promise<boolean> => {
  try {
    const stored = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
    if (!stored) return false;

    const data = JSON.parse(stored);
    // Check if the current version has been accepted
    return data.accepted && data.version === DISCLAIMER_VERSION;
  } catch (error) {
    console.error('Failed to check disclaimer status:', error);
    return false;
  }
};

/**
 * Reset disclaimer acceptance (useful for testing or re-prompting)
 */
export const resetDisclaimerAcceptance = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DISCLAIMER_ACCEPTED_KEY);
  } catch (error) {
    console.error('Failed to reset disclaimer acceptance:', error);
  }
};

/**
 * Compact disclaimer banner for settings/about screen
 */
export const DisclaimerBanner: React.FC<{ onPress?: () => void }> = ({ 
  onPress 
}) => (
  <TouchableOpacity 
    style={styles.banner}
    onPress={onPress}
  >
    <View style={styles.bannerContent}>
      <Ionicons name="information-circle" size={24} color="#0A5C6B" />
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>Educational Use Only</Text>
        <Text style={styles.bannerSubtitle}>
          Tap to view medical disclaimer
        </Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '85%',
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc3545',
    marginLeft: 12,
    flex: 1,
  },
  scrollView: {
    padding: 20,
    maxHeight: 400,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#721c24',
    flex: 1,
    marginLeft: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#0A5C6B',
    fontWeight: '600',
    marginRight: 6,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0A5C6B',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Banner Styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F4F6',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A5C6B',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default MedicalDisclaimerModal;
