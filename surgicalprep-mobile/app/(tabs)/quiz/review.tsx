// Quiz Review Screen - Stage 6D
// For reviewing missed questions from a completed quiz session
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { getMissedQuestions } from '../../../src/api/quiz';
import { QuizQuestionCompact } from '../../../src/components/quiz';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import type { QuizQuestion } from '../../../src/types/quiz';

export default function QuizReviewScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['missedQuestions', sessionId],
    queryFn: () => getMissedQuestions(sessionId!),
    enabled: !!sessionId,
  });

  const missedQuestions = data?.questions || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Review Questions' }} />
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Review Questions' }} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load questions</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (missedQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Review Questions' }} />
        <View style={styles.centerContainer}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            <Text style={styles.emptyTitle}>Perfect Score!</Text>
            <Text style={styles.emptyText}>
              You answered all questions correctly. Great job!
            </Text>
          </Animated.View>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Back to Results</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Review Mistakes',
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="school" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.headerTitle}>Learn from Your Mistakes</Text>
          <Text style={styles.headerSubtitle}>
            Review these {missedQuestions.length} questions to improve your knowledge
          </Text>
        </Animated.View>

        {/* Questions List */}
        <View style={styles.questionsList}>
          {missedQuestions.map((question, index) => (
            <Animated.View
              key={question.id}
              entering={FadeInDown.delay(200 + index * 100)}
            >
              <ReviewQuestionCard
                question={question}
                index={index + 1}
              />
            </Animated.View>
          ))}
        </View>

        {/* Study Tips */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Study Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <TipItem text="Review the instrument details in the database" />
            <TipItem text="Add these instruments to your bookmarks for later" />
            <TipItem text="Try the flashcard mode for focused practice" />
            <TipItem text="Take another quiz to test your progress" />
          </View>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/(tabs)/quiz/session')}
          >
            <Ionicons name="refresh" size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Take New Quiz</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/(tabs)/quiz/flashcards')}
          >
            <Ionicons name="albums" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Practice Flashcards</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Review Question Card Component
interface ReviewQuestionCardProps {
  question: QuizQuestion;
  index: number;
}

function ReviewQuestionCard({ question, index }: ReviewQuestionCardProps) {
  const correctOption = question.options.find((o) => o.isCorrect);
  const router = useRouter();

  return (
    <View style={reviewStyles.card}>
      <View style={reviewStyles.cardHeader}>
        <View style={reviewStyles.indexBadge}>
          <Text style={reviewStyles.indexText}>{index}</Text>
        </View>
        <View style={reviewStyles.categoryBadge}>
          <Text style={reviewStyles.categoryText}>{question.category}</Text>
        </View>
      </View>

      <Text style={reviewStyles.questionText}>{question.questionText}</Text>

      {/* Instrument Info */}
      <Pressable
        style={reviewStyles.instrumentRow}
        onPress={() =>
          router.push(`/(tabs)/instruments/${question.instrumentId}`)
        }
      >
        <View style={reviewStyles.instrumentInfo}>
          <Text style={reviewStyles.instrumentLabel}>Instrument:</Text>
          <Text style={reviewStyles.instrumentName}>
            {question.instrumentName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </Pressable>

      {/* Correct Answer */}
      <View style={reviewStyles.answerSection}>
        <View style={reviewStyles.answerHeader}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={reviewStyles.answerLabel}>Correct Answer</Text>
        </View>
        <Text style={reviewStyles.answerText}>{correctOption?.text}</Text>
      </View>

      {/* Explanation */}
      <View style={reviewStyles.explanationSection}>
        <View style={reviewStyles.explanationHeader}>
          <Ionicons name="information-circle" size={16} color="#3B82F6" />
          <Text style={reviewStyles.explanationLabel}>Explanation</Text>
        </View>
        <Text style={reviewStyles.explanationText}>{question.explanation}</Text>
      </View>
    </View>
  );
}

// Tip Item Component
function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipBullet} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  questionsList: {
    gap: 16,
    marginBottom: 24,
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

const reviewStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 22,
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  instrumentInfo: {
    flex: 1,
  },
  instrumentLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  instrumentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  answerSection: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  answerText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  explanationSection: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  explanationText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
