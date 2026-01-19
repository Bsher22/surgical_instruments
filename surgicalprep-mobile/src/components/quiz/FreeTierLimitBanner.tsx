// ============================================================================
// Free Tier Limit Banner Component
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { QuizLimit } from '../../types/quiz';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface FreeTierLimitBannerProps {
  quizLimit: QuizLimit | null;
  onUpgradePress: () => void;
  isLoading?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatResetTime(resetAt: string): string {
  try {
    const resetDate = new Date(resetAt);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'soon';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return 'soon';
  }
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface LimitProgressBarProps {
  used: number;
  total: number;
}

function LimitProgressBar({ used, total }: LimitProgressBarProps) {
  const percentage = Math.min((used / total) * 100, 100);
  const isNearLimit = used >= total - 1;
  const isAtLimit = used >= total;

  const fillColor = isAtLimit 
    ? colors.error 
    : isNearLimit 
    ? colors.warning 
    : colors.primary;

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressUsed}>{used} used</Text>
        <Text style={styles.progressTotal}>{total - used} remaining</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Free Tier Limit Banner Component
// ============================================================================

export function FreeTierLimitBanner({
  quizLimit,
  onUpgradePress,
  isLoading = false,
}: FreeTierLimitBannerProps) {
  // Don't show for premium users
  if (quizLimit?.isPremium) {
    return null;
  }

  // Don't show if loading or no data
  if (isLoading || !quizLimit) {
    return null;
  }

  const handleUpgradePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgradePress();
  };

  const isAtLimit = quizLimit.quizzesUsedToday >= quizLimit.dailyLimit;
  const isNearLimit = quizLimit.remainingToday <= 1 && !isAtLimit;

  // At limit - show prominent banner
  if (isAtLimit) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[`${colors.error}15`, `${colors.error}08`]}
          style={styles.limitReachedBanner}
        >
          <View style={styles.limitReachedContent}>
            <View style={styles.limitReachedIcon}>
              <Ionicons name="lock-closed" size={24} color={colors.error} />
            </View>
            <View style={styles.limitReachedText}>
              <Text style={styles.limitReachedTitle}>Daily Limit Reached</Text>
              <Text style={styles.limitReachedSubtext}>
                Resets in {formatResetTime(quizLimit.resetsAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium for unlimited quizzes"
          >
            <Ionicons name="star" size={18} color={colors.white} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>

          <View style={styles.benefitsList}>
            <BenefitItem text="Unlimited daily quizzes" />
            <BenefitItem text="Unlimited preference cards" />
            <BenefitItem text="Full instrument details" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Near limit - show warning
  if (isNearLimit) {
    return (
      <View style={styles.container}>
        <View style={styles.warningBanner}>
          <View style={styles.warningContent}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              {quizLimit.remainingToday === 1
                ? '1 quiz remaining today'
                : `${quizLimit.remainingToday} quizzes remaining today`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleUpgradePress}
            accessibilityRole="button"
          >
            <Text style={styles.upgradeLink}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Normal state - show subtle progress
  return (
    <View style={styles.container}>
      <View style={styles.normalBanner}>
        <View style={styles.normalHeader}>
          <View style={styles.normalTitleRow}>
            <Ionicons name="school-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.normalTitle}>Free Plan</Text>
          </View>
          <TouchableOpacity
            onPress={handleUpgradePress}
            accessibilityRole="button"
          >
            <Text style={styles.upgradeLink}>Upgrade</Text>
          </TouchableOpacity>
        </View>
        <LimitProgressBar
          used={quizLimit.quizzesUsedToday}
          total={quizLimit.dailyLimit}
        />
      </View>
    </View>
  );
}

// ============================================================================
// Benefit Item Component
// ============================================================================

interface BenefitItemProps {
  text: string;
}

function BenefitItem({ text }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  // Normal Banner
  normalBanner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  normalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  normalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  normalTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },

  // Progress Bar
  progressBarContainer: {
    gap: spacing.xs,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressUsed: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  progressTotal: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.warning,
  },

  // Limit Reached Banner
  limitReachedBanner: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  limitReachedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  limitReachedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  limitReachedText: {
    flex: 1,
  },
  limitReachedTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
  limitReachedSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Upgrade Button
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },

  // Benefits List
  benefitsList: {
    gap: spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  benefitText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Upgrade Link
  upgradeLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});

export default FreeTierLimitBanner;
