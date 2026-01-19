import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'document-outline',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color="#D1D5DB" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {message && <Text style={styles.message}>{message}</Text>}
      
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

// Pre-configured empty states for common scenarios
export function NoInstrumentsFound() {
  return (
    <EmptyState
      icon="search-outline"
      title="No instruments found"
      message="Try adjusting your search or filters"
    />
  );
}

export function NoCardsYet({ onCreatePress }: { onCreatePress?: () => void }) {
  return (
    <EmptyState
      icon="folder-outline"
      title="No preference cards yet"
      message="Create your first card to get started"
    />
  );
}

export function NoQuizHistory() {
  return (
    <EmptyState
      icon="school-outline"
      title="No quiz history"
      message="Complete a quiz to see your results here"
    />
  );
}

export function NoBookmarks() {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="No bookmarked instruments"
      message="Tap the bookmark icon on any instrument to save it for later"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 24,
  },
});

export default EmptyState;
