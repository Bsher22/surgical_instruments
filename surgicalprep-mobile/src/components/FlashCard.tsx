import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Instrument } from '../types';
import { COLORS, SPACING } from '../utils/constants';

interface FlashCardProps {
  instrument: Instrument;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function FlashCard({ instrument, onSwipeLeft, onSwipeRight }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleFlip}
      activeOpacity={0.95}
    >
      {!isFlipped ? (
        // Front of card - Image
        <View style={styles.cardFace}>
          <Image
            source={{ uri: instrument.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.hint}>Tap to reveal</Text>
        </View>
      ) : (
        // Back of card - Details
        <View style={styles.cardFace}>
          <Text style={styles.name}>{instrument.name}</Text>
          {instrument.aliases && instrument.aliases.length > 0 && (
            <Text style={styles.aliases}>
              Also known as: {instrument.aliases.join(', ')}
            </Text>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{instrument.category}</Text>
          </View>
          <Text style={styles.description}>{instrument.description}</Text>
          <View style={styles.usesContainer}>
            <Text style={styles.usesTitle}>Primary Uses:</Text>
            {instrument.primary_uses.slice(0, 3).map((use, index) => (
              <Text key={index} style={styles.useItem}>
                • {use}
              </Text>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFace: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  aliases: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  usesContainer: {
    alignSelf: 'stretch',
  },
  usesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  useItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});
