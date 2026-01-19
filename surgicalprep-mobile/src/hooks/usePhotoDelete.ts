// src/hooks/usePhotoDelete.ts
// Hook for handling photo deletion with confirmation

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Photo } from '../types/photo';
import { deletePhoto, deletePhotos } from '../api/storage';

interface UsePhotoDeleteOptions {
  /** Callback when photo is deleted */
  onDelete?: (photoId: string) => void;
  /** Callback when deletion fails */
  onError?: (photoId: string, error: Error) => void;
  /** Whether to show confirmation dialog */
  confirmDelete?: boolean;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
}

interface UsePhotoDeleteReturn {
  /** Delete a single photo */
  deletePhotoById: (photo: Photo) => void;
  /** Delete a single photo without confirmation */
  deletePhotoImmediate: (photo: Photo) => Promise<void>;
  /** Delete multiple photos from storage */
  deleteFromStorage: (paths: string[]) => Promise<void>;
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Current error if any */
  error: Error | null;
}

/**
 * Hook for handling photo deletion
 */
export function usePhotoDelete(options: UsePhotoDeleteOptions = {}): UsePhotoDeleteReturn {
  const {
    onDelete,
    onError,
    confirmDelete = true,
    hapticFeedback = true,
  } = options;

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = useCallback(async () => {
    if (hapticFeedback) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Haptics not available
      }
    }
  }, [hapticFeedback]);

  /**
   * Delete a photo immediately without confirmation
   */
  const deletePhotoImmediate = useCallback(async (photo: Photo) => {
    setIsDeleting(true);
    setError(null);
    
    await triggerHaptic();
    
    try {
      // Delete from storage if uploaded
      if (photo.storagePath && photo.uploadStatus === 'success') {
        await deletePhoto(photo.storagePath);
      }
      
      // Notify parent
      onDelete?.(photo.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Delete failed');
      setError(error);
      onError?.(photo.id, error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, onError, triggerHaptic]);

  /**
   * Delete a photo with optional confirmation
   */
  const deletePhotoById = useCallback((photo: Photo) => {
    if (!confirmDelete) {
      deletePhotoImmediate(photo);
      return;
    }
    
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // For UI responsiveness, notify parent immediately
            // Storage deletion will happen on save
            triggerHaptic();
            onDelete?.(photo.id);
          },
        },
      ]
    );
  }, [confirmDelete, deletePhotoImmediate, onDelete, triggerHaptic]);

  /**
   * Delete multiple photos from storage (batch operation)
   */
  const deleteFromStorage = useCallback(async (paths: string[]) => {
    if (paths.length === 0) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deletePhotos(paths);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bulk delete failed');
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deletePhotoById,
    deletePhotoImmediate,
    deleteFromStorage,
    isDeleting,
    error,
  };
}

export default usePhotoDelete;
