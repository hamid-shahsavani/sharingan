import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from 'cn';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentProps } from 'react';

export type SelectProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> = SelectPrimitive.Root.Props<Value, Multiple>;

export const Select = <
  Value = string,
  Multiple extends boolean | undefined = false,
>(
  props: SelectProps<Value, Multiple>,
) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

export type SelectGroupProps = SelectPrimitive.Group.Props;

export const SelectGroup = (props: SelectGroupProps) => {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', props.className)}
      {...props}
    />
  );
};

export type SelectValueProps = SelectPrimitive.Value.Props;

export const SelectValue = (props: SelectValueProps) => {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-right', props.className)}
      {...props}
    />
  );
};

export interface SelectTriggerProps extends SelectPrimitive.Trigger.Props {
  size?: 'sm' | 'default';
}

export const SelectTrigger = (props: SelectTriggerProps) => {
  const size = props.size ?? 'default';

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'flex w-full items-center justify-between gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-sm transition-colors outline-hidden select-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-7',
        props.className,
      )}
      {...props}
    >
      {props.children}
      <SelectPrimitive.Icon
        render={<ChevronDown className="pointer-events-none size-4 text-muted-foreground" />}
      />
    </SelectPrimitive.Trigger>
  );
};

export interface SelectContentProps
  extends SelectPrimitive.Popup.Props,
    Pick<
      SelectPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
    > {}

export const SelectContent = (props: SelectContentProps) => {
  const side = props.side ?? 'bottom';
  const sideOffset = props.sideOffset ?? 4;
  const align = props.align ?? 'center';
  const alignOffset = props.alignOffset ?? 0;
  const alignItemWithTrigger = props.alignItemWithTrigger ?? true;

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 max-h-72 w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            props.className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{props.children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
};

export type SelectLabelProps = SelectPrimitive.GroupLabel.Props;

export const SelectLabel = (props: SelectLabelProps) => {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-1.5 py-1 text-xs text-muted-foreground', props.className)}
      {...props}
    />
  );
};

export type SelectItemProps = SelectPrimitive.Item.Props;

export const SelectItem = (props: SelectItemProps) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-hidden hover:bg-muted focus:bg-muted focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        props.className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none flex size-4 items-center justify-center text-primary">
            <Check className="size-3.5" />
          </span>
        }
      />
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2">
        {props.children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
};

export type SelectSeparatorProps = SelectPrimitive.Separator.Props;

export const SelectSeparator = (props: SelectSeparatorProps) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border/60', props.className)}
      {...props}
    />
  );
};

export type SelectScrollUpButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollUpArrow
>;

export const SelectScrollUpButton = (props: SelectScrollUpButtonProps) => {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1',
        props.className,
      )}
      {...props}
    >
      <ChevronUp className="size-3.5" />
    </SelectPrimitive.ScrollUpArrow>
  );
};

export type SelectScrollDownButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollDownArrow
>;

export const SelectScrollDownButton = (props: SelectScrollDownButtonProps) => {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1',
        props.className,
      )}
      {...props}
    >
      <ChevronDown className="size-3.5" />
    </SelectPrimitive.ScrollDownArrow>
  );
};
