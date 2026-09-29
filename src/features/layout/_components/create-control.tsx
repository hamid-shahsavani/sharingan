import { FilePlus2, Layers3 } from 'lucide-react';
import { useState } from 'react';

import type { CreateToolbarAction } from '@/features/shared/_types/workspace-types';
import { Button } from '@/features/shared/_uis/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shared/_uis/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

interface ContentCreateItem {
  type: CreateToolbarAction;
  icon: typeof Layers3;
  label: string;
}

const CONTENT_CREATE_ITEMS: ContentCreateItem[] = [
  { type: 'group', icon: Layers3, label: 'گروه' },
];

export interface CreateControlProps {
  onCreateNode: (action: CreateToolbarAction) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export const CreateControl = (props: CreateControlProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    props.onOpenChange?.(open);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="ایجاد نود"
                  className="size-10! rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 text-node-text shadow-sm backdrop-blur-xl transition-all duration-200 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:text-accent-purple aria-expanded:from-node-surface-hover-from aria-expanded:to-node-surface-hover-to aria-expanded:text-accent-purple active:scale-95"
                />
              }
            />
          }
        >
          <FilePlus2 size={20} strokeWidth={1.8} />
        </TooltipTrigger>
        <TooltipContent side="top">ایجاد نود</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side="top"
        align="center"
        className="grid min-w-0 grid-cols-1 rounded-xl border border-node-border bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 p-1.5 text-center text-node-text shadow-[0_18px_55px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10"
        dir="rtl"
      >
        {CONTENT_CREATE_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <DropdownMenuItem
              key={item.type}
              onClick={() => props.onCreateNode(item.type)}
              className="flex w-24 flex-col gap-2 rounded-lg p-3 text-center text-xs transition-colors hover:bg-white/5 hover:text-accent-purple"
            >
              <span className="flex size-9 items-center justify-center rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-accent-purple shadow-sm">
                <IconComponent className="size-5" strokeWidth={1.5} />
              </span>
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
