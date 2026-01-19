/**
 * CardDetailSkeleton Component
 * Loading placeholder for the card detail screen
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  style?: object;
}

function SkeletonBox({ width, height, style }: SkeletonBoxProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
    />
  );
}

export function CardDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <SkeletonBox width="70%" height={28} />
        <View style={styles.headerDetails}>
          <SkeletonBox width={24} height={24} style={styles.iconSkeleton} />
          <SkeletonBox width="50%" height={18} />
        </View>
        <View style={styles.headerDetails}>
          <SkeletonBox width={24} height={24} style={styles.iconSkeleton} />
          <SkeletonBox width="60%" height={18} />
        </View>
        <View style={styles.footerRow}>
          <SkeletonBox width={80} height={24} style={styles.badge} />
          <SkeletonBox width={100} height={14} />
        </View>
      </View>

      {/* Photo Carousel Placeholder */}
      <View style={styles.photoSection}>
        <View style={styles.photoHeader}>
          <SkeletonBox width={120} height={18} />
          <SkeletonBox width={40} height={14} />
        </View>
        <SkeletonBox width="100%" height={200} style={styles.photoPlaceholder} />
      </View>

      {/* Items Section */}
      <View style={styles.itemsSection}>
        <SkeletonBox width={100} height={22} style={styles.sectionTitle} />
        
        {/* Category Group 1 */}
        <View style={styles.categoryGroup}>
          <View style={styles.categoryHeader}>
            <SkeletonBox width={32} height={32} style={styles.categoryIcon} />
            <SkeletonBox width="40%" height={18} />
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.itemRow}>
              <SkeletonBox width="65%" height={16} />
              <SkeletonBox width="20%" height={14} style={styles.itemMeta} />
            </View>
          ))}
        </View>

        {/* Category Group 2 */}
        <View style={styles.categoryGroup}>
          <View style={styles.categoryHeader}>
            <SkeletonBox width={32} height={32} style={styles.categoryIcon} />
            <SkeletonBox width="35%" height={18} />
          </View>
          {[1, 2].map((i) => (
            <View key={i} style={styles.itemRow}>
              <SkeletonBox width="55%" height={16} />
              <SkeletonBox width="25%" height={14} style={styles.itemMeta} />
            </View>
          ))}
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.notesSection}>
        <View style={styles.notesHeader}>
          <SkeletonBox width={24} height={24} style={styles.iconSkeleton} />
          <SkeletonBox width={100} height={18} />
        </View>
        <SkeletonBox width="100%" height={60} style={styles.notesContent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 6,
  },
  headerSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconSkeleton: {
    borderRadius: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badge: {
    borderRadius: 12,
  },
  photoSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  photoPlaceholder: {
    borderRadius: 12,
  },
  itemsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  categoryGroup: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    gap: spacing.sm,
  },
  categoryIcon: {
    borderRadius: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemMeta: {
    borderRadius: 4,
  },
  notesSection: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    gap: spacing.xs,
  },
  notesContent: {
    margin: spacing.md,
    marginTop: 0,
  },
});
