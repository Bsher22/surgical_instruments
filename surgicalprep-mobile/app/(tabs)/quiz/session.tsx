// Quiz Session Screen - Stage 6D
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  Pressable,
  Text,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  QuizProgressBar,
  QuizTimer,
  QuizQuestionDisplay,
  AnswerOptionsList,
  AnswerFeedback,
  QuizResults,
} from '../../../src/components/quiz';
import { useMultipleChoiceQuiz } from '../../../src/hooks/useMultipleChoiceQuiz';
import { useQuizTimer } from '../../../src/hooks/useQuizTimer';
import { QuizQuestionType, QuizConfig, QuizDifficulty } from '../../../src/types/quiz';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';

// Default quiz configuration
const DEFAULT_CONFIG: QuizConfig = {
  questionCount: 10,
  questionTypes: [
    QuizQuestionType.IMAGE_TO_NAME,
    QuizQuestionType.NAME_TO_USE,
    QuizQuestionType.IMAGE_TO_CATEGORY,
  ],
  timerEnabled: true,
  timerSeconds: 30,
};

export default function QuizSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionCount?: string;
    categories?: string;
    timerEnabled?: string;
    timerSeconds?: string;
    difficulty?: string;
  }>();

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Build config from params
  const config: QuizConfig = {
    questionCount: params.questionCount ? parseInt(params.questionCount) : DEFAULT_CONFIG.questionCount,
    questionTypes: DEFAULT_CONFIG.questionTypes,
    categories: params.categories ? params.categories.split(',') : undefined,
    difficulty: params.difficulty as QuizDifficulty | undefined,
    timerEnabled: params.timerEnabled !== 'false',
    timerSeconds: params.timerSeconds ? parseInt(params.timerSeconds) : DEFAULT_CONFIG.timerSeconds,
  };

  const {
    session,
    currentQuestion,
    progress,
    isLastQuestion,
    isLoading,
    error,
    showFeedback,
    lastAnswer,
    result,
    startQuiz,
    selectAnswer,
    continueToNext,
    abandonQuiz,
    resetQuiz,
  } = useMultipleChoiceQuiz();

  // Handle time up - auto-submit no answer
  const handleTimeUp = useCallback(async () => {
    if (!showFeedback && currentQuestion) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Submit with empty answer when time runs out
      await selectAnswer('', 0);
    }
  }, [showFeedback, currentQuestion, selectAnswer]);

  const timer = useQuizTimer({
    onTimeUp: handleTimeUp,
    warningThreshold: 10,
    onWarning: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  // Start quiz on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startQuiz(config);
    }
  }, [hasStarted, startQuiz, config]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (session && !result) {
        handleExitPress();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [session, result]);

  // Reset selected option when moving to next question
  useEffect(() => {
    if (!showFeedback) {
      setSelectedOptionId(null);
    }
  }, [showFeedback, progress.current]);

  const handleExitPress = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            await abandonQuiz();
            router.back();
          },
        },
      ]
    );
  };

  const handleSelectOption = async (optionId: string) => {
    if (showFeedback || isLoading) return;
    
    setSelectedOptionId(optionId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await selectAnswer(optionId, 0); // Time spent is tracked internally
  };

  const handleContinue = () => {
    continueToNext();
  };

  const handleReviewMistakes = () => {
    if (result) {
      router.push({
        pathname: '/(tabs)/quiz/review',
        params: { sessionId: result.sessionId },
      });
    }
  };

  const handlePlayAgain = async () => {
    resetQuiz();
    setHasStarted(false);
    // Will restart on next render
  };

  const handleGoHome = () => {
    resetQuiz();
    router.replace('/(tabs)/quiz');
  };

  // Show results screen when quiz is complete
  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Quiz Results',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <QuizResults
          result={result}
          onReviewMistakes={handleReviewMistakes}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      </SafeAreaView>
    );
  }

  // Show loading state
  if (isLoading && !session) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Loading Quiz',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Preparing questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Error',
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </Pressable>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              resetQuiz();
              setHasStarted(false);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main quiz UI
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <Pressable onPress={handleExitPress} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          ),
          headerRight: () =>
            config.timerEnabled ? (
              <QuizTimer
                remainingSeconds={timer.remainingSeconds}
                totalSeconds={config.timerSeconds}
                formattedTime={timer.formattedTime}
                isRunning={timer.isRunning}
                isPaused={timer.isPaused}
                isWarning={timer.isWarning}
                size="small"
              />
            ) : null,
        }}
      />

      <View style={styles.content}>
        {/* Progress Bar */}
        <QuizProgressBar
          current={progress.current}
          total={progress.total}
          percentage={progress.percentage}
        />

        {/* Question Display */}
        {currentQuestion && (
          <Animated.View
            key={currentQuestion.id}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(100)}
            style={styles.questionContainer}
          >
            <QuizQuestionDisplay
              question={currentQuestion}
              questionNumber={progress.current}
            />
          </Animated.View>
        )}

        {/* Answer Options */}
        {currentQuestion && (
          <View style={styles.optionsContainer}>
            <AnswerOptionsList
              options={currentQuestion.options}
              selectedOptionId={selectedOptionId}
              correctOptionId={showFeedback ? lastAnswer?.correctOptionId || null : null}
              showFeedback={showFeedback}
              disabled={isLoading}
              onSelectOption={handleSelectOption}
            />
          </View>
        )}

        {/* Feedback Overlay */}
        {showFeedback && lastAnswer && currentQuestion && (
          <AnswerFeedback
            isCorrect={lastAnswer.isCorrect}
            explanation={lastAnswer.explanation}
            correctAnswer={
              currentQuestion.options.find((o) => o.id === lastAnswer.correctOptionId)?.text
            }
            onContinue={handleContinue}
            isLastQuestion={isLastQuestion}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
