// ============================================================================
// Quiz Store (Zustand)
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  QuizConfig,
  QuizType,
  QuestionType,
  QuizSession,
  QuizQuestion,
  FlashcardItem,
  FlashcardResult,
  Category,
  DEFAULT_QUIZ_CONFIG,
} from '../types/quiz';

// ============================================================================
// Store State Interface
// ============================================================================

interface QuizState {
  // Quiz Configuration
  quizConfig: QuizConfig;
  selectedCategoryIds: string[];

  // Active Session
  currentSession: QuizSession | null;
  currentQuestion: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  sessionAnswers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    responseTimeMs: number;
  }>;

  // Flashcard Mode
  flashcards: FlashcardItem[];
  flashcardIndex: number;
  flashcardResults: FlashcardResult[];
  isFlipped: boolean;

  // UI State
  isCategoryModalVisible: boolean;
  isQuizConfigModalVisible: boolean;
  isLoading: boolean;

  // User Preferences (persisted)
  defaultQuestionCount: number;
  defaultTimerEnabled: boolean;
  defaultTimePerQuestion: number;
  preferredCategories: string[];

  // Actions - Configuration
  setQuizType: (type: QuizType) => void;
  setQuestionTypes: (types: QuestionType[]) => void;
  setQuestionCount: (count: number) => void;
  setTimerEnabled: (enabled: boolean) => void;
  setTimePerQuestion: (seconds: number) => void;
  toggleCategory: (categoryId: string) => void;
  selectAllCategories: (categories: Category[]) => void;
  clearCategories: () => void;
  setSelectedCategories: (categoryIds: string[]) => void;
  resetConfig: () => void;

  // Actions - Session Management
  startSession: (session: QuizSession, firstQuestion: QuizQuestion) => void;
  setCurrentQuestion: (question: QuizQuestion | null) => void;
  recordAnswer: (answer: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    responseTimeMs: number;
  }) => void;
  endSession: () => void;
  abandonSession: () => void;

  // Actions - Flashcard Mode
  loadFlashcards: (cards: FlashcardItem[]) => void;
  flipCard: () => void;
  nextFlashcard: (response: 'got_it' | 'study_more', timeSpentMs: number) => void;
  resetFlashcards: () => void;

  // Actions - UI
  showCategoryModal: () => void;
  hideCategoryModal: () => void;
  showQuizConfigModal: () => void;
  hideQuizConfigModal: () => void;
  setLoading: (loading: boolean) => void;

  // Actions - Preferences
  savePreferences: () => void;
  loadPreferences: () => void;
}

// ============================================================================
// Default Configuration
// ============================================================================

const defaultConfig: QuizConfig = {
  quizType: 'flashcard',
  questionTypes: ['image_to_name'],
  categoryIds: [],
  questionCount: 10,
  timerEnabled: false,
  timePerQuestion: 30,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initial State - Configuration
      quizConfig: { ...defaultConfig },
      selectedCategoryIds: [],

      // Initial State - Active Session
      currentSession: null,
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      sessionAnswers: [],

      // Initial State - Flashcard Mode
      flashcards: [],
      flashcardIndex: 0,
      flashcardResults: [],
      isFlipped: false,

      // Initial State - UI
      isCategoryModalVisible: false,
      isQuizConfigModalVisible: false,
      isLoading: false,

      // Initial State - User Preferences
      defaultQuestionCount: 10,
      defaultTimerEnabled: false,
      defaultTimePerQuestion: 30,
      preferredCategories: [],

      // ========================================================================
      // Configuration Actions
      // ========================================================================

      setQuizType: (type) =>
        set((state) => ({
          quizConfig: { ...state.quizConfig, quizType: type },
        })),

      setQuestionTypes: (types) =>
        set((state) => ({
          quizConfig: { ...state.quizConfig, questionTypes: types },
        })),

      setQuestionCount: (count) =>
        set((state) => ({
          quizConfig: { ...state.quizConfig, questionCount: count },
        })),

      setTimerEnabled: (enabled) =>
        set((state) => ({
          quizConfig: { ...state.quizConfig, timerEnabled: enabled },
        })),

      setTimePerQuestion: (seconds) =>
        set((state) => ({
          quizConfig: { ...state.quizConfig, timePerQuestion: seconds },
        })),

      toggleCategory: (categoryId) =>
        set((state) => {
          const isSelected = state.selectedCategoryIds.includes(categoryId);
          const newCategories = isSelected
            ? state.selectedCategoryIds.filter((id) => id !== categoryId)
            : [...state.selectedCategoryIds, categoryId];

          return {
            selectedCategoryIds: newCategories,
            quizConfig: { ...state.quizConfig, categoryIds: newCategories },
          };
        }),

      selectAllCategories: (categories) =>
        set((state) => {
          const allIds = categories.map((c) => c.id);
          return {
            selectedCategoryIds: allIds,
            quizConfig: { ...state.quizConfig, categoryIds: allIds },
          };
        }),

      clearCategories: () =>
        set((state) => ({
          selectedCategoryIds: [],
          quizConfig: { ...state.quizConfig, categoryIds: [] },
        })),

      setSelectedCategories: (categoryIds) =>
        set((state) => ({
          selectedCategoryIds: categoryIds,
          quizConfig: { ...state.quizConfig, categoryIds },
        })),

      resetConfig: () =>
        set({
          quizConfig: { ...defaultConfig },
          selectedCategoryIds: [],
        }),

      // ========================================================================
      // Session Management Actions
      // ========================================================================

      startSession: (session, firstQuestion) =>
        set({
          currentSession: session,
          currentQuestion: firstQuestion,
          questionIndex: 0,
          totalQuestions: session.totalQuestions,
          correctAnswers: 0,
          sessionAnswers: [],
          isLoading: false,
        }),

      setCurrentQuestion: (question) =>
        set({ currentQuestion: question }),

      recordAnswer: (answer) =>
        set((state) => ({
          sessionAnswers: [...state.sessionAnswers, answer],
          questionIndex: state.questionIndex + 1,
          correctAnswers: answer.isCorrect
            ? state.correctAnswers + 1
            : state.correctAnswers,
        })),

      endSession: () =>
        set({
          currentSession: null,
          currentQuestion: null,
          questionIndex: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          sessionAnswers: [],
        }),

      abandonSession: () =>
        set({
          currentSession: null,
          currentQuestion: null,
          questionIndex: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          sessionAnswers: [],
        }),

      // ========================================================================
      // Flashcard Mode Actions
      // ========================================================================

      loadFlashcards: (cards) =>
        set({
          flashcards: cards,
          flashcardIndex: 0,
          flashcardResults: [],
          isFlipped: false,
        }),

      flipCard: () =>
        set((state) => ({
          isFlipped: !state.isFlipped,
        })),

      nextFlashcard: (response, timeSpentMs) =>
        set((state) => {
          const currentCard = state.flashcards[state.flashcardIndex];
          if (!currentCard) return state;

          const result: FlashcardResult = {
            instrumentId: currentCard.instrumentId,
            response,
            timeSpentMs,
          };

          const newIndex = state.flashcardIndex + 1;
          const isComplete = newIndex >= state.flashcards.length;

          return {
            flashcardResults: [...state.flashcardResults, result],
            flashcardIndex: isComplete ? state.flashcardIndex : newIndex,
            isFlipped: false,
          };
        }),

      resetFlashcards: () =>
        set({
          flashcards: [],
          flashcardIndex: 0,
          flashcardResults: [],
          isFlipped: false,
        }),

      // ========================================================================
      // UI Actions
      // ========================================================================

      showCategoryModal: () => set({ isCategoryModalVisible: true }),
      hideCategoryModal: () => set({ isCategoryModalVisible: false }),
      showQuizConfigModal: () => set({ isQuizConfigModalVisible: true }),
      hideQuizConfigModal: () => set({ isQuizConfigModalVisible: false }),
      setLoading: (loading) => set({ isLoading: loading }),

      // ========================================================================
      // Preferences Actions
      // ========================================================================

      savePreferences: () => {
        const state = get();
        set({
          defaultQuestionCount: state.quizConfig.questionCount,
          defaultTimerEnabled: state.quizConfig.timerEnabled,
          defaultTimePerQuestion: state.quizConfig.timePerQuestion,
          preferredCategories: state.selectedCategoryIds,
        });
      },

      loadPreferences: () =>
        set((state) => ({
          quizConfig: {
            ...state.quizConfig,
            questionCount: state.defaultQuestionCount,
            timerEnabled: state.defaultTimerEnabled,
            timePerQuestion: state.defaultTimePerQuestion,
            categoryIds: state.preferredCategories,
          },
          selectedCategoryIds: state.preferredCategories,
        })),
    }),
    {
      name: 'quiz-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user preferences, not session state
      partialize: (state) => ({
        defaultQuestionCount: state.defaultQuestionCount,
        defaultTimerEnabled: state.defaultTimerEnabled,
        defaultTimePerQuestion: state.defaultTimePerQuestion,
        preferredCategories: state.preferredCategories,
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentFlashcard = (state: QuizState) =>
  state.flashcards[state.flashcardIndex] ?? null;

export const selectFlashcardProgress = (state: QuizState) => ({
  current: state.flashcardIndex + 1,
  total: state.flashcards.length,
  gotItCount: state.flashcardResults.filter((r) => r.response === 'got_it').length,
  studyMoreCount: state.flashcardResults.filter((r) => r.response === 'study_more').length,
});

export const selectQuizProgress = (state: QuizState) => ({
  current: state.questionIndex + 1,
  total: state.totalQuestions,
  correct: state.correctAnswers,
  percentage: state.questionIndex > 0
    ? Math.round((state.correctAnswers / state.questionIndex) * 100)
    : 0,
});

export const selectIsQuizComplete = (state: QuizState) =>
  state.questionIndex >= state.totalQuestions && state.totalQuestions > 0;

export const selectIsFlashcardSessionComplete = (state: QuizState) =>
  state.flashcardIndex >= state.flashcards.length && state.flashcards.length > 0;
