// src/utils/imageUtils.ts
// Image processing utilities for photo upload

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { PHOTO_CONFIG } from './constants';

/**
 * Compress and resize an image
 * @param uri - Local URI of the image
 * @param options - Compression options
 * @returns Processed image URI and dimensions
 */
export async function compressImage(
  uri: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  const maxWidth = options?.maxWidth ?? PHOTO_CONFIG.TARGET_WIDTH;
  const maxHeight = options?.maxHeight ?? PHOTO_CONFIG.TARGET_HEIGHT;
  const quality = options?.quality ?? PHOTO_CONFIG.COMPRESSION_QUALITY;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original URI if compression fails
    return {
      uri,
      width: maxWidth,
      height: maxHeight,
    };
  }
}

/**
 * Get the file size of an image
 * @param uri - Local URI of the image
 * @returns File size in bytes
 */
export async function getImageFileSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}

/**
 * Check if image file size exceeds the maximum allowed
 * @param uri - Local URI of the image
 * @param maxSizeMB - Maximum size in megabytes
 * @returns true if file is too large
 */
export async function isImageTooLarge(
  uri: string,
  maxSizeMB: number = PHOTO_CONFIG.MAX_FILE_SIZE_MB
): Promise<boolean> {
  const fileSize = await getImageFileSize(uri);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize > maxSizeBytes;
}

/**
 * Convert a local image URI to a Blob for upload
 * @param uri - Local URI of the image
 * @returns Blob object
 */
export async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

/**
 * Get image dimensions from URI
 * @param uri - Local URI of the image
 * @returns Width and height of the image
 */
export function getImageDimensions(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // For React Native, we can use Image.getSize
    // But since we're using expo-image-manipulator anyway,
    // we'll get dimensions from there
    ImageManipulator.manipulateAsync(uri, [], {})
      .then((result) => {
        resolve({
          width: result.width,
          height: result.height,
        });
      })
      .catch(reject);
  });
}

/**
 * Create a thumbnail from an image
 * @param uri - Local URI of the image
 * @param size - Thumbnail size (width and height)
 * @returns Thumbnail URI
 */
export async function createThumbnail(
  uri: string,
  size: number = PHOTO_CONFIG.THUMBNAIL_SIZE
): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: size,
            height: size,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return uri;
  }
}

/**
 * Validate image format
 * @param uri - Local URI or filename
 * @param mimeType - MIME type if available
 * @returns true if format is valid
 */
export function isValidImageFormat(
  uri: string,
  mimeType?: string
): boolean {
  const allowedTypes = PHOTO_CONFIG.ALLOWED_TYPES;
  
  // Check MIME type if provided
  if (mimeType) {
    return allowedTypes.includes(mimeType.toLowerCase());
  }
  
  // Fall back to extension check
  const extension = uri.split('.').pop()?.toLowerCase();
  const extensionToMime: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    heic: 'image/heic',
    heif: 'image/heic',
  };
  
  const derivedMime = extensionToMime[extension || ''];
  return derivedMime ? allowedTypes.includes(derivedMime) : false;
}

/**
 * Read image as base64 string
 * @param uri - Local URI of the image
 * @returns Base64 encoded string
 */
export async function readImageAsBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error reading image as base64:', error);
    throw error;
  }
}

/**
 * Delete a local image file
 * @param uri - Local URI of the image
 */
export async function deleteLocalImage(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting local image:', error);
    // Don't throw - deletion failure shouldn't break the app
  }
}

/**
 * Copy image to app's cache directory
 * @param uri - Original URI
 * @param filename - Desired filename
 * @returns New URI in cache directory
 */
export async function copyToCache(
  uri: string,
  filename: string
): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache directory not available');
  }
  
  const destUri = `${cacheDir}${filename}`;
  
  try {
    await FileSystem.copyAsync({
      from: uri,
      to: destUri,
    });
    return destUri;
  } catch (error) {
    console.error('Error copying to cache:', error);
    throw error;
  }
}
