// src/api/storage.ts
// Storage API client - uploads via backend to Cloudflare R2

import { apiClient } from './client';
import { PHOTO_CONFIG } from '../utils/constants';
import { PhotoUploadResult } from '../types/photo';

/**
 * Upload a photo via the backend API
 * @param uri - Local URI of the file
 * @param folder - Storage folder ('cards', 'instruments', 'profiles')
 * @param onProgress - Optional progress callback (0-100)
 * @returns Upload result with public URL and key
 */
export async function uploadPhoto(
  uri: string,
  folder: string = 'cards',
  onProgress?: (progress: number) => void
): Promise<PhotoUploadResult> {
  try {
    onProgress?.(10);

    // Fetch the file as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: blob.type || 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    onProgress?.(30);

    // Upload via backend API
    const result = await apiClient.post<{
      key: string;
      url: string;
      size: number;
    }>(`/storage/upload?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            30 + (progressEvent.loaded / progressEvent.total) * 60
          );
          onProgress?.(progress);
        }
      },
    });

    onProgress?.(100);

    return {
      url: result.data.url,
      path: result.data.key,
      size: result.data.size,
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}

/**
 * Upload a photo using presigned URL (direct to R2)
 * More efficient for large files as it bypasses the API server
 * @param uri - Local URI of the file
 * @param folder - Storage folder
 * @param mimeType - MIME type of the file
 * @param onProgress - Progress callback (0-100)
 * @returns Upload result
 */
export async function uploadPhotoWithProgress(
  uri: string,
  folder: string = 'cards',
  mimeType: string = 'image/jpeg',
  onProgress?: (progress: number) => void
): Promise<PhotoUploadResult> {
  try {
    onProgress?.(5);

    // Get presigned URL from backend
    const presignedResponse = await apiClient.post<{
      upload_url: string;
      key: string;
      public_url: string;
    }>('/storage/presigned-upload', null, {
      params: {
        filename: 'photo.jpg',
        folder,
        content_type: mimeType,
      },
    });

    const { upload_url, key, public_url } = presignedResponse.data;

    onProgress?.(15);

    // Fetch the file as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    onProgress?.(25);

    // Upload directly to R2 using presigned URL
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round(25 + (event.loaded / event.total) * 70);
          onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', upload_url);
      xhr.setRequestHeader('Content-Type', mimeType);
      xhr.send(blob);
    });

    onProgress?.(100);

    return {
      url: public_url,
      path: key,
      size: blob.size,
    };
  } catch (error) {
    console.error('Presigned upload error:', error);
    throw error;
  }
}

/**
 * Delete a photo from storage
 * @param path - Storage key of the photo to delete
 */
export async function deletePhoto(path: string): Promise<void> {
  try {
    await apiClient.delete('/storage/delete', {
      params: { key: path },
    });
  } catch (error) {
    console.error('Storage delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple photos from storage
 * @param paths - Array of storage keys to delete
 */
export async function deletePhotos(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  // Delete photos in parallel
  await Promise.all(paths.map((path) => deletePhoto(path)));
}

/**
 * Get the public URL for a stored photo
 * @param path - Storage key
 * @returns Public URL string
 */
export function getPhotoUrl(path: string): string {
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }

  // Otherwise construct from API URL (fallback)
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  return `${apiUrl}/storage/file/${path}`;
}

/**
 * Upload multiple photos with overall progress tracking
 * @param uris - Array of file URIs
 * @param folder - Storage folder
 * @param onProgress - Progress callback (completed count, total count)
 * @returns Array of upload results
 */
export async function uploadPhotos(
  uris: string[],
  folder: string = 'cards',
  onProgress?: (completed: number, total: number) => void
): Promise<PhotoUploadResult[]> {
  const results: PhotoUploadResult[] = [];
  let completed = 0;

  // Upload with concurrency control
  const batchSize = PHOTO_CONFIG?.concurrentUploads || 2;

  for (let i = 0; i < uris.length; i += batchSize) {
    const batch = uris.slice(i, i + batchSize);

    const batchPromises = batch.map(async (uri) => {
      const result = await uploadPhoto(uri, folder);
      completed++;
      onProgress?.(completed, uris.length);
      return result;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Check if a photo exists in storage
 * @param path - Storage key to check
 * @returns true if photo exists
 */
export async function photoExists(path: string): Promise<boolean> {
  try {
    const files = await listCardPhotos('', '');
    return files.some((file) => file === path);
  } catch {
    return false;
  }
}

/**
 * List all photos in a folder
 * @param folder - Storage folder
 * @returns Array of photo keys
 */
export async function listCardPhotos(
  userId: string,
  cardId: string
): Promise<string[]> {
  try {
    const response = await apiClient.get<
      Array<{
        key: string;
        url: string;
        size: number;
        last_modified: string;
      }>
    >('/storage/list', {
      params: { folder: 'cards' },
    });

    return response.data.map((file) => file.key);
  } catch (error) {
    console.error('Storage list error:', error);
    return [];
  }
}
