import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from 'cn';

export type TooltipProviderProps = TooltipPrimitive.Provider.Props;

export const TooltipProvider = (props: TooltipProviderProps) => {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={props.delay ?? 0}
      {...props}
    />
  );
};

export type TooltipProps = TooltipPrimitive.Root.Props;

export const Tooltip = (props: TooltipProps) => {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
};

export type TooltipTriggerProps = TooltipPrimitive.Trigger.Props;

export const TooltipTrigger = (props: TooltipTriggerProps) => {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

export interface TooltipContentProps
  extends TooltipPrimitive.Popup.Props,
    Pick<
      TooltipPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    > {}

export const TooltipContent = (props: TooltipContentProps) => {
  const side = props.side ?? 'top';
  const sideOffset = props.sideOffset ?? 6;
  const align = props.align ?? 'center';
  const alignOffset = props.alignOffset ?? 0;

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-3000"
      >
        <TooltipPrimitive.Popup
          dir="rtl"
          data-slot="tooltip-content"
          className={cn(
            'z-3000 w-max max-w-[200px] rounded-md border border-surface-panel-border bg-surface-panel px-2 py-1 text-center font-sans text-xs font-light text-foreground shadow-md outline-none transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95',
            props.className,
          )}
          style={props.style}
        >
          {props.children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
};
