// src/components/photos/index.ts
// Barrel exports for photo components

export { PhotoUploader, urlsToPhotos, photosToUrls } from './PhotoUploader';
export { PhotoPreviewGrid, getPhotoStatusSummary } from './PhotoPreviewGrid';
export { PhotoPreviewItem } from './PhotoPreviewItem';
export { PhotoSourceModal } from './PhotoSourceModal';

// Re-export types for convenience
export type {
  Photo,
  PhotoUploadStatus,
  PhotoPickerResult,
  PhotoUploadOptions,
  PhotoUploadResult,
  PhotoConfig,
} from '../../types/photo';
