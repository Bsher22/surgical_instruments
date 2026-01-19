/**
 * HeaderButton Component
 * Icon button for use in navigation headers
 */
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../utils/theme';

interface HeaderButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  color?: string;
  size?: number;
}

export function HeaderButton({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
  color = colors.primary,
  size = 24,
}: HeaderButtonProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={icon}
        size={size}
        color={disabled ? colors.textTertiary : color}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
});
