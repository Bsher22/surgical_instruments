// src/components/ui/Button.tsx
// Accessible button component with haptic feedback

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { haptics, HapticType } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticType?: HapticType;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// Variant styles
const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: {
    bg: theme.colors.primary,
    text: theme.colors.white,
  },
  secondary: {
    bg: theme.colors.gray100,
    text: theme.colors.textPrimary,
  },
  outline: {
    bg: 'transparent',
    text: theme.colors.primary,
    border: theme.colors.primary,
  },
  ghost: {
    bg: 'transparent',
    text: theme.colors.primary,
  },
  danger: {
    bg: theme.colors.error,
    text: theme.colors.white,
  },
};

// Size styles
const SIZE_STYLES: Record<ButtonSize, { padding: number; fontSize: number; iconSize: number }> = {
  sm: {
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    iconSize: 16,
  },
  md: {
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    iconSize: 20,
  },
  lg: {
    padding: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
    iconSize: 24,
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      haptics.buttonPress();
      onPress();
    }
  }, [isDisabled, onPress]);

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );
    }

    if (icon) {
      return (
        <Ionicons
          name={icon}
          size={sizeStyle.iconSize}
          color={isDisabled ? theme.colors.textDisabled : variantStyle.text}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? theme.colors.gray200 : variantStyle.bg,
          paddingVertical: sizeStyle.padding,
          paddingHorizontal: sizeStyle.padding * 1.5,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: isDisabled ? theme.colors.gray300 : variantStyle.border,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
    >
      <View style={styles.content}>
        {iconPosition === 'left' && renderIcon()}
        
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
              color: isDisabled ? theme.colors.textDisabled : variantStyle.text,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
        
        {iconPosition === 'right' && renderIcon()}
      </View>
    </TouchableOpacity>
  );
};

// Icon-only button variant
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  hapticType?: HapticType;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  color = theme.colors.textPrimary,
  backgroundColor = 'transparent',
  disabled = false,
  hapticType = 'light',
  accessibilityLabel,
  style,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      haptics.buttonPress();
      onPress();
    }
  }, [disabled, onPress]);

  const buttonSize = Math.max(size + 16, theme.touchTargets.minimum);

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
    >
      <Ionicons
        name={icon}
        size={size}
        color={disabled ? theme.colors.textDisabled : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.touchTargets.minimum,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: theme.typography.weights.semibold,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },
});

export default Button;
