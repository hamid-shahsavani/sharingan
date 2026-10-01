import { cn } from 'cn';
import { Check, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

import { subscribeToast, type ToastItem } from '@/features/shared/_utils/toast';

export interface AppToastProps {
  className?: string;
}

export const AppToast = (props: AppToastProps) => {
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    return subscribeToast(setToast);
  }, []);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === 'success';

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-5000 flex justify-center px-4"
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-auto relative inline-flex min-h-11 max-w-[min(calc(100vw-2rem),26rem)] items-center justify-center gap-2.5 rounded-full p-2.5 text-center font-sans text-xs font-medium text-node-text backdrop-blur-2xl select-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-200 ease-out sm:text-sm',
          isSuccess
            ? 'border border-emerald-500/30 bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 ring-1 ring-emerald-500/20 shadow-[0_18px_45px_var(--node-shadow),0_0_24px_rgba(16,185,129,0.12)]'
            : 'border border-rose-500/35 bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 ring-1 ring-rose-500/25 shadow-[0_18px_45px_var(--node-shadow),0_0_24px_rgba(244,63,94,0.12)]',
          props.className,
        )}
      >
        <span
          className={cn(
            'flex size-5.5 shrink-0 items-center justify-center rounded-full',
            isSuccess
              ? 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/40'
              : 'bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)] dark:bg-rose-500/20 dark:text-rose-400 dark:ring-rose-500/40',
          )}
          aria-hidden="true"
        >
          {isSuccess ? (
            <Check size={14} strokeWidth={2.5} />
          ) : (
            <CircleAlert size={14} strokeWidth={2.3} />
          )}
        </span>
        <span className="leading-tight">{toast.message}</span>
      </div>
    </div>
  );
};
