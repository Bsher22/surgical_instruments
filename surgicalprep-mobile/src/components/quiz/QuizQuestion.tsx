// QuizQuestion Component - Stage 6D
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import type { QuizQuestion as QuizQuestionType, QuizQuestionType as QuestionTypeEnum } from '../../types/quiz';
import { QuizQuestionType } from '../../types/quiz';

interface QuizQuestionDisplayProps {
  question: QuizQuestionType;
  questionNumber: number;
}

export function QuizQuestionDisplay({
  question,
  questionNumber,
}: QuizQuestionDisplayProps) {
  const renderQuestionContent = () => {
    switch (question.type) {
      case QuizQuestionType.IMAGE_TO_NAME:
      case QuizQuestionType.IMAGE_TO_CATEGORY:
        return (
          <View style={styles.imageQuestionContainer}>
            {question.instrumentImageUrl ? (
              <Animated.Image
                entering={FadeIn.duration(300)}
                source={{ uri: question.instrumentImageUrl }}
                style={styles.instrumentImage}
                resizeMode="contain"
                accessibilityLabel={`Instrument image for question ${questionNumber}`}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>Image not available</Text>
              </View>
            )}
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>
        );

      case QuizQuestionType.NAME_TO_USE:
        return (
          <View style={styles.textQuestionContainer}>
            <View style={styles.instrumentNameCard}>
              <Text style={styles.instrumentNameLabel}>Instrument</Text>
              <Text style={styles.instrumentName}>{question.instrumentName}</Text>
            </View>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>
        );

      default:
        return (
          <View style={styles.textQuestionContainer}>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>
        );
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case QuizQuestionType.IMAGE_TO_NAME:
        return 'Identify the Instrument';
      case QuizQuestionType.NAME_TO_USE:
        return 'Primary Use';
      case QuizQuestionType.IMAGE_TO_CATEGORY:
        return 'Identify the Category';
      default:
        return 'Question';
    }
  };

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>{getQuestionTypeLabel()}</Text>
        </View>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{question.category}</Text>
        </View>
      </View>
      {renderQuestionContent()}
    </Animated.View>
  );
}

// Compact version for results review
interface QuizQuestionCompactProps {
  question: QuizQuestionType;
  userAnswer: string;
  isCorrect: boolean;
}

export function QuizQuestionCompact({
  question,
  userAnswer,
  isCorrect,
}: QuizQuestionCompactProps) {
  const selectedOption = question.options.find((o) => o.id === userAnswer);
  const correctOption = question.options.find((o) => o.isCorrect);

  return (
    <View style={[styles.compactContainer, !isCorrect && styles.compactIncorrect]}>
      <View style={styles.compactHeader}>
        {question.instrumentImageUrl && (
          <Image
            source={{ uri: question.instrumentImageUrl }}
            style={styles.compactImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactQuestion} numberOfLines={2}>
            {question.questionText}
          </Text>
          <View style={styles.compactAnswers}>
            {!isCorrect && (
              <View style={styles.compactAnswerRow}>
                <Text style={styles.compactAnswerLabel}>Your answer:</Text>
                <Text style={styles.compactAnswerWrong}>
                  {selectedOption?.text || 'No answer'}
                </Text>
              </View>
            )}
            <View style={styles.compactAnswerRow}>
              <Text style={styles.compactAnswerLabel}>
                {isCorrect ? 'Correct:' : 'Should be:'}
              </Text>
              <Text style={styles.compactAnswerCorrect}>{correctOption?.text}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeChip: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  imageQuestionContainer: {
    alignItems: 'center',
  },
  instrumentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  textQuestionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  instrumentNameCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instrumentNameLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instrumentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
  },
  // Compact styles for review
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactIncorrect: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  compactHeader: {
    flexDirection: 'row',
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  compactContent: {
    flex: 1,
  },
  compactQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  compactAnswers: {
    gap: 4,
  },
  compactAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactAnswerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  compactAnswerWrong: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  compactAnswerCorrect: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
});
