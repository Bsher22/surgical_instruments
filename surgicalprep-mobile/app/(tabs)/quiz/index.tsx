// ============================================================================
// Quiz Home Screen
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Components
import {
  StatsDashboard,
  QuickActionButtons,
  CategorySelectModal,
  QuizHistoryList,
  FreeTierLimitBanner,
} from '../../../src/components/quiz';

// Hooks
import {
  useStudyStats,
  useDueForReview,
  useQuizHistory,
  useCategories,
  useStartQuizSession,
  useStartReviewSession,
} from '../../../src/hooks/useQuiz';

// Store
import { useQuizStore } from '../../../src/stores/quizStore';

// Types
import type { QuickAction, QuizConfig, DEFAULT_QUIZ_CONFIG } from '../../../src/types/quiz';

// Theme
import { colors, spacing } from '../../../src/utils/theme';

// ============================================================================
// Quiz Home Screen Component
// ============================================================================

export default function QuizHomeScreen() {
  const router = useRouter();

  // ========================================================================
  // State
  // ========================================================================

  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<QuickAction | null>(null);

  // ========================================================================
  // Store
  // ========================================================================

  const {
    selectedCategoryIds,
    isCategoryModalVisible,
    showCategoryModal,
    hideCategoryModal,
    toggleCategory,
    selectAllCategories,
    clearCategories,
    setQuizType,
    setQuestionCount,
    loadFlashcards,
    quizConfig,
  } = useQuizStore();

  // ========================================================================
  // Queries
  // ========================================================================

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useStudyStats();

  const {
    data: dueForReviewData,
    isLoading: isLoadingDue,
    refetch: refetchDue,
  } = useDueForReview();

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuizHistory({ pageSize: 5, status: 'completed' });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useCategories();

  // ========================================================================
  // Mutations
  // ========================================================================

  const startQuizMutation = useStartQuizSession();
  const startReviewMutation = useStartReviewSession();

  // ========================================================================
  // Computed Values
  // ========================================================================

  const stats = statsData?.stats ?? null;
  const quizLimit = statsData?.quizLimit ?? null;
  const dueForReviewCount = dueForReviewData?.totalDue ?? 0;
  const categories = categoriesData?.categories ?? [];
  const historySessions = historyData?.sessions ?? [];

  const isAtQuizLimit = quizLimit ? quizLimit.quizzesUsedToday >= quizLimit.dailyLimit : false;

  // ========================================================================
  // Handlers
  // ========================================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Promise.all([
        refetchStats(),
        refetchDue(),
        refetchHistory(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStats, refetchDue, refetchHistory]);

  const handleQuickAction = useCallback(async (action: QuickAction) => {
    // Check quiz limit
    if (isAtQuizLimit && !quizLimit?.isPremium) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve used all your free quizzes today. Upgrade to Premium for unlimited quizzes!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/premium') },
        ]
      );
      return;
    }

    setLoadingAction(action);

    try {
      switch (action) {
        case 'review_due':
          if (dueForReviewCount === 0) {
            Alert.alert(
              'No Items Due',
              'Great job! You have no instruments due for review right now.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          const reviewResult = await startReviewMutation.mutateAsync();
          loadFlashcards(reviewResult.cards);
          router.push('/quiz/flashcards');
          break;

        case 'quick_10':
          setQuizType('flashcard');
          setQuestionCount(10);
          clearCategories();
          
          const quickConfig: QuizConfig = {
            quizType: 'flashcard',
            questionTypes: ['image_to_name'],
            categoryIds: [],
            questionCount: 10,
            timerEnabled: false,
            timePerQuestion: 30,
          };
          
          const quickResult = await startQuizMutation.mutateAsync(quickConfig);
          router.push({
            pathname: '/quiz/session',
            params: { sessionId: quickResult.session.id },
          });
          break;

        case 'full_quiz':
          // Show category selection modal for full quiz
          showCategoryModal();
          break;
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert(
        'Error',
        'Unable to start the quiz. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingAction(null);
    }
  }, [
    isAtQuizLimit,
    quizLimit,
    dueForReviewCount,
    router,
    startReviewMutation,
    startQuizMutation,
    loadFlashcards,
    setQuizType,
    setQuestionCount,
    clearCategories,
    showCategoryModal,
  ]);

  const handleCategoryConfirm = useCallback(async () => {
    hideCategoryModal();
    setLoadingAction('full_quiz');

    try {
      const config: QuizConfig = {
        ...quizConfig,
        quizType: 'multiple_choice',
        categoryIds: selectedCategoryIds,
      };

      const result = await startQuizMutation.mutateAsync(config);
      router.push({
        pathname: '/quiz/session',
        params: { sessionId: result.session.id },
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert(
        'Error',
        'Unable to start the quiz. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingAction(null);
    }
  }, [
    hideCategoryModal,
    quizConfig,
    selectedCategoryIds,
    startQuizMutation,
    router,
  ]);

  const handleSelectAllCategories = useCallback(() => {
    selectAllCategories(categories);
  }, [selectAllCategories, categories]);

  const handleSessionPress = useCallback((sessionId: string) => {
    router.push({
      pathname: '/quiz/results',
      params: { sessionId },
    });
  }, [router]);

  const handleViewAllHistory = useCallback(() => {
    router.push('/quiz/history');
  }, [router]);

  const handleUpgradePress = useCallback(() => {
    router.push('/premium');
  }, [router]);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Free Tier Limit Banner */}
        <FreeTierLimitBanner
          quizLimit={quizLimit}
          onUpgradePress={handleUpgradePress}
          isLoading={isLoadingStats}
        />

        {/* Stats Dashboard */}
        <StatsDashboard
          stats={stats}
          isLoading={isLoadingStats}
          error={statsError}
        />

        {/* Spacer */}
        <View style={styles.sectionSpacer} />

        {/* Quick Action Buttons */}
        <QuickActionButtons
          dueForReviewCount={dueForReviewCount}
          onActionPress={handleQuickAction}
          isLoading={isLoadingDue}
          loadingAction={loadingAction}
          disabled={startQuizMutation.isPending || startReviewMutation.isPending}
        />

        {/* Spacer */}
        <View style={styles.sectionSpacer} />

        {/* Quiz History List */}
        <QuizHistoryList
          sessions={historySessions}
          isLoading={isLoadingHistory}
          maxItems={5}
          onSessionPress={handleSessionPress}
          onViewAllPress={handleViewAllHistory}
        />

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Category Selection Modal */}
      <CategorySelectModal
        visible={isCategoryModalVisible}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        isLoading={isLoadingCategories}
        onToggleCategory={toggleCategory}
        onSelectAll={handleSelectAllCategories}
        onClearAll={clearCategories}
        onConfirm={handleCategoryConfirm}
        onClose={hideCategoryModal}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  sectionSpacer: {
    height: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
