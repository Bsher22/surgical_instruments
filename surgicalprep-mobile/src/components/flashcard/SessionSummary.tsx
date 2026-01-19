// ============================================================================
// Stage 6C: SessionSummary Component
// ============================================================================

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withSequence,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { SessionResults, CardResult } from '../../types/flashcard';
import { triggerHaptic } from '../../utils/haptics';
import { colors, typography, spacing, shadows } from '../../utils/theme';

interface SessionSummaryProps {
  results: SessionResults;
  onRestart: () => void;
  onReviewMistakes: () => void;
  onGoHome: () => void;
}

// Format duration as mm:ss
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format response time as seconds
const formatResponseTime = (ms: number): string => {
  return `${(ms / 1000).toFixed(1)}s`;
};

// Get grade based on accuracy
const getGrade = (accuracy: number): { grade: string; color: string; message: string } => {
  if (accuracy >= 90) {
    return { grade: 'A', color: colors.success, message: 'Excellent!' };
  } else if (accuracy >= 80) {
    return { grade: 'B', color: colors.primary, message: 'Great job!' };
  } else if (accuracy >= 70) {
    return { grade: 'C', color: colors.warning, message: 'Good progress!' };
  } else if (accuracy >= 60) {
    return { grade: 'D', color: colors.warning, message: 'Keep practicing!' };
  } else {
    return { grade: 'F', color: colors.error, message: 'More study needed' };
  }
};

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  results,
  onRestart,
  onReviewMistakes,
  onGoHome,
}) => {
  const { grade, color: gradeColor, message } = getGrade(results.accuracy);
  const hasIncorrect = results.studyMoreCount > 0;
  
  // Animation values
  const gradeScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  
  // Animate on mount
  useEffect(() => {
    triggerHaptic('success');
    gradeScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    statsOpacity.value = withDelay(300, withSpring(1));
  }, [gradeScale, statsOpacity]);
  
  const gradeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gradeScale.value }],
  }));
  
  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <Text style={styles.title}>Session Complete!</Text>
        <Text style={styles.subtitle}>{message}</Text>
      </Animated.View>
      
      {/* Grade Circle */}
      <Animated.View style={[styles.gradeContainer, gradeAnimatedStyle]}>
        <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
          <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          <Text style={styles.accuracyText}>{Math.round(results.accuracy)}%</Text>
        </View>
      </Animated.View>
      
      {/* Stats Grid */}
      <Animated.View style={[styles.statsGrid, statsAnimatedStyle]}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{results.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {results.gotItCount}
          </Text>
          <Text style={styles.statLabel}>Got It</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {results.studyMoreCount}
          </Text>
          <Text style={styles.statLabel}>Study More</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(results.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </Animated.View>
      
      {/* Response Time Stats */}
      <Animated.View
        entering={SlideInUp.delay(400)}
        style={styles.responseTimeCard}
      >
        <Text style={styles.sectionTitle}>Response Times</Text>
        <View style={styles.responseTimeStats}>
          <View style={styles.responseTimeStat}>
            <Text style={styles.responseTimeValue}>
              {formatResponseTime(results.averageResponseTime)}
            </Text>
            <Text style={styles.responseTimeLabel}>Average</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.responseTimeStat}>
            <Text style={[styles.responseTimeValue, { color: colors.success }]}>
              {formatResponseTime(results.fastestResponse)}
            </Text>
            <Text style={styles.responseTimeLabel}>Fastest</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.responseTimeStat}>
            <Text style={[styles.responseTimeValue, { color: colors.warning }]}>
              {formatResponseTime(results.slowestResponse)}
            </Text>
            <Text style={styles.responseTimeLabel}>Slowest</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Incorrect Items (if any) */}
      {hasIncorrect && (
        <Animated.View
          entering={SlideInUp.delay(500)}
          style={styles.incorrectSection}
        >
          <Text style={styles.sectionTitle}>
            Items to Review ({results.studyMoreCount})
          </Text>
          <View style={styles.incorrectList}>
            {results.cardResults
              .filter((r) => !r.gotIt)
              .slice(0, 5)
              .map((result, index) => (
                <View key={index} style={styles.incorrectItem}>
                  <View style={styles.incorrectDot} />
                  <Text style={styles.incorrectText} numberOfLines={1}>
                    {result.instrumentName}
                  </Text>
                </View>
              ))}
            {results.studyMoreCount > 5 && (
              <Text style={styles.moreText}>
                +{results.studyMoreCount - 5} more items
              </Text>
            )}
          </View>
        </Animated.View>
      )}
      
      {/* Action Buttons */}
      <Animated.View
        entering={SlideInUp.delay(600)}
        style={styles.buttonContainer}
      >
        {/* Review Mistakes Button */}
        {hasIncorrect && (
          <Pressable
            style={[styles.button, styles.reviewButton]}
            onPress={() => {
              triggerHaptic('light');
              onReviewMistakes();
            }}
          >
            <Text style={styles.reviewButtonText}>Review Mistakes</Text>
          </Pressable>
        )}
        
        {/* Restart Button */}
        <Pressable
          style={[styles.button, styles.restartButton]}
          onPress={() => {
            triggerHaptic('light');
            onRestart();
          }}
        >
          <Text style={styles.restartButtonText}>Study Again</Text>
        </Pressable>
        
        {/* Home Button */}
        <Pressable
          style={[styles.button, styles.homeButton]}
          onPress={() => {
            triggerHaptic('light');
            onGoHome();
          }}
        >
          <Text style={styles.homeButtonText}>Back to Quiz Home</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  gradeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  gradeText: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  accuracyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  responseTimeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  responseTimeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  responseTimeStat: {
    alignItems: 'center',
    flex: 1,
  },
  responseTimeValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  responseTimeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  incorrectSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  incorrectList: {
    gap: spacing.sm,
  },
  incorrectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  incorrectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  incorrectText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  moreText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: colors.error,
  },
  reviewButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  restartButton: {
    backgroundColor: colors.primary,
  },
  restartButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  homeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

export default SessionSummary;
