// src/components/ui/ToastContainer.tsx
// Container component that renders all active toasts

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Layout } from 'react-native-reanimated';
import { useToastStore } from '../../stores/toastStore';
import { Toast } from './Toast';
import { theme } from '../../theme';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { top: insets.top + theme.spacing.sm },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View layout={Layout.springify()}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});

export default ToastContainer;
