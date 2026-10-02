import { cn } from 'cn';
import type { ComponentProps } from 'react';

export interface LabelProps extends ComponentProps<'label'> {
  isRequired?: boolean;
}

export const Label = (props: LabelProps) => {
  const { isRequired, children, className, ...rest } = props;

  return (
    <label
      {...rest}
      data-slot="label"
      className={cn(
        'flex items-center gap-1 text-sm font-medium text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
    >
      {children}
      {isRequired ? <span className="text-destructive">*</span> : null}
    </label>
  );
};
