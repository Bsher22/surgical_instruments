import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ZoomableImage,
  CategoryBadge,
  SectionCard,
  TagList,
  BookmarkButton,
  PremiumLockOverlay,
} from '../../../src/components/ui';
import { useInstrumentBookmark, usePremiumStatus } from '../../../src/hooks';
import { Instrument } from '../../../src/types/instrument';
import { getInstrument } from '../../../src/api/instruments';

export default function InstrumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isPremium } = usePremiumStatus();
  const { isBookmarked, toggle: toggleBookmark } = useInstrumentBookmark(id ?? '');

  // Fetch instrument data
  const {
    data: instrument,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['instrument', id],
    queryFn: () => getInstrument(id!),
    enabled: !!id,
  });

  // Determine which content is gated for free users
  const contentAccess = useMemo(() => {
    if (!instrument) return { showFull: true };
    
    // Premium instruments gate certain sections for free users
    if (instrument.is_premium && !isPremium) {
      return {
        showFull: false,
        gatedSections: ['handling_notes', 'full_procedures'],
      };
    }
    
    return { showFull: true };
  }, [instrument, isPremium]);

  // Handle "Add to Card" action
  const handleAddToCard = () => {
    if (!instrument) return;
    
    // Navigate to card selector or create new card flow
    router.push({
      pathname: '/cards/select',
      params: { instrumentId: id, instrumentName: instrument.name },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading instrument...</Text>
      </View>
    );
  }

  // Error state
  if (error || !instrument) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load instrument</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'Instrument not found'}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {/* Dynamic header with instrument name */}
      <Stack.Screen
        options={{
          title: instrument.name,
          headerRight: () => (
            <View style={styles.headerRight}>
              <BookmarkButton
                isBookmarked={isBookmarked}
                onToggle={toggleBookmark}
                size={20}
              />
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <ZoomableImage
            uri={instrument.image_url}
            alt={instrument.name}
            fallbackIcon="medical-outline"
          />
          
          {/* Premium badge overlay if applicable */}
          {instrument.is_premium && !isPremium && (
            <View style={styles.premiumBadgeOverlay}>
              <PremiumLockOverlay variant="badge" />
            </View>
          )}
        </View>

        {/* Name & Category Section */}
        <View style={styles.titleSection}>
          <Text style={styles.instrumentName}>{instrument.name}</Text>
          
          {/* Aliases */}
          {instrument.aliases.length > 0 && (
            <Text style={styles.aliases}>
              Also known as: {instrument.aliases.join(', ')}
            </Text>
          )}
          
          {/* Category Badge */}
          <CategoryBadge
            category={instrument.category}
            size="large"
            style={styles.categoryBadge}
          />
        </View>

        {/* Description */}
        <SectionCard
          title="Description"
          icon="information-circle-outline"
          iconColor="#3B82F6"
          style={styles.section}
        >
          <Text style={styles.descriptionText}>{instrument.description}</Text>
        </SectionCard>

        {/* Primary Uses */}
        <SectionCard
          title="Primary Uses"
          icon="build-outline"
          iconColor="#059669"
          style={styles.section}
        >
          <View style={styles.usesList}>
            {instrument.primary_uses.map((use, index) => (
              <View key={index} style={styles.useItem}>
                <View style={styles.useBullet} />
                <Text style={styles.useText}>{use}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* Common Procedures */}
        <SectionCard
          title="Common Procedures"
          icon="medical-outline"
          iconColor="#7C3AED"
          style={styles.section}
        >
          {contentAccess.showFull ? (
            <TagList
              tags={instrument.common_procedures}
              variant="primary"
              onTagPress={(procedure) => {
                // Could navigate to procedure details or filter
                console.log('Tapped procedure:', procedure);
              }}
            />
          ) : (
            <>
              <TagList
                tags={instrument.common_procedures.slice(0, 3)}
                variant="primary"
                maxVisible={3}
              />
              <PremiumLockOverlay
                variant="inline"
                message="View all procedures with Premium"
                style={styles.inlineLock}
              />
            </>
          )}
        </SectionCard>

        {/* Handling Notes */}
        {instrument.handling_notes && (
          <SectionCard
            title="Handling Notes"
            icon="hand-left-outline"
            iconColor="#D97706"
            style={styles.section}
          >
            {contentAccess.showFull ? (
              <View style={styles.handlingNotesContainer}>
                <View style={styles.warningBanner}>
                  <Ionicons name="warning-outline" size={16} color="#D97706" />
                  <Text style={styles.warningLabel}>Important</Text>
                </View>
                <Text style={styles.handlingText}>{instrument.handling_notes}</Text>
              </View>
            ) : (
              <PremiumLockOverlay
                variant="inline"
                message="Handling notes are available with Premium"
              />
            )}
          </SectionCard>
        )}

        {/* Premium upsell section for free users viewing premium content */}
        {!contentAccess.showFull && (
          <PremiumLockOverlay
            variant="overlay"
            message="Unlock complete instrument details, handling notes, and unlimited study access"
            style={styles.section}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleAddToCard}
          >
            <Ionicons name="add-circle-outline" size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Add to Card</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              // Navigate to study/quiz with this instrument
              router.push({
                pathname: '/quiz/flashcards',
                params: { instrumentId: id },
              });
            }}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="school-outline" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Study This</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    marginRight: 8,
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    marginBottom: 16,
  },
  premiumBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },

  // Title Section
  titleSection: {
    marginBottom: 20,
  },
  instrumentName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  aliases: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  categoryBadge: {
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },

  // Uses List
  usesList: {
    gap: 10,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  useBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginTop: 7,
    marginRight: 10,
  },
  useText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },

  // Handling Notes
  handlingNotesContainer: {
    gap: 10,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  warningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  handlingText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },

  inlineLock: {
    marginTop: 12,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  bottomSpacer: {
    height: 40,
  },
});
