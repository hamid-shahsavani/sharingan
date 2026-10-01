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

export function getCollapsedNodeIds(
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
    if (!list.includes(edge.target)) {
      list.push(edge.target);
    }
    childrenMap.set(edge.source, list);
  }

  const hiddenIds = new Set<string>();
  const pending: string[] = [];

  for (const node of nodes) {
    if (node.data?.isCollapsed) {
      const children = childrenMap.get(node.id) ?? [];
      if (children.length > 0) {
        pending.push(...children);
      }
    }
  }

  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (!nodeId || hiddenIds.has(nodeId)) continue;
    hiddenIds.add(nodeId);
    const children = childrenMap.get(nodeId);
    if (children) {
      pending.push(...children);
    }
  }

  return hiddenIds;
}

interface SubtreePlacement {
  rootId: string;
  width: number;
  rootX: number;
  positions: Map<string, PositionCoordinates>;
  leftContour: number[];
  rightContour: number[];
}

function computeTreeLayout(
  rootId: string,
  nodeMap: Map<string, Node>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>,
): SubtreePlacement {
  visited.add(rootId);
  const node = nodeMap.get(rootId);
  const nodeW = getNodeWidth(node);

  const children = (childrenMap.get(rootId) || []).filter(
    (id) => !visited.has(id),
  );

  if (children.length === 0) {
    const positions = new Map<string, PositionCoordinates>();
    positions.set(rootId, { x: 0, y: 0 });
    return {
      rootId,
      width: nodeW,
      rootX: nodeW / 2,
      positions,
      leftContour: [0],
      rightContour: [nodeW],
    };
  }

  // Lay out each child subtree recursively
  const childSubtrees: SubtreePlacement[] = [];
  for (const childId of children) {
    childSubtrees.push(
      computeTreeLayout(childId, nodeMap, childrenMap, visited),
    );
  }

  // Position children side-by-side using contours with exact STANDARD_GAP
  const childX: number[] = [0];
  const accRightContour = [...childSubtrees[0].rightContour];

  for (let i = 1; i < childSubtrees.length; i++) {
    const child = childSubtrees[i];
    let minOffset = 0;
    const maxD = Math.min(accRightContour.length, child.leftContour.length);

    for (let d = 0; d < maxD; d++) {
      const needed = accRightContour[d] + STANDARD_GAP - child.leftContour[d];
      if (needed > minOffset) {
        minOffset = needed;
      }
    }

    childX.push(minOffset);

    for (let d = 0; d < child.rightContour.length; d++) {
      const val = minOffset + child.rightContour[d];
      if (d < accRightContour.length) {
        accRightContour[d] = Math.max(accRightContour[d], val);
      } else {
        accRightContour.push(val);
      }
    }
  }

  // Symmetrically center parent over children
  const firstChildCenter = childX[0] + childSubtrees[0].rootX;
  const lastChildCenter =
    childX[childX.length - 1] + childSubtrees[childSubtrees.length - 1].rootX;
  const childrenCenter = (firstChildCenter + lastChildCenter) / 2;

  let parentX = Math.round(childrenCenter - nodeW / 2);

  if (parentX < 0) {
    const shift = -parentX;
    parentX = 0;
    for (let i = 0; i < childX.length; i++) {
      childX[i] += shift;
    }
    for (let d = 0; d < accRightContour.length; d++) {
      accRightContour[d] += shift;
    }
  }

  const positions = new Map<string, PositionCoordinates>();
  positions.set(rootId, { x: parentX, y: 0 });

  for (let i = 0; i < childSubtrees.length; i++) {
    const child = childSubtrees[i];
    const offX = childX[i];
    for (const [id, pos] of child.positions) {
      positions.set(id, {
        x: pos.x + offX,
        y: pos.y + LEVEL_Y_STEP,
      });
    }
  }

  // Build left contour
  const leftContour: number[] = [parentX];
  const maxChildDepth = Math.max(
    ...childSubtrees.map((c) => c.leftContour.length),
  );
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

  const rightContour: number[] = [parentX + nodeW, ...accRightContour];

  let minAllX = parentX;
  let maxAllX = parentX + nodeW;
  for (const [id, pos] of positions) {
    const w = getNodeWidth(nodeMap.get(id));
    if (pos.x < minAllX) minAllX = pos.x;
    if (pos.x + w > maxAllX) maxAllX = pos.x + w;
  }

  return {
    rootId,
    width: maxAllX - minAllX,
    rootX: parentX + nodeW / 2,
    positions,
    leftContour,
    rightContour,
  };
}

export function calculateStandardLayout(
  nodes: readonly Node[],
  edges: readonly Edge[],
): Node[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [
      {
        ...nodes[0],
        position: { x: 0, y: 0 },
        draggable: false,
      },
    ];
  }

  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // 1. Build adjacency list of parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();

  for (const node of nodes) {
    childrenMap.set(node.id, []);
    parentMap.set(node.id, []);
  }

  for (const edge of edges) {
    if (!isParentChildEdge(edge)) continue;
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    if (edge.source === edge.target) continue;

    const currentChildren = childrenMap.get(edge.source)!;
    if (!currentChildren.includes(edge.target)) {
      currentChildren.push(edge.target);
    }

    const currentParents = parentMap.get(edge.target)!;
    if (!currentParents.includes(edge.source)) {
      currentParents.push(edge.source);
    }
  }

  // 2. Identify roots (nodes with in-degree 0 in the DAG)
  // Preserve natural ordering from original nodes array
  const roots = nodes
    .filter((n) => (parentMap.get(n.id) || []).length === 0)
    .map((n) => n.id);

  const visited = new Set<string>();
  const trees: SubtreePlacement[] = [];

  // Lay out each root tree
  for (const rootId of roots) {
    if (!visited.has(rootId)) {
      trees.push(computeTreeLayout(rootId, nodeMap, childrenMap, visited));
    }
  }

  // Safety fallback for any unvisited nodes (cycles or DAG cross roots)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      trees.push(computeTreeLayout(node.id, nodeMap, childrenMap, visited));
    }
  }

  if (trees.length === 0) return [];

  // 3. Merge trees horizontally using contour spacing
  const allPositions = new Map<string, PositionCoordinates>();
  const treeOffsets: number[] = [0];
  const accRightContour = [...trees[0].rightContour];

  for (let i = 1; i < trees.length; i++) {
    const tree = trees[i];
    let minOffset = 0;
    const maxD = Math.min(accRightContour.length, tree.leftContour.length);

    for (let d = 0; d < maxD; d++) {
      const needed = accRightContour[d] + STANDARD_GAP - tree.leftContour[d];
      if (needed > minOffset) {
        minOffset = needed;
      }
    }

    treeOffsets.push(minOffset);

    for (let d = 0; d < tree.rightContour.length; d++) {
      const val = minOffset + tree.rightContour[d];
      if (d < accRightContour.length) {
        accRightContour[d] = Math.max(accRightContour[d], val);
      } else {
        accRightContour.push(val);
      }
    }
  }

  for (let i = 0; i < trees.length; i++) {
    const tree = trees[i];
    const offX = treeOffsets[i];
    for (const [id, pos] of tree.positions) {
      allPositions.set(id, {
        x: pos.x + offX,
        y: pos.y,
      });
    }
  }

  // 4. DAG multi-parent barycenter adjustment
  for (const node of nodes) {
    const parents = parentMap.get(node.id) || [];
    if (parents.length > 1) {
      const parentCenters = parents.map((pId) => {
        const pPos = allPositions.get(pId)!;
        const pW = getNodeWidth(nodeMap.get(pId));
        return pPos.x + pW / 2;
      });
      const avgParentCenter =
        parentCenters.reduce((s, c) => s + c, 0) / parentCenters.length;
      const curPos = allPositions.get(node.id)!;
      const w = getNodeWidth(node);
      allPositions.set(node.id, {
        x: Math.round(avgParentCenter - w / 2),
        y: curPos.y,
      });
    }
  }

  // 5. Ensure minimum STANDARD_GAP between any adjacent nodes on the same horizontal level
  const levelsByY = new Map<number, string[]>();
  for (const [id, pos] of allPositions) {
    const list = levelsByY.get(pos.y) ?? [];
    list.push(id);
    levelsByY.set(pos.y, list);
  }

  for (const [, levelNodeIds] of levelsByY) {
    levelNodeIds.sort(
      (a, b) => allPositions.get(a)!.x - allPositions.get(b)!.x,
    );
    for (let i = 0; i < levelNodeIds.length - 1; i++) {
      const leftId = levelNodeIds[i];
      const rightId = levelNodeIds[i + 1];
      const leftPos = allPositions.get(leftId)!;
      const rightPos = allPositions.get(rightId)!;
      const leftW = getNodeWidth(nodeMap.get(leftId));
      const minRightX = leftPos.x + leftW + STANDARD_GAP;
      if (rightPos.x < minRightX) {
        const shiftX = minRightX - rightPos.x;
        const queue = [rightId];
        const visitedDesc = new Set<string>();
        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (visitedDesc.has(curr)) continue;
          visitedDesc.add(curr);
          const p = allPositions.get(curr);
          if (p) {
            allPositions.set(curr, { x: p.x + shiftX, y: p.y });
          }
          for (const ch of childrenMap.get(curr) || []) {
            queue.push(ch);
          }
        }
      }
    }
  }

  // 6. Center all nodes around (0, 0)
  let minAllX = Infinity;
  let maxX = -Infinity;
  let minAllY = Infinity;
  let maxY = -Infinity;

  for (const [id, pos] of allPositions) {
    const node = nodeMap.get(id);
    const w = getNodeWidth(node);
    if (pos.x < minAllX) minAllX = pos.x;
    if (pos.x + w > maxX) maxX = pos.x + w;
    if (pos.y < minAllY) minAllY = pos.y;
    if (pos.y + NODE_CARD_HEIGHT > maxY) maxY = pos.y + NODE_CARD_HEIGHT;
  }

  const shiftX = Math.round((minAllX + maxX) / 2);
  const shiftY = Math.round((minAllY + maxY) / 2);

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



