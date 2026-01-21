import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: number;
  style?: ViewStyle;
}

// Web-compatible BookmarkButton that doesn't use reanimated
export function BookmarkButton({
  isBookmarked,
  onToggle,
  size = 24,
  style,
}: BookmarkButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = async () => {
    // Haptic feedback only on native
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(
        isBookmarked
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }

    // Simple press animation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    onToggle();
  };

  const backgroundColor = isBookmarked
    ? 'rgba(59, 130, 246, 1)'
    : 'rgba(59, 130, 246, 0.1)';

  const iconColor = isBookmarked ? '#FFFFFF' : '#3B82F6';

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: size + 20,
          height: size + 20,
          backgroundColor,
          transform: [{ scale: isPressed ? 1.2 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons
        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={iconColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
