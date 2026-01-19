import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CardsEmptyStateProps {
  hasSearchFilter?: boolean;
  onClearFilters?: () => void;
}

export function CardsEmptyState({
  hasSearchFilter = false,
  onClearFilters,
}: CardsEmptyStateProps) {
  const router = useRouter();

  const handleCreateCard = () => {
    router.push('/cards/new');
  };

  if (hasSearchFilter) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
        </View>
        <Text style={styles.title}>No cards found</Text>
        <Text style={styles.description}>
          Try adjusting your search or filter criteria
        </Text>
        {onClearFilters && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClearFilters}
          >
            <Text style={styles.secondaryButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="documents-outline" size={64} color="#4a90d9" />
      </View>
      <Text style={styles.title}>Create Your First Card</Text>
      <Text style={styles.description}>
        Preference cards help you organize instruments and supplies for 
        specific procedures and surgeons. Create one to get started!
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCreateCard}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.primaryButtonText}>Create Card</Text>
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Quick Tips:</Text>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4a90d9" />
          <Text style={styles.tipText}>
            Add instruments from the database or create custom items
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4a90d9" />
          <Text style={styles.tipText}>
            Include setup notes and photos for quick reference
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4a90d9" />
          <Text style={styles.tipText}>
            Duplicate cards to create variations for different surgeons
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90d9',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90d9',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#4a90d9',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 48,
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CardsEmptyState;
