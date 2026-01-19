// QuizResults Component - Stage 6D
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { QuizSessionResult, QuizQuestion } from '../../types/quiz';

interface QuizResultsProps {
  result: QuizSessionResult;
  onReviewMistakes: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function QuizResults({
  result,
  onReviewMistakes,
  onPlayAgain,
  onGoHome,
}: QuizResultsProps) {
  const getScoreColor = () => {
    if (result.score >= 80) return '#10B981';
    if (result.score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreEmoji = () => {
    if (result.score >= 90) return '🏆';
    if (result.score >= 80) return '🌟';
    if (result.score >= 70) return '👍';
    if (result.score >= 60) return '📚';
    return '💪';
  };

  const getScoreMessage = () => {
    if (result.score >= 90) return 'Outstanding!';
    if (result.score >= 80) return 'Great job!';
    if (result.score >= 70) return 'Good work!';
    if (result.score >= 60) return 'Keep practicing!';
    return 'Room to improve';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Score Circle */}
      <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={styles.emoji}>{getScoreEmoji()}</Text>
          <Text style={[styles.scoreNumber, { color: getScoreColor() }]}>
            {Math.round(result.score)}%
          </Text>
          <Text style={styles.scoreLabel}>{getScoreMessage()}</Text>
        </View>
      </Animated.View>

      {/* Stats Grid */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.statValue}>{result.correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
          <Text style={styles.statValue}>{result.incorrectAnswers}</Text>
          <Text style={styles.statLabel}>Incorrect</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{formatTime(result.totalTimeMs)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>
            {formatTime(result.averageTimePerQuestionMs)}
          </Text>
          <Text style={styles.statLabel}>Avg/Question</Text>
        </View>
      </Animated.View>

      {/* Category Breakdown */}
      {result.breakdown.length > 0 && (
        <Animated.View entering={FadeInDown.delay(600)} style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Performance by Category</Text>
          {result.breakdown.map((item, index) => (
            <View key={item.category} style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownCategory}>{item.category}</Text>
                <Text style={styles.breakdownStats}>
                  {item.correct}/{item.total} correct
                </Text>
              </View>
              <View style={styles.breakdownBarContainer}>
                <View
                  style={[
                    styles.breakdownBar,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor:
                        item.percentage >= 70
                          ? '#10B981'
                          : item.percentage >= 50
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.breakdownPercentage}>
                {Math.round(item.percentage)}%
              </Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Missed Questions Preview */}
      {result.missedQuestions.length > 0 && (
        <Animated.View entering={FadeInDown.delay(800)} style={styles.missedSection}>
          <View style={styles.missedHeader}>
            <Text style={styles.sectionTitle}>Questions to Review</Text>
            <Text style={styles.missedCount}>
              {result.missedQuestions.length} questions
            </Text>
          </View>
          <View style={styles.missedPreview}>
            {result.missedQuestions.slice(0, 3).map((q, index) => (
              <View key={q.id} style={styles.missedItem}>
                <View style={styles.missedBullet}>
                  <Ionicons name="close" size={12} color="#DC2626" />
                </View>
                <Text style={styles.missedText} numberOfLines={1}>
                  {q.instrumentName}
                </Text>
              </View>
            ))}
            {result.missedQuestions.length > 3 && (
              <Text style={styles.missedMore}>
                +{result.missedQuestions.length - 3} more
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.delay(1000)} style={styles.actions}>
        {result.missedQuestions.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.reviewButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onReviewMistakes}
          >
            <Ionicons name="refresh" size={20} color="#DC2626" />
            <Text style={[styles.buttonText, styles.reviewButtonText]}>
              Review Mistakes
            </Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.playAgainButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onPlayAgain}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.homeButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onGoHome}
        >
          <Ionicons name="home" size={20} color="#6B7280" />
          <Text style={[styles.buttonText, styles.homeButtonText]}>
            Back to Home
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

// Mini results card for history list
interface QuizResultsCardProps {
  result: QuizSessionResult;
  onPress: () => void;
}

export function QuizResultsCard({ result, onPress }: QuizResultsCardProps) {
  const getScoreColor = () => {
    if (result.score >= 80) return '#10B981';
    if (result.score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.cardScore, { backgroundColor: getScoreColor() }]}>
        <Text style={styles.cardScoreText}>{Math.round(result.score)}%</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {result.correctAnswers}/{result.totalQuestions} correct
        </Text>
        <Text style={styles.cardDate}>{formatDate(result.completedAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  breakdownSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownInfo: {
    width: 100,
  },
  breakdownCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  breakdownStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownPercentage: {
    width: 40,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  missedSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  missedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missedCount: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  missedPreview: {
    gap: 8,
  },
  missedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missedBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missedText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  missedMore: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reviewButtonText: {
    color: '#DC2626',
  },
  playAgainButton: {
    backgroundColor: '#3B82F6',
  },
  homeButton: {
    backgroundColor: '#F3F4F6',
  },
  homeButtonText: {
    color: '#6B7280',
  },
  // Card styles
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: '#F9FAFB',
  },
  cardScore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardScoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
