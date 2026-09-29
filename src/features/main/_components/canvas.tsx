import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { cn } from 'cn';
import { type MouseEvent, useEffect, useRef } from 'react';

import { NodeGroup } from '@/features/main/_components/node-group';

export interface MindMapCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  isSelectingZoomArea?: boolean;
  onSelectZoomAreaChange?: (isActive: boolean) => void;
  onEditNode?: (nodeId: string) => void;
  className?: string;
  isBackgroundVisible?: boolean;
}

const NODE_TYPES: NodeTypes = {
  group: NodeGroup,
};

export interface InitialViewportProps {
  nodes: Node[];
}

const InitialViewport = (props: InitialViewportProps) => {
  const { fitView } = useReactFlow();
  const fittedNodeSignatureRef = useRef<string>('');

  useEffect(() => {
    if (props.nodes.length === 0) {
      return;
    }

    const currentSignature = props.nodes.map((node) => node.id).sort().join('|');
    if (fittedNodeSignatureRef.current === currentSignature) {
      return;
    }

    fittedNodeSignatureRef.current = currentSignature;

    const frameId = requestAnimationFrame(() => {
      void fitView({ padding: 0.25, duration: 0 });
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [fitView, props.nodes]);

  return null;
};

const MAX_CANVAS_ZOOM = 3;

export interface ZoomAreaSelectorProps {
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
}

const ZoomAreaSelector = (props: ZoomAreaSelectorProps) => {
  const { screenToFlowPosition, setCenter } = useReactFlow();

  if (!props.isActive) {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const point = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    void setCenter(point.x, point.y, { zoom: MAX_CANVAS_ZOOM, duration: 400 });
    props.onActiveChange(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="محدوده انتخاب زوم"
      className="absolute inset-0 z-3000 cursor-crosshair bg-transparent"
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          props.onActiveChange(false);
        }
      }}
    />
  );
};

export const Canvas = (props: MindMapCanvasProps) => {
  const isBackgroundVisible = props.isBackgroundVisible ?? true;
  const isSelectingZoomArea = props.isSelectingZoomArea ?? false;

  const nodesWithHandlers = props.nodes.map((node) => {
    if (node.type === 'group') {
      return {
        ...node,
        data: {
          ...node.data,
          onEdit: props.onEditNode,
        },
      };
    }
    return node;
  });

  return (
    <div className={cn('relative h-full w-full', props.className)}>
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={props.edges}
        onNodesChange={props.onNodesChange}
        onEdgesChange={props.onEdgesChange}
        onNodeDoubleClick={(_event, node) => {
          props.onEditNode?.(node.id);
        }}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.25, duration: 0 }}
        minZoom={0.2}
        maxZoom={MAX_CANVAS_ZOOM}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        className="bg-background"
      >
        {isBackgroundVisible ? (
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            className="opacity-50"
          />
        ) : null}
        <InitialViewport nodes={props.nodes} />
        <ZoomAreaSelector
          isActive={isSelectingZoomArea}
          onActiveChange={(active) => {
            props.onSelectZoomAreaChange?.(active);
          }}
        />
      </ReactFlow>
    </div>
  );
};

export const MindMapCanvas = Canvas;
