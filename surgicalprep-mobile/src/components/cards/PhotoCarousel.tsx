/**
 * PhotoCarousel Component
 * Horizontal scrollable gallery of setup photos
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const PHOTO_HEIGHT = PHOTO_WIDTH * 0.75; // 4:3 aspect ratio

interface PhotoCarouselProps {
  photos: string[];
  onPhotoPress?: (index: number) => void;
}

export function PhotoCarousel({ photos, onPhotoPress }: PhotoCarouselProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / PHOTO_WIDTH);
      if (index !== currentIndex && index >= 0 && index < photos.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, photos.length]
  );

  const handlePhotoPress = useCallback(
    (index: number) => {
      Haptics.selectionAsync();
      onPhotoPress?.(index);
    },
    [onPhotoPress]
  );

  const renderPhoto = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <Pressable
        onPress={() => handlePhotoPress(index)}
        style={({ pressed }) => [
          styles.photoContainer,
          pressed && styles.photoPressed,
        ]}
        accessibilityRole="image"
        accessibilityLabel={`Setup photo ${index + 1} of ${photos.length}`}
        accessibilityHint="Tap to view full screen"
      >
        <Image
          source={{ uri: item }}
          style={styles.photo}
          resizeMode="cover"
        />
        <View style={styles.expandHint}>
          <Ionicons name="expand-outline" size={20} color={colors.white} />
        </View>
      </Pressable>
    ),
    [handlePhotoPress, photos.length]
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `photo-${index}`,
    []
  );

  if (photos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="camera-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.title}>Setup Photos</Text>
        <Text style={styles.count}>
          {currentIndex + 1} / {photos.length}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={PHOTO_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />

      {photos.length > 1 && (
        <View style={styles.pagination}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  photoContainer: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  photoPressed: {
    opacity: 0.9,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  expandHint: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: spacing.xs,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
