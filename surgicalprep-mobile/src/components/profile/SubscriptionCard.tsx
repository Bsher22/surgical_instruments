// src/components/profile/SubscriptionCard.tsx
// Subscription status card showing tier, expiration, and upgrade CTA

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SubscriptionTier } from '../../types/user';
import {
  formatSubscriptionExpiry,
  FREE_TIER_LIMITS,
  PREMIUM_TIER_LIMITS,
} from '../../types/user';
import { useSettingsStore } from '../../stores/settingsStore';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  expiresAt?: string | null;
  cancelled?: boolean;
  onUpgradePress?: () => void;
  onManagePress?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  expiresAt,
  cancelled,
  onUpgradePress,
  onManagePress,
}) => {
  const hapticEnabled = useSettingsStore((state) => state.hapticFeedback);
  const isPremium = tier === 'premium';
  
  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isPremium) {
      onManagePress?.();
    } else {
      onUpgradePress?.();
    }
  };
  
  const gradientColors = isPremium
    ? ['#F59E0B', '#D97706'] // Amber gradient for premium
    : ['#6B7280', '#4B5563']; // Gray gradient for free
  
  const limits = isPremium ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Tier Badge */}
        <View style={styles.tierBadge}>
          <Ionicons
            name={isPremium ? 'star' : 'star-outline'}
            size={14}
            color="#FFF"
          />
          <Text style={styles.tierBadgeText}>
            {isPremium ? 'PREMIUM' : 'FREE'}
          </Text>
        </View>
        
        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.tierTitle}>
            {isPremium ? 'Premium Member' : 'Free Plan'}
          </Text>
          
          {isPremium ? (
            <View style={styles.expiryContainer}>
              <Text style={styles.expiryText}>
                {cancelled
                  ? 'Subscription cancelled'
                  : formatSubscriptionExpiry(expiresAt)}
              </Text>
              {cancelled && expiresAt && (
                <Text style={styles.expirySubtext}>
                  Access until {new Date(expiresAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.limitsContainer}>
              <LimitItem
                icon="albums-outline"
                label="Cards"
                value={`${limits.cards_limit} max`}
              />
              <LimitItem
                icon="help-circle-outline"
                label="Quizzes"
                value={`${limits.quizzes_per_day}/day`}
              />
              <LimitItem
                icon="layers-outline"
                label="Flashcards"
                value={`${limits.flashcards_per_day}/day`}
              />
            </View>
          )}
        </View>
        
        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isPremium && styles.actionButtonPremium,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.actionButtonText,
              isPremium && styles.actionButtonTextPremium,
            ]}
          >
            {isPremium
              ? cancelled
                ? 'Resubscribe'
                : 'Manage'
              : 'Upgrade to Premium'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isPremium ? '#D97706' : '#FFF'}
          />
        </TouchableOpacity>
        
        {/* Decorative Element */}
        <View style={styles.decorativeCircle} />
      </LinearGradient>
    </View>
  );
};

interface LimitItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const LimitItem: React.FC<LimitItemProps> = ({ icon, label, value }) => (
  <View style={styles.limitItem}>
    <Ionicons name={icon} size={14} color="rgba(255,255,255,0.8)" />
    <Text style={styles.limitLabel}>{label}:</Text>
    <Text style={styles.limitValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 16,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  expiryContainer: {
    gap: 2,
  },
  expiryText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  expirySubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  limitsContainer: {
    gap: 6,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  limitValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonPremium: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionButtonTextPremium: {
    color: '#FFF',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default SubscriptionCard;
