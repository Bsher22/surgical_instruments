// ============================================================================
// Stage 6C: Flashcards Screen
// ============================================================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  SwipeableCardStack,
  FlashcardProgressBar,
  SessionSummary,
} from '../../../src/components/flashcard';
import {
  useFlashcardSession,
  useFlashcardInstruments,
  useSessionTimer,
} from '../../../src/hooks/useFlashcardSession';
import { SwipeDirection, SessionResults } from '../../../src/types/flashcard';
import { triggerHaptic } from '../../../src/utils/haptics';
import { colors, typography, spacing, shadows } from '../../../src/utils/theme';

// ============================================================================
// Types
// ============================================================================

type SessionMode = 'all' | 'due_review' | 'bookmarked';

interface SearchParams {
  mode?: SessionMode;
  categoryIds?: string;
  count?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SearchParams>();
  
  // Parse params
  const mode: SessionMode = (params.mode as SessionMode) || 'all';
  const categoryIds = params.categoryIds?.split(',').filter(Boolean);
  const cardCount = parseInt(params.count || '20', 10);
  
  // State
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Fetch instruments
  const {
    data: instruments,
    isLoading: isLoadingInstruments,
    error: instrumentsError,
    refetch: refetchInstruments,
  } = useFlashcardInstruments({
    mode,
    categoryIds,
    limit: cardCount,
  });
  
  // Session management
  const {
    session,
    currentCard,
    progress,
    isActive,
    isComplete,
    isLoading,
    error,
    initialize,
    start,
    pause,
    resume,
    flip,
    swipe,
    reset,
    reviewMistakes,
  } = useFlashcardSession({
    onSessionComplete: (results) => {
      setSessionResults(results);
    },
  });
  
  // Session timer
  const { formatted: elapsedTime } = useSessionTimer(isActive);
  
  // Initialize session when instruments are loaded
  useEffect(() => {
    if (instruments && instruments.length > 0 && !session && !hasStarted) {
      initialize(
        {
          mode,
          categoryIds,
          cardCount: Math.min(cardCount, instruments.length),
          shuffled: true,
        },
        instruments
      );
    }
  }, [instruments, session, hasStarted, initialize, mode, categoryIds, cardCount]);
  
  // Handle start session
  const handleStart = useCallback(() => {
    triggerHaptic('light');
    setHasStarted(true);
    start();
  }, [start]);
  
  // Handle card flip
  const handleFlip = useCallback(
    (cardId: string) => {
      flip();
    },
    [flip]
  );
  
  // Handle swipe
  const handleSwipe = useCallback(
    (direction: SwipeDirection, cardId: string, responseTime: number) => {
      swipe(direction, responseTime);
    },
    [swipe]
  );
  
  // Handle restart
  const handleRestart = useCallback(() => {
    setSessionResults(null);
    setHasStarted(false);
    reset();
    refetchInstruments();
  }, [reset, refetchInstruments]);
  
  // Handle review mistakes
  const handleReviewMistakes = useCallback(() => {
    setSessionResults(null);
    reviewMistakes();
  }, [reviewMistakes]);
  
  // Handle go home
  const handleGoHome = useCallback(() => {
    router.back();
  }, [router]);
  
  // Handle pause/resume
  const handlePauseResume = useCallback(() => {
    if (isActive) {
      pause();
    } else {
      resume();
    }
  }, [isActive, pause, resume]);
  
  // Loading state
  if (isLoadingInstruments || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (instrumentsError || error || !instruments || instruments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>📚</Text>
          <Text style={styles.errorTitle}>
            {instrumentsError || error
              ? 'Something went wrong'
              : 'No instruments available'}
          </Text>
          <Text style={styles.errorMessage}>
            {instrumentsError || error
              ? 'Please try again later.'
              : mode === 'due_review'
              ? "You don't have any instruments due for review!"
              : mode === 'bookmarked'
              ? "You haven't bookmarked any instruments yet."
              : 'No instruments found for the selected categories.'}
          </Text>
          <Pressable style={styles.errorButton} onPress={handleGoHome}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  // Session complete - show results
  if (isComplete && sessionResults) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SessionSummary
          results={sessionResults}
          onRestart={handleRestart}
          onReviewMistakes={handleReviewMistakes}
          onGoHome={handleGoHome}
        />
      </SafeAreaView>
    );
  }
  
  // Pre-start state
  if (!hasStarted && session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.preStartContainer}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.preStartContent}>
            <Text style={styles.preStartEmoji}>🎴</Text>
            <Text style={styles.preStartTitle}>Ready to Study?</Text>
            <Text style={styles.preStartSubtitle}>
              {session.cards.length} flashcards
              {mode === 'due_review' && ' due for review'}
              {mode === 'bookmarked' && ' from your bookmarks'}
            </Text>
            
            <View style={styles.preStartInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>👆</Text>
                <Text style={styles.infoText}>Tap card to flip</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>👉</Text>
                <Text style={styles.infoText}>Swipe right if you got it</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>👈</Text>
                <Text style={styles.infoText}>Swipe left to study more</Text>
              </View>
            </View>
            
            <Pressable style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Studying</Text>
            </Pressable>
            
            <Pressable style={styles.cancelButton} onPress={handleGoHome}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Active session
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleGoHome}>
            <Text style={styles.headerButtonText}>✕</Text>
          </Pressable>
          
          <Text style={styles.timerText}>{elapsedTime}</Text>
          
          <Pressable style={styles.headerButton} onPress={handlePauseResume}>
            <Text style={styles.headerButtonText}>{isActive ? '⏸' : '▶'}</Text>
          </Pressable>
        </View>
        
        {/* Progress Bar */}
        <FlashcardProgressBar
          current={progress.current}
          total={progress.total}
          gotItCount={progress.gotItCount}
          studyMoreCount={progress.studyMoreCount}
        />
        
        {/* Card Stack */}
        {session && (
          <View style={styles.cardContainer}>
            <SwipeableCardStack
              cards={session.cards}
              currentIndex={session.currentIndex}
              onSwipe={handleSwipe}
              onFlip={handleFlip}
            />
          </View>
        )}
        
        {/* Paused Overlay */}
        {!isActive && hasStarted && !isComplete && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.pausedOverlay}
          >
            <View style={styles.pausedContent}>
              <Text style={styles.pausedEmoji}>⏸</Text>
              <Text style={styles.pausedTitle}>Paused</Text>
              <Pressable style={styles.resumeButton} onPress={resume}>
                <Text style={styles.resumeButtonText}>Resume</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  errorButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  
  // Pre-start
  preStartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  preStartContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  preStartEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  preStartTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  preStartSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  preStartInfo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  startButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  startButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  cancelButton: {
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  headerButtonText: {
    fontSize: 18,
  },
  timerText: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  
  // Card container
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Paused overlay
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pausedContent: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.large,
  },
  pausedEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  pausedTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  resumeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  resumeButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
