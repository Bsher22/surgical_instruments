/**
 * Premium Gate Component
 * Wrapper component that conditionally renders content based on subscription status
 */
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePremiumFeature } from '../../hooks/usePremiumFeature';
import { PremiumFeature } from '../../types/subscription';
import LockedOverlay from './LockedOverlay';

interface PremiumGateProps {
  /** Feature to check access for */
  feature: PremiumFeature;
  /** Content to render when user has access */
  children: ReactNode;
  /** Optional custom fallback when access is denied */
  fallback?: ReactNode;
  /** Whether to show the locked overlay (default: true) */
  showOverlay?: boolean;
  /** Whether to blur the content behind the overlay */
  blurContent?: boolean;
  /** Custom message to show in the overlay */
  customMessage?: string;
  /** Style for the container */
  style?: object;
}

export default function PremiumGate({
  feature,
  children,
  fallback,
  showOverlay = true,
  blurContent = true,
  customMessage,
  style,
}: PremiumGateProps) {
  const { hasAccess, reason } = usePremiumFeature(feature, {
    autoPrompt: false,
    autoNavigate: false,
  });
  
  // User has access - render children normally
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // User doesn't have access - show fallback or overlay
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showOverlay) {
    return null;
  }
  
  return (
    <View style={[styles.container, style]}>
      {/* Optionally show blurred content behind */}
      {blurContent && (
        <View style={styles.blurredContent} pointerEvents="none">
          {children}
        </View>
      )}
      
      {/* Locked overlay */}
      <LockedOverlay
        feature={feature}
        message={customMessage || reason || undefined}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Content Component (Alternative Usage)
// ─────────────────────────────────────────────────────────────────────────────

interface PremiumContentProps {
  /** Feature to check access for */
  feature: PremiumFeature;
  /** Content to render when user has access */
  children: ReactNode;
  /** Content to render when user doesn't have access */
  lockedContent?: ReactNode;
  /** Placeholder to show while loading */
  placeholder?: ReactNode;
}

export function PremiumContent({
  feature,
  children,
  lockedContent,
  placeholder,
}: PremiumContentProps) {
  const { hasAccess, isLoading } = usePremiumFeature(feature, {
    autoPrompt: false,
    autoNavigate: false,
  });
  
  if (isLoading && placeholder) {
    return <>{placeholder}</>;
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (lockedContent) {
    return <>{lockedContent}</>;
  }
  
  return <LockedOverlay feature={feature} compact />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium Section Component (For larger content areas)
// ─────────────────────────────────────────────────────────────────────────────

interface PremiumSectionProps {
  /** Feature to check access for */
  feature: PremiumFeature;
  /** Section title (shown in locked state) */
  title?: string;
  /** Content to render when user has access */
  children: ReactNode;
  /** Style for the container */
  style?: object;
}

export function PremiumSection({
  feature,
  title,
  children,
  style,
}: PremiumSectionProps) {
  const { hasAccess } = usePremiumFeature(feature, {
    autoPrompt: false,
    autoNavigate: false,
  });
  
  if (hasAccess) {
    return <View style={style}>{children}</View>;
  }
  
  return (
    <View style={[styles.sectionContainer, style]}>
      <LockedOverlay
        feature={feature}
        title={title}
        variant="section"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  blurredContent: {
    opacity: 0.3,
  },
  sectionContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
});
