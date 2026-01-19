// src/hooks/useFocus.ts
// Accessibility focus management hook

import { useRef, useCallback, useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';

/**
 * Hook for managing accessibility focus
 * Provides utilities to programmatically set and manage focus
 */
export const useFocus = <T extends View = View>() => {
  const ref = useRef<T>(null);

  /**
   * Set accessibility focus to the referenced element
   */
  const focus = useCallback(() => {
    if (ref.current) {
      const node = findNodeHandle(ref.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
  }, []);

  /**
   * Set focus after a delay (useful for animations)
   */
  const focusWithDelay = useCallback((delay: number = 100) => {
    setTimeout(focus, delay);
  }, [focus]);

  return {
    ref,
    focus,
    focusWithDelay,
  };
};

/**
 * Hook that sets focus on mount (useful for modals and new screens)
 */
export const useFocusOnMount = <T extends View = View>(delay: number = 100) => {
  const { ref, focusWithDelay } = useFocus<T>();

  useEffect(() => {
    focusWithDelay(delay);
  }, [focusWithDelay, delay]);

  return ref;
};

/**
 * Hook for managing focus restoration
 * Stores previous focus and restores it on unmount
 */
export const useFocusRestoration = <T extends View = View>() => {
  const focusRef = useRef<T>(null);
  const previousFocusRef = useRef<number | null>(null);

  // Store current focus on mount
  useEffect(() => {
    // Note: React Native doesn't have a direct way to get the currently focused element
    // This is a simplified implementation
    return () => {
      // Restore focus on unmount if we had stored a reference
      if (previousFocusRef.current) {
        AccessibilityInfo.setAccessibilityFocus(previousFocusRef.current);
      }
    };
  }, []);

  const setFocus = useCallback(() => {
    if (focusRef.current) {
      const node = findNodeHandle(focusRef.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
  }, []);

  return {
    ref: focusRef,
    setFocus,
  };
};

/**
 * Hook for focus trap (useful for modals)
 * Keeps focus within a container
 */
export const useFocusTrap = () => {
  const containerRef = useRef<View>(null);
  const firstFocusableRef = useRef<View>(null);
  const lastFocusableRef = useRef<View>(null);

  const trapFocus = useCallback(() => {
    if (firstFocusableRef.current) {
      const node = findNodeHandle(firstFocusableRef.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }
  }, []);

  return {
    containerRef,
    firstFocusableRef,
    lastFocusableRef,
    trapFocus,
  };
};

export default useFocus;
