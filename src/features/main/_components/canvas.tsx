import {
  Background,
  BackgroundVariant,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { cn } from 'cn';
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { MindMapEdge } from '@/features/main/_components/mind-map-edge';
import { NodeGroup } from '@/features/main/_components/node-group';
import { ParentSectionNode } from '@/features/main/_components/parent-section-node';
import { type NodeVisualBounds } from '@/features/main/_types/flow';
import { calculateParentSections } from '@/features/main/_utils/parent-section';

export interface MindMapCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect?: (connection: Connection) => void;
  isSelectingZoomArea?: boolean;
  onSelectZoomAreaChange?: (isActive: boolean) => void;
  onEditNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onCloneNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onAiNode?: (nodeId: string) => void;
  onNoteNode?: (nodeId: string) => void;
  onCollapseNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  className?: string;
  isBackgroundVisible?: boolean;
}

const NODE_TYPES: NodeTypes = {
  group: NodeGroup,
  'parent-section': ParentSectionNode,
};

const EDGE_TYPES: EdgeTypes = {
  smoothstep: MindMapEdge,
  default: MindMapEdge,
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

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodeVisualBounds, setNodeVisualBounds] = useState<
    Record<string, NodeVisualBounds>
  >({});

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  const handleNodeVisualBoundsChange = useCallback(
    (nodeId: string, bounds: NodeVisualBounds) => {
      setNodeVisualBounds((prev) => {
        const existing = prev[nodeId];
        if (
          existing &&
          Math.abs(existing.left - bounds.left) < 1 &&
          Math.abs(existing.top - bounds.top) < 1 &&
          Math.abs(existing.right - bounds.right) < 1 &&
          Math.abs(existing.bottom - bounds.bottom) < 1
        ) {
          return prev;
        }
        return { ...prev, [nodeId]: bounds };
      });
    },
    [],
  );

  const nodesWithHandlers = useMemo(() => {
    return props.nodes.map((node) => {
      if (node.type === 'group') {
        const hasChildren = props.edges.some((edge) => edge.source === node.id);
        return {
          ...node,
          draggable: false,
          data: {
            ...node.data,
            hasChildren,
            onEdit: props.onEditNode,
            onDelete: props.onDeleteNode,
            onClone: props.onCloneNode,
            onFocus: props.onFocusNode,
            onAi: props.onAiNode,
            onNote: props.onNoteNode,
            onCollapse: props.onCollapseNode,
            onHover: handleNodeHover,
            onVisualBoundsChange: handleNodeVisualBoundsChange,
          },
        };
      }
      return {
        ...node,
        draggable: false,
      };
    });
  }, [
    props.nodes,
    props.edges,
    props.onEditNode,
    props.onDeleteNode,
    props.onCloneNode,
    props.onFocusNode,
    props.onAiNode,
    props.onNoteNode,
    props.onCollapseNode,
    handleNodeHover,
    handleNodeVisualBoundsChange,
  ]);

  const parentSectionNodes = useMemo(() => {
    return calculateParentSections(
      props.nodes,
      props.edges,
      hoveredNodeId,
      nodeVisualBounds,
    );
  }, [props.nodes, props.edges, hoveredNodeId, nodeVisualBounds]);

  const edgesWithHandlers = useMemo(() => {
    return props.edges.map((edge) => {
      return {
        ...edge,
        data: {
          ...edge.data,
          onDelete: props.onDeleteEdge,
        },
      };
    });
  }, [props.edges, props.onDeleteEdge]);

  const flowNodes = useMemo(() => {
    return [...parentSectionNodes, ...nodesWithHandlers];
  }, [parentSectionNodes, nodesWithHandlers]);

  return (
    <div className={cn('relative h-full w-full', props.className)}>
      <ReactFlow
        nodes={flowNodes}
        edges={edgesWithHandlers}
        onNodesChange={props.onNodesChange}
        onEdgesChange={props.onEdgesChange}
        onConnect={props.onConnect}
        onNodeMouseEnter={(_event, node) => {
          if (node.type !== 'parent-section') {
            handleNodeHover(node.id);
          }
        }}
        onNodeMouseLeave={(_event, node) => {
          if (node.type !== 'parent-section') {
            handleNodeHover(null);
          }
        }}
        onPaneClick={() => {
          handleNodeHover(null);
        }}
        nodesDraggable={false}
        nodesConnectable={true}
        elementsSelectable={true}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: 'var(--node-border, #4b5563)', strokeWidth: 1.5 },
        }}
        onNodeDoubleClick={(_event, node) => {
          props.onEditNode?.(node.id);
        }}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
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
