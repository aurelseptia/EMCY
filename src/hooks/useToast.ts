import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let toastQueue: ToastMessage[] = [];

export function showToast(message: string, type: ToastMessage['type'] = 'info', title?: string) {
  const newToast: ToastMessage = {
    id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    type,
    title,
    message,
  };
  toastQueue = [...toastQueue, newToast];
  toastListeners.forEach(listener => listener(toastQueue));

  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== newToast.id);
    toastListeners.forEach(listener => listener(toastQueue));
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastQueue);

  const subscribe = useCallback(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setToasts([...newToasts]);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toastQueue));
  }, []);

  return {
    toasts,
    subscribe,
    removeToast,
    success: (msg: string, title?: string) => showToast(msg, 'success', title),
    error: (msg: string, title?: string) => showToast(msg, 'error', title),
    warning: (msg: string, title?: string) => showToast(msg, 'warning', title),
    info: (msg: string, title?: string) => showToast(msg, 'info', title),
  };
}
