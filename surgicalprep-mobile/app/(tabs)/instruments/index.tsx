// app/(tabs)/instruments/index.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Components
import { SearchBar } from '../../../src/components/SearchBar';
import { CategoryChip } from '../../../src/components/CategoryChip';
import {
  InstrumentCard,
  CARD_MARGIN,
  NUM_COLUMNS,
} from '../../../src/components/InstrumentCard';
import { LoadingSkeleton, LoadingSkeletonRow } from '../../../src/components/LoadingSkeleton';
import { NoSearchResults, NoInstruments, NetworkError } from '../../../src/components/EmptyState';

// API & Types
import { useInstruments } from '../../../src/api/instruments';
import type { Instrument, InstrumentCategory } from '../../../src/types/instruments';

// Constants
const PAGE_SIZE = 20;

const CATEGORIES: Array<{ label: string; value: InstrumentCategory | null }> = [
  { label: 'All', value: null },
  { label: 'Cutting', value: 'cutting' },
  { label: 'Clamping', value: 'clamping' },
  { label: 'Grasping', value: 'grasping' },
  { label: 'Retracting', value: 'retracting' },
  { label: 'Suturing', value: 'suturing' },
  { label: 'Probing', value: 'probing' },
  { label: 'Dilating', value: 'dilating' },
  { label: 'Suctioning', value: 'suctioning' },
  { label: 'Specialty', value: 'specialty' },
];

export default function InstrumentsListScreen() {
  const router = useRouter();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InstrumentCategory | null>(null);

  // Fetch instruments with infinite query
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInstruments({
    search: searchQuery || undefined,
    category: selectedCategory,
    page_size: PAGE_SIZE,
  });

  // Flatten paginated data into single array
  const instruments = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery.length > 0 || selectedCategory !== null;

  // Handle navigation to detail screen
  const handlePressInstrument = useCallback(
    (instrument: Instrument) => {
      router.push(`/instruments/${instrument.id}`);
    },
    [router]
  );

  // Handle search input
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle category selection
  const handleCategoryPress = useCallback((category: InstrumentCategory | null) => {
    setSelectedCategory(category);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  // Load more when reaching end of list
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render individual instrument card
  const renderItem: ListRenderItem<Instrument> = useCallback(
    ({ item }) => (
      <InstrumentCard instrument={item} onPress={handlePressInstrument} />
    ),
    [handlePressInstrument]
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Instrument) => item.id, []);

  // Render footer with loading indicator for pagination
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSkeletonRow />
      </View>
    );
  }, [isFetchingNextPage]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    
    if (hasActiveFilters) {
      return <NoSearchResults onClear={handleClearFilters} />;
    }
    
    return <NoInstruments />;
  }, [isLoading, hasActiveFilters, handleClearFilters]);

  // Render error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NetworkError onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search instruments..."
          onSearch={handleSearch}
          initialValue={searchQuery}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category.label}
              label={category.label}
              selected={selectedCategory === category.value}
              onPress={() => handleCategoryPress(category.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Instrument List */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <FlatList
          data={instruments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={8}
          getItemLayout={(_, index) => ({
            length: 180, // Approximate card height
            offset: 180 * Math.floor(index / NUM_COLUMNS),
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 2,
    paddingBottom: 100, // Space for tab bar
  },
  row: {
    justifyContent: 'flex-start',
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
