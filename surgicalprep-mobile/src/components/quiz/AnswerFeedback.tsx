// AnswerFeedback Component - Stage 6D
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  onContinue: () => void;
  isLastQuestion: boolean;
}

export function AnswerFeedback({
  isCorrect,
  explanation,
  correctAnswer,
  onContinue,
  isLastQuestion,
}: AnswerFeedbackProps) {
  const iconScale = useSharedValue(1);

  useEffect(() => {
    // Celebration animation for correct answers
    if (isCorrect) {
      iconScale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else {
      // Shake animation for incorrect
      iconScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [isCorrect, iconScale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify()}
      exiting={SlideOutDown.duration(200)}
      style={[
        styles.container,
        isCorrect ? styles.containerCorrect : styles.containerIncorrect,
      ]}
    >
      <View style={styles.header}>
        <Animated.View style={iconAnimatedStyle}>
          <View
            style={[
              styles.iconCircle,
              isCorrect ? styles.iconCorrect : styles.iconIncorrect,
            ]}
          >
            <Ionicons
              name={isCorrect ? 'checkmark' : 'close'}
              size={32}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isCorrect ? styles.titleCorrect : styles.titleIncorrect]}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </Text>
          {!isCorrect && correctAnswer && (
            <Text style={styles.correctAnswerText}>
              Correct answer: {correctAnswer}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.explanationContainer}>
        <Text style={styles.explanationLabel}>
          <Ionicons name="information-circle" size={14} color="#6B7280" /> Explanation
        </Text>
        <Text style={styles.explanationText}>{explanation}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          isCorrect ? styles.continueButtonCorrect : styles.continueButtonIncorrect,
          pressed && styles.continueButtonPressed,
        ]}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel={isLastQuestion ? 'See Results' : 'Continue to next question'}
      >
        <Text style={styles.continueButtonText}>
          {isLastQuestion ? 'See Results' : 'Continue'}
        </Text>
        <Ionicons
          name={isLastQuestion ? 'trophy' : 'arrow-forward'}
          size={20}
          color="#FFFFFF"
        />
      </Pressable>
    </Animated.View>
  );
}

// Overlay version that covers the whole screen
interface AnswerFeedbackOverlayProps extends AnswerFeedbackProps {
  visible: boolean;
}

export function AnswerFeedbackOverlay({
  visible,
  ...props
}: AnswerFeedbackOverlayProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.overlay}
    >
      <Pressable style={styles.overlayBackdrop} onPress={props.onContinue}>
        <View style={styles.overlayContent}>
          <AnswerFeedback {...props} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Inline version that shows below options
interface AnswerFeedbackInlineProps {
  isCorrect: boolean;
  explanation: string;
}

export function AnswerFeedbackInline({
  isCorrect,
  explanation,
}: AnswerFeedbackInlineProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.inlineContainer,
        isCorrect ? styles.inlineCorrect : styles.inlineIncorrect,
      ]}
    >
      <View style={styles.inlineHeader}>
        <Ionicons
          name={isCorrect ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={isCorrect ? '#059669' : '#DC2626'}
        />
        <Text
          style={[
            styles.inlineTitle,
            isCorrect ? styles.inlineTitleCorrect : styles.inlineTitleIncorrect,
          ]}
        >
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </Text>
      </View>
      <Text style={styles.inlineExplanation}>{explanation}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
  },
  containerCorrect: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  containerIncorrect: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconCorrect: {
    backgroundColor: '#10B981',
  },
  iconIncorrect: {
    backgroundColor: '#EF4444',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  titleCorrect: {
    color: '#059669',
  },
  titleIncorrect: {
    color: '#DC2626',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  explanationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonCorrect: {
    backgroundColor: '#10B981',
  },
  continueButtonIncorrect: {
    backgroundColor: '#3B82F6',
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayContent: {
    backgroundColor: 'transparent',
  },
  // Inline styles
  inlineContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  inlineCorrect: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  inlineIncorrect: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inlineTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  inlineTitleCorrect: {
    color: '#059669',
  },
  inlineTitleIncorrect: {
    color: '#DC2626',
  },
  inlineExplanation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
