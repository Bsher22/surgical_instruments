// src/components/ui/OptimizedImage.tsx
// Optimized image component with caching, placeholders, and progressive loading

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
  AccessibilityProps,
} from 'react-native';
import { Image, ImageContentFit, ImageProps as ExpoImageProps } from 'expo-image';
import { theme } from '../../theme';

export interface OptimizedImageProps extends AccessibilityProps {
  source: string | { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  placeholder?: string; // Blurhash or low-res URL
  placeholderContentFit?: ImageContentFit;
  transition?: number;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  recyclingKey?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  showLoadingIndicator?: boolean;
  fallbackSource?: string | { uri: string } | number;
  aspectRatio?: number;
  borderRadius?: number;
}

// Default blurhash placeholder (neutral gray)
const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  contentFit = 'cover',
  placeholder,
  placeholderContentFit = 'cover',
  transition = 300,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  recyclingKey,
  onLoad,
  onError,
  showLoadingIndicator = true,
  fallbackSource,
  aspectRatio,
  borderRadius,
  accessibilityLabel,
  accessibilityRole = 'image',
  ...accessibilityProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize source to URI string
  const imageSource = useMemo(() => {
    if (typeof source === 'string') {
      return source;
    }
    if (typeof source === 'object' && 'uri' in source) {
      return source.uri;
    }
    return source; // Local require() image
  }, [source]);

  // Handle fallback on error
  const displaySource = useMemo(() => {
    if (hasError && fallbackSource) {
      return fallbackSource;
    }
    return imageSource;
  }, [hasError, fallbackSource, imageSource]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (error: { error: string }) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error(error.error));
  };

  // Calculate styles with aspect ratio and border radius
  const computedStyle = useMemo(() => {
    const styles: ImageStyle[] = [baseStyles.image];
    
    if (style) {
      styles.push(style as ImageStyle);
    }
    
    if (aspectRatio) {
      styles.push({ aspectRatio });
    }
    
    if (borderRadius !== undefined) {
      styles.push({ borderRadius });
    }
    
    return styles;
  }, [style, aspectRatio, borderRadius]);

  const computedContainerStyle = useMemo(() => {
    const styles: ViewStyle[] = [baseStyles.container];
    
    if (containerStyle) {
      styles.push(containerStyle as ViewStyle);
    }
    
    if (borderRadius !== undefined) {
      styles.push({ borderRadius, overflow: 'hidden' });
    }
    
    return styles;
  }, [containerStyle, borderRadius]);

  return (
    <View style={computedContainerStyle}>
      <Image
        source={displaySource}
        style={computedStyle}
        contentFit={contentFit}
        placeholder={placeholder || DEFAULT_BLURHASH}
        placeholderContentFit={placeholderContentFit}
        transition={transition}
        priority={priority}
        cachePolicy={cachePolicy}
        recyclingKey={recyclingKey}
        onLoad={handleLoad}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        {...accessibilityProps}
      />
      
      {/* Loading indicator overlay */}
      {showLoadingIndicator && isLoading && (
        <View style={baseStyles.loadingOverlay}>
          {/* Could add an ActivityIndicator here */}
        </View>
      )}
    </View>
  );
};

// Preset configurations for common use cases
export const ImagePresets = {
  // Instrument thumbnail in list
  instrumentThumbnail: {
    cachePolicy: 'memory-disk' as const,
    priority: 'normal' as const,
    contentFit: 'cover' as const,
    transition: 200,
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
  },
  
  // Instrument hero image in detail view
  instrumentHero: {
    cachePolicy: 'disk' as const,
    priority: 'high' as const,
    contentFit: 'contain' as const,
    transition: 300,
    aspectRatio: 4 / 3,
  },
  
  // Preference card photo
  cardPhoto: {
    cachePolicy: 'memory-disk' as const,
    priority: 'normal' as const,
    contentFit: 'cover' as const,
    transition: 200,
    aspectRatio: 16 / 9,
    borderRadius: theme.borderRadius.md,
  },
  
  // Flashcard image
  flashcard: {
    cachePolicy: 'memory' as const,
    priority: 'high' as const,
    contentFit: 'contain' as const,
    transition: 0, // No transition for fast flipping
    aspectRatio: 1,
  },
  
  // Quiz question image
  quizImage: {
    cachePolicy: 'memory' as const,
    priority: 'high' as const,
    contentFit: 'contain' as const,
    transition: 150,
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
  },
};

// Helper component for instrument images
export const InstrumentImage: React.FC<
  Omit<OptimizedImageProps, keyof typeof ImagePresets.instrumentThumbnail> & {
    variant?: 'thumbnail' | 'hero';
  }
> = ({ variant = 'thumbnail', ...props }) => {
  const preset = variant === 'hero' 
    ? ImagePresets.instrumentHero 
    : ImagePresets.instrumentThumbnail;
  
  return <OptimizedImage {...preset} {...props} />;
};

const baseStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.gray100,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;
