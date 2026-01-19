// src/stores/toastStore.ts
// Centralized toast notification state management

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissible?: boolean;
}

export interface ToastInput {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissible?: boolean;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: ToastInput) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Default durations by type (in milliseconds)
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

// Maximum number of toasts visible at once
const MAX_VISIBLE_TOASTS = 3;

// Generate unique ID
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (input: ToastInput): string => {
    const id = generateId();
    const duration = input.duration ?? DEFAULT_DURATIONS[input.type];
    const dismissible = input.dismissible ?? true;

    const toast: Toast = {
      id,
      ...input,
      duration,
      dismissible,
    };

    set((state) => {
      // Remove oldest toasts if we exceed the limit
      let updatedToasts = [...state.toasts, toast];
      if (updatedToasts.length > MAX_VISIBLE_TOASTS) {
        updatedToasts = updatedToasts.slice(-MAX_VISIBLE_TOASTS);
      }
      return { toasts: updatedToasts };
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience functions for quick toasts
export const toast = {
  success: (message: string, options?: Partial<ToastInput>) => {
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      ...options,
    });
  },

  error: (message: string, options?: Partial<ToastInput>) => {
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      ...options,
    });
  },

  warning: (message: string, options?: Partial<ToastInput>) => {
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      ...options,
    });
  },

  info: (message: string, options?: Partial<ToastInput>) => {
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      ...options,
    });
  },

  dismiss: (id: string) => {
    useToastStore.getState().removeToast(id);
  },

  dismissAll: () => {
    useToastStore.getState().clearAllToasts();
  },
};

export default useToastStore;
