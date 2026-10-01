import { type Edge, type Node } from '@xyflow/react';

import {
  type NodeVisualBounds,
  type ParentSectionNodeData,
} from '@/features/main/_types/flow';
import {
  getNodeWidth,
  isParentChildEdge,
  NODE_CARD_HEIGHT,
  NODE_ICON_HEIGHT,
} from '@/features/main/_utils/node-layout';

export const calculateParentSections = (
  nodes: readonly Node[],
  edges: readonly Edge[],
  hoveredNodeId: string | null,
  nodeVisualBounds: Record<string, NodeVisualBounds>,
  padding = 12,
): Node<ParentSectionNodeData>[] => {
  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  const childrenByParent = new Map<string, string[]>();
  for (const edge of edges) {
    if (!isParentChildEdge(edge)) {
      continue;
    }
    const children = childrenByParent.get(edge.source) ?? [];
    children.push(edge.target);
    childrenByParent.set(edge.source, children);
  }

  const getSubtreeIds = (parentId: string): Set<string> => {
    const ids = new Set<string>([parentId]);
    const pending = [...(childrenByParent.get(parentId) ?? [])];
    while (pending.length > 0) {
      const id = pending.pop();
      if (!id || ids.has(id)) continue;
      ids.add(id);
      pending.push(...(childrenByParent.get(id) ?? []));
    }
    return ids;
  };

  const sections: Node<ParentSectionNodeData>[] = [];

  for (const parentId of childrenByParent.keys()) {
    const memberIds = getSubtreeIds(parentId);
    if (memberIds.size < 2) continue;

    const members = [...memberIds]
      .map((id) => nodeMap.get(id))
      .filter((node): node is Node => Boolean(node && !node.hidden));

    if (members.length < 2) continue;

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;

    for (const member of members) {
      const visual = nodeVisualBounds[member.id];
      const fallbackWidth = member.measured?.width ?? getNodeWidth(member);
      const fallbackHeight = member.measured?.height ?? NODE_CARD_HEIGHT;

      const visualLeft =
        visual?.left ?? Math.min(0, fallbackWidth / 2 - 14);
      const visualTop = visual?.top ?? -NODE_ICON_HEIGHT;
      const visualRight =
        visual?.right ?? Math.max(fallbackWidth, fallbackWidth / 2 + 14);
      const visualBottom = visual?.bottom ?? fallbackHeight;

      const left = member.position.x + visualLeft;
      const top = member.position.y + visualTop;
      const right = member.position.x + visualRight;
      const bottom = member.position.y + visualBottom;

      if (left < minLeft) minLeft = left;
      if (top < minTop) minTop = top;
      if (right > maxRight) maxRight = right;
      if (bottom > maxBottom) maxBottom = bottom;
    }

    if (
      !Number.isFinite(minLeft) ||
      !Number.isFinite(minTop) ||
      !Number.isFinite(maxRight) ||
      !Number.isFinite(maxBottom)
    ) {
      continue;
    }

    const isHovered = hoveredNodeId === parentId;

    sections.push({
      id: `parent-section-${parentId}`,
      type: 'parent-section',
      className: 'parent-section pointer-events-none',
      position: {
        x: minLeft - padding,
        y: minTop - padding,
      },
      data: {
        isHovered,
      },
      style: {
        width: maxRight - minLeft + padding * 2,
        height: maxBottom - minTop + padding * 2,
        borderRadius: 16,
        pointerEvents: 'none',
      },
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false,
      zIndex: -1,
    });
  }

  return sections;
};
