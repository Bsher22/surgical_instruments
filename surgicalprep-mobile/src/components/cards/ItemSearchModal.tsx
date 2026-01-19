/**
 * ItemSearchModal Component
 * Full-screen modal for searching and adding instruments to preference cards
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { InstrumentSearchResult, ItemCategory } from '../../types/cardItems';
import { ITEM_CATEGORIES, getCategoryInfo } from '../../types/cardItems';
import { debounce } from '../../utils/cardItemHelpers';
import { CategoryChips } from './CategoryBadge';

// Mock API function - replace with actual API call
async function searchInstruments(params: {
  query: string;
  category?: string;
  page: number;
  limit: number;
}): Promise<{ data: InstrumentSearchResult[]; hasMore: boolean }> {
  // This would be your actual API call:
  // return instrumentsApi.search(params);
  
  // Placeholder return for type safety
  return { data: [], hasMore: false };
}

interface ItemSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (instrument: InstrumentSearchResult, quantity: number, category?: ItemCategory) => void;
  isInstrumentAdded: (instrumentId: string) => boolean;
}

export function ItemSearchModal({
  visible,
  onClose,
  onAddItem,
  isInstrumentAdded,
}: ItemSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Debounce search query
  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => setDebouncedQuery(query), 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [searchQuery, debouncedSetQuery]);

  // Focus search input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when closing
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedCategory(null);
    }
  }, [visible]);

  // Infinite query for search results
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['instrumentSearch', debouncedQuery, selectedCategory],
    queryFn: ({ pageParam = 1 }) =>
      searchInstruments({
        query: debouncedQuery,
        category: selectedCategory || undefined,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    enabled: visible && debouncedQuery.length >= 2,
  });

  // Flatten pages into single array
  const instruments = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Handle adding an instrument
  const handleAddInstrument = useCallback(
    (instrument: InstrumentSearchResult) => {
      if (isInstrumentAdded(instrument.id)) {
        return;
      }

      setAddingItemId(instrument.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Add with default quantity of 1
      onAddItem(instrument, 1);
      
      // Brief visual feedback
      setTimeout(() => {
        setAddingItemId(null);
      }, 300);
    },
    [onAddItem, isInstrumentAdded]
  );

  // Render instrument item
  const renderInstrument = useCallback(
    ({ item }: { item: InstrumentSearchResult }) => {
      const isAdded = isInstrumentAdded(item.id);
      const isAdding = addingItemId === item.id;
      const categoryInfo = getCategoryInfo(item.category as ItemCategory);

      return (
        <Pressable
          style={[styles.instrumentItem, isAdded && styles.instrumentItemAdded]}
          onPress={() => handleAddInstrument(item)}
          disabled={isAdded || isAdding}
          android_ripple={{ color: '#E5E7EB' }}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {item.thumbnail_url ? (
              <Image
                source={{ uri: item.thumbnail_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnailPlaceholder, { backgroundColor: `${categoryInfo.color}20` }]}>
                <Ionicons name="medical-outline" size={24} color={categoryInfo.color} />
              </View>
            )}
            
            {item.is_premium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={10} color="#fff" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.instrumentInfo}>
            <Text style={styles.instrumentName} numberOfLines={1}>
              {item.name}
            </Text>
            
            {item.aliases && item.aliases.length > 0 && (
              <Text style={styles.instrumentAliases} numberOfLines={1}>
                aka: {item.aliases.slice(0, 2).join(', ')}
              </Text>
            )}
            
            <View style={[styles.categoryTag, { backgroundColor: `${categoryInfo.color}15` }]}>
              <Text style={[styles.categoryTagText, { color: categoryInfo.color }]}>
                {item.category}
              </Text>
            </View>
          </View>

          {/* Add button / status */}
          <View style={styles.addButtonContainer}>
            {isAdding ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : isAdded ? (
              <View style={styles.addedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.addedText}>Added</Text>
              </View>
            ) : (
              <View style={styles.addButton}>
                <Ionicons name="add" size={24} color="#3B82F6" />
              </View>
            )}
          </View>
        </Pressable>
      );
    },
    [handleAddInstrument, isInstrumentAdded, addingItemId]
  );

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.emptyStateText}>Searching instruments...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyStateTitle}>Search Failed</Text>
          <Text style={styles.emptyStateText}>
            Unable to search instruments. Please try again.
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (debouncedQuery.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Search Instruments</Text>
          <Text style={styles.emptyStateText}>
            Enter at least 2 characters to search
          </Text>
        </View>
      );
    }

    if (instruments.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Results</Text>
          <Text style={styles.emptyStateText}>
            No instruments found for "{debouncedQuery}"
          </Text>
        </View>
      );
    }

    return null;
  };

  // Load more on end reached
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Add Instrument</Text>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </Pressable>
          </View>

          {/* Search input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search by name or alias..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Category filter */}
          <View style={styles.categoryFilter}>
            <CategoryChips
              selectedCategory={selectedCategory as ItemCategory | null}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              showAll
            />
          </View>
        </View>

        {/* Results */}
        <FlatList
          data={instruments}
          renderItem={renderInstrument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryFilter: {
    marginTop: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  instrumentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  instrumentItemAdded: {
    backgroundColor: '#F0FDF4',
    opacity: 0.8,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instrumentInfo: {
    flex: 1,
    gap: 4,
  },
  instrumentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  instrumentAliases: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButtonContainer: {
    width: 60,
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedIndicator: {
    alignItems: 'center',
  },
  addedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
