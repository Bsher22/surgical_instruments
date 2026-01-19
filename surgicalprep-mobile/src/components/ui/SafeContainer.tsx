// src/components/ui/SafeContainer.tsx
// Safe area wrapper with flexible edge handling

import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, StatusBar, Platform } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  Edge,
} from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface SafeContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarBackgroundColor?: string;
}

// Default edges - top and bottom for most screens
const DEFAULT_EDGES: Edge[] = ['top', 'bottom'];

export const SafeContainer: React.FC<SafeContainerProps> = ({
  children,
  style,
  edges = DEFAULT_EDGES,
  backgroundColor = theme.colors.background,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
}) => {
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor || backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor }, style]}
        edges={edges}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

// Screen container with standard padding
interface ScreenContainerProps extends SafeContainerProps {
  padded?: boolean;
  scrollable?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  padded = true,
  ...props
}) => {
  return (
    <SafeContainer {...props}>
      <View style={[styles.content, padded && styles.padded]}>
        {children}
      </View>
    </SafeContainer>
  );
};

// Tab screen container (no bottom edge, tab bar handles it)
export const TabScreenContainer: React.FC<Omit<SafeContainerProps, 'edges'>> = ({
  children,
  ...props
}) => {
  return (
    <SafeContainer edges={['top']} {...props}>
      {children}
    </SafeContainer>
  );
};

// Modal container with all edges
export const ModalContainer: React.FC<SafeContainerProps> = ({
  children,
  ...props
}) => {
  return (
    <SafeContainer edges={['top', 'bottom', 'left', 'right']} {...props}>
      {children}
    </SafeContainer>
  );
};

// Hook for custom safe area handling
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  return {
    insets,
    // Computed values for common use cases
    headerHeight: insets.top + 56, // Standard header height
    tabBarHeight: insets.bottom + theme.layout.tabBarHeight,
    contentPadding: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    // For lists that go under tab bar
    listContentInset: {
      paddingBottom: insets.bottom + theme.layout.tabBarHeight,
    },
  };
};

// Component for adding bottom padding for tab bar
export const TabBarSpacer: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height: insets.bottom + theme.layout.tabBarHeight }} />
  );
};

// Edge-to-edge container (content goes behind status bar)
export const EdgeToEdgeContainer: React.FC<{
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  return <View style={[styles.edgeToEdge, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: theme.spacing.md,
  },
  edgeToEdge: {
    flex: 1,
    paddingTop: 0, // Content goes behind status bar
  },
});

export default SafeContainer;
