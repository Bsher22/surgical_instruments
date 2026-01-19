// Example: Instruments List Screen with Stage 10 Integrations
// app/(tabs)/instruments/index.tsx

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Stage 10 components
import {
  TabScreenContainer,
  OptimizedFlatList,
  OptimizedImage,
  Button,
  SkeletonInstrumentCard,
  SkeletonList,
} from '../../../src/components';

// Theme & Utils
import { theme } from '../../../src/theme';
import { haptics } from '../../../src/utils';
import { queryKeys, CACHE_TIMES } from '../../../src/api';

// Types
import { Instrument } from '../../../src/types';

// API (example)
const fetchInstruments = async (page: number): Promise<{
  items: Instrument[];
  hasMore: boolean;
}> => {
  // Replace with actual API call
  const response = await fetch(`/api/instruments?page=${page}`);
  return response.json();
};

// Instrument Card Component
const InstrumentCard: React.FC<{
  instrument: Instrument;
  onPress: () => void;
}> = React.memo(({ instrument, onPress }) => {
  const handlePress = useCallback(() => {
    haptics.light();
    onPress();
  }, [onPress]);

  return (
    <Button
      title=""
      onPress={handlePress}
      variant="ghost"
      style={styles.card}
      accessibilityLabel={`${instrument.name}, ${instrument.category}`}
      accessibilityHint="Double tap to view details"
    >
      <View style={styles.cardContent}>
        <OptimizedImage
          source={instrument.image_url}
          style={styles.cardImage}
          contentFit="cover"
          placeholder={instrument.blurhash}
          priority="normal"
          cachePolicy="memory-disk"
          accessibilityLabel={`Image of ${instrument.name}`}
        />
        
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {instrument.name}
          </Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{instrument.category}</Text>
          </View>
          
          <Text style={styles.cardDescription} numberOfLines={2}>
            {instrument.description}
          </Text>
        </View>
        
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
        />
      </View>
    </Button>
  );
});

// Empty State Component
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Ionicons
      name="search-outline"
      size={64}
      color={theme.colors.textTertiary}
    />
    <Text style={styles.emptyTitle}>No instruments found</Text>
    <Text style={styles.emptySubtitle}>
      Try adjusting your search or filters
    </Text>
  </View>
);

// Main Screen Component
export default function InstrumentsScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // Fetch instruments with React Query
  const {
    data,
    isLoading,
    isRefreshing,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: queryKeys.instruments.list({ page }),
    queryFn: () => fetchInstruments(page),
    ...CACHE_TIMES.STATIC,
  });

  // Navigate to instrument detail
  const handleInstrumentPress = useCallback((instrument: Instrument) => {
    router.push(`/(tabs)/instruments/${instrument.id}`);
  }, [router]);

  // Render item
  const renderItem = useCallback(({ item }: { item: Instrument }) => (
    <InstrumentCard
      instrument={item}
      onPress={() => handleInstrumentPress(item)}
    />
  ), [handleInstrumentPress]);

  // Key extractor
  const keyExtractor = useCallback((item: Instrument) => item.id, []);

  // Loading state
  if (isLoading) {
    return (
      <TabScreenContainer>
        <View style={styles.container}>
          <SkeletonList
            count={5}
            itemComponent={SkeletonInstrumentCard}
            style={styles.list}
          />
        </View>
      </TabScreenContainer>
    );
  }

  return (
    <TabScreenContainer>
      <View style={styles.container}>
        <OptimizedFlatList
          data={data?.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          itemHeight={100} // Enable getItemLayout optimization
          isRefreshing={isRefreshing}
          onRefresh={refetch}
          hasNextPage={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={fetchNextPage}
          emptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  separator: {
    height: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 0,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray100,
  },
  cardInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  cardDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
