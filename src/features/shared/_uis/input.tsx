import { cn } from 'cn';
import type { ComponentProps } from 'react';

export interface InputProps extends ComponentProps<'input'> {
  isInvalid?: boolean;
}

export const Input = (props: InputProps) => {
  return (
    <input
      {...props}
      data-slot="input"
      aria-invalid={props.isInvalid ? 'true' : undefined}
      className={cn(
        'flex h-11 w-full rounded-xl border border-node-border/70 bg-background/50 px-3.5 py-2 text-sm text-foreground shadow-xs transition-colors outline-hidden focus-visible:border-accent-purple focus-visible:ring-2 focus-visible:ring-accent-purple/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        props.className,
      )}
    />
  );
};
