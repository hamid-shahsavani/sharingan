import { ScanSearch } from 'lucide-react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface ZoomAreaControlProps {
  onSelectZoomArea: () => void;
}

export const ZoomAreaControl = (props: ZoomAreaControlProps) => {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block" />}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="انتخاب محدوده برای زوم"
          onClick={props.onSelectZoomArea}
          className="size-10! rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 p-0 text-node-text shadow-sm backdrop-blur-xl transition-all duration-200 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:text-accent-purple active:scale-95"
        >
          <ScanSearch size={16} strokeWidth={1.8} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">انتخاب محدوده برای زوم</TooltipContent>
    </Tooltip>
  );
};

