import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from '@xyflow/react';
import { cn } from 'cn';
import {
  ChevronDown,
  ChevronsDown,
  ChevronUp,
  Copy,
  CornerDownRight,
  FileText,
  GitMerge,
  Link,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  type FocusEvent,
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

export interface NodeMarkdownData extends Record<string, unknown> {
  header: string;
  body: string;
  footer?: string;
  title?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
  onFocus?: (id: string) => void;
  onAi?: (id: string) => void;
  onNote?: (id: string) => void;
  onMove?: (id: string) => void;
  onCollapse?: (id: string) => void;
  onExpand?: (id: string) => void;
  onConnectStart?: (id: string) => void;
  onRelationStart?: (id: string) => void;
  onSelectAsConnectTarget?: (id: string) => void;
  onSelectAsRelationTarget?: (id: string) => void;
  isConnecting?: boolean;
  isRelating?: boolean;
  isConnectingSource?: boolean;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  onHover?: (id: string | null) => void;
  onVisualBoundsChange?: (id: string, bounds: NodeVisualBounds) => void;
}

export type NodeMarkdownProps = NodeProps<Node<NodeMarkdownData, 'markdown'>>;

export const NodeMarkdown = (props: NodeMarkdownProps) => {
  const isConnecting = Boolean(props.data.isConnecting);
  const isRelating = Boolean(props.data.isRelating);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [hasMoreText, setHasMoreText] = useState(false);
  const hasHeader = Boolean(props.data.header?.trim());
  const hasFooter = Boolean(props.data.footer?.trim());
  const hasChildren = Boolean(props.data.hasChildren);
  const isCollapsed = Boolean(props.data.isCollapsed);
  const isActionsVisible = isActionsOpen && !isConnecting && !isRelating;
  const nodeRootRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLSpanElement>(null);
  const { getViewport } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(props.id);
  }, [props.id, hasHeader, updateNodeInternals]);

  useEffect(() => {
    const nodeElement =
      nodeRootRef.current?.closest<HTMLElement>('.react-flow__node');
    if (!nodeElement) return;
    if (isActionsVisible) {
      nodeElement.style.zIndex = '1000';
    } else {
      nodeElement.style.zIndex = '';
    }
  }, [isActionsVisible]);

  useEffect(() => {
    if (!isActionsVisible) return;
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        nodeRootRef.current &&
        !nodeRootRef.current.contains(event.target as globalThis.Node)
      ) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isActionsVisible]);

  useLayoutEffect(() => {
    const textElement = textContentRef.current;
    if (!textElement) return;
    const checkOverflow = () => {
      if (!isTextExpanded) {
        setHasMoreText(textElement.scrollHeight > textElement.clientHeight + 1);
      }
    };
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(textElement);
    return () => observer.disconnect();
  }, [isTextExpanded, props.data.body]);

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

  const handleMouseEnter = useCallback(() => {
    props.data.onHover?.(props.id);
  }, [props.data, props.id]);

  const handleMouseLeave = useCallback(() => {
    props.data.onHover?.(null);
  }, [props.data]);

  const handleIconClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      if (props.data.isConnecting) {
        props.data.onSelectAsConnectTarget?.(props.id);
        return;
      }
      if (props.data.isRelating) {
        props.data.onSelectAsRelationTarget?.(props.id);
        return;
      }
      setIsActionsOpen((prev) => !prev);
    },
    [props.data, props.id],
  );

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsActionsOpen(false);
    }
  }, []);

  const closeActions = useCallback(() => {
    setIsActionsOpen(false);
  }, []);

  return (
    <div
      ref={nodeRootRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      className={cn(
        'group/node relative block w-fit min-w-0 select-none transition-all duration-200 ease-out',
        isActionsVisible && 'z-50',
      )}
    >
      <TooltipProvider>
        <div
          data-node-visual-part
          className={cn(
            'group/node-icon absolute right-0 size-7',
            hasHeader ? '-top-14' : '-top-9',
          )}
        >
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
          <span
            aria-label="آیکون مارک‌داون"
            role="button"
            tabIndex={0}
            onClick={handleIconClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                handleIconClick(e as unknown as MouseEvent<HTMLSpanElement>);
            }}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-node-icon-foreground shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to group-hover/node:text-accent-purple"
          >
            <FileText size={14} strokeWidth={1.8} />
          </span>

          <div
            className={cn(
              'absolute bottom-[calc(100%+4px)] left-1/2 z-100001 flex -translate-x-1/2 items-center gap-0.5 rounded-md border border-node-border bg-linear-to-br from-node-surface-from/95 to-node-surface-to/95 p-0.5 shadow-[0_8px_20px_var(--node-shadow)] backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out',
              isActionsVisible
                ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-1 scale-95 opacity-0',
            )}
          >
            <NodeActionButton
              label="ویرایش"
              onClick={() => {
                props.data.onEdit?.(props.id);
                closeActions();
              }}
            >
              <Pencil className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="اتصال"
              onClick={() => {
                props.data.onConnectStart?.(props.id);
                closeActions();
              }}
            >
              <Link className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="ارتباط"
              onClick={() => {
                props.data.onRelationStart?.(props.id);
                closeActions();
              }}
            >
              <GitMerge className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            {hasChildren && !isCollapsed && (
              <NodeActionButton
                label="جمع‌کردن فرزندان"
                onClick={() => {
                  props.data.onCollapse?.(props.id);
                  closeActions();
                }}
              >
                <ChevronsDown className="size-2.5" strokeWidth={1.8} />
              </NodeActionButton>
            )}
            {hasChildren && isCollapsed && (
              <NodeActionButton
                label="نمایش فرزندان"
                onClick={() => {
                  (props.data.onExpand ?? props.data.onCollapse)?.(props.id);
                  closeActions();
                }}
              >
                <ChevronsDown
                  className="size-2.5 rotate-180"
                  strokeWidth={1.8}
                />
              </NodeActionButton>
            )}
            <NodeActionButton
              label="تکثیر"
              onClick={() => {
                props.data.onClone?.(props.id);
                closeActions();
              }}
            >
              <Copy className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="جابه‌جایی"
              onClick={() => {
                props.data.onMove?.(props.id);
                closeActions();
              }}
            >
              <CornerDownRight className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
            <NodeActionButton
              label="حذف"
              onClick={() => {
                props.data.onDelete?.(props.id);
                closeActions();
              }}
            >
              <Trash2 className="size-2.5" strokeWidth={1.8} />
            </NodeActionButton>
          </div>
        </div>
      </TooltipProvider>

      {hasHeader && (
        <div
          data-node-visual-part
          dir="rtl"
          className="absolute -top-5 right-0 z-10 flex min-h-5 max-w-full items-center rounded-t-md border border-b-0! border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-1.5 text-node-text shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to"
        >
          <span className="min-w-0 overflow-hidden text-right text-[8px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-normal text-node-text transition-colors duration-200">
            {props.data.header}
          </span>
        </div>
      )}

      <div
        className={cn(
          'mind-node-card group/node-card relative mx-auto box-border flex w-fit min-w-36 max-w-56 shrink-0 flex-col items-stretch justify-center gap-1 rounded-md border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-1.5 py-1 text-right text-node-text shadow-[0_14px_38px_var(--node-shadow)] transition-all duration-200 ease-out select-none hover:border-node-border-hover hover:from-node-surface-hover-from hover:to-node-surface-hover-to group-hover/node:border-node-border-hover',
          hasHeader && 'rounded-tr-none!',
          hasFooter && 'rounded-bl-none!',
        )}
      >
        <section
          dir="rtl"
          className="relative w-full cursor-default rounded-sm p-0.5 text-right text-[8px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-pre-wrap text-node-text transition-colors duration-200"
        >
          <span
            ref={textContentRef}
            className={cn(
              'block overflow-hidden',
              !isTextExpanded && 'line-clamp-5',
            )}
          >
            {props.data.body}
          </span>
          {hasMoreText && (
            <button
              type="button"
              aria-label={isTextExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
              onClick={(event) => {
                event.stopPropagation();
                setIsTextExpanded((expanded) => !expanded);
              }}
              className="absolute top-0.5 left-0.5 z-10 flex size-3.5 cursor-pointer items-center justify-center rounded-full text-accent-purple transition-colors hover:bg-accent-purple/15"
            >
              {isTextExpanded ? (
                <ChevronUp className="size-2.5" />
              ) : (
                <ChevronDown className="size-2.5" />
              )}
            </button>
          )}
        </section>
      </div>

      {hasFooter && (
        <div
          data-node-visual-part
          dir="ltr"
          className="absolute -bottom-5 left-0 z-10 flex min-h-5 max-w-full items-center rounded-b-md border border-t-0! border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-1.5 text-node-text shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to"
        >
          <span className="min-w-0 overflow-hidden text-left text-[8px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-normal text-node-text transition-colors duration-200">
            {props.data.footer}
          </span>
        </div>
      )}

      {hasChildren && isCollapsed && (
        <div
          aria-hidden="true"
          className={cn(
            'nodrag nopan absolute left-1/2 z-20 flex h-3.5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-node-icon-foreground shadow-[0_4px_10px_var(--node-shadow)] transition-colors group-hover/node:border-node-border-hover',
            hasFooter ? '-bottom-9' : '-bottom-5',
          )}
        >
          <MoreHorizontal className="size-2.5" strokeWidth={2} />
        </div>
      )}
    </div>
  );
};
