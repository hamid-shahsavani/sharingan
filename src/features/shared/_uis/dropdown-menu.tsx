import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { cn } from 'cn';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';

export type DropdownMenuProps = MenuPrimitive.Root.Props;

export const DropdownMenu = (props: DropdownMenuProps) => {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
};

export type DropdownMenuPortalProps = MenuPrimitive.Portal.Props;

export const DropdownMenuPortal = (props: DropdownMenuPortalProps) => {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
};

export type DropdownMenuTriggerProps = MenuPrimitive.Trigger.Props;

export const DropdownMenuTrigger = (props: DropdownMenuTriggerProps) => {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

export interface DropdownMenuContentProps
  extends MenuPrimitive.Popup.Props,
    Pick<
      MenuPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    > {}

export const DropdownMenuContent = (props: DropdownMenuContentProps) => {
  const side = props.side ?? 'bottom';
  const sideOffset = props.sideOffset ?? 4;
  const align = props.align ?? 'center';
  const alignOffset = props.alignOffset ?? 0;

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'z-50 min-w-32 origin-(--transform-origin) overflow-hidden rounded-xl border border-surface-panel-border bg-surface-panel/95 p-1 text-popover-foreground shadow-xl backdrop-blur-xl duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            props.className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
};

export type DropdownMenuGroupProps = MenuPrimitive.Group.Props;

export const DropdownMenuGroup = (props: DropdownMenuGroupProps) => {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
};

export interface DropdownMenuItemProps extends MenuPrimitive.Item.Props {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

export const DropdownMenuItem = (props: DropdownMenuItemProps) => {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={props.inset}
      data-variant={props.variant ?? 'default'}
      className={cn(
        'group/dropdown-menu-item relative flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-muted focus:bg-muted focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10 data-[variant=destructive]:focus:bg-destructive/10 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        props.className,
      )}
      {...props}
    />
  );
};

export type DropdownMenuSubProps = MenuPrimitive.SubmenuRoot.Props;

export const DropdownMenuSub = (props: DropdownMenuSubProps) => {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
};

export interface DropdownMenuSubTriggerProps
  extends MenuPrimitive.SubmenuTrigger.Props {
  inset?: boolean;
}

export const DropdownMenuSubTrigger = (props: DropdownMenuSubTriggerProps) => {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={props.inset}
      className={cn(
        'flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm outline-hidden hover:bg-muted focus:bg-muted focus:text-accent-foreground data-open:bg-muted data-open:text-accent-foreground',
        props.className,
      )}
      {...props}
    >
      {props.children}
      <ChevronRight className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  );
};

export type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props;

export const DropdownMenuSeparator = (props: DropdownMenuSeparatorProps) => {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border/60', props.className)}
      {...props}
    />
  );
};

export type DropdownMenuShortcutProps = ComponentProps<'span'>;

export const DropdownMenuShortcut = (props: DropdownMenuShortcutProps) => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        props.className,
      )}
      {...props}
    />
  );
};
