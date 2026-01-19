import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  PreferenceCardItem,
  PreferenceCardItemSkeleton,
  CardsEmptyState,
  CardsHeader,
  SpecialtyFilter,
  CardLimitIndicator,
} from '../../../src/components/cards';
import {
  PreferenceCard,
  Specialty,
  CardsListParams,
  UserCardLimits,
} from '../../../src/types/cards';
import { cardsApi } from '../../../src/api/cards';

const CARDS_PER_PAGE = 20;

export default function CardsListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Build query params
  const queryParams: CardsListParams = {
    search: searchQuery || undefined,
    specialty: selectedSpecialty || undefined,
    limit: CARDS_PER_PAGE,
  };

  // Fetch cards
  const {
    data: cardsData,
    isLoading,
    isRefetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ['cards', queryParams],
    queryFn: () => cardsApi.getCards(queryParams),
  });

  // Fetch user's card limits
  const { data: limitsData } = useQuery({
    queryKey: ['cardLimits'],
    queryFn: () => cardsApi.getCardLimits(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (cardId: string) => cardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['cardLimits'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to delete card');
    },
  });

  const cards = cardsData?.cards ?? [];
  const limits: UserCardLimits = limitsData ?? { used: 0, max: 5, is_premium: false };

  const hasActiveFilters = searchQuery.length > 0 || selectedSpecialty !== null;

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSpecialtySelect = useCallback((specialty: Specialty | null) => {
    setSelectedSpecialty(specialty);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSpecialty(null);
  }, []);

  const handleAddPress = useCallback(() => {
    // Check if at limit before navigating
    if (!limits.is_premium && limits.used >= limits.max) {
      Alert.alert(
        'Card Limit Reached',
        'Upgrade to Premium for unlimited preference cards.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/profile/upgrade') },
        ]
      );
      return;
    }
    router.push('/cards/new');
  }, [limits, router]);

  const handleEditCard = useCallback((card: PreferenceCard) => {
    router.push(`/cards/${card.id}/edit`);
  }, [router]);

  const handleDeleteCard = useCallback((card: PreferenceCard) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(card.id),
        },
      ]
    );
  }, [deleteMutation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render card item
  const renderCard = useCallback(
    ({ item }: { item: PreferenceCard }) => (
      <PreferenceCardItem
        card={item}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
      />
    ),
    [handleEditCard, handleDeleteCard]
  );

  // Render loading skeleton
  const renderLoadingList = () => (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        <PreferenceCardItemSkeleton key={index} />
      ))}
    </View>
  );

  // Key extractor
  const keyExtractor = useCallback((item: PreferenceCard) => item.id, []);

  // List footer (loading more indicator)
  const renderFooter = () => {
    if (!cardsData?.has_more) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#4a90d9" />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Header with search and filters */}
        <CardsHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedSpecialty={selectedSpecialty}
          onSpecialtyPress={() => setFilterModalVisible(true)}
          onAddPress={handleAddPress}
        />

        {/* Card limit indicator for free users */}
        <CardLimitIndicator limits={limits} />

        {/* Cards list */}
        {isLoading ? (
          renderLoadingList()
        ) : cards.length === 0 ? (
          <CardsEmptyState
            hasSearchFilter={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                colors={['#4a90d9']}
                tintColor="#4a90d9"
              />
            }
            ListFooterComponent={renderFooter}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            getItemLayout={(data, index) => ({
              length: 100, // Approximate item height
              offset: 100 * index,
              index,
            })}
          />
        )}

        {/* Specialty filter modal */}
        <SpecialtyFilter
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          selectedSpecialty={selectedSpecialty}
          onSelectSpecialty={handleSpecialtySelect}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
