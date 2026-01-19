// src/components/OfflineBanner.tsx
// Persistent banner displayed when device is offline

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { theme } from '../theme';
import { triggerHaptic } from '../utils/haptics';

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const { isOffline, isInternetReachable, refresh } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);

  // Trigger haptic when going offline
  useEffect(() => {
    if (isOffline) {
      triggerHaptic('warning');
    }
  }, [isOffline]);

  // Pulse animation for the icon
  useEffect(() => {
    if (isOffline) {
      const interval = setInterval(() => {
        pulse.value = withSequence(
          withSpring(1.1, { damping: 8 }),
          withDelay(100, withSpring(1, { damping: 8 }))
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOffline, pulse]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleRetry = async () => {
    triggerHaptic('light');
    await refresh();
    onRetry?.();
  };

  if (!isOffline) {
    return null;
  }

  const message = isInternetReachable === false
    ? 'No internet connection'
    : 'You are offline';

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp.duration(200)}
      style={[
        styles.container,
        { paddingTop: insets.top > 0 ? insets.top : theme.spacing.sm },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={iconStyle}>
          <Ionicons
            name="cloud-offline-outline"
            size={20}
            color={theme.colors.white}
          />
        </Animated.View>
        
        <Text style={styles.message}>{message}</Text>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Ionicons
            name="refresh"
            size={18}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subMessage}>
        Some features may be unavailable
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  subMessage: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  retryButton: {
    padding: theme.spacing.xs,
  },
});

export default OfflineBanner;
