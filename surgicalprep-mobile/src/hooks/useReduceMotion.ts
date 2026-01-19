// src/hooks/useReduceMotion.ts
// Hook for respecting user's reduce motion preference

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook that returns whether reduce motion is enabled
 * Use this to conditionally disable animations
 */
export const useReduceMotion = (): boolean => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reduceMotionEnabled;
};

/**
 * Get animation duration based on reduce motion preference
 * Returns 0 if reduce motion is enabled, otherwise returns the provided duration
 */
export const useAnimationDuration = (duration: number): number => {
  const reduceMotion = useReduceMotion();
  return reduceMotion ? 0 : duration;
};

/**
 * Get animation config that respects reduce motion
 * Returns undefined (no animation) if reduce motion is enabled
 */
export const useAnimationConfig = <T extends object>(
  config: T
): T | undefined => {
  const reduceMotion = useReduceMotion();
  return reduceMotion ? undefined : config;
};

export default useReduceMotion;
