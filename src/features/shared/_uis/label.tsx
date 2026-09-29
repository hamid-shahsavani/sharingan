import { cn } from 'cn';
import type { ComponentProps } from 'react';

export interface LabelProps extends ComponentProps<'label'> {
  isRequired?: boolean;
}

export const Label = (props: LabelProps) => {
  return (
    <label
      {...props}
      data-slot="label"
      className={cn(
        'flex items-center gap-1 text-sm font-medium text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.className,
      )}
    >
      {props.children}
      {props.isRequired ? <span className="text-destructive">*</span> : null}
    </label>
  );
};
