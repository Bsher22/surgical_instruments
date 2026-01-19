// src/utils/fileUtils.ts
// File handling utilities for photo upload

import * as FileSystem from 'expo-file-system';
import { PHOTO_CONFIG } from './constants';

/**
 * Generate a unique filename for uploaded photos
 * @param extension - File extension (e.g., 'jpg', 'png')
 * @returns Unique filename with timestamp and UUID
 */
export function generateUniqueFilename(extension: string = 'jpg'): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `photo_${timestamp}_${randomPart}.${extension}`;
}

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get MIME type from file extension
 * @param filename - Filename or URI with extension
 * @returns MIME type string
 */
export function getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heic',
    webp: 'image/webp',
  };
  
  return mimeTypes[extension || ''] || 'image/jpeg';
}

/**
 * Get file extension from MIME type
 * @param mimeType - MIME type string
 * @returns File extension without dot
 */
export function getExtensionFromMime(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heic',
    'image/webp': 'webp',
  };
  
  return extensions[mimeType.toLowerCase()] || 'jpg';
}

/**
 * Generate storage path for a photo
 * @param options - Path options
 * @returns Storage path string
 */
export function generateStoragePath(options: {
  userId?: string;
  cardId?: string;
  filename: string;
}): string {
  const { userId, cardId, filename } = options;
  
  // Build path: cards/{userId}/{cardId}/{filename}
  // or: cards/{userId}/{filename} if no cardId
  // or: cards/anonymous/{filename} if no userId
  
  const parts = ['cards'];
  
  if (userId) {
    parts.push(userId);
  } else {
    parts.push('anonymous');
  }
  
  if (cardId) {
    parts.push(cardId);
  }
  
  parts.push(filename);
  
  return parts.join('/');
}

/**
 * Extract storage path from a Supabase public URL
 * @param url - Public URL
 * @returns Storage path or null if invalid
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    // Supabase public URLs look like:
    // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const regex = /\/storage\/v1\/object\/public\/[^/]+\/(.+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if a URL is a valid Supabase storage URL
 * @param url - URL to check
 * @returns true if valid Supabase URL
 */
export function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage/');
}

/**
 * Check if a URI is a local file
 * @param uri - URI to check
 * @returns true if local file
 */
export function isLocalUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith(FileSystem.cacheDirectory || '') ||
    uri.startsWith(FileSystem.documentDirectory || '')
  );
}

/**
 * Sanitize a filename for safe storage
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove special characters, keep alphanumeric, dots, dashes, underscores
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Get the filename from a URI or path
 * @param uri - URI or path
 * @returns Filename with extension
 */
export function getFilenameFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] || generateUniqueFilename();
}

/**
 * Validate that a file doesn't exceed size limit
 * @param sizeBytes - File size in bytes
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns true if within limit
 */
export function isFileSizeValid(
  sizeBytes: number,
  maxSizeMB: number = PHOTO_CONFIG.MAX_FILE_SIZE_MB
): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes <= maxBytes;
}
