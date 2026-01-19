// ============================================================================
// Stats Dashboard Component
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StudyStats } from '../../types/quiz';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface StatsDashboardProps {
  stats: StudyStats | null;
  isLoading: boolean;
  error?: Error | null;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  backgroundColor?: string;
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  backgroundColor = colors.surface,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ============================================================================
// Progress Ring Component
// ============================================================================

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = colors.primary,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.progressRingBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
      {/* Progress Text */}
      <View style={styles.progressRingTextContainer}>
        <Text style={styles.progressRingValue}>{Math.round(progress)}%</Text>
        <Text style={styles.progressRingLabel}>Avg Score</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Stats Dashboard Component
// ============================================================================

export function StatsDashboard({ stats, isLoading, error }: StatsDashboardProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Unable to load stats</Text>
        <Text style={styles.errorSubtext}>Pull down to refresh</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="school-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Start Your Study Journey</Text>
        <Text style={styles.emptySubtext}>
          Complete your first quiz to see your progress here
        </Text>
      </View>
    );
  }

  const studyProgress = stats.totalInstruments > 0
    ? Math.round((stats.instrumentsStudied / stats.totalInstruments) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header Section with Progress Ring */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>
            {stats.instrumentsStudied} of {stats.totalInstruments} instruments studied
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${studyProgress}%` },
              ]}
            />
          </View>
        </View>
        <ProgressRing progress={stats.averageScore} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="flame"
          iconColor={colors.warning}
          label="Day Streak"
          value={stats.studyStreak}
          subtitle={stats.studyStreak === 1 ? 'day' : 'days'}
        />
        <StatCard
          icon="time-outline"
          iconColor={colors.info}
          label="Due for Review"
          value={stats.dueForReviewCount}
          subtitle={stats.dueForReviewCount === 1 ? 'instrument' : 'instruments'}
        />
        <StatCard
          icon="checkmark-circle-outline"
          iconColor={colors.success}
          label="Quizzes Taken"
          value={stats.totalQuizzesTaken}
          subtitle="total"
        />
        <StatCard
          icon="trending-up-outline"
          iconColor={colors.primary}
          label="Accuracy"
          value={
            stats.totalQuestionsAnswered > 0
              ? `${Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)}%`
              : 'N/A'
          }
          subtitle={`${stats.totalCorrectAnswers}/${stats.totalQuestionsAnswered}`}
        />
      </View>

      {/* Motivation Message */}
      {stats.studyStreak > 0 && (
        <View style={styles.motivationCard}>
          <Ionicons name="star" size={24} color={colors.warning} />
          <Text style={styles.motivationText}>
            {getMotivationMessage(stats.studyStreak, stats.averageScore)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getMotivationMessage(streak: number, score: number): string {
  if (streak >= 30) {
    return `Incredible! ${streak} days straight! You're a studying champion! 🏆`;
  }
  if (streak >= 14) {
    return `Amazing! ${streak} day streak! Keep that momentum going! 🔥`;
  }
  if (streak >= 7) {
    return `Great work! A full week of studying! You're on fire! 💪`;
  }
  if (streak >= 3) {
    return `Nice! ${streak} days in a row! Building great habits! ⭐`;
  }
  if (score >= 90) {
    return "Outstanding scores! You're mastering this material! 🌟";
  }
  if (score >= 80) {
    return "Great performance! Keep reviewing to reinforce learning! 📚";
  }
  return "Keep going! Every study session builds your knowledge! 💡";
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },

  // Loading State
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Error State
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
  errorSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Empty State
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Header Section
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...elevationShadow(2),
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  // Progress Ring
  progressRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
    borderColor: colors.border,
  },
  progressRingTextContainer: {
    alignItems: 'center',
  },
  progressRingValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  progressRingLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  // Stat Card
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...elevationShadow(1),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },

  // Motivation Card
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  motivationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
});

// ============================================================================
// Shadow Helper
// ============================================================================

function elevationShadow(elevation: number) {
  return {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.1 + elevation * 0.03,
    shadowRadius: elevation * 2,
    elevation,
  };
}

export default StatsDashboard;
