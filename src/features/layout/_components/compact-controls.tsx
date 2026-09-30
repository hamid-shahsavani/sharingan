import { cn } from 'cn';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CreateControl } from '@/features/layout/_components/create-control';
import { FitViewControl } from '@/features/layout/_components/fit-view-control';
import { ZoomAreaControl } from '@/features/layout/_components/zoom-area-control';
import { ZoomControl } from '@/features/layout/_components/zoom-control';
import type { CreateToolbarAction } from '@/features/shared/_types/workspace-types';
import { TooltipProvider } from '@/features/shared/_uis/tooltip';

const BOTTOM_MENU_POSITION_CLASS = 'bottom-5!';

export interface CompactControlsProps {
  nodes: Array<{ id: string }>;
  onOpenCreateGroupModal: () => void;
  onCreateNode?: (action: CreateToolbarAction) => void;
  onSelectZoomArea: () => void;
}

export const CompactControls = (props: CompactControlsProps) => {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const bottomMenuHideTimerRef = useRef<number | null>(null);

  const [isBottomMenuHovered, setIsBottomMenuHovered] = useState(false);

  const handleShowBottomMenu = useCallback(() => {
    if (bottomMenuHideTimerRef.current !== null) {
      window.clearTimeout(bottomMenuHideTimerRef.current);
      bottomMenuHideTimerRef.current = null;
    }
    setIsBottomMenuHovered(true);
  }, []);

  const handleHideBottomMenu = useCallback(() => {
    if (bottomMenuHideTimerRef.current !== null) {
      window.clearTimeout(bottomMenuHideTimerRef.current);
    }
    bottomMenuHideTimerRef.current = window.setTimeout(() => {
      setIsBottomMenuHovered(false);
      bottomMenuHideTimerRef.current = null;
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (bottomMenuHideTimerRef.current !== null) {
        window.clearTimeout(bottomMenuHideTimerRef.current);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-2000 h-5">
        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 h-5"
          onPointerEnter={handleShowBottomMenu}
          onPointerLeave={handleHideBottomMenu}
        />
        <div
          ref={dockRef}
          className={cn(
            'pointer-events-none fixed! right-auto! left-1/2! flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-2 rounded-2xl border border-node-border bg-linear-to-b from-node-surface-from/90 to-node-surface-to/95 p-1.5 shadow-[0_18px_55px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10 transition-transform duration-200 ease-out',
            isBottomMenuHovered
              ? `pointer-events-auto ${BOTTOM_MENU_POSITION_CLASS} translate-y-0`
              : 'bottom-0! translate-y-full',
          )}
          onPointerEnter={handleShowBottomMenu}
          onPointerLeave={handleHideBottomMenu}
        >
          <ZoomAreaControl onSelectZoomArea={props.onSelectZoomArea} />
          <FitViewControl />
          <CreateControl onOpenCreateGroupModal={props.onOpenCreateGroupModal} />
          <ZoomControl />
        </div>
      </div>
    </TooltipProvider>
  );
};
