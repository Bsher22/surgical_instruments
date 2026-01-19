/**
 * BottomSheet Component
 * Reusable bottom sheet modal with gesture support
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | 'auto';
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  avoidKeyboard?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  height = 'auto',
  showHandle = true,
  closeOnBackdrop = true,
  avoidKeyboard = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // Calculate max height (80% of screen)
  const maxHeight = SCREEN_HEIGHT * 0.8;
  const sheetHeight = height === 'auto' ? undefined : Math.min(height, maxHeight);

  // Open/close animation
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 300,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 25,
        stiffness: 300,
      });
    }
  }, [visible]);

  // Handle close
  const handleClose = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [onClose]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Only allow dragging down
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      // If dragged more than 100px or velocity is high, close
      if (translateY.value > 100 || event.velocityY > 500) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 300,
        });
      }
    });

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.5,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const content = (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdrop ? handleClose : undefined}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              sheetHeight ? { height: sheetHeight } : undefined,
              { paddingBottom: insets.bottom },
            ]}
          >
            {/* Handle */}
            {showHandle && (
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});
