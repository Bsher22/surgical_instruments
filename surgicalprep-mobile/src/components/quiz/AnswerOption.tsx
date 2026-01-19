// AnswerOption Component - Stage 6D
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type AnswerState = 'default' | 'selected' | 'correct' | 'incorrect' | 'missed';

interface AnswerOptionProps {
  id: string;
  text: string;
  label: string; // A, B, C, D
  state: AnswerState;
  disabled: boolean;
  onPress: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerOption({
  id,
  text,
  label,
  state,
  disabled,
  onPress,
}: AnswerOptionProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    switch (state) {
      case 'correct':
        backgroundColor.value = withSpring(1);
        scale.value = withSequence(
          withSpring(1.02, { damping: 10 }),
          withSpring(1, { damping: 15 })
        );
        break;
      case 'incorrect':
        backgroundColor.value = withSpring(2);
        shake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        break;
      case 'missed':
        backgroundColor.value = withSpring(3);
        break;
      case 'selected':
        backgroundColor.value = withSpring(4);
        scale.value = withSpring(1.01);
        break;
      default:
        backgroundColor.value = withSpring(0);
        scale.value = withSpring(1);
    }
  }, [state, backgroundColor, scale, shake]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      backgroundColor.value,
      [0, 1, 2, 3, 4],
      ['#FFFFFF', '#DCFCE7', '#FEE2E2', '#FEF3C7', '#EBF5FF']
    );
    
    const borderColor = interpolateColor(
      backgroundColor.value,
      [0, 1, 2, 3, 4],
      ['#E5E7EB', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6']
    );

    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
      transform: [
        { scale: scale.value },
        { translateX: shake.value },
      ],
    };
  });

  const handlePress = () => {
    if (!disabled) {
      scale.value = withSequence(
        withSpring(0.98, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      onPress(id);
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'correct':
        return <Ionicons name="checkmark-circle" size={24} color="#22C55E" />;
      case 'incorrect':
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      case 'missed':
        return <Ionicons name="alert-circle" size={24} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getLabelStyle = () => {
    switch (state) {
      case 'correct':
        return styles.labelCorrect;
      case 'incorrect':
        return styles.labelIncorrect;
      case 'missed':
        return styles.labelMissed;
      case 'selected':
        return styles.labelSelected;
      default:
        return null;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, animatedContainerStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Answer option ${label}: ${text}`}
      accessibilityState={{ selected: state === 'selected', disabled }}
    >
      <View style={styles.content}>
        <View style={[styles.labelBadge, getLabelStyle()]}>
          <Text style={[styles.labelText, getLabelStyle() && styles.labelTextActive]}>
            {label}
          </Text>
        </View>
        <Text style={styles.answerText} numberOfLines={3}>
          {text}
        </Text>
      </View>
      <View style={styles.iconContainer}>{getIcon()}</View>
    </AnimatedPressable>
  );
}

// Helper component for rendering all answer options
interface AnswerOptionsListProps {
  options: Array<{ id: string; text: string }>;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  showFeedback: boolean;
  disabled: boolean;
  onSelectOption: (id: string) => void;
}

export function AnswerOptionsList({
  options,
  selectedOptionId,
  correctOptionId,
  showFeedback,
  disabled,
  onSelectOption,
}: AnswerOptionsListProps) {
  const labels = ['A', 'B', 'C', 'D'];

  const getOptionState = (optionId: string): AnswerState => {
    if (!showFeedback) {
      if (optionId === selectedOptionId) return 'selected';
      return 'default';
    }

    // Feedback mode
    if (optionId === correctOptionId) return 'correct';
    if (optionId === selectedOptionId && optionId !== correctOptionId) return 'incorrect';
    if (optionId === correctOptionId && selectedOptionId !== correctOptionId) return 'missed';
    return 'default';
  };

  return (
    <View style={styles.optionsList}>
      {options.map((option, index) => (
        <AnswerOption
          key={option.id}
          id={option.id}
          text={option.text}
          label={labels[index] || String(index + 1)}
          state={getOptionState(option.id)}
          disabled={disabled || showFeedback}
          onPress={onSelectOption}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    minHeight: 64,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelCorrect: {
    backgroundColor: '#22C55E',
  },
  labelIncorrect: {
    backgroundColor: '#EF4444',
  },
  labelMissed: {
    backgroundColor: '#F59E0B',
  },
  labelSelected: {
    backgroundColor: '#3B82F6',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  labelTextActive: {
    color: '#FFFFFF',
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    width: '100%',
  },
});
