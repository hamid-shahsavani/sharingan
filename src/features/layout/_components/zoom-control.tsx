import { useReactFlow } from '@xyflow/react';
import { Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

const ZOOM_ANIMATION_DURATION = 180;
const ZOOM_REPEAT_INTERVAL = 190;

export interface ZoomControlProps {
  className?: string;
}

export const ZoomControl = (props: ZoomControlProps) => {
  const { zoomIn, zoomOut } = useReactFlow();
  const repeatTimerRef = useRef<number | null>(null);

  const handleStopZooming = useCallback(() => {
    if (repeatTimerRef.current !== null) {
      window.clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  }, []);

  const handleStartZooming = useCallback(
    (direction: 'in' | 'out') => {
      handleStopZooming();
      const zoomFunction = direction === 'in' ? zoomIn : zoomOut;
      void zoomFunction({ duration: ZOOM_ANIMATION_DURATION });
      repeatTimerRef.current = window.setInterval(() => {
        void zoomFunction({ duration: ZOOM_ANIMATION_DURATION });
      }, ZOOM_REPEAT_INTERVAL);
    },
    [handleStopZooming, zoomIn, zoomOut],
  );

  useEffect(() => {
    return handleStopZooming;
  }, [handleStopZooming]);

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
            aria-label="بزرگ‌نمایی"
            onPointerDown={() => handleStartZooming('in')}
            onPointerUp={handleStopZooming}
            onPointerLeave={handleStopZooming}
            onPointerCancel={handleStopZooming}
            className="size-10! rounded-xl p-0 text-node-text transition-all duration-200 hover:bg-white/5 hover:text-accent-purple active:scale-95"
          >
            <Plus size={20} strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">بزرگ‌نمایی</TooltipContent>
      </Tooltip>
      <div className="h-4 w-px bg-node-border/40" />
      <Tooltip>
        <TooltipTrigger render={<span className="inline-block" />}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="کوچک‌نمایی"
            onPointerDown={() => handleStartZooming('out')}
            onPointerUp={handleStopZooming}
            onPointerLeave={handleStopZooming}
            onPointerCancel={handleStopZooming}
            className="size-10! rounded-xl p-0 text-node-text transition-all duration-200 hover:bg-white/5 hover:text-accent-purple active:scale-95"
          >
            <Minus size={20} strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">کوچک‌نمایی</TooltipContent>
      </Tooltip>
    </div>
  );
};

