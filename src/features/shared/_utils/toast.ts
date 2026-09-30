type ToastListener = (message: string | null) => void;

let currentMessage: string | null = null;
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<ToastListener>();

export function showToast(message: string, duration = 3000): void {
  currentMessage = message;
  listeners.forEach((listener) => {
    listener(currentMessage);
  });

  if (toastTimeout !== null) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    currentMessage = null;
    listeners.forEach((listener) => {
      listener(null);
    });
    toastTimeout = null;
  }, duration);
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  listener(currentMessage);
  return () => {
    listeners.delete(listener);
  };
}
