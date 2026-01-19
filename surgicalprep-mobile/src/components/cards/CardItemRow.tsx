/**
 * CardItemRow Component
 * Displays a single item in the preference card with swipe-to-delete
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { CardItem } from '../../types/cardItems';
import { getItemDisplayName, getCategoryInfo } from '../../types/cardItems';
import { formatQuantity, formatItemDetails } from '../../utils/cardItemHelpers';
import { CategoryBadge } from './CategoryBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_THRESHOLD = -80;

interface CardItemRowProps {
  item: CardItem;
  onPress: (item: CardItem) => void;
  onDelete: (item: CardItem) => void;
  isDragging?: boolean;
  drag?: () => void;
}

export function CardItemRow({
  item,
  onPress,
  onDelete,
  isDragging = false,
  drag,
}: CardItemRowProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(72);
  const opacity = useSharedValue(1);

  const displayName = getItemDisplayName(item);
  const details = formatItemDetails(item);
  const quantity = formatQuantity(item.quantity);
  const categoryInfo = getCategoryInfo(item.category);
  const thumbnailUrl = item.instrument?.thumbnail_url;

  // Handle delete animation
  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    itemHeight.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDelete)(item);
    });
  }, [item, onDelete]);

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      // Only allow swipe left
      translateX.value = Math.min(0, Math.max(event.translationX, DELETE_THRESHOLD - 20));
    })
    .onEnd((event) => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Trigger delete
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  // Long press gesture for drag
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      if (drag) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(drag)();
      }
    });

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / 40),
  }));

  return (
    <View style={styles.wrapper}>
      {/* Delete background */}
      <Animated.View style={[styles.deleteBackground, deleteButtonStyle]}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      {/* Item content */}
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, longPressGesture)}>
        <Animated.View style={[styles.container, containerStyle, isDragging && styles.dragging]}>
          <Pressable
            style={styles.content}
            onPress={() => onPress(item)}
            android_ripple={{ color: '#E5E7EB' }}
          >
            {/* Drag handle */}
            <View style={styles.dragHandle}>
              <Ionicons name="reorder-two" size={20} color="#9CA3AF" />
            </View>

            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {thumbnailUrl ? (
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumbnailPlaceholder, { backgroundColor: `${categoryInfo.color}20` }]}>
                  <Ionicons
                    name={item.instrument_id ? 'medical-outline' : 'cube-outline'}
                    size={20}
                    color={categoryInfo.color}
                  />
                </View>
              )}
              
              {/* Quantity badge */}
              {item.quantity > 1 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
              )}
            </View>

            {/* Item info */}
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <CategoryBadge category={item.category} size="small" />
              </View>
              
              {details ? (
                <Text style={styles.details} numberOfLines={1}>
                  {details}
                </Text>
              ) : (
                <Text style={styles.detailsPlaceholder}>
                  Tap to add details
                </Text>
              )}
            </View>

            {/* Edit indicator */}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Compact version for drag list
interface CardItemRowCompactProps {
  item: CardItem;
  onPress?: (item: CardItem) => void;
  isActive?: boolean;
}

export function CardItemRowCompact({
  item,
  onPress,
  isActive = false,
}: CardItemRowCompactProps) {
  const displayName = getItemDisplayName(item);
  const categoryInfo = getCategoryInfo(item.category);

  return (
    <Pressable
      style={[styles.compactContainer, isActive && styles.compactActive]}
      onPress={() => onPress?.(item)}
    >
      <View style={[styles.compactIndicator, { backgroundColor: categoryInfo.color }]} />
      <Text style={styles.compactName} numberOfLines={1}>
        {displayName}
      </Text>
      {item.quantity > 1 && (
        <Text style={styles.compactQuantity}>×{item.quantity}</Text>
      )}
      {item.size && (
        <Text style={styles.compactSize}>{item.size}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#fff',
  },
  dragging: {
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dragHandle: {
    padding: 4,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  quantityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  details: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailsPlaceholder: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingRight: 16,
  },
  deleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
  },
  compactActive: {
    backgroundColor: '#F3F4F6',
    transform: [{ scale: 1.02 }],
  },
  compactIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  compactName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  compactQuantity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  compactSize: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
