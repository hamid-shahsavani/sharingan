import { type Edge, type Node } from '@xyflow/react';
import Dexie, { type EntityTable } from 'dexie';

export interface DocumentViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  icon?: string;
  color?: string;
  isArchived?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceTreeNode extends WorkspaceRecord {
  children: WorkspaceTreeNode[];
}

export interface DocumentRecord<
  TNodeData extends Record<string, unknown> = Record<string, unknown>,
  TEdgeData extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  nodes: Node<TNodeData>[];
  edges: Edge<TEdgeData>[];
  viewport: DocumentViewport;
  thumbnail?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VersionRecord<
  TNodeData extends Record<string, unknown> = Record<string, unknown>,
  TEdgeData extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  documentId: string;
  name: string;
  description?: string;
  nodes: Node<TNodeData>[];
  edges: Edge<TEdgeData>[];
  viewport: DocumentViewport;
  thumbnail?: string;
  createdAt: number;
}

export interface SettingRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

export class SharinganDatabase extends Dexie {
  workspaces!: EntityTable<WorkspaceRecord, 'id'>;
  documents!: EntityTable<DocumentRecord, 'id'>;
  versions!: EntityTable<VersionRecord, 'id'>;
  settings!: EntityTable<SettingRecord, 'key'>;

  constructor() {
    super('SharinganDatabase');

    this.version(1).stores({
      workspaces: 'id, parentId, order, updatedAt',
      documents: 'id, workspaceId, isFavorite, isArchived, updatedAt',
      versions: 'id, documentId, createdAt, [documentId+createdAt]',
      settings: 'key, updatedAt',
    });
  }
}

export const db = new SharinganDatabase();

async function collectDescendantWorkspaceIds(
  rootId: string,
): Promise<string[]> {
  const descendantIds: string[] = [rootId];
  let currentParentIds: string[] = [rootId];

  while (currentParentIds.length > 0) {
    const children = await db.workspaces
      .where('parentId')
      .anyOf(currentParentIds)
      .toArray();

    if (children.length === 0) {
      break;
    }

    const childIds = children.map((child) => child.id);
    descendantIds.push(...childIds);
    currentParentIds = childIds;
  }

  return descendantIds;
}

export const workspaceService = {
  async create(
    workspace: Omit<WorkspaceRecord, 'createdAt' | 'updatedAt'>,
  ): Promise<WorkspaceRecord> {
    const timestampDate = Date.now();
    const record: WorkspaceRecord = {
      ...workspace,
      order: workspace.order ?? timestampDate,
      createdAt: timestampDate,
      updatedAt: timestampDate,
    };

    await db.workspaces.add(record);
    return record;
  },

  async getById(id: string): Promise<WorkspaceRecord | undefined> {
    return await db.workspaces.get(id);
  },

  async getAll(): Promise<WorkspaceRecord[]> {
    const records = await db.workspaces.toArray();
    return records.sort(
      (firstRecord, secondRecord) =>
        (firstRecord.order ?? 0) - (secondRecord.order ?? 0),
    );
  },

  async getChildren(
    parentId: string | null = null,
  ): Promise<WorkspaceRecord[]> {
    let records: WorkspaceRecord[];
    if (parentId === null) {
      records = await db.workspaces
        .filter((workspace) => !workspace.parentId)
        .toArray();
    } else {
      records = await db.workspaces
        .where('parentId')
        .equals(parentId)
        .toArray();
    }

    return records.sort(
      (firstRecord, secondRecord) =>
        (firstRecord.order ?? 0) - (secondRecord.order ?? 0),
    );
  },

  async getTree(): Promise<WorkspaceTreeNode[]> {
    const allWorkspaces = await db.workspaces.toArray();
    const sortedWorkspaces = allWorkspaces.sort(
      (firstWorkspace, secondWorkspace) =>
        (firstWorkspace.order ?? 0) - (secondWorkspace.order ?? 0),
    );

    const nodeMaps = new Map<string, WorkspaceTreeNode>();
    for (const workspace of sortedWorkspaces) {
      nodeMaps.set(workspace.id, { ...workspace, children: [] });
    }

    const rootNodes: WorkspaceTreeNode[] = [];
    for (const workspace of sortedWorkspaces) {
      const currentNode = nodeMaps.get(workspace.id);
      if (!currentNode) {
        continue;
      }

      if (workspace.parentId && nodeMaps.has(workspace.parentId)) {
        const parentNode = nodeMaps.get(workspace.parentId);
        parentNode?.children.push(currentNode);
      } else {
        rootNodes.push(currentNode);
      }
    }

    return rootNodes;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.workspaces, async () => {
      const timestampDate = Date.now();
      for (let index = 0; index < orderedIds.length; index += 1) {
        const workspaceId = orderedIds[index];
        if (workspaceId) {
          await db.workspaces.update(workspaceId, {
            order: index,
            updatedAt: timestampDate,
          });
        }
      }
    });
  },

  async update(
    id: string,
    updates: Partial<Omit<WorkspaceRecord, 'id' | 'createdAt'>>,
  ): Promise<void> {
    await db.workspaces.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transaction(
      'rw',
      [db.workspaces, db.documents, db.versions],
      async () => {
        const allWorkspaceIds = await collectDescendantWorkspaceIds(id);

        const documents = await db.documents
          .where('workspaceId')
          .anyOf(allWorkspaceIds)
          .toArray();
        const documentIds = documents.map((document) => document.id);

        if (documentIds.length > 0) {
          await db.versions.where('documentId').anyOf(documentIds).delete();
          await db.documents.where('id').anyOf(documentIds).delete();
        }

        await db.workspaces.where('id').anyOf(allWorkspaceIds).delete();
      },
    );
  },
};

export const documentService = {
  async create(
    document: Omit<DocumentRecord, 'createdAt' | 'updatedAt'>,
  ): Promise<DocumentRecord> {
    const timestampDate = Date.now();
    const record: DocumentRecord = {
      ...document,
      isFavorite: document.isFavorite ?? false,
      isArchived: document.isArchived ?? false,
      createdAt: timestampDate,
      updatedAt: timestampDate,
    };

    await db.documents.add(record);
    return record;
  },

  async getById(id: string): Promise<DocumentRecord | undefined> {
    return await db.documents.get(id);
  },

  async getByWorkspaceId(
    workspaceId: string,
    includeArchived = false,
  ): Promise<DocumentRecord[]> {
    let documents = await db.documents
      .where('workspaceId')
      .equals(workspaceId)
      .toArray();

    if (!includeArchived) {
      documents = documents.filter((document) => !document.isArchived);
    }

    return documents.sort(
      (firstDoc, secondDoc) => secondDoc.updatedAt - firstDoc.updatedAt,
    );
  },

  async getFavorites(): Promise<DocumentRecord[]> {
    const documents = await db.documents
      .filter(
        (document) => Boolean(document.isFavorite) && !document.isArchived,
      )
      .toArray();

    return documents.sort(
      (firstDoc, secondDoc) => secondDoc.updatedAt - firstDoc.updatedAt,
    );
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const document = await db.documents.get(id);
    if (!document) {
      throw new Error(`Document with id ${id} was not found.`);
    }

    const nextIsFavorite = !document.isFavorite;
    await db.documents.update(id, {
      isFavorite: nextIsFavorite,
      updatedAt: Date.now(),
    });

    return nextIsFavorite;
  },

  async duplicate(id: string, newTitle?: string): Promise<DocumentRecord> {
    const sourceDocument = await db.documents.get(id);
    if (!sourceDocument) {
      throw new Error(`Document with id ${id} was not found.`);
    }

    const timestampDate = Date.now();
    const duplicatedRecord: DocumentRecord = {
      ...sourceDocument,
      id: crypto.randomUUID(),
      title: newTitle || `${sourceDocument.title} (کپی)`,
      isFavorite: false,
      createdAt: timestampDate,
      updatedAt: timestampDate,
    };

    await db.documents.add(duplicatedRecord);
    return duplicatedRecord;
  },

  async save(
    id: string,
    updates: Partial<Omit<DocumentRecord, 'id' | 'createdAt'>>,
  ): Promise<void> {
    await db.documents.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.documents, db.versions], async () => {
      await db.versions.where('documentId').equals(id).delete();
      await db.documents.delete(id);
    });
  },
};

export const versionService = {
  async create(
    version: Omit<VersionRecord, 'createdAt'>,
  ): Promise<VersionRecord> {
    const record: VersionRecord = {
      ...version,
      createdAt: Date.now(),
    };

    await db.versions.add(record);
    return record;
  },

  async getByDocumentId(documentId: string): Promise<VersionRecord[]> {
    return await db.versions
      .where('documentId')
      .equals(documentId)
      .reverse()
      .sortBy('createdAt');
  },

  async getById(id: string): Promise<VersionRecord | undefined> {
    return await db.versions.get(id);
  },

  async delete(id: string): Promise<void> {
    await db.versions.delete(id);
  },

  async rollback(versionId: string): Promise<DocumentRecord> {
    return await db.transaction('rw', [db.documents, db.versions], async () => {
      const version = await db.versions.get(versionId);
      if (!version) {
        throw new Error(`Version with id ${versionId} was not found.`);
      }

      const document = await db.documents.get(version.documentId);
      if (!document) {
        throw new Error(`Document with id ${version.documentId} was not found.`);
      }

      const updatedDocument: DocumentRecord = {
        ...document,
        nodes: version.nodes,
        edges: version.edges,
        viewport: version.viewport,
        thumbnail: version.thumbnail ?? document.thumbnail,
        updatedAt: Date.now(),
      };

      await db.documents.put(updatedDocument);
      return updatedDocument;
    });
  },
};

export const settingService = {
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const record = await db.settings.get(key);
    if (!record) {
      return defaultValue;
    }
    return record.value as T;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const record: SettingRecord = {
      key,
      value,
      updatedAt: Date.now(),
    };
    await db.settings.put(record);
  },

  async delete(key: string): Promise<void> {
    await db.settings.delete(key);
  },

  async getAll(): Promise<Record<string, unknown>> {
    const records = await db.settings.toArray();
    const settingsMap: Record<string, unknown> = {};
    for (const record of records) {
      settingsMap[record.key] = record.value;
    }
    return settingsMap;
  },
};

export const dbService = {
  workspaces: workspaceService,
  documents: documentService,
  versions: versionService,
  settings: settingService,
};
