import { useViewport } from '@xyflow/react';
import { cn } from 'cn';
import { type ReactNode } from 'react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface NodeActionButtonProps {
  label: string;
  isCompact?: boolean;
  compact?: boolean;
  className?: string;
  tooltipClassName?: string;
  children: ReactNode;
  onClick: () => void;
}

export const NodeActionButton = (props: NodeActionButtonProps) => {
  const { zoom } = useViewport();
  const isCompact = props.isCompact ?? props.compact ?? false;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={isCompact ? 'icon-xs' : 'icon-sm'}
            aria-label={props.label}
            onClick={(event) => {
              event.stopPropagation();
              props.onClick();
            }}
            className={cn(
              'nodrag nopan flex cursor-pointer items-center justify-center rounded-md border border-transparent transition-all duration-200',
              isCompact
                ? 'size-4 bg-transparent text-tertiary-foreground hover:bg-transparent hover:brightness-105'
                : 'size-5 text-node-icon-foreground hover:text-accent-purple',
              '[&_svg]:size-2.5',
              props.className,
            )}
          >
            {props.children}
          </Button>
        }
      />
      <TooltipContent
        side="top"
        sideOffset={4}
        zoom={zoom}
        className={cn(
          'pointer-events-none text-[8px] font-normal px-1.5 py-0.5 rounded-md leading-normal shadow-xs',
          props.tooltipClassName,
        )}
      >
        {props.label}
      </TooltipContent>
    </Tooltip>
  );
};
