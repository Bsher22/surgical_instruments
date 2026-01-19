/**
 * CardHeader Component
 * Displays card title, surgeon, procedure, specialty badge, and metadata
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../utils/theme';
import { formatRelativeTime } from '../../utils/formatters';
import { SpecialtyBadge } from '../ui/SpecialtyBadge';

interface CardHeaderProps {
  title: string;
  surgeonName?: string | null;
  procedureName?: string | null;
  specialty?: string | null;
  updatedAt?: string | null;
  isTemplate?: boolean;
}

export function CardHeader({
  title,
  surgeonName,
  procedureName,
  specialty,
  updatedAt,
  isTemplate = false,
}: CardHeaderProps) {
  return (
    <View style={styles.container}>
      {isTemplate && (
        <View style={styles.templateBadge}>
          <Ionicons name="document-text" size={14} color={colors.primary} />
          <Text style={styles.templateText}>Template</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.detailsContainer}>
        {surgeonName && (
          <View style={styles.detailRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailText}>{surgeonName}</Text>
          </View>
        )}

        {procedureName && (
          <View style={styles.detailRow}>
            <Ionicons
              name="medical-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailText}>{procedureName}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {specialty && <SpecialtyBadge specialty={specialty} />}
        
        {updatedAt && (
          <View style={styles.timestampContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textTertiary}
            />
            <Text style={styles.timestamp}>
              Updated {formatRelativeTime(updatedAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginBottom: spacing.sm,
    gap: 4,
  },
  templateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailsContainer: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
