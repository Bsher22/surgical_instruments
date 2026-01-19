/**
 * Locked Overlay Component
 * Displays a lock overlay with upgrade CTA for premium content
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PremiumFeature } from '../../types/subscription';
import { FEATURE_MESSAGES } from '../../constants/subscription';

interface LockedOverlayProps {
  /** Feature being locked */
  feature: PremiumFeature;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Visual variant */
  variant?: 'overlay' | 'section' | 'inline';
  /** Whether to use compact styling */
  compact?: boolean;
  /** Custom onUpgrade handler */
  onUpgrade?: () => void;
}

export default function LockedOverlay({
  feature,
  title,
  message,
  variant = 'overlay',
  compact = false,
  onUpgrade,
}: LockedOverlayProps) {
  const router = useRouter();
  
  const featureInfo = FEATURE_MESSAGES[feature];
  const displayTitle = title || featureInfo?.title || 'Premium Feature';
  const displayMessage = message || featureInfo?.message || 'This feature requires Premium.';
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/(tabs)/profile/subscription');
    }
  };
  
  if (variant === 'inline') {
    return (
      <TouchableOpacity
        style={styles.inlineContainer}
        onPress={handleUpgrade}
        activeOpacity={0.7}
      >
        <Feather name="lock" size={14} color="#6366F1" />
        <Text style={styles.inlineText}>Premium</Text>
      </TouchableOpacity>
    );
  }
  
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactIconContainer}>
          <Feather name="lock" size={16} color="#6366F1" />
        </View>
        <Text style={styles.compactTitle}>{displayTitle}</Text>
        <TouchableOpacity
          style={styles.compactButton}
          onPress={handleUpgrade}
        >
          <Text style={styles.compactButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (variant === 'section') {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionIconContainer}>
          <Feather name="lock" size={24} color="#6366F1" />
        </View>
        <Text style={styles.sectionTitle}>{displayTitle}</Text>
        <Text style={styles.sectionMessage}>{displayMessage}</Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
        >
          <Feather name="zap" size={16} color="#FFFFFF" />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Default overlay variant
  return (
    <View style={styles.overlayContainer}>
      <BlurView intensity={20} style={styles.blur} tint="light" />
      <View style={styles.overlayContent}>
        <View style={styles.lockIconContainer}>
          <Feather name="lock" size={32} color="#6366F1" />
        </View>
        <Text style={styles.overlayTitle}>{displayTitle}</Text>
        <Text style={styles.overlayMessage}>{displayMessage}</Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
        >
          <Feather name="zap" size={18} color="#FFFFFF" />
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini Lock Badge (For list items)
// ─────────────────────────────────────────────────────────────────────────────

export function LockBadge() {
  return (
    <View style={styles.lockBadge}>
      <Feather name="lock" size={10} color="#6366F1" />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Overlay Variant
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: Dimensions.get('window').width - 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  overlayMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  // Section Variant
  sectionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  sectionMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  
  // Compact Variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  compactButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Inline Variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  
  // Shared
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Lock Badge
  lockBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
