// src/components/ui/KeyboardAvoidingWrapper.tsx
// Cross-platform keyboard avoiding view with best practices

import React, { ReactNode, useCallback, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInput,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface KeyboardAvoidingWrapperProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  enableScrollView?: boolean;
  dismissOnTap?: boolean;
  keyboardVerticalOffset?: number;
  bottomOffset?: number;
}

export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  contentContainerStyle,
  enableScrollView = true,
  dismissOnTap = true,
  keyboardVerticalOffset,
  bottomOffset = 0,
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate offset based on platform
  const offset = keyboardVerticalOffset ?? (Platform.OS === 'ios' ? 0 : 0);

  // Dismiss keyboard on tap outside
  const handleDismiss = useCallback(() => {
    if (dismissOnTap) {
      Keyboard.dismiss();
    }
  }, [dismissOnTap]);

  // Scroll to focused input
  const handleInputFocus = useCallback((event: { nativeEvent: { target: number } }) => {
    if (scrollViewRef.current && Platform.OS === 'ios') {
      // Small delay to ensure keyboard is open
      setTimeout(() => {
        const nodeHandle = findNodeHandle(event.nativeEvent.target as unknown as TextInput);
        if (nodeHandle) {
          scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
            nodeHandle,
            120, // Extra padding above input
            true
          );
        }
      }, 100);
    }
  }, []);

  const content = enableScrollView ? (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollViewContent,
        { paddingBottom: insets.bottom + bottomOffset },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + bottomOffset },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = dismissOnTap ? (
    <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  ) : (
    content
  );

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingView, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
    >
      {wrappedContent}
    </KeyboardAvoidingView>
  );
};

// Simple keyboard dismiss wrapper (no scroll)
export const KeyboardDismissView: React.FC<{
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

// Hook for keyboard visibility
import { useState, useEffect } from 'react';

export const useKeyboardVisible = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingWrapper;
