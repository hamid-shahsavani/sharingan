import {
  Handle,
  type Position,
} from '@xyflow/react';

export type NodeHandlePosition =
  | 'parent-target'
  | 'parent-source';

export interface NodeHandleProps {
  id: NodeHandlePosition;
  nodeId?: string;
  type?: 'target' | 'source';
  position: Position;
  isConnectable?: boolean;
}

export const NodeHandle = (props: NodeHandleProps) => {
  return (
    <Handle
      id={props.id}
      type={props.type ?? 'source'}
      position={props.position}
      isConnectable={false}
      isConnectableStart={false}
      isConnectableEnd={false}
      className="pointer-events-none! opacity-0! size-0! min-w-0! min-h-0! border-0! p-0! bg-transparent!"
    />
  );
};

