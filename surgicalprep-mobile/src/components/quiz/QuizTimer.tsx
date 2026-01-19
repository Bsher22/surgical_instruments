// QuizTimer Component - Stage 6D
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface QuizTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  formattedTime: string;
  isRunning: boolean;
  isPaused: boolean;
  isWarning: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function QuizTimer({
  remainingSeconds,
  totalSeconds,
  formattedTime,
  isRunning,
  isPaused,
  isWarning,
  size = 'medium',
}: QuizTimerProps) {
  const warningProgress = useSharedValue(0);
  const circleProgress = useSharedValue(1);

  // Update warning animation
  useEffect(() => {
    warningProgress.value = withTiming(isWarning ? 1 : 0, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [isWarning, warningProgress]);

  // Update circle progress
  useEffect(() => {
    const percentage = remainingSeconds / totalSeconds;
    circleProgress.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [remainingSeconds, totalSeconds, circleProgress]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      warningProgress.value,
      [0, 1],
      ['#F3F4F6', '#FEE2E2']
    );
    return { backgroundColor };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      warningProgress.value,
      [0, 1],
      ['#1F2937', '#DC2626']
    );
    return { color };
  });

  const sizeStyles = {
    small: {
      container: { padding: 8, borderRadius: 8 },
      icon: 16,
      text: 14,
    },
    medium: {
      container: { padding: 12, borderRadius: 12 },
      icon: 20,
      text: 18,
    },
    large: {
      container: { padding: 16, borderRadius: 16 },
      icon: 24,
      text: 24,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <Animated.View
      style={[
        styles.container,
        currentSize.container,
        containerAnimatedStyle,
        isPaused && styles.paused,
      ]}
    >
      <Ionicons
        name={isPaused ? 'pause-circle' : 'time-outline'}
        size={currentSize.icon}
        color={isWarning ? '#DC2626' : '#6B7280'}
      />
      <Animated.Text
        style={[
          styles.timeText,
          { fontSize: currentSize.text },
          textAnimatedStyle,
        ]}
      >
        {formattedTime}
      </Animated.Text>
      {isWarning && (
        <View style={styles.warningBadge}>
          <Ionicons name="warning" size={12} color="#DC2626" />
        </View>
      )}
    </Animated.View>
  );
}

// Circular timer variant
interface CircularQuizTimerProps extends QuizTimerProps {
  radius?: number;
  strokeWidth?: number;
}

export function CircularQuizTimer({
  remainingSeconds,
  totalSeconds,
  formattedTime,
  isRunning,
  isPaused,
  isWarning,
  radius = 40,
  strokeWidth = 6,
}: CircularQuizTimerProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(remainingSeconds / totalSeconds, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [remainingSeconds, totalSeconds, progress]);

  const circumference = 2 * Math.PI * radius;

  const circleAnimatedStyle = useAnimatedStyle(() => {
    return {
      strokeDashoffset: circumference * (1 - progress.value),
    };
  });

  const getStrokeColor = () => {
    if (isPaused) return '#9CA3AF';
    if (isWarning) return '#DC2626';
    if (remainingSeconds / totalSeconds > 0.5) return '#10B981';
    if (remainingSeconds / totalSeconds > 0.25) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.circularContainer}>
      <View style={[styles.circularWrapper, { width: radius * 2 + strokeWidth, height: radius * 2 + strokeWidth }]}>
        {/* Background circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              borderWidth: strokeWidth,
            },
          ]}
        />
        {/* Progress circle (using View for simplicity - could use SVG for smoother animation) */}
        <View
          style={[
            styles.circleProgress,
            {
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: getStrokeColor(),
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
        {/* Center content */}
        <View style={styles.circularContent}>
          <Text
            style={[
              styles.circularTimeText,
              isWarning && styles.warningText,
            ]}
          >
            {formattedTime}
          </Text>
          {isPaused && (
            <Ionicons name="pause" size={12} color="#9CA3AF" />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  paused: {
    opacity: 0.7,
  },
  timeText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  warningBadge: {
    marginLeft: 4,
  },
  // Circular timer styles
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    borderColor: '#E5E7EB',
  },
  circleProgress: {
    position: 'absolute',
  },
  circularContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  warningText: {
    color: '#DC2626',
  },
});
