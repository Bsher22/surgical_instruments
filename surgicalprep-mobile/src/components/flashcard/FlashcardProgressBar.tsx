// ============================================================================
// Stage 6C: FlashcardProgressBar Component
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../utils/theme';

interface FlashcardProgressBarProps {
  current: number;
  total: number;
  gotItCount: number;
  studyMoreCount: number;
}

export const FlashcardProgressBar: React.FC<FlashcardProgressBarProps> = ({
  current,
  total,
  gotItCount,
  studyMoreCount,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const gotItPercentage = total > 0 ? (gotItCount / total) * 100 : 0;
  const studyMorePercentage = total > 0 ? (studyMoreCount / total) * 100 : 0;
  
  // Animated style for progress bar fill
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${percentage}%` as any, {
        damping: 20,
        stiffness: 150,
      }),
    };
  });
  
  // Animated style for "Got it" portion
  const gotItAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${gotItPercentage}%` as any, {
        damping: 20,
        stiffness: 150,
      }),
    };
  });
  
  // Animated style for "Study more" portion
  const studyMoreAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${studyMorePercentage}%` as any, {
        damping: 20,
        stiffness: 150,
      }),
    };
  });
  
  return (
    <View style={styles.container}>
      {/* Progress Text */}
      <View style={styles.header}>
        <Text style={styles.progressText}>
          {current} / {total}
        </Text>
        <Text style={styles.percentageText}>
          {Math.round(percentage)}%
        </Text>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          {/* Got it (green) */}
          <Animated.View
            style={[styles.progressFill, styles.gotItFill, gotItAnimatedStyle]}
          />
          {/* Study more (red) */}
          <Animated.View
            style={[styles.progressFill, styles.studyMoreFill, studyMoreAnimatedStyle]}
          />
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <View style={[styles.statDot, styles.gotItDot]} />
          <Text style={styles.statText}>Got it: {gotItCount}</Text>
        </View>
        <View style={styles.stat}>
          <View style={[styles.statDot, styles.studyMoreDot]} />
          <Text style={styles.statText}>Study more: {studyMoreCount}</Text>
        </View>
      </View>
    </View>
  );
};

// Compact version for overlay display
export const CompactProgressBar: React.FC<{
  current: number;
  total: number;
}> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <View style={compactStyles.container}>
      <View style={compactStyles.progressBar}>
        <View style={[compactStyles.fill, { width: `${percentage}%` }]} />
      </View>
      <Text style={compactStyles.text}>
        {current} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  percentageText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  gotItFill: {
    backgroundColor: colors.success,
  },
  studyMoreFill: {
    backgroundColor: colors.error,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gotItDot: {
    backgroundColor: colors.success,
  },
  studyMoreDot: {
    backgroundColor: colors.error,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
});

export default FlashcardProgressBar;
