import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionLineType,
  ConnectionMode,
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
import { type MouseEvent, useCallback, useMemo, useState } from 'react';

import { MindMapEdge } from '@/features/main/_components/mind-map-edge';
import { NodeGroup } from '@/features/main/_components/node-group';
import { NodeMarkdown } from '@/features/main/_components/node-markdown';
import { ParentSectionNode } from '@/features/main/_components/parent-section-node';
import { RelationEdge } from '@/features/main/_components/relation-edge';
import { type NodeVisualBounds } from '@/features/main/_types/flow';
import { getCollapsedNodeIds } from '@/features/main/_utils/node-layout';
import { calculateParentSections } from '@/features/main/_utils/parent-section';
import { isParentChildEdge } from '@/features/shared/_utils/edge-validator';

export interface MindMapCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect?: (connection: Connection) => void;
  isSelectingZoomArea?: boolean;
  onSelectZoomAreaChange?: (isActive: boolean) => void;
  connectingSourceId?: string | null;
  onStartConnect?: (nodeId: string) => void;
  onSelectConnectTarget?: (nodeId: string) => void;
  onCancelConnect?: () => void;
  onStartRelation?: (nodeId: string) => void;
  onSelectRelationTarget?: (nodeId: string) => void;
  onCancelRelation?: () => void;
  relationSourceId?: string | null;
  onEditNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onCloneNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onAiNode?: (nodeId: string) => void;
  onNoteNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string) => void;
  onCollapseNode?: (nodeId: string) => void;
  onExpandNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  className?: string;
  isBackgroundVisible?: boolean;
}

const NODE_TYPES: NodeTypes = {
  group: NodeGroup,
  markdown: NodeMarkdown,
  'parent-section': ParentSectionNode,
};

const EDGE_TYPES: EdgeTypes = {
  straight: MindMapEdge,
  smoothstep: MindMapEdge,
  default: MindMapEdge,
  relation: RelationEdge,
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

  const collapsedNodeIds = useMemo(() => {
    return getCollapsedNodeIds(props.nodes, props.edges);
  }, [props.nodes, props.edges]);

  const nodesWithHandlers = useMemo(() => {
    const isConnecting = Boolean(props.connectingSourceId);
    const isRelating = Boolean(props.relationSourceId);
    return props.nodes.map((node) => {
      const isHidden = collapsedNodeIds.has(node.id);
      if (node.type === 'group' || node.type === 'markdown') {
        const hasChildren =
          props.edges.some(
            (edge) => isParentChildEdge(edge) && edge.source === node.id,
          ) || props.nodes.some((other) => other.parentId === node.id);
        const isCollapsed = Boolean(node.data?.isCollapsed);
        return {
          ...node,
          hidden: isHidden,
          style: {
            ...node.style,
            ...(isHidden ? { display: 'none' } : {}),
          },
          draggable: false,
          data: {
            ...node.data,
            hasChildren,
            isCollapsed,
            isConnecting,
            isRelating,
            onConnectStart: props.onStartConnect,
            onRelationStart: props.onStartRelation,
            onSelectAsConnectTarget: props.onSelectConnectTarget,
            onSelectAsRelationTarget: props.onSelectRelationTarget,
            onEdit: props.onEditNode,
            onDelete: props.onDeleteNode,
            onClone: props.onCloneNode,
            onFocus: props.onFocusNode,
            onAi: props.onAiNode,
            onNote: props.onNoteNode,
            onMove: props.onMoveNode,
            onCollapse: props.onCollapseNode,
            onExpand: props.onExpandNode ?? props.onCollapseNode,
            onHover: handleNodeHover,
            onVisualBoundsChange: handleNodeVisualBoundsChange,
          },
        };
      }
      return {
        ...node,
        hidden: isHidden,
        style: {
          ...node.style,
          ...(isHidden ? { display: 'none' } : {}),
        },
        draggable: false,
      };
    });
  }, [
    props.nodes,
    props.edges,
    collapsedNodeIds,
    props.connectingSourceId,
    props.relationSourceId,
    props.onStartConnect,
    props.onStartRelation,
    props.onSelectConnectTarget,
    props.onSelectRelationTarget,
    props.onEditNode,
    props.onDeleteNode,
    props.onCloneNode,
    props.onFocusNode,
    props.onAiNode,
    props.onNoteNode,
    props.onMoveNode,
    props.onCollapseNode,
    props.onExpandNode,
    handleNodeHover,
    handleNodeVisualBoundsChange,
  ]);

  const edgesWithHandlers = useMemo(() => {
    return props.edges.map((edge) => {
      const isHidden =
        collapsedNodeIds.has(edge.source) || collapsedNodeIds.has(edge.target);
      return {
        ...edge,
        hidden: isHidden,
        data: {
          ...edge.data,
          onDelete: props.onDeleteEdge,
        },
      };
    });
  }, [props.edges, collapsedNodeIds, props.onDeleteEdge]);

  const parentSectionNodes = useMemo(() => {
    return calculateParentSections(
      nodesWithHandlers,
      edgesWithHandlers,
      hoveredNodeId,
      nodeVisualBounds,
    );
  }, [nodesWithHandlers, edgesWithHandlers, hoveredNodeId, nodeVisualBounds]);

  const edgesToRender = useMemo(() => {
    let edges: Edge[] = edgesWithHandlers;

    // Preview edge for connect action
    if (
      props.connectingSourceId &&
      hoveredNodeId &&
      hoveredNodeId !== props.connectingSourceId
    ) {
      const previewEdge: Edge = {
        id: '__preview_connecting_edge__',
        source: hoveredNodeId,
        target: props.connectingSourceId,
        sourceHandle: 'parent-source',
        targetHandle: 'parent-target',
        type: 'straight',
        hidden: false,
        style: {
          stroke: 'var(--accent-purple)',
          strokeWidth: 1.5,
        },
      };
      edges = [...edges, previewEdge];
    }

    // Preview edge for relation action (dashed)
    if (
      props.relationSourceId &&
      hoveredNodeId &&
      hoveredNodeId !== props.relationSourceId
    ) {
      const previewRelationEdge: Edge = {
        id: '__preview_relation_edge__',
        source: props.relationSourceId,
        target: hoveredNodeId,
        type: 'relation',
        hidden: false,
        style: {
          stroke: 'var(--accent-purple)',
          strokeWidth: 1.5,
          opacity: 0.7,
        },
      };
      edges = [...edges, previewRelationEdge];
    }

    return edges;
  }, [
    edgesWithHandlers,
    props.connectingSourceId,
    props.relationSourceId,
    hoveredNodeId,
  ]);

  const flowNodes = useMemo(() => {
    return [...parentSectionNodes, ...nodesWithHandlers];
  }, [parentSectionNodes, nodesWithHandlers]);

  return (
    <div className={cn('relative size-full', props.className)}>
      <ReactFlow
        nodes={flowNodes}
        edges={edgesToRender}
        onNodesChange={props.onNodesChange}
        onEdgesChange={props.onEdgesChange}
        onConnect={props.onConnect}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.Straight}
        connectionLineStyle={{
          stroke: 'var(--accent-purple)',
          strokeWidth: 1.5,
        }}
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
          if (props.connectingSourceId) {
            props.onCancelConnect?.();
          }
          if (props.relationSourceId) {
            props.onCancelRelation?.();
          }
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={{
          type: 'straight',
          style: { stroke: 'var(--node-border, #4b5563)', strokeWidth: 1.5 },
        }}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}

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
