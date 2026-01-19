// src/utils/constants.ts
// Configuration constants for photo upload

import { PhotoConfig } from '../types/photo';

/**
 * Photo upload configuration
 */
export const PHOTO_CONFIG: PhotoConfig = {
  /** Maximum number of photos per preference card */
  maxPhotosPerCard: 10,
  
  /** Maximum file size in megabytes before compression */
  maxFileSizeMB: 5,
  
  /** JPEG compression quality (0-1) */
  compressionQuality: 0.8,
  
  /** Target width for resized images */
  targetWidth: 1200,
  
  /** Target height for resized images */
  targetHeight: 1200,
  
  /** Allowed MIME types for upload */
  allowedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  
  /** Maximum concurrent uploads */
  concurrentUploads: 2,
  
  /** Supabase storage bucket name */
  storageBucket: 'card-photos',
  
  /** Thumbnail size in pixels */
  thumbnailSize: 200,
};

/**
 * Retry configuration for failed uploads
 */
export const UPLOAD_RETRY_CONFIG = {
  /** Maximum retry attempts */
  maxRetries: 3,
  
  /** Base delay between retries in ms */
  baseDelay: 1000,
  
  /** Multiplier for exponential backoff */
  backoffMultiplier: 2,
};

/**
 * Image picker configuration
 */
export const IMAGE_PICKER_CONFIG = {
  /** Allow editing in picker */
  allowsEditing: false,
  
  /** Aspect ratio (1:1 for square) */
  aspect: [4, 3] as [number, number],
  
  /** Quality (0-1) */
  quality: 0.8,
  
  /** Media type */
  mediaTypes: 'images' as const,
  
  /** Allow multiple selection from gallery */
  allowsMultipleSelection: true,
  
  /** Maximum selection count */
  selectionLimit: 10,
};

/**
 * UI configuration for photo components
 */
export const PHOTO_UI_CONFIG = {
  /** Number of columns in photo grid */
  gridColumns: 3,
  
  /** Spacing between grid items */
  gridSpacing: 8,
  
  /** Delete button size */
  deleteButtonSize: 24,
  
  /** Progress indicator size */
  progressSize: 40,
  
  /** Animation duration in ms */
  animationDuration: 200,
};
