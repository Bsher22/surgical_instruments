import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  Swipeable,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { PreferenceCard, SPECIALTY_LABELS } from '../../types/cards';

interface PreferenceCardItemProps {
  card: PreferenceCard;
  onEdit?: (card: PreferenceCard) => void;
  onDelete?: (card: PreferenceCard) => void;
  onDuplicate?: (card: PreferenceCard) => void;
}

export function PreferenceCardItem({
  card,
  onEdit,
  onDelete,
  onDuplicate,
}: PreferenceCardItemProps) {
  const router = useRouter();
  const swipeableRef = React.useRef<Swipeable>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handlePress = () => {
    router.push(`/cards/${card.id}`);
  };

  const handleEdit = () => {
    swipeableRef.current?.close();
    onEdit?.(card);
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete?.(card);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateEdit = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [160, 0],
    });

    const translateDelete = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[
            styles.swipeAction,
            styles.editAction,
            { transform: [{ translateX: translateEdit }] },
          ]}
        >
          <TouchableOpacity
            style={styles.swipeActionButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={22} color="#fff" />
            <Text style={styles.swipeActionText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeAction,
            styles.deleteAction,
            { transform: [{ translateX: translateDelete }] },
          ]}
        >
          <TouchableOpacity
            style={styles.swipeActionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={22} color="#fff" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const itemCount = card.item_count ?? card.items?.length ?? 0;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {card.title}
            </Text>
            {card.is_template && (
              <View style={styles.templateBadge}>
                <Text style={styles.templateBadgeText}>Template</Text>
              </View>
            )}
          </View>

          <View style={styles.meta}>
            {card.surgeon_name && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {card.surgeon_name}
                </Text>
              </View>
            )}
            {card.procedure_name && (
              <View style={styles.metaItem}>
                <Ionicons name="medical-outline" size={14} color="#666" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {card.procedure_name}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {card.specialty && (
                <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>
                    {SPECIALTY_LABELS[card.specialty]}
                  </Text>
                </View>
              )}
              <View style={styles.itemCountBadge}>
                <Ionicons name="list-outline" size={12} color="#666" />
                <Text style={styles.itemCountText}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>

            <Text style={styles.dateText}>
              {formatDate(card.updated_at)}
            </Text>
          </View>
        </View>

        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

// Loading skeleton for the card item
export function PreferenceCardItemSkeleton() {
  return (
    <View style={[styles.container, styles.skeleton]}>
      <View style={styles.content}>
        <View style={[styles.skeletonLine, { width: '70%', height: 20 }]} />
        <View style={[styles.skeletonLine, { width: '50%', height: 14, marginTop: 8 }]} />
        <View style={styles.footer}>
          <View style={[styles.skeletonLine, { width: 80, height: 20 }]} />
          <View style={[styles.skeletonLine, { width: 60, height: 14 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  skeleton: {
    opacity: 0.6,
  },
  skeletonLine: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  templateBadge: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0077cc',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    maxWidth: 150,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  itemCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCountText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  chevron: {
    marginLeft: 8,
  },
  swipeActionsContainer: {
    flexDirection: 'row',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  editAction: {
    backgroundColor: '#4a90d9',
  },
  deleteAction: {
    backgroundColor: '#dc3545',
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default PreferenceCardItem;
