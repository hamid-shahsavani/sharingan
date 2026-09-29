import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Layers3, Pencil } from 'lucide-react';
import type { MouseEvent } from 'react';

export interface NodeGroupData extends Record<string, unknown> {
  title: string;
  onEdit?: (id: string) => void;
}

export type NodeGroupProps = NodeProps<Node<NodeGroupData, 'group'>>;

const HANDLE_BASE_CLASS =
  'pointer-events-auto! size-3! border-2! border-surface-panel! bg-node-handle! opacity-0 transition-opacity group-hover/node-card:opacity-100';

export const NodeGroup = (props: NodeGroupProps) => {
  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    props.data.onEdit?.(props.id);
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    props.data.onEdit?.(props.id);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="group/node relative block w-fit min-w-0 select-none transition-opacity duration-200 ease-out"
    >
      <div className="group/node-icon absolute -top-11 left-1/2 -ml-4.5 size-9">
        <span
          aria-label="آیکون گروه"
          className="node-drag-handle flex size-9 items-center justify-center rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to text-node-icon-foreground shadow-[0_6px_16px_var(--node-shadow)] transition-all duration-200 hover:cursor-grab active:cursor-grabbing group-hover/node:border-node-border-hover group-hover/node:from-node-surface-hover-from group-hover/node:to-node-surface-hover-to group-hover/node:text-accent-purple"
        >
          <Layers3 size={17} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mind-node-card group/node-card relative mx-auto box-border flex w-fit shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-node-border bg-linear-to-br from-node-surface-from to-node-surface-to px-2 text-center text-node-text shadow-[0_14px_38px_var(--node-shadow)] transition-all duration-200 ease-out select-none hover:border-node-border-hover hover:from-node-surface-hover-from hover:to-node-surface-hover-to group-hover/node:border-node-border-hover">
        <div className="flex w-full min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden py-1">
          <div
            dir="rtl"
            className="line-clamp-2 w-full min-w-0 overflow-hidden text-center text-[10px] leading-normal font-normal tracking-[-0.2px] wrap-break-word whitespace-normal text-node-text transition-colors duration-200"
          >
            {props.data.title}
          </div>
          {props.data.onEdit ? (
            <button
              type="button"
              aria-label="ویرایش نود گروه"
              onClick={handleEditClick}
              className="pointer-events-auto flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:text-accent-purple group-hover/node-card:opacity-100"
            >
              <Pencil size={10} strokeWidth={2} />
            </button>
          ) : null}
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
