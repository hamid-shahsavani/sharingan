import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
} from '@xyflow/react';
import { cn } from 'cn';
import {
  ChevronsDown,
  Copy,
  Layers3,
  Link,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { NodeActionButton } from '@/features/main/_components/node-action-button';
import { NodeHandle } from '@/features/main/_components/node-handle';
import { type NodeVisualBounds } from '@/features/main/_types/flow';
import { TooltipProvider } from '@/features/shared/_uis/tooltip';

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
  onConnectStart?: (id: string) => void;
  onSelectAsConnectTarget?: (id: string) => void;
  isConnecting?: boolean;
  isConnectingSource?: boolean;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  onHover?: (id: string | null) => void;
  onVisualBoundsChange?: (id: string, bounds: NodeVisualBounds) => void;
}

export type NodeGroupProps = NodeProps<Node<NodeGroupData, 'group'>>;

export const NodeGroup = (props: NodeGroupProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const nodeRootRef = useRef<HTMLDivElement>(null);
  const { getViewport } = useReactFlow();

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

  useLayoutEffect(() => {
    const root = nodeRootRef.current;
    const reportBounds = props.data.onVisualBoundsChange;
    if (!root || !reportBounds) return;

    const updateBounds = (): void => {
      const rootRect = root.getBoundingClientRect();
      const zoom = getViewport().zoom || 1;
      const parts = [
        root,
        ...Array.from(
          root.querySelectorAll<HTMLElement>('[data-node-visual-part]'),
        ),
      ];
      const rects = parts.map((part) => part.getBoundingClientRect());
      const bounds: NodeVisualBounds = {
        left: Math.min(
          ...rects.map((rect) => (rect.left - rootRect.left) / zoom),
        ),
        top: Math.min(...rects.map((rect) => (rect.top - rootRect.top) / zoom)),
        right: Math.max(
          ...rects.map((rect) => (rect.right - rootRect.left) / zoom),
        ),
        bottom: Math.max(
          ...rects.map((rect) => (rect.bottom - rootRect.top) / zoom),
        ),
      };
      reportBounds(props.id, bounds);
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(root);
    return () => resizeObserver.disconnect();
  }, [getViewport, props.id, props.data.onVisualBoundsChange]);

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    props.data.onEdit?.(props.id);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (props.data.isConnecting) {
      event.stopPropagation();
      props.data.onSelectAsConnectTarget?.(props.id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (props.data.isConnecting) {
        event.preventDefault();
        event.stopPropagation();
        props.data.onSelectAsConnectTarget?.(props.id);
      }
    }
  };

  const hasChildren = Boolean(props.data.hasChildren);
  const isCollapsed = Boolean(props.data.isCollapsed);
  const isConnecting = Boolean(props.data.isConnecting);

  return (
    <div
      ref={nodeRootRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => props.data.onHover?.(props.id)}
      onMouseLeave={() => props.data.onHover?.(null)}
      className={cn(
        'group/node relative block w-fit max-w-37.5 min-w-0 select-none transition-all duration-200 ease-out',
        isActionsOpen && 'z-50',
        isConnecting && 'cursor-pointer',
      )}
    >
      <TooltipProvider>
        <div
          data-node-visual-part
          onMouseEnter={showActions}
          onMouseLeave={hideActions}
          className="group/node-icon absolute -top-9 left-1/2 -ml-3.5 size-7"
        >
          <span
            aria-hidden="true"
            className="pointer-events-auto absolute top-full inset-x-0 h-2.5"
          />
          <span
            aria-label="آیکون گروه"
            className="flex size-7 cursor-default items-center justify-center rounded-md border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-node-icon-foreground shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to group-hover/node:text-accent-purple"
          >
            <Layers3 size={14} strokeWidth={1.8} />
          </span>

          <div
            onMouseEnter={showActions}
            onMouseLeave={hideActions}
            className={cn(
              'absolute bottom-[calc(100%+4px)] left-1/2 z-100001 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from/95 to-node-surface-to/95 p-0.5 shadow-[0_8px_20px_var(--node-shadow)] backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out',
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
              <Pencil className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="اتصال"
              onClick={() => props.data.onConnectStart?.(props.id)}
            >
              <Link className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            {hasChildren && !isCollapsed && (
              <NodeActionButton
                label="جمع‌کردن فرزندان"
                onClick={() => props.data.onCollapse?.(props.id)}
              >
                <ChevronsDown className="size-2.5" strokeWidth={1.8} />
              </NodeActionButton>
            )}
            <NodeActionButton
              label="تکثیر"
              onClick={() => props.data.onClone?.(props.id)}
            >
              <Copy className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="حذف"
              onClick={() => props.data.onDelete?.(props.id)}
            >
              <Trash2 className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
          </div>
        </div>
      </TooltipProvider>

      <div className="mind-node-card group/node-card relative mx-auto box-border flex h-6.25 min-h-6.25 w-fit max-w-37.5 min-w-0 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-2 text-center text-node-text shadow-[0_14px_38px_var(--node-shadow)] transition-all duration-200 ease-out select-none hover:border-node-border-hover hover:from-node-surface-hover-from hover:to-node-surface-hover-to group-hover/node:border-node-border-hover">
        <div className="flex w-full min-w-0 flex-1 items-center justify-center overflow-hidden">
          <div
            dir="rtl"
            className="line-clamp-2 w-full min-w-0 overflow-hidden text-center text-[10px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-normal text-node-text transition-colors duration-200"
          >
            {props.data.title}
          </div>
        </div>
        <NodeHandle
          id="parent-target"
          nodeId={props.id}
          type="target"
          position={Position.Top}
        />
        <NodeHandle
          id="parent-source"
          nodeId={props.id}
          type="source"
          position={Position.Bottom}
        />
      </div>
    </div>
  );
};
