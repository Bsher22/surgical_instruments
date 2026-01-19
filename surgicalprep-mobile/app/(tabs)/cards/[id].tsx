/**
 * Card Detail Screen
 * Displays full preference card information including items, photos, and notes
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCard } from '../../../src/hooks/useCards';
import { CardHeader } from '../../../src/components/cards/CardHeader';
import { CardItemsSection } from '../../../src/components/cards/CardItemsSection';
import { PhotoCarousel } from '../../../src/components/cards/PhotoCarousel';
import { NotesSection } from '../../../src/components/cards/NotesSection';
import { CardDetailSkeleton } from '../../../src/components/cards/CardDetailSkeleton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { ImageViewer } from '../../../src/components/ui/ImageViewer';
import { HeaderButton } from '../../../src/components/ui/HeaderButton';
import { colors, spacing } from '../../../src/utils/theme';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: card, isLoading, error, refetch } = useCard(id);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEdit = useCallback(() => {
    router.push(`/cards/${id}/edit`);
  }, [router, id]);

  const handleShare = useCallback(async () => {
    if (!card) return;

    try {
      const itemCount = card.items?.length || 0;
      const message = `${card.title}\n\nSurgeon: ${card.surgeon_name || 'N/A'}\nProcedure: ${card.procedure_name || 'N/A'}\nSpecialty: ${card.specialty || 'N/A'}\n\nItems: ${itemCount}`;
      
      await Share.share({
        message,
        title: card.title,
      });
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share card');
      }
    }
  }, [card]);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleItemPress = useCallback((itemId: string, instrumentId?: string) => {
    if (instrumentId) {
      router.push(`/instruments/${instrumentId}`);
    }
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerRight: () => null,
          }}
        />
        <CardDetailSkeleton />
      </View>
    );
  }

  if (error || !card) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Error',
            headerRight: () => null,
          }}
        />
        <ErrorState
          title="Failed to load card"
          message={error?.message || 'Card not found'}
          onRetry={refetch}
        />
      </View>
    );
  }

  const photoUrls = card.photos?.map((p) => p.photo_url) || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: card.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <HeaderButton
                icon="share-outline"
                onPress={handleShare}
                accessibilityLabel="Share card"
              />
              <HeaderButton
                icon="create-outline"
                onPress={handleEdit}
                accessibilityLabel="Edit card"
              />
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <CardHeader
          title={card.title}
          surgeonName={card.surgeon_name}
          procedureName={card.procedure_name}
          specialty={card.specialty}
          updatedAt={card.updated_at}
          isTemplate={card.is_template}
        />

        {photoUrls.length > 0 && (
          <PhotoCarousel
            photos={photoUrls}
            onPhotoPress={handleImagePress}
          />
        )}

        <CardItemsSection
          items={card.items || []}
          onItemPress={handleItemPress}
        />

        {(card.notes || card.setup_notes) && (
          <View style={styles.notesContainer}>
            {card.notes && (
              <NotesSection
                title="General Notes"
                content={card.notes}
              />
            )}
            {card.setup_notes && (
              <NotesSection
                title="Setup Notes"
                content={card.setup_notes}
                defaultExpanded={false}
              />
            )}
          </View>
        )}

        {/* Bottom padding for safe area */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {selectedImageIndex !== null && (
        <ImageViewer
          images={photoUrls}
          initialIndex={selectedImageIndex}
          visible={true}
          onClose={handleCloseViewer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notesContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
