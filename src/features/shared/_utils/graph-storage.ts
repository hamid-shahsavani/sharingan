import { type Edge, type Node } from '@xyflow/react';

import {
  dbService,
  flowToTree,
  treeToFlow,
} from '@/features/shared/_utils/database';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export const DEFAULT_GRAPH_DOCUMENT_ID = '1';

export function findNodeById(
  nodes: readonly Node[],
  id: string | null | undefined,
): Node | undefined {
  if (!id) return undefined;
  return nodes.find((node) => node.id === id);
}

export async function saveGraphDocument(
  documentId: string,
  nodes: Node[],
  edges: Edge[],
): Promise<void> {
  const treeData = flowToTree(nodes, edges);
  await dbService.documents.save(documentId, {
    data: treeData,
    edges,
  });
}

export async function loadOrCreateGraphDocument(
  documentId: string = DEFAULT_GRAPH_DOCUMENT_ID,
): Promise<GraphData> {
  let documentRecord = await dbService.documents.getById(documentId);

  if (!documentRecord) {
    documentRecord = await dbService.documents.create({
      id: documentId,
      title: 'نقشه ذهنی من',
      data: [],
    });
  }

  const flow = treeToFlow(documentRecord.data ?? []);
  if (documentRecord.edges && documentRecord.edges.length > 0) {
    return {
      nodes: flow.nodes,
      edges: documentRecord.edges,
    };
  }

  return flow;
}
