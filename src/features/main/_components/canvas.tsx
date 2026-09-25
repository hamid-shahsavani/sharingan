import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';

import { cn } from '@/lib/utils';

export interface MindMapCanvasProps {
  className?: string;
  hasBackground?: boolean;
}

const INITIAL_NODES: Node[] = [];
const INITIAL_EDGES: Edge[] = [];

export const Canvas = ({
  className,
  hasBackground = true,
}: MindMapCanvasProps) => {
  return (
    <div className={cn('h-full w-full', className)}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={INITIAL_NODES}
          edges={INITIAL_EDGES}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
          colorMode="system"
          className="bg-background"
        >
          {hasBackground ? (
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              className="opacity-50"
            />
          ) : null}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export const MindMapCanvas = Canvas;

