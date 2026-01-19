import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PremiumLockOverlayProps {
  /** Message to display */
  message?: string;
  /** Whether to show the full overlay or just a badge */
  variant?: 'overlay' | 'badge' | 'inline';
  /** Custom styles */
  style?: ViewStyle;
  /** Callback when upgrade is pressed */
  onUpgradePress?: () => void;
}

export function PremiumLockOverlay({
  message = 'Upgrade to Premium to unlock full details',
  variant = 'overlay',
  style,
  onUpgradePress,
}: PremiumLockOverlayProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      router.push('/profile/subscription');
    }
  };

  if (variant === 'badge') {
    return (
      <View style={[styles.badge, style]}>
        <Ionicons name="lock-closed" size={12} color="#F59E0B" />
        <Text style={styles.badgeText}>Premium</Text>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <Pressable onPress={handleUpgrade} style={[styles.inlineContainer, style]}>
        <View style={styles.inlineIconContainer}>
          <Ionicons name="lock-closed" size={16} color="#F59E0B" />
        </View>
        <View style={styles.inlineContent}>
          <Text style={styles.inlineTitle}>Premium Content</Text>
          <Text style={styles.inlineMessage}>{message}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
      </Pressable>
    );
  }

  // Full overlay variant
  return (
    <View style={[styles.overlayContainer, style]}>
      <LinearGradient
        colors={['rgba(251,191,36,0.1)', 'rgba(251,191,36,0.05)']}
        style={styles.gradient}
      >
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={32} color="#F59E0B" />
        </View>
        
        <Text style={styles.overlayTitle}>Premium Feature</Text>
        <Text style={styles.overlayMessage}>{message}</Text>
        
        <Pressable
          onPress={handleUpgrade}
          style={({ pressed }) => [
            styles.upgradeButton,
            pressed && styles.upgradeButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgradeButtonGradient}
          >
            <Ionicons name="star" size={16} color="#FFF" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
            <Text style={styles.benefitText}>Full instrument details</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
            <Text style={styles.benefitText}>Unlimited preference cards</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
            <Text style={styles.benefitText}>Unlimited daily quizzes</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Badge variant
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },

  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  inlineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContent: {
    flex: 1,
  },
  inlineTitle: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineMessage: {
    color: '#B45309',
    fontSize: 12,
    marginTop: 2,
  },

  // Overlay variant
  overlayContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  overlayTitle: {
    color: '#92400E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  overlayMessage: {
    color: '#B45309',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  upgradeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    color: '#92400E',
    fontSize: 13,
  },
});
