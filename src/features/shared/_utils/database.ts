import { type Edge, type Node } from '@xyflow/react';
import Dexie, { type EntityTable } from 'dexie';

export interface MindMapNodePosition {
  x: number;
  y: number;
}

export interface MindMapNode {
  id: string;
  title: string;
  position: MindMapNodePosition;
  data?: MindMapNode[];
}

export interface DocumentRecord {
  id: string;
  title: string;
  data: MindMapNode[];
}

export class SharinganDatabase extends Dexie {
  documents!: EntityTable<DocumentRecord, 'id'>;

  constructor() {
    super('SharinganDatabase');

    this.version(1).stores({
      documents: 'id',
    });
  }
}

export const db = new SharinganDatabase();

export const generateNumericId = (): string => {
  return `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

export const treeToFlow = (
  tree: MindMapNode[],
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (items: MindMapNode[], parentId?: string): void => {
    for (const item of items) {
      nodes.push({
        id: item.id,
        type: 'group',
        position: item.position,
        data: {
          title: item.title,
        },
        ...(parentId ? { parentId } : {}),
      });

      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${item.id}`,
          source: parentId,
          target: item.id,
        });
      }

      if (item.data && item.data.length > 0) {
        traverse(item.data, item.id);
      }
    }
  };

  traverse(tree);
  return { nodes, edges };
};

export const flowToTree = (
  nodes: Node[],
  edges: Edge[] = [],
): MindMapNode[] => {
  const itemMap = new Map<string, MindMapNode>();
  for (const node of nodes) {
    const title = typeof node.data?.title === 'string' ? node.data.title : '';
    itemMap.set(node.id, {
      id: node.id,
      title,
      position: { x: node.position.x, y: node.position.y },
    });
  }

  const parentMap = new Map<string, string>();
  for (const node of nodes) {
    if (node.parentId) {
      parentMap.set(node.id, node.parentId);
    }
  }
  for (const edge of edges) {
    if (edge.source && edge.target && !parentMap.has(edge.target)) {
      parentMap.set(edge.target, edge.source);
    }
  }

  const rootItems: MindMapNode[] = [];
  for (const [nodeId, item] of itemMap) {
    const parentId = parentMap.get(nodeId);
    if (parentId && itemMap.has(parentId)) {
      const parent = itemMap.get(parentId);
      if (!parent) continue;
      if (!parent.data) {
        parent.data = [];
      }
      parent.data.push(item);
    } else {
      rootItems.push(item);
    }
  }

  return rootItems;
};

export const documentService = {
  async create(document: DocumentRecord): Promise<DocumentRecord> {
    await db.documents.add(document);
    return document;
  },

  async getById(id: string): Promise<DocumentRecord | undefined> {
    return await db.documents.get(id);
  },

  async getAll(): Promise<DocumentRecord[]> {
    return await db.documents.toArray();
  },

  async duplicate(id: string, newTitle?: string): Promise<DocumentRecord> {
    const sourceDocument = await db.documents.get(id);
    if (!sourceDocument) {
      throw new Error(`Document with id ${id} was not found.`);
    }

    const duplicatedRecord: DocumentRecord = {
      ...sourceDocument,
      id: generateNumericId(),
      title: newTitle || `${sourceDocument.title} (کپی)`,
    };

    await db.documents.add(duplicatedRecord);
    return duplicatedRecord;
  },

  async save(
    id: string,
    updates: Partial<Omit<DocumentRecord, 'id'>>,
  ): Promise<void> {
    const document = await db.documents.get(id);
    if (!document) {
      throw new Error(`Document with id ${id} was not found.`);
    }

    await db.documents.put({
      ...document,
      ...updates,
    });
  },

  async delete(id: string): Promise<void> {
    await db.documents.delete(id);
  },
};

export const dbService = {
  documents: documentService,
};
