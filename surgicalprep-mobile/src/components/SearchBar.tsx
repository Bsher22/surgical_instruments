import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
  value?: string;
}

export function SearchBar({
  placeholder = 'Search instruments...',
  onSearch,
  debounceMs = 300,
  autoFocus = false,
  value: controlledValue,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Sync with controlled value if provided
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInternalValue(text);

      // Clear existing debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer
      debounceRef.current = setTimeout(() => {
        onSearch(text.trim());
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleClear = useCallback(() => {
    setInternalValue('');
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleSubmit = useCallback(() => {
    // Clear debounce and search immediately on submit
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearch(internalValue.trim());
    Keyboard.dismiss();
  }, [internalValue, onSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={internalValue}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          clearButtonMode="never" // We use custom clear button
          accessibilityLabel="Search input"
          accessibilityHint="Type to search instruments"
        />
        
        {internalValue.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0, // Removes default padding on Android
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SearchBar;
