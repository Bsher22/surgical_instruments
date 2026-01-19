// src/components/photos/PhotoPreviewItem.tsx
// Individual photo thumbnail with loading state and delete button

import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Photo } from '../../types/photo';
import { PHOTO_UI_CONFIG } from '../../utils/constants';

interface PhotoPreviewItemProps {
  /** Photo to display */
  photo: Photo;
  /** Size of the thumbnail (width and height) */
  size: number;
  /** Called when delete button is pressed */
  onDelete: () => void;
  /** Called when photo is pressed (optional, for full-screen view) */
  onPress?: () => void;
  /** Disable interactions */
  disabled?: boolean;
  /** Show delete button */
  showDelete?: boolean;
}

/**
 * Individual photo thumbnail with status overlay and delete button
 */
export function PhotoPreviewItem({
  photo,
  size,
  onDelete,
  onPress,
  disabled = false,
  showDelete = true,
}: PhotoPreviewItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const { uploadStatus, uploadProgress, localUri, remoteUrl, errorMessage } = photo;
  
  // Use remote URL if available, otherwise local URI
  const imageSource = remoteUrl || localUri;
  
  const isUploading = uploadStatus === 'uploading';
  const isPending = uploadStatus === 'pending';
  const hasError = uploadStatus === 'error';
  const isSuccess = uploadStatus === 'success';
  
  const handleDelete = async () => {
    if (disabled) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
    
    onDelete();
  };
  
  const handlePress = async () => {
    if (disabled || !onPress) return;
    
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics not available
    }
    
    onPress();
  };
  
  const renderOverlay = () => {
    // Uploading overlay with progress
    if (isUploading || isPending) {
      return (
        <View style={styles.overlay}>
          <ActivityIndicator
            size={PHOTO_UI_CONFIG.progressSize}
            color="#FFFFFF"
          />
          {isUploading && uploadProgress !== undefined && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </View>
          )}
        </View>
      );
    }
    
    // Error overlay
    if (hasError) {
      return (
        <View style={[styles.overlay, styles.errorOverlay]}>
          <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.container,
        { width: size, height: size },
        pressed && styles.pressed,
      ]}
    >
      {/* Image */}
      {!imageError ? (
        <Image
          source={{ uri: imageSource }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.errorPlaceholder]}>
          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      
      {/* Loading indicator for image load */}
      {imageLoading && isSuccess && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}
      
      {/* Status overlay */}
      {renderOverlay()}
      
      {/* Delete button */}
      {showDelete && !disabled && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={styles.deleteButtonInner}>
            <Ionicons
              name="close"
              size={14}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      )}
      
      {/* Error badge */}
      {hasError && (
        <View style={styles.errorBadge}>
          <Ionicons name="refresh" size={12} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: PHOTO_UI_CONFIG.deleteButtonSize,
    height: PHOTO_UI_CONFIG.deleteButtonSize,
    borderRadius: PHOTO_UI_CONFIG.deleteButtonSize / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PhotoPreviewItem;
