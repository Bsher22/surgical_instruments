import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function InstrumentCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      {/* Image placeholder */}
      <Skeleton width={80} height={80} borderRadius={8} />
      
      <View style={styles.cardContent}>
        {/* Title */}
        <Skeleton width="70%" height={18} style={styles.titleSkeleton} />
        
        {/* Alias */}
        <Skeleton width="50%" height={14} style={styles.aliasSkeleton} />
        
        {/* Badge */}
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

interface InstrumentListSkeletonProps {
  count?: number;
}

export function InstrumentListSkeleton({ count = 5 }: InstrumentListSkeletonProps) {
  return (
    <View style={styles.listContainer}>
      {/* Search bar skeleton */}
      <View style={styles.searchContainer}>
        <Skeleton width="100%" height={44} borderRadius={12} />
      </View>
      
      {/* Category chips skeleton */}
      <View style={styles.chipsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            width={80 + Math.random() * 30}
            height={36}
            borderRadius={20}
            style={styles.chipSkeleton}
          />
        ))}
      </View>
      
      {/* Card skeletons */}
      {Array.from({ length: count }).map((_, index) => (
        <InstrumentCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function CardDetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      {/* Hero image */}
      <Skeleton width="100%" height={250} borderRadius={0} />
      
      <View style={styles.detailContent}>
        {/* Title */}
        <Skeleton width="80%" height={28} style={styles.detailTitle} />
        
        {/* Aliases */}
        <Skeleton width="60%" height={16} style={styles.detailSubtitle} />
        
        {/* Badge */}
        <Skeleton width={90} height={28} borderRadius={14} style={styles.detailBadge} />
        
        {/* Description header */}
        <Skeleton width={120} height={20} style={styles.sectionHeader} />
        
        {/* Description lines */}
        <Skeleton width="100%" height={16} style={styles.textLine} />
        <Skeleton width="95%" height={16} style={styles.textLine} />
        <Skeleton width="85%" height={16} style={styles.textLine} />
        
        {/* Uses header */}
        <Skeleton width={100} height={20} style={styles.sectionHeader} />
        
        {/* Uses list */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.listItem}>
            <Skeleton width={6} height={6} borderRadius={3} />
            <Skeleton width={`${70 + Math.random() * 25}%`} height={16} style={styles.listText} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  
  // InstrumentCardSkeleton styles
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titleSkeleton: {
    marginBottom: 6,
  },
  aliasSkeleton: {
    marginBottom: 10,
  },
  
  // InstrumentListSkeleton styles
  listContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSkeleton: {
    marginRight: 8,
  },
  
  // CardDetailSkeleton styles
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    padding: 16,
  },
  detailTitle: {
    marginBottom: 8,
  },
  detailSubtitle: {
    marginBottom: 12,
  },
  detailBadge: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  textLine: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listText: {
    marginLeft: 12,
  },
});

export default Skeleton;
