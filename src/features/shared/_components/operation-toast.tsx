import { cn } from 'cn';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ToastCancelButtonProps {
  onCancel: () => void;
}

const ToastCancelButton = (props: ToastCancelButtonProps) => {
  return (
    <button
      type="button"
      aria-label="لغو"
      onClick={props.onCancel}
      className="absolute top-1/2 left-2.5 z-20 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-full border border-node-border/60 bg-linear-to-b from-node-surface-from to-node-surface-to p-0 text-node-text/80 shadow-xs transition-colors hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none"
    >
      <X size={14} strokeWidth={2.2} />
    </button>
  );
};

export interface OperationToastProps {
  isVisible: boolean;
  onCancel?: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const OperationToast = (props: OperationToastProps) => {
  if (!props.isVisible) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="pointer-events-none fixed inset-x-0 top-6 z-5000 flex justify-center px-4"
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-auto relative inline-flex min-h-12 max-w-[min(calc(100vw-2rem),28rem)] items-center gap-3 rounded-full border border-node-border bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 px-5 py-3 pr-4.5 pl-11 text-sm font-medium text-node-text shadow-[0_18px_45px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-3 duration-200 ease-out',
          props.className,
        )}
      >
        <span
          className="relative flex size-2.5 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 font-sans text-xs sm:text-sm font-normal text-node-text select-none">
          {props.children}
        </div>
        {props.actions ? (
          <div className="flex shrink-0 items-center gap-1">{props.actions}</div>
        ) : null}
        {props.onCancel ? <ToastCancelButton onCancel={props.onCancel} /> : null}
      </div>
    </div>
  );
};
