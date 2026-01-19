// src/components/ui/SkeletonLoader.tsx
// Skeleton loading placeholders with shimmer animation

import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// Base skeleton component with shimmer
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = theme.borderRadius.sm,
  style,
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [shimmerValue]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerValue.value,
            [0, 1],
            [-SCREEN_WIDTH, SCREEN_WIDTH]
          ),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// Text line skeleton
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  lineHeight = 16,
  lastLineWidth = '60%',
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          style={index > 0 ? { marginTop: theme.spacing.sm } : undefined}
        />
      ))}
    </View>
  );
};

// Instrument card skeleton
export const SkeletonInstrumentCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  style,
}) => {
  return (
    <View style={[styles.instrumentCard, style]}>
      <Skeleton
        width={80}
        height={80}
        borderRadius={theme.borderRadius.md}
      />
      <View style={styles.instrumentCardContent}>
        <Skeleton width="70%" height={18} />
        <Skeleton
          width="40%"
          height={14}
          style={{ marginTop: theme.spacing.sm }}
        />
        <Skeleton
          width="90%"
          height={12}
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </View>
  );
};

// Preference card skeleton
export const SkeletonPreferenceCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  style,
}) => {
  return (
    <View style={[styles.preferenceCard, style]}>
      <Skeleton width="60%" height={20} />
      <Skeleton
        width="40%"
        height={14}
        style={{ marginTop: theme.spacing.sm }}
      />
      <View style={styles.preferenceCardMeta}>
        <Skeleton width={60} height={12} />
        <Skeleton width={80} height={12} />
      </View>
    </View>
  );
};

// List of skeleton items
interface SkeletonListProps {
  count?: number;
  itemComponent: React.FC<{ style?: StyleProp<ViewStyle> }>;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  itemComponent: ItemComponent,
  style,
  itemStyle,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <ItemComponent
          key={index}
          style={[
            index > 0 ? { marginTop: theme.spacing.md } : undefined,
            itemStyle,
          ]}
        />
      ))}
    </View>
  );
};

// Avatar skeleton
export const SkeletonAvatar: React.FC<{
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ size = 48, style }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

// Image skeleton with aspect ratio
export const SkeletonImage: React.FC<{
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ aspectRatio = 1, style }) => {
  return (
    <Skeleton
      width="100%"
      height={undefined}
      borderRadius={theme.borderRadius.md}
      style={[{ aspectRatio }, style]}
    />
  );
};

// Quiz card skeleton
export const SkeletonQuizCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  style,
}) => {
  return (
    <View style={[styles.quizCard, style]}>
      <View style={styles.quizCardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
          <Skeleton width="50%" height={16} />
          <Skeleton
            width="30%"
            height={12}
            style={{ marginTop: theme.spacing.xs }}
          />
        </View>
      </View>
      <Skeleton
        width="100%"
        height={100}
        borderRadius={theme.borderRadius.md}
        style={{ marginTop: theme.spacing.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.gray200,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH * 2,
  },
  instrumentCard: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  instrumentCardContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  preferenceCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  preferenceCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  quizCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  quizCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Skeleton;
