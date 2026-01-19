/**
 * SpecialtyBadge Component
 * Displays surgical specialty as a colored badge
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface SpecialtyBadgeProps {
  specialty: string;
  size?: 'small' | 'medium' | 'large';
}

// Map specialties to colors for visual distinction
const SPECIALTY_COLORS: Record<string, string> = {
  general: '#3B82F6',      // Blue
  orthopedic: '#10B981',   // Green
  cardiac: '#EF4444',      // Red
  cardiovascular: '#EF4444',
  neuro: '#8B5CF6',        // Purple
  neurosurgery: '#8B5CF6',
  plastic: '#EC4899',      // Pink
  urology: '#F59E0B',      // Amber
  obgyn: '#06B6D4',        // Cyan
  'ob/gyn': '#06B6D4',
  ent: '#84CC16',          // Lime
  ophthalmology: '#6366F1', // Indigo
  vascular: '#DC2626',     // Red-600
  thoracic: '#0EA5E9',     // Sky
  pediatric: '#A855F7',    // Purple-500
  trauma: '#F97316',       // Orange
  transplant: '#14B8A6',   // Teal
};

function getSpecialtyColor(specialty: string): string {
  const normalizedSpecialty = specialty.toLowerCase().replace(/\s+/g, '');
  
  // Check for exact match first
  if (SPECIALTY_COLORS[normalizedSpecialty]) {
    return SPECIALTY_COLORS[normalizedSpecialty];
  }

  // Check for partial matches
  for (const [key, color] of Object.entries(SPECIALTY_COLORS)) {
    if (normalizedSpecialty.includes(key) || key.includes(normalizedSpecialty)) {
      return color;
    }
  }

  // Default color
  return colors.textSecondary;
}

function formatSpecialtyName(specialty: string): string {
  // Handle common abbreviations
  const abbreviations: Record<string, string> = {
    'obgyn': 'OB/GYN',
    'ob/gyn': 'OB/GYN',
    'ent': 'ENT',
  };

  const lower = specialty.toLowerCase();
  if (abbreviations[lower]) {
    return abbreviations[lower];
  }

  // Title case
  return specialty
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function SpecialtyBadge({ specialty, size = 'medium' }: SpecialtyBadgeProps) {
  const color = useMemo(() => getSpecialtyColor(specialty), [specialty]);
  const formattedName = useMemo(() => formatSpecialtyName(specialty), [specialty]);

  const sizeStyles = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
        };
    }
  }, [size]);

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: color + '20' },
      ]}
      accessibilityLabel={`Specialty: ${formattedName}`}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, sizeStyles.text, { color }]}>
        {formattedName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  containerSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  containerMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  containerLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
    lineHeight: 14,
  },
  textMedium: {
    fontSize: 12,
    lineHeight: 16,
  },
  textLarge: {
    fontSize: 14,
    lineHeight: 18,
  },
});
