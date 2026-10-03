import { type Edge, type Node } from '@xyflow/react';

import { getDescendantNodeIds } from '@/features/main/_utils/node-layout';
import { generateNumericId } from '@/features/shared/_utils/database';

export interface PositionCoordinates {
  x: number;
  y: number;
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
    draggable: false,
    data: {
      title,
    },
  };
}

export function createMarkdownNode(
  values: { header?: string; body?: string; footer?: string },
  position: PositionCoordinates,
  id: string = generateNumericId(),
): Node {
  const header = values.header?.trim() ?? '';
  const body = values.body?.trim() ?? '';
  const footer = values.footer?.trim() ?? '';
  const title = header || body.split('\n')[0]?.slice(0, 30) || 'مارک‌داون';

  return {
    id,
    type: 'markdown',
    position,
    draggable: false,
    data: {
      title,
      header,
      body,
      footer,
    },
  };
}

export function updateMarkdownNodeData(
  nodes: Node[],
  nodeId: string,
  values: { header?: string; body?: string; footer?: string },
): Node[] {
  const header = values.header?.trim() ?? '';
  const body = values.body?.trim() ?? '';
  const footer = values.footer?.trim() ?? '';
  const title = header || body.split('\n')[0]?.slice(0, 30) || 'مارک‌داون';

  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          title,
          header,
          body,
          footer,
        },
      };
    }
    return node;
  });
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

export interface CloneSubtreeResult {
  clonedNodes: Node[];
  createdEdges: Edge[];
  isSubtreeWithDescendants: boolean;
}

export function cloneSubtree(
  rootNodeId: string,
  nodes: readonly Node[],
  edges: readonly Edge[],
): CloneSubtreeResult | null {
  const sourceNode = nodes.find((node) => node.id === rootNodeId);
  if (!sourceNode) {
    return null;
  }

  const descendantIds = getDescendantNodeIds(rootNodeId, nodes, edges);
  const subtreeIds = [rootNodeId, ...descendantIds];

  const existingIds = new Set<string>(nodes.map((node) => node.id));
  function generateUniqueId(): string {
    let newId = generateNumericId();
    while (existingIds.has(newId)) {
      newId = `${Date.now()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    }
    existingIds.add(newId);
    return newId;
  }

  const idMapping = new Map<string, string>();
  const clonedNodes: Node[] = [];

  for (const oldId of subtreeIds) {
    const origNode = nodes.find((node) => node.id === oldId);
    if (!origNode) continue;

    const newId = generateUniqueId();
    idMapping.set(oldId, newId);

    const isMarkdown = origNode.type === 'markdown';
    const clonedNode: Node = isMarkdown
      ? createMarkdownNode(
          {
            header:
              typeof origNode.data?.header === 'string'
                ? origNode.data.header
                : typeof origNode.data?.title === 'string'
                  ? origNode.data.title
                  : '',
            body:
              typeof origNode.data?.body === 'string'
                ? origNode.data.body
                : '',
            footer:
              typeof origNode.data?.footer === 'string'
                ? origNode.data.footer
                : undefined,
          },
          { x: 0, y: 0 },
          newId,
        )
      : createGroupNode(
          typeof origNode.data?.title === 'string'
            ? origNode.data.title
            : 'گروه جدید',
          { x: 0, y: 0 },
          newId,
        );

    if (origNode.parentId) {
      const mappedParentId = idMapping.get(origNode.parentId);
      if (mappedParentId) {
        clonedNode.parentId = mappedParentId;
      } else if (origNode.id === rootNodeId) {
        clonedNode.parentId = origNode.parentId;
      }
    }

    clonedNodes.push(clonedNode);
  }

  const newRootId = idMapping.get(rootNodeId);
  if (!newRootId) {
    return null;
  }

  const createdEdges: Edge[] = [];

  const incomingParentEdges = edges.filter(
    (edge) => edge.target === rootNodeId && !idMapping.has(edge.source),
  );

  for (const parentEdge of incomingParentEdges) {
    createdEdges.push({
      id: `edge-${parentEdge.source}-${newRootId}`,
      source: parentEdge.source,
      target: newRootId,
      sourceHandle: parentEdge.sourceHandle ?? 'parent-source',
      targetHandle: parentEdge.targetHandle ?? 'parent-target',
      type: parentEdge.type ?? 'straight',
    });
  }

  for (const edge of edges) {
    const clonedSourceId = idMapping.get(edge.source);
    const clonedTargetId = idMapping.get(edge.target);
    if (clonedSourceId && clonedTargetId) {
      createdEdges.push({
        ...edge,
        id: `edge-${clonedSourceId}-${clonedTargetId}`,
        source: clonedSourceId,
        target: clonedTargetId,
      });
    }
  }

  return {
    clonedNodes,
    createdEdges,
    isSubtreeWithDescendants: descendantIds.size > 0,
  };
}
