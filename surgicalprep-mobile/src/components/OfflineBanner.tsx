// src/components/OfflineBanner.tsx
// Persistent banner displayed when device is offline (web-compatible)

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
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
  const [slideAnim] = useState(new Animated.Value(-100));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Trigger haptic when going offline (only on native)
  useEffect(() => {
    if (isOffline && Platform.OS !== 'web') {
      triggerHaptic('warning');
    }
  }, [isOffline]);

  // Slide animation when offline status changes
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOffline ? 0 : -100,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  // Pulse animation for the icon
  useEffect(() => {
    if (isOffline) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      };

      const interval = setInterval(pulse, 3000);
      return () => clearInterval(interval);
    }
  }, [isOffline, pulseAnim]);

  const handleRetry = async () => {
    if (Platform.OS !== 'web') {
      triggerHaptic('light');
    }
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
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top : theme.spacing.sm,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
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
