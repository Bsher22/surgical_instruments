// Quiz Store - Stage 6D Multiple Choice
import { create } from 'zustand';
import type {
  QuizConfig,
  QuizQuestion,
  QuizAnswer,
  QuizSessionState,
  QuizSessionResult,
  QuizTimerState,
  QuizQuestionType,
} from '../types/quiz';
import {
  startMultipleChoiceQuiz,
  submitQuizAnswer,
  endQuizSession,
} from '../api/quiz';

interface MultipleChoiceQuizStore {
  // Session state
  session: QuizSessionState | null;
  isLoading: boolean;
  error: string | null;
  
  // Timer state
  timer: QuizTimerState;
  
  // UI state
  showFeedback: boolean;
  lastAnswer: {
    isCorrect: boolean;
    correctOptionId: string;
    explanation: string;
  } | null;
  
  // Results
  result: QuizSessionResult | null;
  
  // Actions
  startQuiz: (config: QuizConfig) => Promise<void>;
  answerQuestion: (optionId: string, timeSpentMs: number) => Promise<void>;
  nextQuestion: () => void;
  endQuiz: (abandoned?: boolean) => Promise<void>;
  resetQuiz: () => void;
  
  // Timer actions
  setTimerSeconds: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  
  // UI actions
  hideFeedback: () => void;
  
  // Computed getters
  getCurrentQuestion: () => QuizQuestion | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getScore: () => { correct: number; total: number; percentage: number };
  isLastQuestion: () => boolean;
}

const initialTimerState: QuizTimerState = {
  remainingSeconds: 0,
  isRunning: false,
  isPaused: false,
};

export const useMultipleChoiceQuizStore = create<MultipleChoiceQuizStore>((set, get) => ({
  // Initial state
  session: null,
  isLoading: false,
  error: null,
  timer: initialTimerState,
  showFeedback: false,
  lastAnswer: null,
  result: null,

  // Start a new quiz session
  startQuiz: async (config: QuizConfig) => {
    set({ isLoading: true, error: null, result: null });
    
    try {
      const response = await startMultipleChoiceQuiz(config);
      
      const session: QuizSessionState = {
        sessionId: response.sessionId,
        config,
        questions: response.questions,
        currentQuestionIndex: 0,
        answers: [],
        startedAt: new Date().toISOString(),
        status: 'in_progress',
      };
      
      set({
        session,
        isLoading: false,
        timer: {
          remainingSeconds: config.timerEnabled ? config.timerSeconds : 0,
          isRunning: config.timerEnabled,
          isPaused: false,
        },
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start quiz',
      });
      throw error;
    }
  },

  // Submit answer for current question
  answerQuestion: async (optionId: string, timeSpentMs: number) => {
    const { session } = get();
    if (!session) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;

    set({ isLoading: true, error: null });

    try {
      const response = await submitQuizAnswer(
        session.sessionId,
        currentQuestion.id,
        optionId,
        timeSpentMs
      );

      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        isCorrect: response.isCorrect,
        timeSpentMs,
      };

      set((state) => ({
        session: state.session
          ? {
              ...state.session,
              answers: [...state.session.answers, answer],
            }
          : null,
        isLoading: false,
        showFeedback: true,
        lastAnswer: {
          isCorrect: response.isCorrect,
          correctOptionId: response.correctOptionId,
          explanation: response.explanation,
        },
        timer: {
          ...state.timer,
          isRunning: false,
        },
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit answer',
      });
    }
  },

  // Move to next question
  nextQuestion: () => {
    const { session } = get();
    if (!session) return;

    const nextIndex = session.currentQuestionIndex + 1;
    const isComplete = nextIndex >= session.questions.length;

    if (isComplete) {
      // Auto-end quiz when all questions answered
      get().endQuiz();
    } else {
      set((state) => ({
        session: state.session
          ? {
              ...state.session,
              currentQuestionIndex: nextIndex,
            }
          : null,
        showFeedback: false,
        lastAnswer: null,
        timer: state.session?.config.timerEnabled
          ? {
              remainingSeconds: state.session.config.timerSeconds,
              isRunning: true,
              isPaused: false,
            }
          : state.timer,
      }));
    }
  },

  // End quiz session
  endQuiz: async (abandoned = false) => {
    const { session } = get();
    if (!session) return;

    set({ isLoading: true });

    try {
      const response = await endQuizSession(session.sessionId, abandoned);
      
      set({
        session: {
          ...session,
          status: abandoned ? 'abandoned' : 'completed',
        },
        result: response.result,
        isLoading: false,
        showFeedback: false,
        timer: initialTimerState,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to end quiz',
      });
    }
  },

  // Reset quiz state
  resetQuiz: () => {
    set({
      session: null,
      isLoading: false,
      error: null,
      timer: initialTimerState,
      showFeedback: false,
      lastAnswer: null,
      result: null,
    });
  },

  // Timer actions
  setTimerSeconds: (seconds: number) => {
    set((state) => ({
      timer: {
        ...state.timer,
        remainingSeconds: seconds,
      },
    }));
  },

  pauseTimer: () => {
    set((state) => ({
      timer: {
        ...state.timer,
        isRunning: false,
        isPaused: true,
      },
    }));
  },

  resumeTimer: () => {
    set((state) => ({
      timer: {
        ...state.timer,
        isRunning: true,
        isPaused: false,
      },
    }));
  },

  resetTimer: () => {
    const { session } = get();
    set({
      timer: {
        remainingSeconds: session?.config.timerSeconds || 0,
        isRunning: session?.config.timerEnabled || false,
        isPaused: false,
      },
    });
  },

  // UI actions
  hideFeedback: () => {
    set({ showFeedback: false, lastAnswer: null });
  },

  // Computed getters
  getCurrentQuestion: () => {
    const { session } = get();
    if (!session) return null;
    return session.questions[session.currentQuestionIndex] || null;
  },

  getProgress: () => {
    const { session } = get();
    if (!session) return { current: 0, total: 0, percentage: 0 };
    
    const current = session.currentQuestionIndex + 1;
    const total = session.questions.length;
    const percentage = (current / total) * 100;
    
    return { current, total, percentage };
  },

  getScore: () => {
    const { session } = get();
    if (!session) return { correct: 0, total: 0, percentage: 0 };
    
    const correct = session.answers.filter((a) => a.isCorrect).length;
    const total = session.answers.length;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    
    return { correct, total, percentage };
  },

  isLastQuestion: () => {
    const { session } = get();
    if (!session) return false;
    return session.currentQuestionIndex >= session.questions.length - 1;
  },
}));
