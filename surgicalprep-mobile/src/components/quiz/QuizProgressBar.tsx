// QuizProgressBar Component - Stage 6D
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface QuizProgressBarProps {
  current: number;
  total: number;
  percentage: number;
  showLabel?: boolean;
}

export function QuizProgressBar({
  current,
  total,
  percentage,
  showLabel = true,
}: QuizProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(percentage / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            Question {current} of {total}
          </Text>
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        </View>
      )}
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedStyle]} />
        </View>
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < current && styles.dotCompleted,
                i === current - 1 && styles.dotCurrent,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  trackContainer: {
    position: 'relative',
  },
  track: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dotCompleted: {
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  dotCurrent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 1,
  },
});
