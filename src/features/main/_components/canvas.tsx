import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { cn } from 'cn';

import { NodeGroup } from '@/features/main/_components/node-group';

export interface MindMapCanvasProps {
  className?: string;
  hasBackground?: boolean;
}

const NODE_TYPES: NodeTypes = {
  group: NodeGroup,
};

const INITIAL_NODES: Node[] = [
  {
    id: 'group-node-1',
    type: 'group',
    position: { x: 0, y: 0 },
    data: {
      title: 'گروه اصلی پروژه',
    },
  },
];

const INITIAL_EDGES: Edge[] = [];

export const Canvas = ({
  className,
  hasBackground = true,
}: MindMapCanvasProps) => {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);

  return (
    <div className={cn('h-full w-full', className)}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
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
