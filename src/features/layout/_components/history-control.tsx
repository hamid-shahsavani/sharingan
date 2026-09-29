import { cn } from 'cn';
import { Redo2, Undo2 } from 'lucide-react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface HistoryControlProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export const HistoryControl = (props: HistoryControlProps) => {
  return (
    <div
      className={
        props.className ??
        'isolate flex h-10 items-center gap-0 overflow-hidden rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 shadow-sm backdrop-blur-xl'
      }
    >
      <Tooltip>
        <TooltipTrigger render={<span className="inline-block" />}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="قبل"
            disabled={!props.canUndo}
            onClick={props.onUndo}
            className={cn(
              'size-10! rounded-xl p-0 text-node-text transition-all duration-200 hover:bg-white/5 hover:text-accent-purple active:scale-95',
              !props.canUndo && 'pointer-events-none opacity-35',
            )}
          >
            <Undo2 size={20} strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">قبل</TooltipContent>
      </Tooltip>
      <div className="h-4 w-px bg-node-border/40" />
      <Tooltip>
        <TooltipTrigger render={<span className="inline-block" />}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="بعد"
            disabled={!props.canRedo}
            onClick={props.onRedo}
            className={cn(
              'size-10! rounded-xl p-0 text-node-text transition-all duration-200 hover:bg-white/5 hover:text-accent-purple active:scale-95',
              !props.canRedo && 'pointer-events-none opacity-35',
            )}
          >
            <Redo2 size={20} strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">بعد</TooltipContent>
      </Tooltip>
    </div>
  );
};

