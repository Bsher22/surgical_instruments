// src/hooks/usePhotoUpload.ts
// Hook for managing photo upload state and operations

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { Photo, PhotoUploadState, PhotoPickerResult } from '../types/photo';
import { uploadPhotoWithProgress, deletePhoto } from '../api/storage';
import { compressImage, uriToBlob, isImageTooLarge } from '../utils/imageUtils';
import {
  generateUniqueFilename,
  generateUUID,
  generateStoragePath,
  getMimeType,
  extractPathFromUrl,
  isLocalUri,
} from '../utils/fileUtils';
import { PHOTO_CONFIG, UPLOAD_RETRY_CONFIG } from '../utils/constants';
import useImagePicker from './useImagePicker';

interface UsePhotoUploadOptions {
  /** Initial photos (for editing existing cards) */
  initialPhotos?: Photo[];
  /** Card ID for storage path */
  cardId?: string;
  /** User ID for storage path */
  userId?: string;
  /** Maximum number of photos allowed */
  maxPhotos?: number;
  /** Callback when photos change */
  onPhotosChange?: (photos: Photo[]) => void;
}

interface UsePhotoUploadReturn {
  /** Current photos */
  photos: Photo[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Overall upload progress (0-100) */
  uploadProgress: number;
  /** Add photos from picker results */
  addPhotos: (pickerResults: PhotoPickerResult[]) => Promise<void>;
  /** Add a single photo from URI */
  addPhotoFromUri: (uri: string) => Promise<void>;
  /** Remove a photo by ID */
  removePhoto: (photoId: string) => void;
  /** Retry failed uploads */
  retryFailedUploads: () => Promise<void>;
  /** Clear all photos */
  clearAll: () => void;
  /** Open camera picker */
  openCamera: () => Promise<void>;
  /** Open gallery picker */
  openGallery: () => Promise<void>;
  /** Photos marked for deletion (storage paths) */
  photosToDelete: string[];
  /** Commit deletions to storage */
  commitDeletions: () => Promise<void>;
  /** Check if can add more photos */
  canAddMore: boolean;
  /** Number of photos remaining */
  remainingSlots: number;
  /** Set photos directly (for form state management) */
  setPhotos: (photos: Photo[]) => void;
}

/**
 * Hook for managing photo uploads with queue, progress, and retry logic
 */
export function usePhotoUpload(options: UsePhotoUploadOptions = {}): UsePhotoUploadReturn {
  const {
    initialPhotos = [],
    cardId,
    userId,
    maxPhotos = PHOTO_CONFIG.maxPhotosPerCard,
    onPhotosChange,
  } = options;

  const [photos, setPhotosState] = useState<Photo[]>(initialPhotos);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const uploadQueueRef = useRef<string[]>([]);
  const isUploadingRef = useRef(false);
  
  const { pickFromCamera, pickFromGallery } = useImagePicker();

  // Sync photos with parent component
  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  // Computed values
  const isUploading = photos.some(p => p.uploadStatus === 'uploading');
  const canAddMore = photos.length < maxPhotos;
  const remainingSlots = maxPhotos - photos.length;

  /**
   * Set photos directly (for external state management)
   */
  const setPhotos = useCallback((newPhotos: Photo[]) => {
    setPhotosState(newPhotos);
  }, []);

  /**
   * Update a single photo in the state
   */
  const updatePhoto = useCallback((photoId: string, updates: Partial<Photo>) => {
    setPhotosState(prev =>
      prev.map(p => (p.id === photoId ? { ...p, ...updates } : p))
    );
  }, []);

  /**
   * Process and upload a single photo
   */
  const processAndUpload = useCallback(async (photo: Photo): Promise<void> => {
    const { id, localUri } = photo;
    
    try {
      // Update status to uploading
      updatePhoto(id, { uploadStatus: 'uploading', uploadProgress: 0 });
      
      // Check file size
      const tooLarge = await isImageTooLarge(localUri);
      
      // Compress image
      let processedUri = localUri;
      if (tooLarge) {
        const compressed = await compressImage(localUri, {
          quality: PHOTO_CONFIG.compressionQuality * 0.7, // More aggressive compression
        });
        processedUri = compressed.uri;
      } else {
        const compressed = await compressImage(localUri);
        processedUri = compressed.uri;
      }
      
      // Generate storage path
      const filename = generateUniqueFilename('jpg');
      const storagePath = generateStoragePath({
        userId,
        cardId,
        filename,
      });
      
      // Upload with progress tracking
      const result = await uploadPhotoWithProgress(
        processedUri,
        storagePath,
        'image/jpeg',
        (progress) => {
          updatePhoto(id, { uploadProgress: progress });
        }
      );
      
      // Update with success
      updatePhoto(id, {
        uploadStatus: 'success',
        uploadProgress: 100,
        remoteUrl: result.url,
        storagePath: result.path,
        fileSize: result.size,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      updatePhoto(id, {
        uploadStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }, [cardId, userId, updatePhoto]);

  /**
   * Process the upload queue
   */
  const processQueue = useCallback(async () => {
    if (isUploadingRef.current) return;
    if (uploadQueueRef.current.length === 0) return;
    
    isUploadingRef.current = true;
    
    while (uploadQueueRef.current.length > 0) {
      // Get batch for concurrent uploads
      const batch = uploadQueueRef.current.splice(0, PHOTO_CONFIG.concurrentUploads);
      
      // Find the photo objects
      const photosToUpload = photos.filter(p => batch.includes(p.id));
      
      // Upload concurrently
      await Promise.all(photosToUpload.map(processAndUpload));
    }
    
    isUploadingRef.current = false;
  }, [photos, processAndUpload]);

  /**
   * Add photos from picker results
   */
  const addPhotos = useCallback(async (pickerResults: PhotoPickerResult[]) => {
    const slotsAvailable = maxPhotos - photos.length;
    
    if (slotsAvailable <= 0) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only add up to ${maxPhotos} photos per card.`
      );
      return;
    }
    
    // Limit to available slots
    const resultsToAdd = pickerResults.slice(0, slotsAvailable);
    
    if (resultsToAdd.length < pickerResults.length) {
      Alert.alert(
        'Some Photos Skipped',
        `Only ${resultsToAdd.length} of ${pickerResults.length} photos were added due to the ${maxPhotos} photo limit.`
      );
    }
    
    // Create photo objects
    const newPhotos: Photo[] = resultsToAdd.map(result => ({
      id: generateUUID(),
      localUri: result.uri,
      uploadStatus: 'pending',
      createdAt: new Date().toISOString(),
      filename: result.fileName,
      fileSize: result.fileSize,
      mimeType: getMimeType(result.uri),
    }));
    
    // Add to state
    setPhotosState(prev => [...prev, ...newPhotos]);
    
    // Add to upload queue
    uploadQueueRef.current.push(...newPhotos.map(p => p.id));
    
    // Start processing
    processQueue();
  }, [photos.length, maxPhotos, processQueue]);

  /**
   * Add a single photo from URI
   */
  const addPhotoFromUri = useCallback(async (uri: string) => {
    await addPhotos([{ uri, width: 0, height: 0 }]);
  }, [addPhotos]);

  /**
   * Remove a photo by ID
   */
  const removePhoto = useCallback((photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) return;
    
    // If photo was already uploaded, mark for deletion
    if (photo.storagePath && photo.uploadStatus === 'success') {
      setPhotosToDelete(prev => [...prev, photo.storagePath!]);
    }
    
    // Remove from upload queue if pending
    uploadQueueRef.current = uploadQueueRef.current.filter(id => id !== photoId);
    
    // Remove from state
    setPhotosState(prev => prev.filter(p => p.id !== photoId));
  }, [photos]);

  /**
   * Retry failed uploads
   */
  const retryFailedUploads = useCallback(async () => {
    const failedPhotos = photos.filter(p => p.uploadStatus === 'error');
    
    if (failedPhotos.length === 0) return;
    
    // Reset status to pending
    failedPhotos.forEach(photo => {
      updatePhoto(photo.id, {
        uploadStatus: 'pending',
        uploadProgress: 0,
        errorMessage: undefined,
      });
    });
    
    // Add to queue
    uploadQueueRef.current.push(...failedPhotos.map(p => p.id));
    
    // Process
    processQueue();
  }, [photos, updatePhoto, processQueue]);

  /**
   * Clear all photos
   */
  const clearAll = useCallback(() => {
    // Mark all uploaded photos for deletion
    const uploadedPaths = photos
      .filter(p => p.storagePath && p.uploadStatus === 'success')
      .map(p => p.storagePath!);
    
    setPhotosToDelete(prev => [...prev, ...uploadedPaths]);
    
    // Clear queue
    uploadQueueRef.current = [];
    
    // Clear state
    setPhotosState([]);
  }, [photos]);

  /**
   * Commit deletions to storage
   */
  const commitDeletions = useCallback(async () => {
    if (photosToDelete.length === 0) return;
    
    const errors: string[] = [];
    
    for (const path of photosToDelete) {
      try {
        await deletePhoto(path);
      } catch (error) {
        console.error(`Failed to delete ${path}:`, error);
        errors.push(path);
      }
    }
    
    // Keep failed deletions for retry
    setPhotosToDelete(errors);
    
    if (errors.length > 0) {
      console.warn(`${errors.length} photos failed to delete from storage`);
    }
  }, [photosToDelete]);

  /**
   * Open camera and add photo
   */
  const openCamera = useCallback(async () => {
    if (!canAddMore) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only add up to ${maxPhotos} photos per card.`
      );
      return;
    }
    
    const result = await pickFromCamera();
    if (result) {
      await addPhotos([result]);
    }
  }, [canAddMore, maxPhotos, pickFromCamera, addPhotos]);

  /**
   * Open gallery and add photos
   */
  const openGallery = useCallback(async () => {
    if (!canAddMore) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only add up to ${maxPhotos} photos per card.`
      );
      return;
    }
    
    const results = await pickFromGallery(remainingSlots > 1);
    if (results && results.length > 0) {
      await addPhotos(results);
    }
  }, [canAddMore, maxPhotos, remainingSlots, pickFromGallery, addPhotos]);

  // Calculate overall progress
  useEffect(() => {
    const uploadingPhotos = photos.filter(
      p => p.uploadStatus === 'uploading' || p.uploadStatus === 'pending'
    );
    
    if (uploadingPhotos.length === 0) {
      setUploadProgress(100);
      return;
    }
    
    const totalProgress = photos.reduce((sum, p) => {
      if (p.uploadStatus === 'success') return sum + 100;
      if (p.uploadStatus === 'uploading') return sum + (p.uploadProgress || 0);
      return sum;
    }, 0);
    
    setUploadProgress(Math.round(totalProgress / photos.length));
  }, [photos]);

  return {
    photos,
    isUploading,
    uploadProgress,
    addPhotos,
    addPhotoFromUri,
    removePhoto,
    retryFailedUploads,
    clearAll,
    openCamera,
    openGallery,
    photosToDelete,
    commitDeletions,
    canAddMore,
    remainingSlots,
    setPhotos,
  };
}

/**
 * Convert URL array to Photo objects (for loading existing card photos)
 */
export function urlsToPhotos(urls: string[]): Photo[] {
  return urls.map(url => ({
    id: generateUUID(),
    localUri: url, // Use URL as local URI for display
    remoteUrl: url,
    storagePath: extractPathFromUrl(url) || undefined,
    uploadStatus: 'success' as const,
    uploadProgress: 100,
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Convert Photo objects to URL array (for saving card)
 */
export function photosToUrls(photos: Photo[]): string[] {
  return photos
    .filter(p => p.uploadStatus === 'success' && p.remoteUrl)
    .map(p => p.remoteUrl!);
}

export default usePhotoUpload;
