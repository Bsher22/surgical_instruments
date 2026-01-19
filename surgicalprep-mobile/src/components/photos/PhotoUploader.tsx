// src/components/photos/PhotoUploader.tsx
// Main photo upload component with add button, grid, and source modal

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Photo } from '../../types/photo';
import { PhotoPreviewGrid, getPhotoStatusSummary } from './PhotoPreviewGrid';
import { PhotoSourceModal } from './PhotoSourceModal';
import { usePhotoUpload, urlsToPhotos, photosToUrls } from '../../hooks/usePhotoUpload';
import { PHOTO_CONFIG } from '../../utils/constants';

interface PhotoUploaderProps {
  /** Current photos (controlled mode) */
  photos?: Photo[];
  /** Called when photos change (controlled mode) */
  onPhotosChange?: (photos: Photo[]) => void;
  /** Initial photo URLs (for loading existing card photos) */
  initialUrls?: string[];
  /** Card ID for storage path organization */
  cardId?: string;
  /** User ID for storage path organization */
  userId?: string;
  /** Maximum number of photos allowed */
  maxPhotos?: number;
  /** Disable all interactions */
  disabled?: boolean;
  /** Show section header */
  showHeader?: boolean;
  /** Custom header title */
  headerTitle?: string;
  /** Called when a photo is pressed (for full-screen view) */
  onPhotoPress?: (photo: Photo) => void;
}

/**
 * Complete photo upload component with grid, add button, and source selection
 */
export function PhotoUploader({
  photos: controlledPhotos,
  onPhotosChange,
  initialUrls,
  cardId,
  userId,
  maxPhotos = PHOTO_CONFIG.maxPhotosPerCard,
  disabled = false,
  showHeader = true,
  headerTitle = 'Setup Photos',
  onPhotoPress,
}: PhotoUploaderProps) {
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  
  // Convert initial URLs to Photo objects if provided
  const initialPhotos = initialUrls ? urlsToPhotos(initialUrls) : [];
  
  // Use the photo upload hook
  const {
    photos: internalPhotos,
    isUploading,
    uploadProgress,
    removePhoto,
    retryFailedUploads,
    openCamera,
    openGallery,
    canAddMore,
    remainingSlots,
    setPhotos,
  } = usePhotoUpload({
    initialPhotos: controlledPhotos || initialPhotos,
    cardId,
    userId,
    maxPhotos,
    onPhotosChange,
  });
  
  // Use controlled photos if provided, otherwise internal state
  const photos = controlledPhotos || internalPhotos;
  
  const statusSummary = getPhotoStatusSummary(photos);
  const hasErrors = statusSummary.error > 0;
  
  const handleAddPress = useCallback(async () => {
    if (disabled || !canAddMore) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
    
    setSourceModalVisible(true);
  }, [disabled, canAddMore]);
  
  const handleCloseModal = useCallback(() => {
    setSourceModalVisible(false);
  }, []);
  
  const handleRetryPress = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available
    }
    
    await retryFailedUploads();
  }, [retryFailedUploads]);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSubtext}>
            {photos.length}/{maxPhotos} photos
          </Text>
        </View>
      )}
      
      {/* Upload status indicator */}
      {isUploading && (
        <View style={styles.uploadStatus}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.uploadStatusText}>
            Uploading... {uploadProgress}%
          </Text>
        </View>
      )}
      
      {/* Error indicator with retry */}
      {hasErrors && !isUploading && (
        <TouchableOpacity
          style={styles.errorStatus}
          onPress={handleRetryPress}
          activeOpacity={0.7}
        >
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorStatusText}>
            {statusSummary.error} photo{statusSummary.error > 1 ? 's' : ''} failed to upload
          </Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      )}
      
      {/* Photo grid */}
      {photos.length > 0 && (
        <View style={styles.gridContainer}>
          <PhotoPreviewGrid
            photos={photos}
            onDelete={removePhoto}
            onPhotoPress={onPhotoPress}
            disabled={disabled}
          />
        </View>
      )}
      
      {/* Add photos button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          !canAddMore && styles.addButtonDisabled,
          photos.length === 0 && styles.addButtonLarge,
        ]}
        onPress={handleAddPress}
        disabled={disabled || !canAddMore}
        activeOpacity={0.7}
      >
        <Ionicons
          name="camera-outline"
          size={photos.length === 0 ? 32 : 24}
          color={canAddMore && !disabled ? '#3B82F6' : '#9CA3AF'}
        />
        <Text
          style={[
            styles.addButtonText,
            !canAddMore && styles.addButtonTextDisabled,
          ]}
        >
          {photos.length === 0
            ? 'Add Setup Photos'
            : canAddMore
            ? `Add More (${remainingSlots} left)`
            : 'Maximum photos reached'}
        </Text>
      </TouchableOpacity>
      
      {/* Helper text */}
      {photos.length === 0 && (
        <Text style={styles.helperText}>
          Add photos of your instrument setup for quick reference
        </Text>
      )}
      
      {/* Source selection modal */}
      <PhotoSourceModal
        visible={sourceModalVisible}
        onClose={handleCloseModal}
        onSelectCamera={openCamera}
        onSelectGallery={openGallery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadStatusText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  errorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorStatusText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  gridContainer: {
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  addButtonLarge: {
    paddingVertical: 32,
    flexDirection: 'column',
  },
  addButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  addButtonTextDisabled: {
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

// Re-export utility functions for convenience
export { urlsToPhotos, photosToUrls };

export default PhotoUploader;
