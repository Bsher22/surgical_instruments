// ============================================================================
// Stage 6C: FlashCard Component
// ============================================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { FlashcardItem } from '../../types/flashcard';
import { triggerHaptic } from '../../utils/haptics';
import { colors, typography, spacing, shadows } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface FlashCardProps {
  item: FlashcardItem;
  onFlip: () => void;
  isActive: boolean;
  showHint?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  item,
  onFlip,
  isActive,
  showHint = true,
}) => {
  const { instrument, isFlipped } = item;
  
  // Animation values
  const rotation = useSharedValue(isFlipped ? 180 : 0);
  
  // Handle tap to flip
  const handlePress = useCallback(() => {
    if (!isActive) return;
    
    triggerHaptic('light');
    
    // Animate flip
    rotation.value = withTiming(isFlipped ? 0 : 180, {
      duration: 400,
    }, () => {
      runOnJS(onFlip)();
    });
  }, [isActive, isFlipped, onFlip, rotation]);
  
  // Front face animation (visible when rotation is 0-90)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      rotation.value,
      [0, 90],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });
  
  // Back face animation (visible when rotation is 90-180)
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      rotation.value,
      [90, 180],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });
  
  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {/* Front Face - Image */}
      <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
        <View style={styles.imageContainer}>
          {instrument.image_url ? (
            <Image
              source={{ uri: instrument.image_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🔬</Text>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{instrument.category}</Text>
        </View>
        
        {/* Tap Hint */}
        {showHint && isActive && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Tap to reveal answer</Text>
          </View>
        )}
      </Animated.View>
      
      {/* Back Face - Answer */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <View style={styles.backContent}>
          {/* Instrument Name */}
          <Text style={styles.instrumentName}>{instrument.name}</Text>
          
          {/* Aliases */}
          {instrument.aliases && instrument.aliases.length > 0 && (
            <Text style={styles.aliases}>
              Also known as: {instrument.aliases.join(', ')}
            </Text>
          )}
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Primary Uses */}
          <Text style={styles.sectionTitle}>Primary Uses</Text>
          <View style={styles.usesList}>
            {instrument.primary_uses?.slice(0, 3).map((use, index) => (
              <View key={index} style={styles.useItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.useText}>{use}</Text>
              </View>
            ))}
          </View>
          
          {/* Description */}
          {instrument.description && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description} numberOfLines={4}>
                {instrument.description}
              </Text>
            </>
          )}
        </View>
        
        {/* Swipe Hint */}
        {showHint && isActive && (
          <View style={styles.swipeHintContainer}>
            <Text style={styles.swipeHintLeft}>← Study More</Text>
            <Text style={styles.swipeHintRight}>Got It →</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...shadows.large,
  },
  cardFront: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cardBack: {
    padding: spacing.lg,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  hintContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  hintText: {
    ...typography.caption,
    color: '#fff',
  },
  backContent: {
    flex: 1,
  },
  instrumentName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  aliases: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  usesList: {
    gap: spacing.xs,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bullet: {
    ...typography.body,
    color: colors.primary,
    lineHeight: 22,
  },
  useText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  swipeHintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  swipeHintLeft: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  swipeHintRight: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
});

export default FlashCard;
