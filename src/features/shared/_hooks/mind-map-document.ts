import {
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CreateToolbarAction } from '@/features/shared/_types/workspace-types';
import {
  dbService,
  type VersionRecord,
} from '@/features/shared/_utils/database';

const DEFAULT_WORKSPACE_ID = 'default-workspace';
const DEFAULT_DOCUMENT_ID = 'default-document';

const INITIAL_NODES: Node[] = [
  {
    id: 'group-node-1',
    type: 'group',
    position: { x: 0, y: 0 },
    data: {
      title: 'گروه اصلی پروژه',
    },
  },
];

const INITIAL_EDGES: Edge[] = [];

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

export function downloadJsonFile(filenameString: string, dataObject: unknown): void {
  const jsonString = JSON.stringify(dataObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const objectUrl = URL.createObjectURL(blob);
  const linkElement = document.createElement('a');
  linkElement.href = objectUrl;
  linkElement.download = filenameString;
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(objectUrl);
}

export const useMindMapDocument = () => {
  const { getViewport, screenToFlowPosition, setViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChangeOriginal] = useEdgesState(INITIAL_EDGES);

  const [activeDocumentId, setActiveDocumentId] = useState<string>(DEFAULT_DOCUMENT_ID);
  const [versions, setVersions] = useState<VersionRecord[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSelectingZoomArea, setIsSelectingZoomArea] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const historyStackRef = useRef<HistorySnapshot[]>([{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }]);
  const historyIndexRef = useRef<number>(0);
  const isUndoRedoActionRef = useRef<boolean>(false);

  const updateUndoRedoState = useCallback((index: number, length: number) => {
    setCanUndo(index > 0);
    setCanRedo(index < length - 1);
  }, []);

  const pushHistorySnapshot = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }
    const nextHistory = historyStackRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push({ nodes: newNodes, edges: newEdges });
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }
    historyStackRef.current = nextHistory;
    const nextIndex = nextHistory.length - 1;
    historyIndexRef.current = nextIndex;
    updateUndoRedoState(nextIndex, nextHistory.length);
  }, [updateUndoRedoState]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeOriginal(changes);
      setIsDirty(true);
    },
    [onNodesChangeOriginal],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeOriginal(changes);
      setIsDirty(true);
    },
    [onEdgesChangeOriginal],
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      const nextIndex = historyIndexRef.current - 1;
      historyIndexRef.current = nextIndex;
      const targetSnapshot = historyStackRef.current[nextIndex];
      if (targetSnapshot) {
        isUndoRedoActionRef.current = true;
        setNodes(targetSnapshot.nodes);
        setEdges(targetSnapshot.edges);
        setIsDirty(true);
      }
      updateUndoRedoState(nextIndex, historyStackRef.current.length);
    }
  }, [setEdges, setNodes, updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyStackRef.current.length - 1) {
      const nextIndex = historyIndexRef.current + 1;
      historyIndexRef.current = nextIndex;
      const targetSnapshot = historyStackRef.current[nextIndex];
      if (targetSnapshot) {
        isUndoRedoActionRef.current = true;
        setNodes(targetSnapshot.nodes);
        setEdges(targetSnapshot.edges);
        setIsDirty(true);
      }
      updateUndoRedoState(nextIndex, historyStackRef.current.length);
    }
  }, [setEdges, setNodes, updateUndoRedoState]);

  const loadDocumentVersions = useCallback(async (documentId: string): Promise<VersionRecord[]> => {
    const records = await dbService.versions.getByDocumentId(documentId);
    setVersions(records);
    return records;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupDatabase = async () => {
      try {
        let workspace = await dbService.workspaces.getById(DEFAULT_WORKSPACE_ID);
        if (!workspace) {
          workspace = await dbService.workspaces.create({
            id: DEFAULT_WORKSPACE_ID,
            name: 'فضای کاری اصلی',
            description: 'فضای کاری پیش‌فرض نقشه ذهنی',
          });
        }

        let documentRecord = await dbService.documents.getById(DEFAULT_DOCUMENT_ID);
        if (!documentRecord) {
          documentRecord = await dbService.documents.create({
            id: DEFAULT_DOCUMENT_ID,
            workspaceId: workspace.id,
            title: 'نقشه ذهنی من',
            nodes: INITIAL_NODES,
            edges: INITIAL_EDGES,
            viewport: { x: 0, y: 0, zoom: 1 },
          });

          const initialVersion = await dbService.versions.create({
            id: crypto.randomUUID(),
            documentId: documentRecord.id,
            name: 'نسخه اولیه',
            nodes: INITIAL_NODES,
            edges: INITIAL_EDGES,
            viewport: { x: 0, y: 0, zoom: 1 },
          });

          if (!isMounted) return;

          setVersions([initialVersion]);
          setActiveVersionId(initialVersion.id);
        } else {
          if (!isMounted) return;

          setActiveDocumentId(documentRecord.id);
          if (documentRecord.nodes && documentRecord.nodes.length > 0) {
            setNodes(documentRecord.nodes);
          }
          if (documentRecord.edges) {
            setEdges(documentRecord.edges);
          }


          const existingVersions = await dbService.versions.getByDocumentId(documentRecord.id);
          if (!isMounted) return;

          setVersions(existingVersions);
          if (existingVersions.length > 0 && existingVersions[0]) {
            setActiveVersionId(existingVersions[0].id);
          }
        }

        if (!isMounted) return;

        historyStackRef.current = [{
          nodes: documentRecord.nodes || INITIAL_NODES,
          edges: documentRecord.edges || INITIAL_EDGES,
        }];
        historyIndexRef.current = 0;
        updateUndoRedoState(0, 1);
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    void setupDatabase();

    return () => {
      isMounted = false;
    };
  }, [setEdges, setNodes, setViewport, updateUndoRedoState]);

  const handleSaveVersion = useCallback(async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const currentViewport = getViewport();
      const nextVersionNumber = versions.length + 1;
      const newVersionId = crypto.randomUUID();

      const newVersion = await dbService.versions.create({
        id: newVersionId,
        documentId: activeDocumentId,
        name: `نسخه ${nextVersionNumber}`,
        nodes,
        edges,
        viewport: currentViewport,
      });

      await dbService.documents.save(activeDocumentId, {
        nodes,
        edges,
        viewport: currentViewport,
      });

      const updatedVersions = await loadDocumentVersions(activeDocumentId);
      setVersions(updatedVersions);
      setActiveVersionId(newVersion.id);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save version:', error);
    } finally {
      setIsSaving(false);
    }
  }, [activeDocumentId, edges, getViewport, isSaving, loadDocumentVersions, nodes, versions.length]);

  const handleSwitchVersion = useCallback(
    async (versionId: string) => {
      try {
        const rolledBackDoc = await dbService.versions.rollback(versionId);
        setNodes(rolledBackDoc.nodes);
        setEdges(rolledBackDoc.edges);
        if (rolledBackDoc.viewport) {
          void setViewport(rolledBackDoc.viewport);
        }
        setActiveVersionId(versionId);
        setIsDirty(false);
        historyStackRef.current = [{
          nodes: rolledBackDoc.nodes,
          edges: rolledBackDoc.edges,
        }];
        historyIndexRef.current = 0;
        updateUndoRedoState(0, 1);
      } catch (error) {
        console.error('Failed to rollback version:', error);
      }
    },
    [setEdges, setNodes, setViewport, updateUndoRedoState],
  );

  const handleDeleteVersion = useCallback(
    async (versionId: string) => {
      try {
        await dbService.versions.delete(versionId);
        const updatedVersions = await loadDocumentVersions(activeDocumentId);
        setVersions(updatedVersions);
        if (activeVersionId === versionId) {
          setActiveVersionId(updatedVersions[0]?.id ?? null);
        }
      } catch (error) {
        console.error('Failed to delete version:', error);
      }
    },
    [activeDocumentId, activeVersionId, loadDocumentVersions],
  );

  const handleDownloadVersion = useCallback(
    (versionId: string) => {
      const targetVersion = versions.find((version) => version.id === versionId);
      if (!targetVersion) {
        return;
      }
      const safeName = targetVersion.name.replace(/\s+/g, '_');
      const filename = `sharingan_${safeName}_${targetVersion.createdAt}.json`;
      downloadJsonFile(filename, targetVersion);
    },
    [versions],
  );

  const handleCreateNode = useCallback(
    (_action: CreateToolbarAction = 'group') => {
      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const randomOffset = (Math.random() - 0.5) * 60;
      const nodePosition = {
        x: Math.round(centerPosition.x + randomOffset),
        y: Math.round(centerPosition.y + randomOffset),
      };

      const newNode: Node = {
        id: `group-node-${Date.now()}`,
        type: 'group',
        position: nodePosition,
        data: {
          title: 'گروه جدید',
        },
      };

      const nextNodes = [...nodes, newNode];
      setNodes(nextNodes);
      pushHistorySnapshot(nextNodes, edges);
      setIsDirty(true);
    },
    [edges, nodes, pushHistorySnapshot, screenToFlowPosition, setNodes],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    activeDocumentId,
    activeVersionId,
    versions,
    isDirty,
    isSaving,
    isSelectingZoomArea,
    setIsSelectingZoomArea,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleSaveVersion,
    handleSwitchVersion,
    handleDeleteVersion,
    handleDownloadVersion,
    handleCreateNode,
  };
};
