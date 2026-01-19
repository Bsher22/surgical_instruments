// src/components/photos/PhotoPreviewGrid.tsx
// Grid display of photo thumbnails

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
} from 'react-native';
import { Photo } from '../../types/photo';
import { PhotoPreviewItem } from './PhotoPreviewItem';
import { PHOTO_UI_CONFIG } from '../../utils/constants';

interface PhotoPreviewGridProps {
  /** Photos to display */
  photos: Photo[];
  /** Called when delete button is pressed on a photo */
  onDelete: (photoId: string) => void;
  /** Called when a photo is pressed (optional, for full-screen view) */
  onPhotoPress?: (photo: Photo) => void;
  /** Number of columns in the grid */
  columns?: number;
  /** Spacing between items */
  spacing?: number;
  /** Disable all interactions */
  disabled?: boolean;
  /** Horizontal padding for the container */
  horizontalPadding?: number;
  /** Show empty state when no photos */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
}

/**
 * Grid layout for photo thumbnails
 */
export function PhotoPreviewGrid({
  photos,
  onDelete,
  onPhotoPress,
  columns = PHOTO_UI_CONFIG.gridColumns,
  spacing = PHOTO_UI_CONFIG.gridSpacing,
  disabled = false,
  horizontalPadding = 16,
  showEmptyState = false,
  emptyStateMessage = 'No photos added yet',
}: PhotoPreviewGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  
  // Calculate item size based on available width
  const availableWidth = screenWidth - (horizontalPadding * 2);
  const totalSpacing = spacing * (columns - 1);
  const itemSize = Math.floor((availableWidth - totalSpacing) / columns);
  
  const handleDelete = useCallback((photoId: string) => {
    onDelete(photoId);
  }, [onDelete]);
  
  const handlePress = useCallback((photo: Photo) => {
    onPhotoPress?.(photo);
  }, [onPhotoPress]);
  
  // Group photos into rows
  const rows: Photo[][] = [];
  for (let i = 0; i < photos.length; i += columns) {
    rows.push(photos.slice(i, i + columns));
  }
  
  if (photos.length === 0) {
    if (!showEmptyState) return null;
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[
            styles.row,
            { marginBottom: rowIndex < rows.length - 1 ? spacing : 0 },
          ]}
        >
          {row.map((photo, itemIndex) => (
            <View
              key={photo.id}
              style={{
                marginRight: itemIndex < row.length - 1 ? spacing : 0,
              }}
            >
              <PhotoPreviewItem
                photo={photo}
                size={itemSize}
                onDelete={() => handleDelete(photo.id)}
                onPress={onPhotoPress ? () => handlePress(photo) : undefined}
                disabled={disabled}
              />
            </View>
          ))}
          
          {/* Fill empty slots in last row for alignment */}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, i) => (
              <View
                key={`placeholder-${i}`}
                style={{
                  width: itemSize,
                  height: itemSize,
                  marginRight: i < columns - row.length - 1 ? spacing : 0,
                }}
              />
            ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Get photo status summary for display
 */
export function getPhotoStatusSummary(photos: Photo[]): {
  total: number;
  uploading: number;
  success: number;
  error: number;
  pending: number;
} {
  return photos.reduce(
    (acc, photo) => {
      acc.total++;
      switch (photo.uploadStatus) {
        case 'uploading':
          acc.uploading++;
          break;
        case 'success':
          acc.success++;
          break;
        case 'error':
          acc.error++;
          break;
        case 'pending':
          acc.pending++;
          break;
      }
      return acc;
    },
    { total: 0, uploading: 0, success: 0, error: 0, pending: 0 }
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default PhotoPreviewGrid;
