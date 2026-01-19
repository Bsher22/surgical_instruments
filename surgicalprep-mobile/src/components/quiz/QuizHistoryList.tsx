// ============================================================================
// Quiz History List Component
// ============================================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow, format } from 'date-fns';
import type { QuizHistoryItem, QuizType, QuizSessionStatus } from '../../types/quiz';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

// ============================================================================
// Types
// ============================================================================

interface QuizHistoryListProps {
  sessions: QuizHistoryItem[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSessionPress?: (sessionId: string) => void;
  maxItems?: number;
  showHeader?: boolean;
  onViewAllPress?: () => void;
}

interface HistoryItemProps {
  session: QuizHistoryItem;
  onPress?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getQuizTypeLabel(type: QuizType): string {
  switch (type) {
    case 'flashcard':
      return 'Flashcards';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'mixed':
      return 'Mixed Quiz';
    default:
      return 'Quiz';
  }
}

function getQuizTypeIcon(type: QuizType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'flashcard':
      return 'layers-outline';
    case 'multiple_choice':
      return 'list-outline';
    case 'mixed':
      return 'shuffle-outline';
    default:
      return 'help-circle-outline';
  }
}

function getStatusInfo(status: QuizSessionStatus): { label: string; color: string } {
  switch (status) {
    case 'completed':
      return { label: 'Completed', color: colors.success };
    case 'in_progress':
      return { label: 'In Progress', color: colors.warning };
    case 'abandoned':
      return { label: 'Abandoned', color: colors.textTertiary };
    default:
      return { label: 'Unknown', color: colors.textTertiary };
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return colors.success;
  if (score >= 70) return colors.warning;
  if (score >= 50) return colors.info;
  return colors.error;
}

function formatQuizDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (diffInHours < 168) {
      // Within a week
      return format(date, 'EEEE \'at\' h:mm a');
    }
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

// ============================================================================
// History Item Component
// ============================================================================

const HistoryItem = React.memo(function HistoryItem({
  session,
  onPress,
}: HistoryItemProps) {
  const handlePress = async () => {
    if (!onPress) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const statusInfo = getStatusInfo(session.status);
  const scoreColor = session.status === 'completed' ? getScoreColor(session.score) : colors.textTertiary;
  const dateString = session.completedAt || session.createdAt;

  return (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${getQuizTypeLabel(session.quizType)} quiz, score ${session.score}%, ${session.correctAnswers} of ${session.totalQuestions} correct`}
    >
      {/* Left: Icon and Type */}
      <View style={styles.historyLeft}>
        <View style={[styles.historyIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons
            name={getQuizTypeIcon(session.quizType)}
            size={20}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Center: Info */}
      <View style={styles.historyCenter}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyType}>
            {getQuizTypeLabel(session.quizType)}
          </Text>
          {session.status !== 'completed' && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.historyDetails}>
          {session.correctAnswers}/{session.totalQuestions} correct
          {session.categoryNames.length > 0 && ` • ${session.categoryNames.slice(0, 2).join(', ')}${session.categoryNames.length > 2 ? '...' : ''}`}
        </Text>
        <Text style={styles.historyDate}>
          {formatQuizDate(dateString)}
        </Text>
      </View>

      {/* Right: Score */}
      <View style={styles.historyRight}>
        {session.status === 'completed' ? (
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {session.score}%
            </Text>
            <View
              style={[
                styles.scoreDot,
                { backgroundColor: scoreColor },
              ]}
            />
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});

// ============================================================================
// Quiz History List Component
// ============================================================================

export function QuizHistoryList({
  sessions,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onSessionPress,
  maxItems,
  showHeader = true,
  onViewAllPress,
}: QuizHistoryListProps) {
  // Limit items if maxItems is set
  const displaySessions = maxItems ? sessions.slice(0, maxItems) : sessions;

  // Render item
  const renderItem = useCallback(
    ({ item }: { item: QuizHistoryItem }) => (
      <HistoryItem
        session={item}
        onPress={onSessionPress ? () => onSessionPress(item.id) : undefined}
      />
    ),
    [onSessionPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: QuizHistoryItem) => item.id, []);

  // Footer component for loading more
  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return null;
  }, [isLoadingMore]);

  // Handle end reached
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        {showHeader && <Text style={styles.sectionTitle}>Recent Activity</Text>}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && <Text style={styles.sectionTitle}>Recent Activity</Text>}
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Quiz History</Text>
          <Text style={styles.emptySubtext}>
            Complete your first quiz to see your history here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {onViewAllPress && sessions.length > (maxItems || 0) && (
            <TouchableOpacity onPress={onViewAllPress} accessibilityRole="button">
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* List */}
      <FlatList
        data={displaySessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        ListFooterComponent={renderFooter}
        onEndReached={!maxItems ? handleEndReached : undefined}
        onEndReachedThreshold={0.5}
      />

      {/* View All Button for limited list */}
      {maxItems && sessions.length > maxItems && onViewAllPress && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllPress}
          accessibilityRole="button"
          accessibilityLabel="View all quiz history"
        >
          <Text style={styles.viewAllButtonText}>
            View All ({sessions.length})
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },

  // Loading
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Empty
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // History Item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyLeft: {
    marginRight: spacing.md,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCenter: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  historyType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  historyDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  historyDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  historyRight: {
    marginLeft: spacing.sm,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  // Footer
  footerLoader: {
    padding: spacing.md,
    alignItems: 'center',
  },

  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  viewAllButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
});

export default QuizHistoryList;
