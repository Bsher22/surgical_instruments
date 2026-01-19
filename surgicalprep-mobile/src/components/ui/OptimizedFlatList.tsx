// src/components/ui/OptimizedFlatList.tsx
// Performance-optimized FlatList wrapper with best practices

import React, { useCallback, useMemo, useRef, ReactElement } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { theme } from '../../theme';
import { haptics } from '../../utils/haptics';

export interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'data'> {
  data: T[] | null | undefined;
  itemHeight?: number; // Required for getItemLayout optimization
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  emptyComponent?: ReactElement;
  emptyMessage?: string;
  emptyIcon?: ReactElement;
  loadingComponent?: ReactElement;
  headerComponent?: ReactElement;
  footerComponent?: ReactElement;
  separatorComponent?: ReactElement;
  enablePullToRefresh?: boolean;
  enableLoadMore?: boolean;
  loadMoreThreshold?: number; // 0-1, trigger load more at this scroll percentage
  onScrollPositionChange?: (position: number) => void;
}

// Default optimization settings
const OPTIMIZATION_SETTINGS = {
  windowSize: 5, // Render 5 screens worth of content
  maxToRenderPerBatch: 10, // Render 10 items per frame
  updateCellsBatchingPeriod: 50, // 50ms batching for updates
  initialNumToRender: 10, // Initially render 10 items
  removeClippedSubviews: true, // Unmount off-screen views (Android mainly)
};

function OptimizedFlatListInner<T>(
  {
    data,
    itemHeight,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    onLoadMore,
    hasNextPage = false,
    isLoadingMore = false,
    emptyComponent,
    emptyMessage = 'No items to display',
    emptyIcon,
    loadingComponent,
    headerComponent,
    footerComponent,
    separatorComponent,
    enablePullToRefresh = true,
    enableLoadMore = true,
    loadMoreThreshold = 0.8,
    onScrollPositionChange,
    keyExtractor,
    renderItem,
    ...flatListProps
  }: OptimizedFlatListProps<T>,
  ref: React.ForwardedRef<FlatList<T>>
) {
  const lastLoadMoreCall = useRef<number>(0);

  // Optimized key extractor
  const defaultKeyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === 'object' && item !== null) {
      if ('id' in item) return String((item as { id: unknown }).id);
      if ('_id' in item) return String((item as { _id: unknown })._id);
    }
    return String(index);
  }, []);

  // getItemLayout for fixed-height items (major performance boost)
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;
    
    return (_data: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  // Pull-to-refresh handler with haptic
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      haptics.pullToRefresh();
      onRefresh();
    }
  }, [onRefresh]);

  // Infinite scroll handler with debounce
  const handleEndReached = useCallback(() => {
    if (!enableLoadMore || !onLoadMore || !hasNextPage || isLoadingMore) {
      return;
    }

    // Debounce load more calls
    const now = Date.now();
    if (now - lastLoadMoreCall.current < 500) {
      return;
    }
    lastLoadMoreCall.current = now;

    onLoadMore();
  }, [enableLoadMore, onLoadMore, hasNextPage, isLoadingMore]);

  // Scroll position tracking
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (onScrollPositionChange) {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const position = contentOffset.y / (contentSize.height - layoutMeasurement.height);
        onScrollPositionChange(Math.max(0, Math.min(1, position)));
      }
    },
    [onScrollPositionChange]
  );

  // Empty state component
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return loadingComponent || (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        {emptyIcon}
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [isLoading, loadingComponent, emptyComponent, emptyIcon, emptyMessage]);

  // Footer component (loading more indicator)
  const ListFooterComponent = useMemo(() => {
    if (footerComponent) {
      return (
        <>
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
          {footerComponent}
        </>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    return null;
  }, [footerComponent, isLoadingMore]);

  // Refresh control
  const refreshControl = useMemo(() => {
    if (!enablePullToRefresh || !onRefresh) {
      return undefined;
    }

    return (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor={theme.colors.primary}
        colors={[theme.colors.primary]}
      />
    );
  }, [enablePullToRefresh, onRefresh, isRefreshing, handleRefresh]);

  // Item separator
  const ItemSeparatorComponent = useMemo(() => {
    if (separatorComponent) {
      return () => separatorComponent;
    }
    return undefined;
  }, [separatorComponent]);

  return (
    <FlatList
      ref={ref}
      data={data || []}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={loadMoreThreshold}
      onScroll={onScrollPositionChange ? handleScroll : undefined}
      scrollEventThrottle={onScrollPositionChange ? 16 : undefined}
      // Optimization settings
      windowSize={OPTIMIZATION_SETTINGS.windowSize}
      maxToRenderPerBatch={OPTIMIZATION_SETTINGS.maxToRenderPerBatch}
      updateCellsBatchingPeriod={OPTIMIZATION_SETTINGS.updateCellsBatchingPeriod}
      initialNumToRender={OPTIMIZATION_SETTINGS.initialNumToRender}
      removeClippedSubviews={OPTIMIZATION_SETTINGS.removeClippedSubviews}
      // Defaults
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        (!data || data.length === 0) && !isLoading
          ? styles.emptyContentContainer
          : undefined
      }
      {...flatListProps}
    />
  );
}

// Forward ref properly with generics
export const OptimizedFlatList = React.forwardRef(OptimizedFlatListInner) as <T>(
  props: OptimizedFlatListProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => ReturnType<typeof OptimizedFlatListInner>;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  loadingMoreContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
});

export default OptimizedFlatList;
