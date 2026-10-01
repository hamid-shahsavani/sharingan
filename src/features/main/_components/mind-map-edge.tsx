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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { NodeActionButton } from '@/features/main/_components/node-action-button';
import { TooltipProvider } from '@/features/shared/_uis/tooltip';

export interface MindMapEdgeData extends Record<string, unknown> {
  onDelete?: (id: string) => void;
}

export type MindMapEdgeProps = EdgeProps<Edge<MindMapEdgeData>>;

export const MindMapEdge = (props: MindMapEdgeProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const showActions = useCallback(() => {
    clearTimeout(actionsTimeoutRef.current);
    setIsActionsOpen(true);
  }, []);

  const hideActions = useCallback(() => {
    actionsTimeoutRef.current = setTimeout(() => {
      setIsActionsOpen(false);
    }, 300);
  }, []);

  useEffect(() => {
    return () => clearTimeout(actionsTimeoutRef.current);
  }, []);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition ?? Position.Bottom,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition ?? Position.Top,
    borderRadius: 8,
  });

  const handleDelete = useCallback(() => {
    props.data?.onDelete?.(props.id);
  }, [props.data, props.id]);

  const edgeStyle = useMemo<CSSProperties>(() => {
    if (isActionsOpen) {
      return {
        ...props.style,
        stroke: 'var(--accent-purple)',
        strokeWidth: 2,
      };
    }
    return {
      stroke: 'var(--node-border, #4b5563)',
      strokeWidth: 1.5,
      ...props.style,
    };
  }, [isActionsOpen, props.style]);

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
        strokeWidth={28}
        className="cursor-pointer"
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={showActions}
        onMouseLeave={hideActions}
      />
      <EdgeLabelRenderer>
        <div
          onMouseEnter={showActions}
          onMouseLeave={hideActions}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={cn(
            'nodrag nopan z-100001',
            isActionsOpen ? 'pointer-events-auto' : 'pointer-events-none',
          )}
        >
          <TooltipProvider>
            <div
              className={cn(
                'relative flex items-center gap-0.5 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from/95 to-node-surface-to/95 p-0.5 shadow-[0_8px_20px_var(--node-shadow)] backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out',
                isActionsOpen
                  ? 'scale-100 opacity-100'
                  : 'scale-95 opacity-0',
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-auto absolute -inset-3"
              />
              <NodeActionButton
                label="حذف"
                onClick={handleDelete}
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
