import {
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  Position,
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
import { TooltipProvider } from '@/features/shared/_uis/tooltip';

export interface RelationEdgeData extends Record<string, unknown> {
  onDelete?: (id: string) => void;
}

export type RelationEdgeProps = EdgeProps<Edge<RelationEdgeData>>;

export const RelationEdge = (props: RelationEdgeProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

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

  const sourcePosition = props.sourcePosition ?? Position.Bottom;
  const targetPosition = props.targetPosition ?? Position.Top;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition,
    borderRadius: 12,
  });

  const handleDelete = useCallback(() => {
    props.data?.onDelete?.(props.id);
  }, [props.data, props.id]);

  const handleLineClick = useCallback((event: MouseEvent<SVGPathElement>) => {
    event.stopPropagation();
    setIsActionsOpen((prev) => !prev);
  }, []);

  const isPreview = props.id.startsWith('__preview');

  const edgeStyle = useMemo<CSSProperties>(() => {
    if (isPreview) {
      return {
        stroke: 'var(--accent-purple)',
        strokeWidth: 1.5,
        strokeDasharray: '6 4',
        opacity: 0.7,
        pointerEvents: 'none',
        ...props.style,
      };
    }
    if (isActionsOpen) {
      return {
        ...props.style,
        stroke: 'var(--accent-purple)',
        strokeWidth: 2,
        strokeDasharray: '6 4',
      };
    }
    if (isHovered) {
      return {
        ...props.style,
        stroke: 'var(--node-border-hover, #6b7280)',
        strokeWidth: 2,
        strokeDasharray: '6 4',
      };
    }
    return {
      stroke: 'var(--accent-purple-muted)',
      strokeWidth: 1.5,
      strokeDasharray: '6 4',
      ...props.style,
    };
  }, [isActionsOpen, isHovered, isPreview, props.style]);

  if (isPreview) {
    return (
      <path
        id={props.id}
        d={edgePath}
        fill="none"
        style={edgeStyle}
        className="react-flow__edge-path pointer-events-none"
      />
    );
  }

  return (
    <>
      {/* Defs for animated dash */}
      <defs>
        <style>{`
          @keyframes relation-dash-${props.id.replace(/[^a-zA-Z0-9]/g, '_')} {
            to { stroke-dashoffset: -20; }
          }
        `}</style>
      </defs>

      {/* Animated dashed path */}
      <path
        id={props.id}
        d={edgePath}
        fill="none"
        style={{
          ...edgeStyle,
          strokeDasharray: isActionsOpen ? '6 3' : '6 4',
          strokeDashoffset: 0,
          animation: `relation-dash-${props.id.replace(/[^a-zA-Z0-9]/g, '_')} ${isActionsOpen ? '0.4s' : '0.6s'} linear infinite`,
        }}
        markerEnd={props.markerEnd}
        markerStart={props.markerStart}
        className={cn(
          'react-flow__edge-path transition-[stroke,stroke-width] duration-200',
          isActionsOpen && 'stroke-accent-purple!',
        )}
      />

      {/* Invisible wide hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
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
