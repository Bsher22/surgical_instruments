import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: number;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BookmarkButton({
  isBookmarked,
  onToggle,
  size = 24,
  style,
}: BookmarkButtonProps) {
  const scale = useSharedValue(1);
  const bookmarkProgress = useSharedValue(isBookmarked ? 1 : 0);

  React.useEffect(() => {
    bookmarkProgress.value = withSpring(isBookmarked ? 1 : 0);
  }, [isBookmarked]);

  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(
      isBookmarked
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );

    // Pop animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );

    onToggle();
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bookmarkProgress.value,
      [0, 1],
      ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 1)']
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      bookmarkProgress.value,
      [0, 1],
      ['#3B82F6', '#FFFFFF']
    );

    return {
      color,
    };
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.container,
        { width: size + 20, height: size + 20 },
        animatedContainerStyle,
        style,
      ]}
    >
      <Animated.Text style={animatedIconStyle}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
        />
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
