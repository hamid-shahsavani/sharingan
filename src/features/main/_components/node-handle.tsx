import {
  Handle,
  type Position,
  useConnection,
} from '@xyflow/react';
import { cn } from 'cn';

export type NodeHandlePosition =
  | 'parent-target'
  | 'parent-source'
  | 'relation-target'
  | 'relation-source';

export interface NodeHandleProps {
  id: NodeHandlePosition;
  nodeId: string;
  type?: 'target' | 'source';
  position: Position;
  isConnectable?: boolean;
}

export const NodeHandle = (props: NodeHandleProps) => {
  const connection = useConnection((state) => {
    if (!state.inProgress) {
      return {
        isSource: false,
        isTarget: false,
      };
    }
    const isSource =
      state.fromNode?.id === props.nodeId && state.fromHandle?.id === props.id;
    const isTarget =
      state.toNode?.id === props.nodeId && state.toHandle?.id === props.id;
    return {
      isSource,
      isTarget,
    };
  });

  const isHighlighted = connection.isSource || connection.isTarget;

  return (
    <Handle
      id={props.id}
      type={props.type ?? 'source'}
      position={props.position}
      isConnectable={props.isConnectable}
      isConnectableStart={props.isConnectable}
      isConnectableEnd={props.isConnectable}
      style={{
        zIndex: isHighlighted ? 1000 : undefined,
      }}
      className={cn(
        'pointer-events-auto! size-3! rounded-full border-2! transition-[background-color,border-color,opacity] duration-200 ease-out',
        isHighlighted
          ? 'border-white! bg-accent-purple! opacity-100!'
          : 'border-surface-panel! bg-node-handle! opacity-0 group-hover/node-card:opacity-100',
      )}
    />
  );
};
