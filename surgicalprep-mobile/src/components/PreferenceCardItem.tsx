import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PreferenceCard } from '../types';
import { COLORS, SPACING } from '../utils/constants';

interface PreferenceCardItemProps {
  card: PreferenceCard;
  onPress?: () => void;
}

export function PreferenceCardItem({ card, onPress }: PreferenceCardItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/cards/${card.id}`);
    }
  };

  const itemCount = card.items?.length || 0;
  const lastUpdated = new Date(card.updated_at).toLocaleDateString();

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="document-text" size={24} color={COLORS.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {card.title}
        </Text>
        {card.surgeon_name && (
          <Text style={styles.subtitle} numberOfLines={1}>
            Dr. {card.surgeon_name}
          </Text>
        )}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{itemCount} items</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>Updated {lastUpdated}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 6,
  },
});
