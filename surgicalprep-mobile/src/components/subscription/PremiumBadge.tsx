/**
 * Premium Badge Component
 * Visual indicator for premium status
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useIsPremium } from '../../stores/subscriptionStore';

interface PremiumBadgeProps {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show upgrade CTA for free users */
  showUpgrade?: boolean;
  /** Custom onPress handler */
  onPress?: () => void;
}

export default function PremiumBadge({
  size = 'medium',
  showUpgrade = true,
  onPress,
}: PremiumBadgeProps) {
  const router = useRouter();
  const isPremium = useIsPremium();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!isPremium) {
      router.push('/(tabs)/profile/subscription');
    }
  };
  
  const sizeStyles = {
    small: {
      badge: styles.badgeSmall,
      icon: 12,
      text: styles.textSmall,
    },
    medium: {
      badge: styles.badgeMedium,
      icon: 14,
      text: styles.textMedium,
    },
    large: {
      badge: styles.badgeLarge,
      icon: 16,
      text: styles.textLarge,
    },
  };
  
  const currentSize = sizeStyles[size];
  
  if (isPremium) {
    return (
      <View style={[styles.premiumBadge, currentSize.badge]}>
        <Feather name="award" size={currentSize.icon} color="#6366F1" />
        <Text style={[styles.premiumText, currentSize.text]}>Premium</Text>
      </View>
    );
  }
  
  if (!showUpgrade) {
    return (
      <View style={[styles.freeBadge, currentSize.badge]}>
        <Text style={[styles.freeText, currentSize.text]}>Free</Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.upgradeBadge, currentSize.badge]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Feather name="zap" size={currentSize.icon} color="#F59E0B" />
      <Text style={[styles.upgradeText, currentSize.text]}>Upgrade</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier Badge Component (Alternative style)
// ─────────────────────────────────────────────────────────────────────────────

interface TierBadgeProps {
  tier: 'free' | 'premium';
  size?: 'small' | 'medium';
}

export function TierBadge({ tier, size = 'medium' }: TierBadgeProps) {
  const isPremium = tier === 'premium';
  
  return (
    <View
      style={[
        styles.tierBadge,
        isPremium ? styles.tierBadgePremium : styles.tierBadgeFree,
        size === 'small' && styles.tierBadgeSmall,
      ]}
    >
      {isPremium && (
        <Feather name="award" size={size === 'small' ? 10 : 12} color="#6366F1" />
      )}
      <Text
        style={[
          styles.tierBadgeText,
          isPremium ? styles.tierBadgeTextPremium : styles.tierBadgeTextFree,
          size === 'small' && styles.tierBadgeTextSmall,
        ]}
      >
        {isPremium ? 'Premium' : 'Free'}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Premium Badge
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    gap: 4,
  },
  premiumText: {
    fontWeight: '600',
    color: '#6366F1',
  },
  
  // Free Badge
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  freeText: {
    fontWeight: '500',
    color: '#6B7280',
  },
  
  // Upgrade Badge
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    gap: 4,
  },
  upgradeText: {
    fontWeight: '600',
    color: '#D97706',
  },
  
  // Size Variants
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  textSmall: {
    fontSize: 11,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textMedium: {
    fontSize: 12,
  },
  badgeLarge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  textLarge: {
    fontSize: 14,
  },
  
  // Tier Badge Styles
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  tierBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tierBadgePremium: {
    backgroundColor: '#EEF2FF',
  },
  tierBadgeFree: {
    backgroundColor: '#F3F4F6',
  },
  tierBadgeText: {
    fontWeight: '500',
  },
  tierBadgeTextSmall: {
    fontSize: 11,
  },
  tierBadgeTextPremium: {
    color: '#6366F1',
    fontSize: 12,
  },
  tierBadgeTextFree: {
    color: '#6B7280',
    fontSize: 12,
  },
});
