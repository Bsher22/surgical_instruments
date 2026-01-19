// ============================================================================
// Quick Action Buttons Component
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { QuickAction } from '../../types/quiz';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface QuickActionButtonsProps {
  dueForReviewCount: number;
  onActionPress: (action: QuickAction) => void;
  isLoading?: boolean;
  loadingAction?: QuickAction | null;
  disabled?: boolean;
}

interface ActionButtonProps {
  action: QuickAction;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  badge?: number;
  badgeColor?: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
}

// ============================================================================
// Action Button Component
// ============================================================================

function ActionButton({
  action,
  icon,
  label,
  description,
  badge,
  badgeColor = colors.error,
  onPress,
  isLoading,
  disabled,
  variant = 'secondary',
}: ActionButtonProps) {
  const handlePress = async () => {
    if (disabled || isLoading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const buttonStyles = [
    styles.actionButton,
    variant === 'primary' && styles.actionButtonPrimary,
    variant === 'accent' && styles.actionButtonAccent,
    disabled && styles.actionButtonDisabled,
  ];

  const iconColor = variant === 'primary' 
    ? colors.white 
    : variant === 'accent'
    ? colors.warning
    : colors.primary;

  const textColor = variant === 'primary' ? colors.white : colors.text;
  const descColor = variant === 'primary' ? 'rgba(255,255,255,0.8)' : colors.textSecondary;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${description}`}
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      <View style={styles.actionIconContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Ionicons name={icon} size={28} color={iconColor} />
        )}
        {badge !== undefined && badge > 0 && !isLoading && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.actionDescription, { color: descColor }]}>
          {description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={variant === 'primary' ? 'rgba(255,255,255,0.6)' : colors.textTertiary}
      />
    </TouchableOpacity>
  );
}

// ============================================================================
// Quick Action Buttons Component
// ============================================================================

export function QuickActionButtons({
  dueForReviewCount,
  onActionPress,
  isLoading = false,
  loadingAction = null,
  disabled = false,
}: QuickActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Start</Text>

      {/* Review Due - Primary action if items are due */}
      <ActionButton
        action="review_due"
        icon="refresh"
        label="Review Due"
        description={
          dueForReviewCount > 0
            ? `${dueForReviewCount} instrument${dueForReviewCount === 1 ? '' : 's'} ready for review`
            : 'No instruments due for review'
        }
        badge={dueForReviewCount}
        badgeColor={colors.warning}
        onPress={() => onActionPress('review_due')}
        isLoading={loadingAction === 'review_due'}
        disabled={disabled || dueForReviewCount === 0}
        variant={dueForReviewCount > 0 ? 'primary' : 'secondary'}
      />

      {/* Quick 10 */}
      <ActionButton
        action="quick_10"
        icon="flash"
        label="Quick 10"
        description="10 random flashcards"
        onPress={() => onActionPress('quick_10')}
        isLoading={loadingAction === 'quick_10'}
        disabled={disabled || isLoading}
        variant="secondary"
      />

      {/* Full Quiz */}
      <ActionButton
        action="full_quiz"
        icon="clipboard"
        label="Full Quiz"
        description="Customizable quiz session"
        onPress={() => onActionPress('full_quiz')}
        isLoading={loadingAction === 'full_quiz'}
        disabled={disabled || isLoading}
        variant="accent"
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonAccent: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },

  // Icon Container
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },

  // Text Container
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  actionDescription: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
});

export default QuickActionButtons;
