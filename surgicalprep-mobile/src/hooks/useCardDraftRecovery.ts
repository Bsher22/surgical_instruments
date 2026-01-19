/**
 * Card Draft Recovery Hook
 * 
 * Checks for existing drafts on mount and prompts the user
 * to restore or discard them.
 */

import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCardFormStore } from '../stores/cardFormStore';
import { CardDraft } from '../types/cardForm';
import { getDraftKey, getDraftKeyPattern } from '../utils/cardFormUtils';

/**
 * Current draft version - must match cardFormStore
 */
const CURRENT_DRAFT_VERSION = 1;

/**
 * Maximum age for drafts in milliseconds (7 days)
 */
const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Options for the draft recovery hook
 */
interface UseCardDraftRecoveryOptions {
  /** Card ID if editing, undefined if new */
  cardId?: string;
  /** Whether to automatically check for drafts (default: true) */
  autoCheck?: boolean;
  /** Callback when draft is restored */
  onRestore?: (draft: CardDraft) => void;
  /** Callback when draft is discarded */
  onDiscard?: () => void;
  /** Callback when no draft is found */
  onNoDraft?: () => void;
  /** Custom dialog title */
  title?: string;
  /** Custom dialog message */
  message?: string;
}

/**
 * Default dialog text
 */
const DEFAULT_TITLE = 'Restore Draft?';
const DEFAULT_MESSAGE = 'You have an unsaved draft from a previous session. Would you like to restore it?';

/**
 * Result of checking for a draft
 */
interface DraftCheckResult {
  /** Whether a draft was found */
  found: boolean;
  /** The draft if found */
  draft?: CardDraft;
  /** Whether the draft is stale (old version or expired) */
  isStale?: boolean;
}

/**
 * Hook that checks for and recovers saved drafts
 * 
 * Features:
 * - Checks for drafts on mount
 * - Prompts user to restore or discard
 * - Handles stale/expired drafts
 * - Cleans up old drafts
 * 
 * @example
 * ```tsx
 * function CardEditScreen({ cardId }: { cardId?: string }) {
 *   const { isChecking, hasDraft, restoreDraft, discardDraft } = useCardDraftRecovery({
 *     cardId,
 *     onRestore: (draft) => console.log('Restored:', draft.metadata.cardTitle),
 *     onNoDraft: () => console.log('Starting fresh'),
 *   });
 * 
 *   if (isChecking) {
 *     return <LoadingSpinner />;
 *   }
 * 
 *   return <CardForm />;
 * }
 * ```
 */
export function useCardDraftRecovery(options: UseCardDraftRecoveryOptions = {}) {
  const {
    cardId,
    autoCheck = true,
    onRestore,
    onDiscard,
    onNoDraft,
    title = DEFAULT_TITLE,
    message = DEFAULT_MESSAGE,
  } = options;

  const [isChecking, setIsChecking] = useState(autoCheck);
  const [hasDraft, setHasDraft] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<CardDraft | null>(null);

  const initializeFromDraft = useCardFormStore(
    (state) => state.initializeFromDraft
  );
  const initializeNewCard = useCardFormStore(
    (state) => state.initializeNewCard
  );
  const initializeFromCard = useCardFormStore(
    (state) => state.initializeFromCard
  );

  /**
   * Check if a draft exists for the given card ID
   */
  const checkForDraft = useCallback(async (): Promise<DraftCheckResult> => {
    try {
      const draftKey = getDraftKey(cardId);
      const draftJson = await AsyncStorage.getItem(draftKey);

      if (!draftJson) {
        return { found: false };
      }

      const draft: CardDraft = JSON.parse(draftJson);

      // Check if draft is stale (old version)
      if (draft.metadata.version !== CURRENT_DRAFT_VERSION) {
        return { found: true, draft, isStale: true };
      }

      // Check if draft is expired
      const savedAt = new Date(draft.metadata.savedAt);
      const age = Date.now() - savedAt.getTime();
      if (age > MAX_DRAFT_AGE_MS) {
        return { found: true, draft, isStale: true };
      }

      return { found: true, draft, isStale: false };
    } catch (error) {
      console.error('Failed to check for draft:', error);
      return { found: false };
    }
  }, [cardId]);

  /**
   * Restore a draft
   */
  const restoreDraft = useCallback(
    async (draft: CardDraft) => {
      await initializeFromDraft(draft);
      setHasDraft(false);
      setCurrentDraft(null);
      onRestore?.(draft);
    },
    [initializeFromDraft, onRestore]
  );

  /**
   * Discard a draft
   */
  const discardDraft = useCallback(async () => {
    try {
      const draftKey = getDraftKey(cardId);
      await AsyncStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Failed to discard draft:', error);
    }
    setHasDraft(false);
    setCurrentDraft(null);
    onDiscard?.();
  }, [cardId, onDiscard]);

  /**
   * Show the restore/discard dialog
   */
  const showRecoveryDialog = useCallback(
    (draft: CardDraft) => {
      const savedDate = new Date(draft.metadata.savedAt);
      const formattedDate = savedDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const cardTitle = draft.metadata.cardTitle || 'Untitled Card';
      const customMessage = `${message}\n\n"${cardTitle}"\nSaved: ${formattedDate}`;

      Alert.alert(
        title,
        customMessage,
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              discardDraft();
            },
          },
          {
            text: 'Restore',
            style: 'default',
            onPress: () => {
              restoreDraft(draft);
            },
          },
        ],
        { cancelable: false }
      );
    },
    [title, message, discardDraft, restoreDraft]
  );

  /**
   * Effect to check for drafts on mount
   */
  useEffect(() => {
    if (!autoCheck) return;

    const checkDraft = async () => {
      setIsChecking(true);

      const result = await checkForDraft();

      if (result.found && result.draft) {
        if (result.isStale) {
          // Auto-discard stale drafts
          await discardDraft();
          onNoDraft?.();
        } else {
          setHasDraft(true);
          setCurrentDraft(result.draft);
          showRecoveryDialog(result.draft);
        }
      } else {
        onNoDraft?.();
      }

      setIsChecking(false);
    };

    checkDraft();
  }, [autoCheck, checkForDraft, discardDraft, showRecoveryDialog, onNoDraft]);

  return {
    /** Whether we're currently checking for drafts */
    isChecking,
    /** Whether a draft was found */
    hasDraft,
    /** The current draft (if found) */
    currentDraft,
    /** Manually check for a draft */
    checkForDraft,
    /** Restore the current draft */
    restoreDraft: currentDraft
      ? () => restoreDraft(currentDraft)
      : undefined,
    /** Discard the current draft */
    discardDraft,
    /** Show the recovery dialog for the current draft */
    showRecoveryDialog: currentDraft
      ? () => showRecoveryDialog(currentDraft)
      : undefined,
  };
}

/**
 * Utility to clean up all stale drafts
 * Can be called on app startup
 */
export async function cleanupStaleDrafts(): Promise<number> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const draftKeys = allKeys.filter((key) =>
      key.startsWith(getDraftKeyPattern())
    );

    let cleanedCount = 0;

    for (const key of draftKeys) {
      try {
        const draftJson = await AsyncStorage.getItem(key);
        if (!draftJson) continue;

        const draft: CardDraft = JSON.parse(draftJson);

        // Check version
        if (draft.metadata.version !== CURRENT_DRAFT_VERSION) {
          await AsyncStorage.removeItem(key);
          cleanedCount++;
          continue;
        }

        // Check age
        const savedAt = new Date(draft.metadata.savedAt);
        const age = Date.now() - savedAt.getTime();
        if (age > MAX_DRAFT_AGE_MS) {
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      } catch {
        // If we can't parse it, remove it
        await AsyncStorage.removeItem(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Failed to cleanup stale drafts:', error);
    return 0;
  }
}

/**
 * Get a list of all saved drafts (for debugging or management UI)
 */
export async function getAllDrafts(): Promise<CardDraft[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const draftKeys = allKeys.filter((key) =>
      key.startsWith(getDraftKeyPattern())
    );

    const drafts: CardDraft[] = [];

    for (const key of draftKeys) {
      try {
        const draftJson = await AsyncStorage.getItem(key);
        if (draftJson) {
          drafts.push(JSON.parse(draftJson));
        }
      } catch {
        // Skip invalid drafts
      }
    }

    // Sort by saved date, newest first
    drafts.sort((a, b) => 
      new Date(b.metadata.savedAt).getTime() - 
      new Date(a.metadata.savedAt).getTime()
    );

    return drafts;
  } catch (error) {
    console.error('Failed to get all drafts:', error);
    return [];
  }
}
