// src/components/ErrorBoundary.tsx
// Global error boundary with recovery options

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error monitoring service
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      console.error('[ErrorBoundary]', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
      });
    }

    // TODO: Send to error monitoring service (Sentry, etc.)
    // Sentry.captureException(error, {
    //   extra: { componentStack: errorInfo.componentStack },
    // });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReportError = (): void => {
    // Open email or feedback form
    // Could use Linking.openURL('mailto:support@surgicalprep.com')
    console.log('Report error:', this.state.error?.message);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="warning-outline"
                size={80}
                color={theme.colors.error}
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Oops! Something went wrong</Text>

            {/* Description */}
            <Text style={styles.description}>
              We're sorry, but something unexpected happened. The error has been
              reported and we're working to fix it.
            </Text>

            {/* Error details (development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorMessage}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackTrace} numberOfLines={10}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={theme.colors.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleReportError}
                accessibilityRole="button"
                accessibilityLabel="Report this problem"
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>Report Problem</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
    marginBottom: theme.spacing.xl,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  errorDetailsTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    fontFamily: theme.typography.families.mono,
    marginBottom: theme.spacing.sm,
  },
  stackTrace: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    fontFamily: theme.typography.families.mono,
    opacity: 0.8,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  primaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
});

export default ErrorBoundary;
