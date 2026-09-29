import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';
import type { ComponentProps } from 'react';

export type PopoverProps = PopoverPrimitive.Root.Props;

export const Popover = (props: PopoverProps) => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

export type PopoverTriggerProps = PopoverPrimitive.Trigger.Props;

export const PopoverTrigger = (props: PopoverTriggerProps) => {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
};

export interface PopoverContentProps
  extends PopoverPrimitive.Popup.Props,
    Pick<
      PopoverPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset' | 'anchor'
    > {}

export const PopoverContent = (props: PopoverContentProps) => {
  const side = props.side ?? 'bottom';
  const sideOffset = props.sideOffset ?? 4;
  const align = props.align ?? 'center';
  const alignOffset = props.alignOffset ?? 0;
  const anchor = props.anchor;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        anchor={anchor}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-3000"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'z-3000 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg border border-surface-panel-border bg-surface-panel p-2.5 text-sm text-popover-foreground shadow-md outline-hidden transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95',
            props.className,
          )}
          style={props.style}
        >
          {props.children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};

export type PopoverHeaderProps = ComponentProps<'div'>;

export const PopoverHeader = (props: PopoverHeaderProps) => {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-0.5 text-sm', props.className)}
      {...props}
    />
  );
};

export type PopoverTitleProps = PopoverPrimitive.Title.Props;

export const PopoverTitle = (props: PopoverTitleProps) => {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('font-medium', props.className)}
      {...props}
    />
  );
};

export type PopoverDescriptionProps = PopoverPrimitive.Description.Props;

export const PopoverDescription = (props: PopoverDescriptionProps) => {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-muted-foreground', props.className)}
      {...props}
    />
  );
};
