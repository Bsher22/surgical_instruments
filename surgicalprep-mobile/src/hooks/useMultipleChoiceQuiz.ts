// useMultipleChoiceQuiz Hook - Stage 6D
import { useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMultipleChoiceQuizStore } from '../stores/multipleChoiceQuizStore';
import { getQuizHistory, getMissedQuestions } from '../api/quiz';
import type { QuizConfig, QuizSessionResult } from '../types/quiz';
import * as Haptics from 'expo-haptics';

interface UseMultipleChoiceQuizReturn {
  // State
  session: ReturnType<typeof useMultipleChoiceQuizStore>['session'];
  currentQuestion: ReturnType<ReturnType<typeof useMultipleChoiceQuizStore>['getCurrentQuestion']>;
  progress: ReturnType<ReturnType<typeof useMultipleChoiceQuizStore>['getProgress']>;
  score: ReturnType<ReturnType<typeof useMultipleChoiceQuizStore>['getScore']>;
  isLastQuestion: boolean;
  isLoading: boolean;
  error: string | null;
  showFeedback: boolean;
  lastAnswer: ReturnType<typeof useMultipleChoiceQuizStore>['lastAnswer'];
  result: QuizSessionResult | null;
  
  // Actions
  startQuiz: (config: QuizConfig) => Promise<void>;
  selectAnswer: (optionId: string) => Promise<void>;
  continueToNext: () => void;
  abandonQuiz: () => Promise<void>;
  resetQuiz: () => void;
  reviewMistakes: (sessionId: string) => void;
  
  // Quiz history
  quizHistory: QuizSessionResult[];
  isLoadingHistory: boolean;
}

export function useMultipleChoiceQuiz(): UseMultipleChoiceQuizReturn {
  const store = useMultipleChoiceQuizStore();
  const questionStartTimeRef = useRef<number>(Date.now());

  // Track when question started for timing
  const trackQuestionStart = useCallback(() => {
    questionStartTimeRef.current = Date.now();
  }, []);

  // Calculate time spent on current question
  const getTimeSpent = useCallback(() => {
    return Date.now() - questionStartTimeRef.current;
  }, []);

  // Start quiz with haptic feedback
  const startQuiz = useCallback(async (config: QuizConfig) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await store.startQuiz(config);
    trackQuestionStart();
  }, [store, trackQuestionStart]);

  // Select an answer with haptic feedback
  const selectAnswer = useCallback(async (optionId: string) => {
    const timeSpent = getTimeSpent();
    await store.answerQuestion(optionId, timeSpent);
    
    // Haptic feedback based on correctness
    if (store.lastAnswer?.isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [store, getTimeSpent]);

  // Continue to next question
  const continueToNext = useCallback(() => {
    store.nextQuestion();
    trackQuestionStart();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [store, trackQuestionStart]);

  // Abandon quiz
  const abandonQuiz = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await store.endQuiz(true);
  }, [store]);

  // Review mistakes - redirect to a review session
  const reviewMistakes = useCallback(async (sessionId: string) => {
    // This would typically navigate to a review screen
    // For now, we'll fetch the missed questions
    const { questions } = await getMissedQuestions(sessionId);
    // You could start a new review session with these questions
    console.log('Missed questions for review:', questions);
  }, []);

  // Fetch quiz history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['quizHistory', 'multiple_choice'],
    queryFn: () => getQuizHistory({ quizType: 'multiple_choice', limit: 20 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    // State
    session: store.session,
    currentQuestion: store.getCurrentQuestion(),
    progress: store.getProgress(),
    score: store.getScore(),
    isLastQuestion: store.isLastQuestion(),
    isLoading: store.isLoading,
    error: store.error,
    showFeedback: store.showFeedback,
    lastAnswer: store.lastAnswer,
    result: store.result,
    
    // Actions
    startQuiz,
    selectAnswer,
    continueToNext,
    abandonQuiz,
    resetQuiz: store.resetQuiz,
    reviewMistakes,
    
    // History
    quizHistory: historyData?.sessions || [],
    isLoadingHistory,
  };
}
