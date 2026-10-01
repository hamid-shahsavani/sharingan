import { type Edge, type Node } from '@xyflow/react';

export interface PositionCoordinates {
  x: number;
  y: number;
}

export const NODE_CARD_HEIGHT = 32;
export const NODE_ICON_HEIGHT = 36;
export const NODE_TOTAL_HEIGHT = NODE_CARD_HEIGHT + NODE_ICON_HEIGHT;
export const STANDARD_GAP = 40;
export const SIBLING_GAP = STANDARD_GAP;
export const SECTION_GAP = STANDARD_GAP;
export const LEVEL_Y_STEP = NODE_TOTAL_HEIGHT + STANDARD_GAP;

let textMeasureCanvas: HTMLCanvasElement | null = null;

function estimateTextWidth(text: string): number {
  if (typeof document !== 'undefined') {
    if (!textMeasureCanvas) {
      textMeasureCanvas = document.createElement('canvas');
    }
    const context = textMeasureCanvas.getContext('2d');
    if (context) {
      context.font = '10px IRANSansX, sans-serif';
      const measured = context.measureText(text).width;
      if (measured > 0) {
        return measured;
      }
    }
  }

  return text.length * 7;
}

export function getNodeWidth(node?: Node): number {
  if (typeof node?.measured?.width === 'number' && node.measured.width > 0) {
    return Math.ceil(node.measured.width);
  }

  const title = typeof node?.data?.title === 'string' ? node.data.title : '';
  if (!title) return 48;

  const textWidth = estimateTextWidth(title);
  const cardWidth = Math.ceil(textWidth + 18);
  return Math.min(150, Math.max(48, cardWidth));
}

export interface SubtreeResult {
  nodeId: string;
  nodeWidth: number;
  rootX: number;
  width: number;
  height: number;
  positions: Map<string, PositionCoordinates>;
  leftContour: number[];
  rightContour: number[];
}

function computeSubtree(
  nodeId: string,
  nodeMap: Map<string, Node>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>,
): SubtreeResult {
  visited.add(nodeId);
  const node = nodeMap.get(nodeId);
  const nodeW = getNodeWidth(node);

  const rawChildren = childrenMap.get(nodeId) || [];
  const children = rawChildren.filter((id) => !visited.has(id) && nodeMap.has(id));

  if (children.length === 0) {
    return {
      nodeId,
      nodeWidth: nodeW,
      rootX: 0,
      width: nodeW,
      height: NODE_CARD_HEIGHT,
      positions: new Map([[nodeId, { x: 0, y: 0 }]]),
      leftContour: [0],
      rightContour: [nodeW],
    };
  }

  const childSubtrees: SubtreeResult[] = [];
  for (const childId of children) {
    childSubtrees.push(computeSubtree(childId, nodeMap, childrenMap, visited));
  }

  const childX: number[] = [0];
  const accumulatedRightContour = [...childSubtrees[0].rightContour];

  for (let i = 1; i < childSubtrees.length; i++) {
    const child = childSubtrees[i];
    let shift = 0;
    const maxSharedDepth = Math.min(
      accumulatedRightContour.length,
      child.leftContour.length,
    );

    for (let d = 0; d < maxSharedDepth; d++) {
      const required =
        accumulatedRightContour[d] + SIBLING_GAP - child.leftContour[d];
      if (required > shift) {
        shift = required;
      }
    }

    childX.push(shift);

    for (let d = 0; d < child.rightContour.length; d++) {
      const val = shift + child.rightContour[d];
      if (d < accumulatedRightContour.length) {
        accumulatedRightContour[d] = Math.max(accumulatedRightContour[d], val);
      } else {
        accumulatedRightContour.push(val);
      }
    }
  }

  const firstChildCenter =
    childX[0] +
    childSubtrees[0].rootX +
    childSubtrees[0].nodeWidth / 2;
  const lastChildCenter =
    childX[childX.length - 1] +
    childSubtrees[childSubtrees.length - 1].rootX +
    childSubtrees[childSubtrees.length - 1].nodeWidth / 2;
  const childrenCenter = (firstChildCenter + lastChildCenter) / 2;

  let parentX = Math.round(childrenCenter - nodeW / 2);

  if (parentX < 0) {
    const shiftChildren = -parentX;
    parentX = 0;
    for (let i = 0; i < childX.length; i++) {
      childX[i] += shiftChildren;
    }
    for (let d = 0; d < accumulatedRightContour.length; d++) {
      accumulatedRightContour[d] += shiftChildren;
    }
  }

  const positions = new Map<string, PositionCoordinates>([[nodeId, { x: parentX, y: 0 }]]);
  let maxChildHeight = 0;

  for (let i = 0; i < childSubtrees.length; i++) {
    const child = childSubtrees[i];
    const offsetX = childX[i];
    if (child.height > maxChildHeight) {
      maxChildHeight = child.height;
    }
    for (const [subId, pos] of child.positions) {
      positions.set(subId, {
        x: pos.x + offsetX,
        y: pos.y + LEVEL_Y_STEP,
      });
    }
  }

  const leftContour: number[] = [parentX];
  const maxChildDepth = Math.max(...childSubtrees.map((c) => c.leftContour.length));

  for (let d = 0; d < maxChildDepth; d++) {
    let minLeft = Infinity;
    for (let i = 0; i < childSubtrees.length; i++) {
      if (d < childSubtrees[i].leftContour.length) {
        const val = childX[i] + childSubtrees[i].leftContour[d];
        if (val < minLeft) minLeft = val;
      }
    }
    leftContour.push(minLeft);
  }

  const rightContour = [parentX + nodeW, ...accumulatedRightContour];

  let minAllX = parentX;
  let maxAllX = parentX + nodeW;
  for (const [subId, pos] of positions) {
    const w = getNodeWidth(nodeMap.get(subId));
    if (pos.x < minAllX) minAllX = pos.x;
    if (pos.x + w > maxAllX) maxAllX = pos.x + w;
  }

  if (minAllX !== 0) {
    for (const [id, pos] of positions) {
      positions.set(id, { x: pos.x - minAllX, y: pos.y });
    }
    parentX -= minAllX;
    maxAllX -= minAllX;
    for (let d = 0; d < leftContour.length; d++) {
      leftContour[d] -= minAllX;
      rightContour[d] -= minAllX;
    }
  }

  return {
    nodeId,
    nodeWidth: nodeW,
    rootX: parentX,
    width: maxAllX,
    height: LEVEL_Y_STEP + maxChildHeight,
    positions,
    leftContour,
    rightContour,
  };
}

export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: readonly Edge[],
): boolean {
  if (sourceId === targetId) return true;

  const visited = new Set<string>();
  const queue: string[] = [targetId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current === sourceId) return true;
    visited.add(current);

    for (const edge of edges) {
      if (edge.source === current && !visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return false;
}

export function isParentChildEdge(edge: {
  sourceHandle?: string | null;
  targetHandle?: string | null;
}): boolean {
  if (
    edge.sourceHandle?.startsWith('relation-') ||
    edge.targetHandle?.startsWith('relation-')
  ) {
    return false;
  }

  if (
    edge.sourceHandle &&
    edge.sourceHandle !== 'parent-source' &&
    edge.targetHandle &&
    edge.targetHandle !== 'parent-target'
  ) {
    return false;
  }
  return true;
}

export function getDescendantNodeIds(
  rootNodeId: string,
  nodes: readonly Node[],
  edges: readonly Edge[],
): Set<string> {
  const childrenMap = new Map<string, string[]>();

  for (const node of nodes) {
    if (node.parentId) {
      const list = childrenMap.get(node.parentId) ?? [];
      list.push(node.id);
      childrenMap.set(node.parentId, list);
    }
  }

  for (const edge of edges) {
    if (!isParentChildEdge(edge)) {
      continue;
    }

    const list = childrenMap.get(edge.source) ?? [];
    list.push(edge.target);
    childrenMap.set(edge.source, list);
  }

  const descendantIds = new Set<string>();
  const queue: string[] = [...(childrenMap.get(rootNodeId) ?? [])];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || descendantIds.has(currentId)) continue;
    descendantIds.add(currentId);
    const children = childrenMap.get(currentId);
    if (children) {
      queue.push(...children);
    }
  }

  return descendantIds;
}

export function calculateStandardLayout(
  nodes: readonly Node[],
  edges: readonly Edge[],
): Node[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const parentMap = new Map<string, string>();
  const childrenMap = new Map<string, string[]>();

  const wouldFormCycle = (source: string, target: string): boolean => {
    if (source === target) return true;
    let current: string | undefined = source;
    const seen = new Set<string>();
    while (current) {
      if (current === target) return true;
      if (seen.has(current)) break;
      seen.add(current);
      current = parentMap.get(current);
    }
    return false;
  };

  for (const edge of edges) {
    if (!isParentChildEdge(edge)) {
      continue;
    }

    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      if (
        !parentMap.has(edge.target) &&
        !wouldFormCycle(edge.source, edge.target)
      ) {
        parentMap.set(edge.target, edge.source);
        const list = childrenMap.get(edge.source) || [];
        list.push(edge.target);
        childrenMap.set(edge.source, list);
      }
    }
  }

  const rootIds: string[] = [];
  for (const node of nodes) {
    if (!parentMap.has(node.id)) {
      rootIds.push(node.id);
    }
  }

  const multiNodeRoots: string[] = [];
  const singleNodeRoots: string[] = [];

  for (const rootId of rootIds) {
    const children = childrenMap.get(rootId) || [];
    if (children.length > 0) {
      multiNodeRoots.push(rootId);
    } else {
      singleNodeRoots.push(rootId);
    }
  }

  const allPositions = new Map<string, PositionCoordinates>();
  const visited = new Set<string>();

  if (multiNodeRoots.length === 0) {
    // Only standalone single nodes exist
    const totalCount = singleNodeRoots.length;
    const cols =
      totalCount <= 3
        ? totalCount
        : totalCount === 4
          ? 2
          : totalCount <= 6
            ? 3
            : 4;

    const colWidths: number[] = new Array<number>(cols).fill(0);
    for (let i = 0; i < totalCount; i++) {
      const colIndex = i % cols;
      const w = getNodeWidth(nodeMap.get(singleNodeRoots[i]));
      if (w > colWidths[colIndex]) {
        colWidths[colIndex] = w;
      }
    }

    const colStarts: number[] = [0];
    for (let c = 1; c < cols; c++) {
      colStarts.push(colStarts[c - 1] + colWidths[c - 1] + SIBLING_GAP);
    }

    const rowStep = NODE_TOTAL_HEIGHT + SIBLING_GAP;

    for (let i = 0; i < totalCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rootId = singleNodeRoots[i];
      const w = getNodeWidth(nodeMap.get(rootId));
      const startX = colStarts[col] + Math.round((colWidths[col] - w) / 2);
      const startY = row * rowStep;
      allPositions.set(rootId, { x: startX, y: startY });
      visited.add(rootId);
    }
  } else {
    // We have at least one connected multi-node tree
    let currentX = 0;

    for (const rootId of multiNodeRoots) {
      if (!visited.has(rootId)) {
        const tree = computeSubtree(rootId, nodeMap, childrenMap, visited);
        for (const [id, pos] of tree.positions) {
          allPositions.set(id, {
            x: pos.x + currentX,
            y: pos.y,
          });
        }
        currentX += tree.width + SECTION_GAP;
      }
    }

    if (singleNodeRoots.length > 0) {
      const unplacedSingles = singleNodeRoots.filter((id) => !visited.has(id));
      const totalSingles = unplacedSingles.length;

      if (totalSingles > 0) {
        const cols = totalSingles <= 2 ? totalSingles : totalSingles <= 4 ? 2 : 3;
        const colWidths: number[] = new Array<number>(cols).fill(0);

        for (let i = 0; i < totalSingles; i++) {
          const colIndex = i % cols;
          const w = getNodeWidth(nodeMap.get(unplacedSingles[i]));
          if (w > colWidths[colIndex]) {
            colWidths[colIndex] = w;
          }
        }

        const colStarts: number[] = [currentX];
        for (let c = 1; c < cols; c++) {
          colStarts.push(colStarts[c - 1] + colWidths[c - 1] + SIBLING_GAP);
        }

        const rowStep = NODE_TOTAL_HEIGHT + SIBLING_GAP;

        for (let i = 0; i < totalSingles; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const rootId = unplacedSingles[i];
          const w = getNodeWidth(nodeMap.get(rootId));
          const startX = colStarts[col] + Math.round((colWidths[col] - w) / 2);
          const startY = row * rowStep;
          allPositions.set(rootId, { x: startX, y: startY });
          visited.add(rootId);
        }
      }
    }
  }

  // Safety fallback for any unvisited nodes (e.g. cycles)
  let fallbackX = 0;
  for (const [, pos] of allPositions) {
    if (pos.x > fallbackX) fallbackX = pos.x;
  }
  fallbackX += SECTION_GAP;

  for (const node of nodes) {
    if (!allPositions.has(node.id)) {
      allPositions.set(node.id, { x: fallbackX, y: 0 });
      fallbackX += getNodeWidth(node) + SIBLING_GAP;
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [id, pos] of allPositions) {
    const node = nodeMap.get(id);
    const w = getNodeWidth(node);
    if (pos.x < minX) minX = pos.x;
    if (pos.x + w > maxX) maxX = pos.x + w;
    if (pos.y < minY) minY = pos.y;
    if (pos.y + NODE_CARD_HEIGHT > maxY) maxY = pos.y + NODE_CARD_HEIGHT;
  }

  const shiftX = Math.round((minX + maxX) / 2);
  const shiftY = Math.round((minY + maxY) / 2);

  return nodes.map((node) => {
    const pos = allPositions.get(node.id) ?? node.position;
    return {
      ...node,
      position: {
        x: pos.x - shiftX,
        y: pos.y - shiftY,
      },
      draggable: false,
    };
  });
}

