import {
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getStraightPath,
  useInternalNode,
} from '@xyflow/react';
import { cn } from 'cn';
import { Trash2 } from 'lucide-react';
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { NodeActionButton } from '@/features/main/_components/node-action-button';
import {
  getIconBox,
  getIntelligentIconConnection,
} from '@/features/main/_utils/icon-connection';
import { TooltipProvider } from '@/features/shared/_uis/tooltip';

export interface MindMapEdgeData extends Record<string, unknown> {
  onDelete?: (id: string) => void;
}

export type MindMapEdgeProps = EdgeProps<Edge<MindMapEdgeData>>;

export const MindMapEdge = (props: MindMapEdgeProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const sourceNode = useInternalNode(props.source);
  const targetNode = useInternalNode(props.target);

  useEffect(() => {
    if (!isActionsOpen) return;
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        labelRef.current &&
        !labelRef.current.contains(event.target as globalThis.Node)
      ) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isActionsOpen]);

  const connectionCoords = useMemo(() => {
    if (sourceNode && targetNode) {
      const sourceBox = getIconBox(sourceNode);
      const targetBox = getIconBox(targetNode);
      return getIntelligentIconConnection(sourceBox, targetBox);
    }
    return {
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
    };
  }, [
    sourceNode,
    targetNode,
    props.sourceX,
    props.sourceY,
    props.targetX,
    props.targetY,
  ]);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: connectionCoords.sourceX,
    sourceY: connectionCoords.sourceY,
    targetX: connectionCoords.targetX,
    targetY: connectionCoords.targetY,
  });

  const handleDelete = useCallback(() => {
    props.data?.onDelete?.(props.id);
  }, [props.data, props.id]);

  const handleLineClick = useCallback((event: MouseEvent<SVGPathElement>) => {
    event.stopPropagation();
    setIsActionsOpen((prev) => !prev);
  }, []);

  const edgeStyle = useMemo<CSSProperties>(() => {
    if (isActionsOpen) {
      return {
        ...props.style,
        stroke: 'var(--accent-purple)',
        strokeWidth: 2,
      };
    }
    if (isHovered) {
      return {
        ...props.style,
        stroke: 'var(--node-border-hover, #6b7280)',
        strokeWidth: 2,
      };
    }
    return {
      stroke: 'var(--node-border, #4b5563)',
      strokeWidth: 1.5,
      ...props.style,
    };
  }, [isActionsOpen, isHovered, props.style]);

  if (props.id.startsWith('__preview')) {
    return (
      <path
        id={props.id}
        d={edgePath}
        fill="none"
        style={{
          stroke: 'var(--accent-purple)',
          strokeWidth: 1.5,
          pointerEvents: 'none',
          ...props.style,
        }}
        className="react-flow__edge-path pointer-events-none transition-all duration-150"
      />
    );
  }

  return (
    <>
      <path
        id={props.id}
        d={edgePath}
        fill="none"
        style={edgeStyle}
        markerEnd={props.markerEnd}
        markerStart={props.markerStart}
        className={cn(
          'react-flow__edge-path transition-[stroke,stroke-width] duration-200',
          isActionsOpen && 'stroke-accent-purple! stroke-[2px]!',
        )}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
        style={{ pointerEvents: 'stroke' }}
        onClick={handleLineClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          ref={labelRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isActionsOpen ? 'all' : 'none',
            zIndex: 100005,
          }}
          className="nodrag nopan z-100005"
        >
          <TooltipProvider>
            <div
              className={cn(
                'relative flex items-center justify-center rounded-lg border border-node-border bg-linear-to-br from-node-surface-from/95 to-node-surface-to/95 p-0.5 shadow-[0_8px_20px_var(--node-shadow)] backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out',
                isActionsOpen
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0',
              )}
            >
              <NodeActionButton
                label="حذف"
                onClick={handleDelete}
                className="hover:text-node-icon-foreground"
              >
                <Trash2 className="size-2.5" strokeWidth={1.8} />
              </NodeActionButton>
            </div>
          </TooltipProvider>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

