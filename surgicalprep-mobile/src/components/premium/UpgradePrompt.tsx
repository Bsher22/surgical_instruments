/**
 * Upgrade Prompt Component
 * Modal that appears when user tries to access premium features
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { FEATURE_MESSAGES, PRICING } from '../../constants/subscription';

export default function UpgradePrompt() {
  const router = useRouter();
  const {
    showUpgradePrompt,
    upgradePromptFeature,
    dismissUpgradePrompt,
  } = useSubscriptionStore();
  
  if (!showUpgradePrompt || !upgradePromptFeature) {
    return null;
  }
  
  const featureInfo = FEATURE_MESSAGES[upgradePromptFeature];
  
  const handleUpgrade = () => {
    dismissUpgradePrompt();
    router.push('/(tabs)/profile/subscription');
  };
  
  const handleDismiss = () => {
    dismissUpgradePrompt();
  };
  
  return (
    <Modal
      visible={showUpgradePrompt}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
          >
            <Feather name="x" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Feather name="zap" size={32} color="#6366F1" />
          </View>
          
          {/* Content */}
          <Text style={styles.title}>{featureInfo?.title || 'Upgrade to Premium'}</Text>
          <Text style={styles.message}>
            {featureInfo?.message || 'This feature requires a premium subscription.'}
          </Text>
          
          {/* Benefits Preview */}
          <View style={styles.benefitsContainer}>
            <BenefitRow icon="layers" text="Unlimited preference cards" />
            <BenefitRow icon="brain" text="Unlimited daily quizzes" />
            <BenefitRow icon="file-text" text="Full instrument details" />
          </View>
          
          {/* Pricing Preview */}
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingText}>
              Starting at just{' '}
              <Text style={styles.pricingHighlight}>
                ${PRICING.annual.perMonthPrice.toFixed(2)}/month
              </Text>
            </Text>
          </View>
          
          {/* Buttons */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeButtonText}>View Plans</Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleDismiss}
          >
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Benefit Row Sub-component
function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Feather name={icon as any} size={16} color="#10B981" />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Upgrade Nudge (For embedding in screens)
// ─────────────────────────────────────────────────────────────────────────────

interface UpgradeNudgeProps {
  message?: string;
  compact?: boolean;
  onUpgrade?: () => void;
}

export function UpgradeNudge({ message, compact = false, onUpgrade }: UpgradeNudgeProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/(tabs)/profile/subscription');
    }
  };
  
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.nudgeCompact}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.nudgeCompactIcon}>
          <Feather name="zap" size={14} color="#F59E0B" />
        </View>
        <Text style={styles.nudgeCompactText}>
          {message || 'Upgrade for unlimited access'}
        </Text>
        <Feather name="chevron-right" size={16} color="#D97706" />
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={styles.nudgeContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.nudgeContent}>
        <View style={styles.nudgeIconContainer}>
          <Feather name="zap" size={20} color="#F59E0B" />
        </View>
        <View style={styles.nudgeTextContainer}>
          <Text style={styles.nudgeTitle}>Upgrade to Premium</Text>
          <Text style={styles.nudgeMessage}>
            {message || 'Get unlimited access to all features'}
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#D97706" />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage Limit Warning (Shows when approaching limits)
// ─────────────────────────────────────────────────────────────────────────────

interface UsageLimitWarningProps {
  current: number;
  limit: number;
  type: 'cards' | 'quizzes' | 'flashcards';
  onUpgrade?: () => void;
}

export function UsageLimitWarning({
  current,
  limit,
  type,
  onUpgrade,
}: UsageLimitWarningProps) {
  const router = useRouter();
  const remaining = limit - current;
  const percentUsed = (current / limit) * 100;
  
  // Don't show if not near limit
  if (percentUsed < 60) {
    return null;
  }
  
  const isAtLimit = remaining <= 0;
  const typeLabels = {
    cards: 'preference cards',
    quizzes: 'quizzes today',
    flashcards: 'flashcard sessions',
  };
  
  const handlePress = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/(tabs)/profile/subscription');
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.limitWarning,
        isAtLimit && styles.limitWarningCritical,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.limitWarningContent}>
        <Feather
          name={isAtLimit ? 'alert-circle' : 'alert-triangle'}
          size={18}
          color={isAtLimit ? '#DC2626' : '#F59E0B'}
        />
        <Text
          style={[
            styles.limitWarningText,
            isAtLimit && styles.limitWarningTextCritical,
          ]}
        >
          {isAtLimit
            ? `You've reached your limit of ${limit} ${typeLabels[type]}`
            : `${remaining} ${typeLabels[type]} remaining`}
        </Text>
      </View>
      <Text style={styles.limitWarningUpgrade}>Upgrade</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: width - 48,
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  // Benefits
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
  },
  
  // Pricing
  pricingContainer: {
    marginBottom: 20,
  },
  pricingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  pricingHighlight: {
    fontWeight: '700',
    color: '#6366F1',
  },
  
  // Buttons
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterButton: {
    paddingVertical: 8,
  },
  laterButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
  
  // Nudge
  nudgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
  },
  nudgeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nudgeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeTextContainer: {
    flex: 1,
  },
  nudgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  nudgeMessage: {
    fontSize: 13,
    color: '#B45309',
  },
  
  // Compact Nudge
  nudgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  nudgeCompactIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeCompactText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  
  // Limit Warning
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  limitWarningCritical: {
    backgroundColor: '#FEF2F2',
  },
  limitWarningContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  limitWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  limitWarningTextCritical: {
    color: '#991B1B',
  },
  limitWarningUpgrade: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
});
