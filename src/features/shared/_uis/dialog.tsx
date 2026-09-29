import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cn } from 'cn';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';

export type DialogProps = DialogPrimitive.Root.Props;

export const Dialog = (props: DialogProps) => {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
};

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

export const DialogTrigger = (props: DialogTriggerProps) => {
  return (
    <DialogPrimitive.Trigger
      {...props}
      data-slot="dialog-trigger"
      className={cn(props.className)}
    />
  );
};

export type DialogPortalProps = DialogPrimitive.Portal.Props;

export const DialogPortal = (props: DialogPortalProps) => {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
};

export type DialogBackdropProps = DialogPrimitive.Backdrop.Props;

export const DialogBackdrop = (props: DialogBackdropProps) => {
  return (
    <DialogPrimitive.Backdrop
      {...props}
      data-slot="dialog-backdrop"
      className={cn(
        'fixed inset-0 z-5000 min-h-dvh bg-black/70 backdrop-blur-xs transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0',
        props.className,
      )}
    />
  );
};

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  isCloseButtonVisible?: boolean;
}

export const DialogContent = (props: DialogContentProps) => {
  const isCloseButtonVisible = props.isCloseButtonVisible ?? true;

  return (
    <DialogPrimitive.Portal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        {...props}
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-5001 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border border-node-border bg-surface-panel p-6 text-foreground shadow-[0_24px_60px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10 outline-none transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0',
          props.className,
        )}
      >
        {props.children}
        {isCloseButtonVisible ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 left-4 cursor-pointer rounded-lg p-1.5 text-muted-foreground opacity-70 transition-opacity hover:bg-white/10 hover:opacity-100 focus:outline-none"
            aria-label="بستن"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
};

export type DialogHeaderProps = ComponentProps<'div'>;

export const DialogHeader = (props: DialogHeaderProps) => {
  return (
    <div
      {...props}
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 text-right', props.className)}
    />
  );
};

export type DialogFooterProps = ComponentProps<'div'>;

export const DialogFooter = (props: DialogFooterProps) => {
  return (
    <div
      {...props}
      data-slot="dialog-footer"
      className={cn(
        'flex items-center justify-end gap-2',
        props.className,
      )}
    />
  );
};

export type DialogTitleProps = DialogPrimitive.Title.Props;

export const DialogTitle = (props: DialogTitleProps) => {
  return (
    <DialogPrimitive.Title
      {...props}
      data-slot="dialog-title"
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-foreground',
        props.className,
      )}
    />
  );
};

export type DialogCloseProps = DialogPrimitive.Close.Props;

export const DialogClose = (props: DialogCloseProps) => {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
};
