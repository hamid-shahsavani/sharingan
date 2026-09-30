import { type Node } from '@xyflow/react';

import { generateNumericId } from '@/features/shared/_utils/database';

export interface PositionCoordinates {
  x: number;
  y: number;
}

export function calculateOffsetPosition(
  center: PositionCoordinates,
  offsetRange: number = 60,
): PositionCoordinates {
  const randomOffset = (Math.random() - 0.5) * offsetRange;
  return {
    x: Math.round(center.x + randomOffset),
    y: Math.round(center.y + randomOffset),
  };
}

export function createGroupNode(
  title: string,
  position: PositionCoordinates,
  id: string = generateNumericId(),
): Node {
  return {
    id,
    type: 'group',
    position,
    data: {
      title,
    },
  };
}

export function updateNodeTitle(
  nodes: Node[],
  nodeId: string,
  title: string,
): Node[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          title,
        },
      };
    }
    return node;
  });
}
