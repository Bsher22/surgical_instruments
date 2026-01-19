import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'instrument_bookmarks';

interface UseBookmarksReturn {
  bookmarks: Set<string>;
  isBookmarked: (instrumentId: string) => boolean;
  toggleBookmark: (instrumentId: string) => Promise<void>;
  isLoading: boolean;
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks from storage on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          setBookmarks(new Set(parsed));
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  // Check if an instrument is bookmarked
  const isBookmarked = useCallback(
    (instrumentId: string): boolean => {
      return bookmarks.has(instrumentId);
    },
    [bookmarks]
  );

  // Toggle bookmark status
  const toggleBookmark = useCallback(
    async (instrumentId: string): Promise<void> => {
      try {
        const newBookmarks = new Set(bookmarks);
        
        if (newBookmarks.has(instrumentId)) {
          newBookmarks.delete(instrumentId);
        } else {
          newBookmarks.add(instrumentId);
        }

        // Save to storage
        await AsyncStorage.setItem(
          BOOKMARKS_KEY,
          JSON.stringify(Array.from(newBookmarks))
        );

        setBookmarks(newBookmarks);
      } catch (error) {
        console.error('Failed to toggle bookmark:', error);
        throw error;
      }
    },
    [bookmarks]
  );

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    isLoading,
  };
}

// Hook for a single instrument's bookmark status
export function useInstrumentBookmark(instrumentId: string) {
  const { isBookmarked, toggleBookmark, isLoading } = useBookmarks();

  return {
    isBookmarked: isBookmarked(instrumentId),
    toggle: () => toggleBookmark(instrumentId),
    isLoading,
  };
}
