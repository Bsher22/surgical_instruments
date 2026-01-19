// src/components/ui/RefreshableScrollView.tsx
// ScrollView with pull-to-refresh and consistent behavior

import React, { ReactNode, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { theme } from '../../theme';
import { haptics } from '../../utils/haptics';

interface RefreshableScrollViewProps extends Omit<ScrollViewProps, 'refreshControl'> {
  children: ReactNode;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  enableRefresh?: boolean;
  refreshTintColor?: string;
}

export const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  children,
  isRefreshing = false,
  onRefresh,
  contentContainerStyle,
  style,
  enableRefresh = true,
  refreshTintColor = theme.colors.primary,
  ...scrollViewProps
}) => {
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      haptics.pullToRefresh();
      onRefresh();
    }
  }, [onRefresh]);

  const refreshControl = enableRefresh && onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={refreshTintColor}
      colors={[refreshTintColor]} // Android
      progressBackgroundColor={theme.colors.surface} // Android
    />
  ) : undefined;

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default RefreshableScrollView;
