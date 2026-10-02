import { cn } from 'cn';
import { type ComponentProps, type ReactNode, useId } from 'react';

import { Label } from '@/features/shared/_uis/label';

export interface InputProps extends ComponentProps<'input'> {
  label?: ReactNode;
  isRequired?: boolean;
  error?: string;
  isInvalid?: boolean;
  containerClassName?: string;
}

export const Input = (props: InputProps) => {
  const generatedId = useId();
  const inputId = props.id ?? (props.label ? generatedId : undefined);
  const isInvalid = Boolean(props.error) || Boolean(props.isInvalid);

  const inputProps = { ...props };
  delete inputProps.label;
  delete inputProps.isRequired;
  delete inputProps.error;
  delete inputProps.isInvalid;
  delete inputProps.containerClassName;

  const inputElement = (
    <input
      {...inputProps}
      id={inputId}
      data-slot="input"
      aria-invalid={isInvalid ? 'true' : undefined}
      className={cn(
        'flex h-11 w-full rounded-xl border border-node-border/70 bg-background/50 px-3.5 py-2 text-sm text-foreground shadow-xs transition-colors outline-hidden focus-visible:border-accent-purple focus-visible:ring-2 focus-visible:ring-accent-purple/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        props.className,
      )}
    />
  );

  if (!props.label && !props.error) {
    return inputElement;
  }

  return (
    <div className={cn('flex flex-col gap-2', props.containerClassName)}>
      {props.label ? (
        <Label htmlFor={inputId} isRequired={props.isRequired}>
          {props.label}
        </Label>
      ) : null}
      {inputElement}
      {props.error ? (
        <p className="text-xs font-medium text-destructive">
          {props.error}
        </p>
      ) : null}
    </div>
  );
};

