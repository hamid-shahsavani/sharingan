import { cn } from 'cn';
import { useEffect, useState } from 'react';

import { subscribeToast } from '@/features/shared/_utils/toast';

export interface AppToastProps {
  className?: string;
}

export const AppToast = (props: AppToastProps) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToast(setMessage);
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-5000 flex justify-center px-4"
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-auto relative inline-flex min-h-10 max-w-[min(calc(100vw-2rem),24rem)] items-center justify-center rounded-full border border-node-border bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 px-5 py-2.5 text-center font-sans text-xs font-medium text-node-text shadow-[0_18px_45px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10 select-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 duration-200 ease-out sm:text-sm',
          props.className,
        )}
      >
        <span>{message}</span>
      </div>
    </div>
  );
};
