import { cn } from 'cn';
import type { ComponentProps } from 'react';

export interface TextareaProps extends ComponentProps<'textarea'> {
  isInvalid?: boolean;
}

export const Textarea = (props: TextareaProps) => {
  const { isInvalid, className, ...rest } = props;

  return (
    <textarea
      {...rest}
      data-slot="textarea"
      aria-invalid={isInvalid ? 'true' : undefined}
      className={cn(
        'flex min-h-24 w-full resize-none rounded-xl border border-node-border/70 bg-background/50 px-3.5 py-2.5 text-sm text-foreground shadow-xs transition-colors outline-hidden focus-visible:border-accent-purple focus-visible:ring-2 focus-visible:ring-accent-purple/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className,
      )}
    />
  );
};
