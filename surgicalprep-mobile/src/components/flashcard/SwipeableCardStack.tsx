// ============================================================================
// Stage 6C: SwipeableCardStack Component
// ============================================================================

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { FlashcardItem, SwipeDirection } from '../../types/flashcard';
import { FlashCard } from './FlashCard';
import { triggerHaptic } from '../../utils/haptics';
import { colors, spacing, typography } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const ROTATION_ANGLE = 15;

interface SwipeableCardStackProps {
  cards: FlashcardItem[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, cardId: string, responseTime: number) => void;
  onFlip: (cardId: string) => void;
}

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  cards,
  currentIndex,
  onSwipe,
  onFlip,
}) => {
  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Track timing for response time
  const cardStartTime = useRef<number>(Date.now());
  
  // Reset timing when card changes
  useEffect(() => {
    cardStartTime.current = Date.now();
    // Reset animation values for new card
    translateX.value = 0;
    translateY.value = 0;
    cardRotation.value = 0;
    scale.value = 1;
  }, [currentIndex, translateX, translateY, cardRotation, scale]);
  
  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];
  
  // Handle swipe completion
  const handleSwipeComplete = useCallback((direction: SwipeDirection) => {
    if (!currentCard) return;
    
    const responseTime = Date.now() - cardStartTime.current;
    triggerHaptic(direction === 'right' ? 'success' : 'warning');
    onSwipe(direction, currentCard.id, responseTime);
  }, [currentCard, onSwipe]);
  
  // Handle card flip
  const handleFlip = useCallback(() => {
    if (currentCard) {
      onFlip(currentCard.id);
    }
  }, [currentCard, onFlip]);
  
  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3; // Reduce vertical movement
      cardRotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || velocity > 500;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || velocity < -500;
      
      if (shouldSwipeRight) {
        // Swipe right - Got it!
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('right');
        });
        translateY.value = withTiming(0, { duration: 300 });
        cardRotation.value = withTiming(ROTATION_ANGLE * 2, { duration: 300 });
      } else if (shouldSwipeLeft) {
        // Swipe left - Study more
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('left');
        });
        translateY.value = withTiming(0, { duration: 300 });
        cardRotation.value = withTiming(-ROTATION_ANGLE * 2, { duration: 300 });
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        cardRotation.value = withSpring(0, { damping: 15 });
        scale.value = withSpring(1, { damping: 15 });
      }
    });
  
  // Animated styles for current card
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${cardRotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });
  
  // Animated style for "Got it" overlay
  const gotItOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  // Animated style for "Study More" overlay
  const studyMoreOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  // Animated style for next card (scale up as current card moves away)
  const nextCardStyle = useAnimatedStyle(() => {
    const cardScale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.92, 1],
      Extrapolate.CLAMP
    );
    
    const cardOpacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.6, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale: cardScale }],
      opacity: cardOpacity,
    };
  });
  
  if (!currentCard) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more cards!</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Next card (underneath) */}
      {nextCard && (
        <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}>
          <FlashCard
            item={nextCard}
            onFlip={() => {}}
            isActive={false}
            showHint={false}
          />
        </Animated.View>
      )}
      
      {/* Current card (on top) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
          {/* Got it overlay */}
          <Animated.View style={[styles.overlay, styles.gotItOverlay, gotItOverlayStyle]}>
            <View style={styles.overlayBadge}>
              <Text style={styles.overlayText}>GOT IT! ✓</Text>
            </View>
          </Animated.View>
          
          {/* Study More overlay */}
          <Animated.View style={[styles.overlay, styles.studyMoreOverlay, studyMoreOverlayStyle]}>
            <View style={[styles.overlayBadge, styles.studyMoreBadge]}>
              <Text style={[styles.overlayText, styles.studyMoreText]}>STUDY MORE</Text>
            </View>
          </Animated.View>
          
          <FlashCard
            item={currentCard}
            onFlip={handleFlip}
            isActive={true}
            showHint={!currentCard.isFlipped}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
  },
  nextCard: {
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 16,
    pointerEvents: 'none',
  },
  gotItOverlay: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  studyMoreOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  overlayBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 3,
    borderColor: colors.success,
  },
  studyMoreBadge: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    transform: [{ rotate: '15deg' }],
  },
  overlayText: {
    ...typography.h3,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  studyMoreText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default SwipeableCardStack;
