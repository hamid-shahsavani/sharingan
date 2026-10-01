export type ToastType = 'success' | 'error';

export interface ToastItem {
  message: string;
  type: ToastType;
}

type ToastListener = (toast: ToastItem | null) => void;

let currentToast: ToastItem | null = null;
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<ToastListener>();

export function showToast(
  message: string,
  type: ToastType = 'success',
  duration = 3000,
): void {
  currentToast = { message, type };
  listeners.forEach((listener) => {
    listener(currentToast);
  });

  if (toastTimeout !== null) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    currentToast = null;
    listeners.forEach((listener) => {
      listener(null);
    });
    toastTimeout = null;
  }, duration);
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  listener(currentToast);
  return () => {
    listeners.delete(listener);
  };
}
