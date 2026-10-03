import { type InternalNode, type Node } from '@xyflow/react';

import { getNodeWidth } from '@/features/main/_utils/node-layout';

export type BoxSide = 'top' | 'bottom';

export interface IconBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface IntelligentConnectionResult {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceSide: BoxSide;
  targetSide: BoxSide;
}

export const ICON_SIZE = 28;
export const ICON_INSET = 3;

export interface NodeLike {
  position?: { x: number; y: number };
  measured?: { width?: number; height?: number };
  type?: string;
  data?: Record<string, unknown>;
  internals?: { positionAbsolute?: { x: number; y: number } };
}

/**
 * Computes the exact bounding box of the 28x28 icon element on a node in flow coordinates.
 */
export function getIconBox(
  node: Node | InternalNode | NodeLike,
): IconBox {
  const internals = 'internals' in node ? node.internals : undefined;
  const nodeX = internals?.positionAbsolute?.x ?? node.position?.x ?? 0;
  const nodeY = internals?.positionAbsolute?.y ?? node.position?.y ?? 0;
  const nodeWidth =
    node.measured?.width && node.measured.width > 0
      ? node.measured.width
      : getNodeWidth(node as Node);

  let iconX: number;
  let iconY: number;

  if (node.type === 'markdown') {
    const header = node.data?.header;
    const hasHeader =
      typeof header === 'string' && header.trim().length > 0;
    const iconTopOffset = hasHeader ? -56 : -36;
    iconX = nodeX + nodeWidth - ICON_SIZE;
    iconY = nodeY + iconTopOffset;
  } else {
    // Default group node: icon is horizontally centered via left-1/2 -ml-3.5
    iconX = nodeX + nodeWidth / 2 - ICON_SIZE / 2;
    iconY = nodeY - 36;
  }

  return {
    x: iconX,
    y: iconY,
    width: ICON_SIZE,
    height: ICON_SIZE,
    centerX: iconX + ICON_SIZE / 2,
    centerY: iconY + ICON_SIZE / 2,
  };
}

/**
 * Determines whether to connect from top or bottom on the source and target icons,
 * exclusively using top and bottom sides (no left or right connections), with an inset
 * so the line starts and ends cleanly inside the icon section without any gap or protruding tip.
 */
export function getIntelligentIconConnection(
  sourceBox: IconBox,
  targetBox: IconBox,
  inset: number = ICON_INSET,
): IntelligentConnectionResult {
  const isTargetBelow = targetBox.centerY >= sourceBox.centerY;

  const sourceSide: BoxSide = isTargetBelow ? 'bottom' : 'top';
  const targetSide: BoxSide = isTargetBelow ? 'top' : 'bottom';

  const sourceX = sourceBox.centerX;
  const sourceY =
    sourceSide === 'bottom'
      ? sourceBox.y + sourceBox.height - inset
      : sourceBox.y + inset;

  const targetX = targetBox.centerX;
  const targetY =
    targetSide === 'top'
      ? targetBox.y + inset
      : targetBox.y + targetBox.height - inset;

  return {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceSide,
    targetSide,
  };
}
