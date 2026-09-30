import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useViewport,
} from '@xyflow/react';
import { cn } from 'cn';
import {
  ChevronsDown,
  Copy,
  Layers3,
  Move,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface NodeGroupData extends Record<string, unknown> {
  title: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
  onFocus?: (id: string) => void;
  onAi?: (id: string) => void;
  onNote?: (id: string) => void;
  onMove?: (id: string) => void;
  onCollapse?: (id: string) => void;
  hasChildren?: boolean;
  isCollapsed?: boolean;
}

export type NodeGroupProps = NodeProps<Node<NodeGroupData, 'group'>>;

interface NodeActionButtonProps {
  label: string;
  compact?: boolean;
  className?: string;
  tooltipClassName?: string;
  children: ReactNode;
  onClick: () => void;
}

const NodeActionButton = ({
  label,
  compact = false,
  className,
  tooltipClassName,
  children,
  onClick,
}: NodeActionButtonProps) => {
  const { zoom } = useViewport();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'icon-xs' : 'icon-sm'}
            aria-label={label}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className={cn(
              'nodrag nopan flex cursor-pointer items-center justify-center rounded-md border border-transparent transition-all duration-200',
              compact
                ? 'size-5 bg-transparent text-tertiary-foreground hover:bg-transparent hover:brightness-105'
                : 'size-6 text-node-icon-foreground hover:text-accent-purple',
              className,
            )}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="top" zoom={zoom} className={tooltipClassName}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

const HANDLE_BASE_CLASS =
  'pointer-events-auto! size-3! border-2! border-surface-panel! bg-node-handle! opacity-0 transition-opacity group-hover/node-card:opacity-100';

export const NodeGroup = (props: NodeGroupProps) => {
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
    }, 400);
  }, []);

  useEffect(() => {
    return () => clearTimeout(actionsTimeoutRef.current);
  }, []);

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    props.data.onEdit?.(props.id);
  };

  const hasChildren = Boolean(props.data.hasChildren);
  const isCollapsed = Boolean(props.data.isCollapsed);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group/node relative block w-fit min-w-0 select-none transition-opacity duration-200 ease-out',
        isActionsOpen && 'z-50',
      )}
    >
      <TooltipProvider>
        <div
          data-node-visual-part
          onMouseEnter={showActions}
          onMouseLeave={hideActions}
          className="group/node-icon absolute -top-11 left-1/2 -ml-4.5 size-9"
        >
          <span
            aria-label="آیکون گروه"
            className="node-drag-handle flex size-9 cursor-grab items-center justify-center rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-node-icon-foreground shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 hover:cursor-grab active:cursor-grabbing group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to group-hover/node:text-accent-purple"
          >
            <Layers3 size={17} strokeWidth={1.8} />
          </span>

          <div
            onMouseEnter={showActions}
            onMouseLeave={hideActions}
            className={cn(
              'absolute bottom-[calc(100%+4px)] left-1/2 z-100001 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from/95 to-node-surface-to/95 p-1 shadow-[0_8px_20px_var(--node-shadow)] backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out',
              isActionsOpen
                ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-1 scale-95 opacity-0',
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-auto absolute -bottom-5 -inset-x-6 h-5"
            />
            <NodeActionButton
              label="ویرایش"
              onClick={() => props.data.onEdit?.(props.id)}
            >
              <Pencil size={13} strokeWidth={1.8} />
            </NodeActionButton>
            {hasChildren && !isCollapsed && (
              <NodeActionButton
                label="جمع‌کردن فرزندان"
                onClick={() => props.data.onCollapse?.(props.id)}
              >
                <ChevronsDown size={13} strokeWidth={1.8} />
              </NodeActionButton>
            )}
            <NodeActionButton
              label="انتقال"
              onClick={() => props.data.onMove?.(props.id)}
            >
              <Move size={13} strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="تکثیر"
              onClick={() => props.data.onClone?.(props.id)}
            >
              <Copy size={13} strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="حذف"
              onClick={() => props.data.onDelete?.(props.id)}
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </NodeActionButton>
          </div>
        </div>
      </TooltipProvider>

      <div className="mind-node-card group/node-card relative mx-auto box-border flex w-fit shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-2 text-center text-node-text shadow-[0_14px_38px_var(--node-shadow)] transition-all duration-200 ease-out select-none hover:border-node-border-hover hover:from-node-surface-hover-from hover:to-node-surface-hover-to group-hover/node:border-node-border-hover">
        <div className="flex w-full min-w-0 flex-1 items-center justify-center overflow-hidden py-1">
          <div
            dir="rtl"
            className="line-clamp-2 w-full min-w-0 overflow-hidden text-center text-[10px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-normal text-node-text transition-colors duration-200"
          >
            {props.data.title}
          </div>
        </div>
        <Handle
          id="parent-target"
          type="target"
          position={Position.Top}
          isConnectable={props.isConnectable}
          className={HANDLE_BASE_CLASS}
        />
        <Handle
          id="relation-target"
          type="target"
          position={Position.Left}
          isConnectable={props.isConnectable}
          className={HANDLE_BASE_CLASS}
        />
        <Handle
          id="parent-source"
          type="source"
          position={Position.Bottom}
          isConnectable={props.isConnectable}
          className={HANDLE_BASE_CLASS}
        />
        <Handle
          id="relation-source"
          type="source"
          position={Position.Right}
          isConnectable={props.isConnectable}
          className={HANDLE_BASE_CLASS}
        />
      </div>
    </div>
  );
};
