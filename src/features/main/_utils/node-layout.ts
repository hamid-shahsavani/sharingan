import { type Edge, type Node } from '@xyflow/react';

export interface PositionCoordinates {
  x: number;
  y: number;
}

export const NODE_LAYOUT_WIDTH = 180;
export const NODE_LAYOUT_HEIGHT = 80;
export const NODE_HORIZONTAL_GAP = 40;
export const NODE_VERTICAL_GAP = 80;
export const TREE_HORIZONTAL_GAP = 80;
export const TREE_ROW_GAP = 120;
export const MAX_TREES_PER_ROW = 3;
export const MAX_ROW_WIDTH = 1200;

interface SubtreeMetrics {
  width: number;
  height: number;
  depth: number;
  childrenMetrics: Map<string, SubtreeMetrics>;
}

function computeSubtreeMetrics(
  nodeId: string,
  childrenMap: Map<string, string[]>,
  visited: Set<string>,
): SubtreeMetrics {
  visited.add(nodeId);
  const children = childrenMap.get(nodeId) || [];
  const validChildren = children.filter((id) => !visited.has(id));

  const childrenMetrics = new Map<string, SubtreeMetrics>();

  if (validChildren.length === 0) {
    return {
      width: NODE_LAYOUT_WIDTH,
      height: NODE_LAYOUT_HEIGHT,
      depth: 0,
      childrenMetrics,
    };
  }

  let totalChildrenWidth = 0;
  let maxChildDepth = 0;

  for (let i = 0; i < validChildren.length; i++) {
    const childId = validChildren[i];
    const metrics = computeSubtreeMetrics(childId, childrenMap, visited);
    childrenMetrics.set(childId, metrics);
    totalChildrenWidth += metrics.width;
    if (i > 0) {
      totalChildrenWidth += NODE_HORIZONTAL_GAP;
    }
    if (metrics.depth > maxChildDepth) {
      maxChildDepth = metrics.depth;
    }
  }

  const depth = maxChildDepth + 1;
  const width = Math.max(NODE_LAYOUT_WIDTH, totalChildrenWidth);
  const height =
    (depth + 1) * (NODE_LAYOUT_HEIGHT + NODE_VERTICAL_GAP) - NODE_VERTICAL_GAP;

  return {
    width,
    height,
    depth,
    childrenMetrics,
  };
}

function layoutTree(
  nodeId: string,
  startX: number,
  startY: number,
  metrics: SubtreeMetrics,
  childrenMap: Map<string, string[]>,
  positions: Map<string, PositionCoordinates>,
  visited: Set<string>,
): void {
  visited.add(nodeId);
  const children = (childrenMap.get(nodeId) || []).filter((id) =>
    metrics.childrenMetrics.has(id),
  );

  if (children.length === 0) {
    positions.set(nodeId, {
      x: Math.round(startX + (metrics.width - NODE_LAYOUT_WIDTH) / 2),
      y: Math.round(startY),
    });
    return;
  }

  let totalChildrenWidth = 0;
  for (let i = 0; i < children.length; i++) {
    const childMetrics = metrics.childrenMetrics.get(children[i]);
    if (!childMetrics) continue;
    totalChildrenWidth += childMetrics.width;
    if (i > 0) {
      totalChildrenWidth += NODE_HORIZONTAL_GAP;
    }
  }

  const childrenStartX =
    metrics.width > totalChildrenWidth
      ? startX + (metrics.width - totalChildrenWidth) / 2
      : startX;

  const childNextY = startY + NODE_LAYOUT_HEIGHT + NODE_VERTICAL_GAP;
  let currentChildX = childrenStartX;

  for (const childId of children) {
    const childMetrics = metrics.childrenMetrics.get(childId);
    if (!childMetrics) continue;
    layoutTree(
      childId,
      currentChildX,
      childNextY,
      childMetrics,
      childrenMap,
      positions,
      visited,
    );
    currentChildX += childMetrics.width + NODE_HORIZONTAL_GAP;
  }

  const firstChildPos = positions.get(children[0]);
  const lastChildPos = positions.get(children[children.length - 1]);
  const parentX =
    firstChildPos && lastChildPos
      ? Math.round((firstChildPos.x + lastChildPos.x) / 2)
      : Math.round(startX + (metrics.width - NODE_LAYOUT_WIDTH) / 2);

  positions.set(nodeId, {
    x: parentX,
    y: Math.round(startY),
  });
}

export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: readonly Edge[],
): boolean {
  if (sourceId === targetId) return true;

  const visited = new Set<string>();
  const queue: string[] = [sourceId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current === targetId) return true;
    visited.add(current);

    for (const edge of edges) {
      if (edge.target === current && !visited.has(edge.source)) {
        queue.push(edge.source);
      }
    }
  }

  return false;
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

  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      if (!parentMap.has(edge.target)) {
        parentMap.set(edge.target, edge.source);
        const list = childrenMap.get(edge.source) || [];
        list.push(edge.target);
        childrenMap.set(edge.source, list);
      }
    }
  }

  for (const node of nodes) {
    if (
      node.parentId &&
      nodeMap.has(node.parentId) &&
      !parentMap.has(node.id)
    ) {
      parentMap.set(node.id, node.parentId);
      const list = childrenMap.get(node.parentId) || [];
      list.push(node.id);
      childrenMap.set(node.parentId, list);
    }
  }

  const rootIds: string[] = [];
  for (const node of nodes) {
    if (!parentMap.has(node.id)) {
      rootIds.push(node.id);
    }
  }

  const treeMetrics: Array<{ rootId: string; metrics: SubtreeMetrics }> = [];
  const metricsVisited = new Set<string>();

  for (const rootId of rootIds) {
    if (!metricsVisited.has(rootId)) {
      const metrics = computeSubtreeMetrics(
        rootId,
        childrenMap,
        metricsVisited,
      );
      treeMetrics.push({ rootId, metrics });
    }
  }

  for (const node of nodes) {
    if (!metricsVisited.has(node.id)) {
      const metrics = computeSubtreeMetrics(
        node.id,
        childrenMap,
        metricsVisited,
      );
      treeMetrics.push({ rootId: node.id, metrics });
    }
  }

  interface TreeRow {
    trees: Array<{ rootId: string; metrics: SubtreeMetrics }>;
    totalWidth: number;
    maxHeight: number;
  }

  const rows: TreeRow[] = [];
  let currentRow: TreeRow = { trees: [], totalWidth: 0, maxHeight: 0 };

  for (const item of treeMetrics) {
    const projectedWidth =
      currentRow.trees.length === 0
        ? item.metrics.width
        : currentRow.totalWidth + TREE_HORIZONTAL_GAP + item.metrics.width;

    if (
      currentRow.trees.length >= MAX_TREES_PER_ROW ||
      (projectedWidth > MAX_ROW_WIDTH && currentRow.trees.length > 0)
    ) {
      rows.push(currentRow);
      currentRow = {
        trees: [item],
        totalWidth: item.metrics.width,
        maxHeight: item.metrics.height,
      };
    } else {
      currentRow.trees.push(item);
      currentRow.totalWidth = projectedWidth;
      currentRow.maxHeight = Math.max(
        currentRow.maxHeight,
        item.metrics.height,
      );
    }
  }

  if (currentRow.trees.length > 0) {
    rows.push(currentRow);
  }

  let totalGridHeight = 0;
  for (let r = 0; r < rows.length; r++) {
    totalGridHeight += rows[r].maxHeight;
    if (r > 0) {
      totalGridHeight += TREE_ROW_GAP;
    }
  }

  const positions = new Map<string, PositionCoordinates>();
  const layoutVisited = new Set<string>();

  let currentY = -Math.round(totalGridHeight / 2);

  for (const row of rows) {
    let currentX = -Math.round(row.totalWidth / 2);

    for (const tree of row.trees) {
      layoutTree(
        tree.rootId,
        currentX,
        currentY,
        tree.metrics,
        childrenMap,
        positions,
        layoutVisited,
      );
      currentX += tree.metrics.width + TREE_HORIZONTAL_GAP;
    }

    currentY += row.maxHeight + TREE_ROW_GAP;
  }

  return nodes.map((node) => {
    const pos = positions.get(node.id) ?? node.position;
    return {
      ...node,
      position: pos,
      draggable: false,
    };
  });
}
