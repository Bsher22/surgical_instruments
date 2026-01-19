// src/components/ui/LoadingSpinner.tsx
// Animated loading spinner component

import React from 'react';
import { View, StyleSheet, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export type SpinnerSize = 'small' | 'medium' | 'large';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const SIZE_MAP: Record<SpinnerSize, number> = {
  small: 16,
  medium: 24,
  large: 48,
};

const ACTIVITY_SIZE_MAP: Record<SpinnerSize, 'small' | 'large'> = {
  small: 'small',
  medium: 'small',
  large: 'large',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = theme.colors.primary,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator
        size={ACTIVITY_SIZE_MAP[size]}
        color={color}
        accessibilityLabel="Loading"
      />
    </View>
  );
};

// Full screen loading overlay
interface FullScreenLoaderProps {
  visible: boolean;
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  visible,
  message,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.loaderBox}>
        <LoadingSpinner size="large" />
        {message && (
          <Animated.Text style={styles.message}>{message}</Animated.Text>
        )}
      </View>
    </View>
  );
};

// Inline button loading spinner
export const ButtonSpinner: React.FC<{ color?: string }> = ({
  color = theme.colors.white,
}) => {
  return <LoadingSpinner size="small" color={color} />;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.modal,
  },
  loaderBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default LoadingSpinner;
