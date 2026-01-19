// ============================================================================
// Quiz History Screen (Full List)
// ============================================================================

import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useInfiniteQuizHistory } from '../../../src/hooks/useQuiz';
import type { QuizHistoryItem } from '../../../src/types/quiz';
import { colors, spacing, typography, borderRadius } from '../../../src/utils/theme';

// Import just the item component logic (simplified version for this screen)
import { QuizHistoryList } from '../../../src/components/quiz';

export default function QuizHistoryScreen() {
  const router = useRouter();

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuizHistory({ pageSize: 20 });

  // Flatten pages into single array
  const sessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  const handleSessionPress = useCallback((sessionId: string) => {
    router.push({
      pathname: '/quiz/results',
      params: { sessionId },
    });
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!isLoading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Quiz History</Text>
          <Text style={styles.emptySubtext}>
            Complete your first quiz to see your history here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <QuizHistoryList
        sessions={sessions}
        isLoading={false}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        onLoadMore={handleLoadMore}
        onSessionPress={handleSessionPress}
        showHeader={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
