// ============================================================================
// Quiz Results Screen (Placeholder - Full implementation in Stage 6D)
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useQuizResults } from '../../../src/hooks/useQuiz';
import { colors, spacing, typography, borderRadius } from '../../../src/utils/theme';

/**
 * Quiz Results Screen
 * 
 * This is a placeholder screen. Full implementation will include:
 * - Score display with animation
 * - Category breakdown
 * - Review mistakes option
 * - XP and streak updates
 * - Share results
 * 
 * See Stage 6D for full implementation details.
 */
export default function QuizResultsScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const { data: results, isLoading } = useQuizResults(sessionId || '', !!sessionId);

  // Mock data for placeholder
  const mockScore = 80;
  const mockCorrect = 8;
  const mockTotal = 10;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{results?.score ?? mockScore}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>
          <Text style={styles.scoreDetails}>
            {results?.correctAnswers ?? mockCorrect} of {results?.totalQuestions ?? mockTotal} correct
          </Text>
        </View>

        {/* Performance Badge */}
        <View style={styles.badgeSection}>
          <View style={[styles.badge, { backgroundColor: `${colors.success}15` }]}>
            <Ionicons name="trophy" size={24} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.success }]}>
              Great Job!
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={colors.info} />
            <Text style={styles.statValue}>2:45</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color={colors.warning} />
            <Text style={styles.statValue}>+50 XP</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>

        {/* Placeholder Notice */}
        <View style={styles.placeholderCard}>
          <Ionicons name="construct-outline" size={32} color={colors.textTertiary} />
          <Text style={styles.placeholderTitle}>Full Results Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Session ID: {sessionId || 'N/A'}
          </Text>
          <Text style={styles.placeholderFeatures}>
            Full implementation in Stage 6D will include:{'\n'}
            • Category score breakdown{'\n'}
            • Review mistakes feature{'\n'}
            • Streak updates{'\n'}
            • Share results
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => {/* TODO: Navigate to review mistakes */}}
        >
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.reviewButtonText}>Review Mistakes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.replace('/quiz')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Score Section
  scoreSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  scoreLabel: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreDetails: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Badge Section
  badgeSection: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  badgeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Placeholder
  placeholderCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  placeholderText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontFamily: 'monospace',
  },
  placeholderFeatures: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Actions
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  reviewButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
