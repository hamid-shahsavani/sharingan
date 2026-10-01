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
    > {
  zoom?: number;
}

export const TooltipContent = (props: TooltipContentProps) => {
  const side = props.side ?? 'top';
  const sideOffset = props.sideOffset ?? 6;
  const align = props.align ?? 'center';
  const alignOffset = props.alignOffset ?? 0;
  const zoom = props.zoom;
  const scaledSideOffset =
    typeof sideOffset === 'number' && zoom !== undefined
      ? sideOffset * zoom
      : sideOffset;
  const transformOrigin =
    side === 'top'
      ? 'bottom center'
      : side === 'bottom'
        ? 'top center'
        : side === 'left'
          ? 'center right'
          : 'center left';

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={scaledSideOffset}
        className="z-3000"
      >
        <TooltipPrimitive.Popup
          dir="rtl"
          data-slot="tooltip-content"
          className={cn(
            'z-3000 w-max max-w-[200px] rounded-md border border-surface-panel-border bg-surface-panel px-2 py-0.5 text-center font-sans text-[11px] font-normal leading-normal text-foreground shadow-md outline-none transition-[opacity,transform] duration-150 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95',
            props.className,
          )}
          style={{
            ...props.style,
            ...(zoom !== undefined
              ? {
                  transform: `scale(${zoom})`,
                  transformOrigin,
                }
              : {}),
          }}
        >
          {props.children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
};
