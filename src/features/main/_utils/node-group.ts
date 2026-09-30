import { type Node } from '@xyflow/react';

import { generateNumericId } from '@/features/shared/_utils/database';

export interface PositionCoordinates {
  x: number;
  y: number;
}

export const NODE_DEFAULT_WIDTH = 180;
export const NODE_DEFAULT_HEIGHT = 80;
export const NODE_SPACING_X = 220;
export const NODE_SPACING_Y = 120;
export const GRID_SNAP = 20;

export function isNodeOverlapping(
  posA: PositionCoordinates,
  posB: PositionCoordinates,
  minDistanceX: number = 190,
  minDistanceY: number = 95,
): boolean {
  return (
    Math.abs(posA.x - posB.x) < minDistanceX &&
    Math.abs(posA.y - posB.y) < minDistanceY
  );
}

export function isPositionAvailable(
  pos: PositionCoordinates,
  existingNodes: readonly Node[],
  excludeNodeId?: string,
  minDistanceX: number = 190,
  minDistanceY: number = 95,
): boolean {
  return !existingNodes.some((node) => {
    if (excludeNodeId && node.id === excludeNodeId) {
      return false;
    }
    return isNodeOverlapping(pos, node.position, minDistanceX, minDistanceY);
  });
}

export function findNearestAvailablePosition(
  target: PositionCoordinates,
  existingNodes: readonly Node[],
  options?: {
    excludeNodeId?: string;
    stepX?: number;
    stepY?: number;
  },
): PositionCoordinates {
  const stepX = options?.stepX ?? NODE_SPACING_X;
  const stepY = options?.stepY ?? NODE_SPACING_Y;
  const excludeNodeId = options?.excludeNodeId;

  if (isPositionAvailable(target, existingNodes, excludeNodeId)) {
    return target;
  }

  const maxRings = 25;
  for (let ring = 1; ring <= maxRings; ring++) {
    const candidates: Array<{ pos: PositionCoordinates; distance: number }> = [];

    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) {
          continue;
        }

        const candidate: PositionCoordinates = {
          x: target.x + dx * stepX,
          y: target.y + dy * stepY,
        };

        if (isPositionAvailable(candidate, existingNodes, excludeNodeId)) {
          const distance =
            Math.hypot(dx * stepX, dy * stepY) +
            (dy < 0 ? 40 : 0) +
            (dx < 0 ? 20 : 0);
          candidates.push({ pos: candidate, distance });
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      return candidates[0].pos;
    }
  }

  return {
    x: target.x + stepX,
    y: target.y + stepY,
  };
}

export function getNewNodePosition(
  viewportCenter: PositionCoordinates,
  existingNodes: readonly Node[],
): PositionCoordinates {
  const targetX =
    Math.round((viewportCenter.x - NODE_DEFAULT_WIDTH / 2) / GRID_SNAP) *
    GRID_SNAP;
  const targetY =
    Math.round((viewportCenter.y - NODE_DEFAULT_HEIGHT / 2) / GRID_SNAP) *
    GRID_SNAP;
  const target: PositionCoordinates = { x: targetX, y: targetY };

  if (isPositionAvailable(target, existingNodes)) {
    return target;
  }

  return findNearestAvailablePosition(target, existingNodes);
}

export function getClonedNodePosition(
  sourceNode: Node,
  existingNodes: readonly Node[],
): PositionCoordinates {
  const origin = sourceNode.position;
  const preferredRight: PositionCoordinates = {
    x: Math.round((origin.x + NODE_SPACING_X) / GRID_SNAP) * GRID_SNAP,
    y: Math.round(origin.y / GRID_SNAP) * GRID_SNAP,
  };

  if (isPositionAvailable(preferredRight, existingNodes)) {
    return preferredRight;
  }

  const preferredBelow: PositionCoordinates = {
    x: Math.round(origin.x / GRID_SNAP) * GRID_SNAP,
    y: Math.round((origin.y + NODE_SPACING_Y) / GRID_SNAP) * GRID_SNAP,
  };

  if (isPositionAvailable(preferredBelow, existingNodes)) {
    return preferredBelow;
  }

  return findNearestAvailablePosition(preferredRight, existingNodes);
}

export function getMovedNodePosition(
  sourceNode: Node,
  existingNodes: readonly Node[],
): PositionCoordinates {
  const origin = sourceNode.position;
  const preferred: PositionCoordinates = {
    x: Math.round((origin.x + NODE_SPACING_X) / GRID_SNAP) * GRID_SNAP,
    y: Math.round(origin.y / GRID_SNAP) * GRID_SNAP,
  };
  return findNearestAvailablePosition(preferred, existingNodes, {
    excludeNodeId: sourceNode.id,
  });
}

export function calculateOffsetPosition(
  center: PositionCoordinates,
  offsetRange: number = 60,
): PositionCoordinates {
  return {
    x: Math.round((center.x + offsetRange) / GRID_SNAP) * GRID_SNAP,
    y: Math.round(center.y / GRID_SNAP) * GRID_SNAP,
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
