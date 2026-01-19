// src/components/ui/Toast.tsx
// Individual toast notification component

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Toast as ToastType } from '../../stores/toastStore';
import { theme } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

// Icon mapping for toast types
const TOAST_ICONS: Record<ToastType['type'], keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle',
};

// Color mapping for toast types
const TOAST_COLORS: Record<ToastType['type'], { bg: string; icon: string; text: string }> = {
  success: {
    bg: theme.colors.success + '15',
    icon: theme.colors.success,
    text: theme.colors.success,
  },
  error: {
    bg: theme.colors.error + '15',
    icon: theme.colors.error,
    text: theme.colors.error,
  },
  warning: {
    bg: theme.colors.warning + '15',
    icon: theme.colors.warning,
    text: theme.colors.warningDark,
  },
  info: {
    bg: theme.colors.info + '15',
    icon: theme.colors.info,
    text: theme.colors.info,
  },
};

const SWIPE_THRESHOLD = 50;

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const colors = TOAST_COLORS[toast.type];

  // Announce toast to screen readers
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      `${toast.type}: ${toast.title ? `${toast.title}. ` : ''}${toast.message}`
    );
  }, [toast]);

  // Handle haptic on show
  useEffect(() => {
    if (toast.type === 'success') {
      triggerHaptic('success');
    } else if (toast.type === 'error') {
      triggerHaptic('error');
    } else if (toast.type === 'warning') {
      triggerHaptic('warning');
    }
  }, [toast.type]);

  const handleDismiss = () => {
    triggerHaptic('light');
    onDismiss();
  };

  // Swipe-to-dismiss gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        opacity.value = 1 - Math.abs(event.translationY) / 100;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -SWIPE_THRESHOLD) {
        translateY.value = withTiming(-100, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInUp.springify().damping(15)}
        exiting={SlideOutUp.duration(200)}
        style={[styles.container, animatedStyle]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <View style={[styles.content, { backgroundColor: colors.bg }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={TOAST_ICONS[toast.type]}
              size={24}
              color={colors.icon}
            />
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            {toast.title && (
              <Text style={[styles.title, { color: colors.text }]}>
                {toast.title}
              </Text>
            )}
            <Text
              style={[styles.message, { color: theme.colors.textPrimary }]}
              numberOfLines={3}
            >
              {toast.message}
            </Text>
          </View>

          {/* Action button */}
          {toast.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                toast.action?.onPress();
                handleDismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                {toast.action.label}
              </Text>
            </TouchableOpacity>
          )}

          {/* Dismiss button */}
          {toast.dismissible && (
            <Pressable
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    backgroundColor: theme.colors.surface,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 2,
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  dismissButton: {
    padding: theme.spacing.xs,
  },
});

export default Toast;
