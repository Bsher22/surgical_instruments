// src/types/photo.ts
// Photo-related TypeScript types for Stage 5D

/**
 * Upload status for a photo
 */
export type PhotoUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * Photo object representing a setup photo for a preference card
 */
export interface Photo {
  /** Unique identifier (UUID) */
  id: string;
  /** Local file URI for display before/during upload */
  localUri: string;
  /** Supabase public URL after successful upload */
  remoteUrl?: string;
  /** Path in Supabase storage bucket */
  storagePath?: string;
  /** Current upload status */
  uploadStatus: PhotoUploadStatus;
  /** Upload progress percentage (0-100) */
  uploadProgress?: number;
  /** Error message if upload failed */
  errorMessage?: string;
  /** ISO timestamp when photo was added */
  createdAt: string;
  /** Original filename */
  filename?: string;
  /** File size in bytes */
  fileSize?: number;
  /** MIME type */
  mimeType?: string;
}

/**
 * Result from image picker
 */
export interface PhotoPickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
  base64?: string;
}

/**
 * Photo upload options
 */
export interface PhotoUploadOptions {
  /** Card ID for organizing storage path */
  cardId?: string;
  /** User ID for organizing storage path */
  userId?: string;
  /** Whether to compress the image */
  compress?: boolean;
  /** Compression quality (0-1) */
  quality?: number;
  /** Maximum width after resize */
  maxWidth?: number;
  /** Maximum height after resize */
  maxHeight?: number;
  /** Progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * Upload result from storage API
 */
export interface PhotoUploadResult {
  /** Public URL of uploaded photo */
  url: string;
  /** Storage path of uploaded photo */
  path: string;
  /** File size in bytes */
  size: number;
}

/**
 * Photo upload queue item
 */
export interface PhotoUploadQueueItem {
  photo: Photo;
  file: Blob;
  path: string;
  retryCount: number;
}

/**
 * Photo upload state for the upload hook
 */
export interface PhotoUploadState {
  /** All photos (pending, uploading, success, error) */
  photos: Photo[];
  /** Currently uploading photos */
  uploadQueue: PhotoUploadQueueItem[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Overall upload progress (0-100) */
  overallProgress: number;
  /** Photos marked for deletion */
  photosToDelete: string[];
}

/**
 * Configuration for photo uploads
 */
export interface PhotoConfig {
  maxPhotosPerCard: number;
  maxFileSizeMB: number;
  compressionQuality: number;
  targetWidth: number;
  targetHeight: number;
  allowedTypes: string[];
  concurrentUploads: number;
  storageBucket: string;
  thumbnailSize: number;
}
