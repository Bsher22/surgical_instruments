import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Specialty } from '../../types/cards';

interface CardsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSpecialty: Specialty | null;
  onSpecialtyPress: () => void;
  onAddPress: () => void;
}

export function CardsHeader({
  searchQuery,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyPress,
  onAddPress,
}: CardsHeaderProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Sync local state with prop changes (e.g., when filters are cleared)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounced search
  const handleSearchChange = useCallback(
    (text: string) => {
      setLocalQuery(text);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onSearchChange(text);
      }, 300);
    },
    [onSearchChange]
  );

  const handleClearSearch = () => {
    setLocalQuery('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const hasActiveFilter = selectedSpecialty !== null;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by surgeon or procedure..."
            placeholderTextColor="#999"
            value={localQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {localQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilter && styles.filterButtonActive,
          ]}
          onPress={onSpecialtyPress}
        >
          <Ionicons
            name="filter"
            size={20}
            color={hasActiveFilter ? '#fff' : '#666'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4a90d9',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4a90d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CardsHeader;
