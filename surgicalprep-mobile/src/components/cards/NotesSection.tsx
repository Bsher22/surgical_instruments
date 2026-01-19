/**
 * NotesSection Component
 * Expandable/collapsible section for displaying notes
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../utils/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotesSectionProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function NotesSection({
  title,
  content,
  defaultExpanded = true,
  icon = 'document-text-outline',
}: NotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setIsExpanded((prev) => !prev);
  }, []);

  // Count approximate lines for preview
  const previewLength = 150;
  const isLongContent = content.length > previewLength;
  const previewText = isLongContent
    ? content.substring(0, previewLength).trim() + '...'
    : content;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <View style={styles.titleRow}>
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.contentContainer}>
          <Text style={styles.content} selectable>
            {content}
          </Text>
        </View>
      )}

      {!isExpanded && isLongContent && (
        <Pressable
          style={styles.previewContainer}
          onPress={toggleExpanded}
          accessibilityLabel="Tap to expand notes"
        >
          <Text style={styles.previewText} numberOfLines={2}>
            {previewText}
          </Text>
        </Pressable>
      )}

      {!isExpanded && !isLongContent && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText} numberOfLines={2}>
            {content}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  content: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  previewContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
  previewText: {
    ...typography.body,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
});
