import {
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_GRAPH_DOCUMENT_ID,
  findNodeById,
  loadOrCreateGraphDocument,
  saveGraphDocument,
} from '@/features/shared/_utils/graph-storage';

export interface UseGraphReturn {
  nodes: Node[];
  edges: Edge[];
  setNodes: Dispatch<SetStateAction<Node[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  saveDocument: (currentNodes: Node[], currentEdges: Edge[]) => Promise<void>;
  getNodeById: (id: string | null) => Node | undefined;
  isDirty: boolean;
  isDatabaseReady: boolean;
}

export const useGraph = (
  documentId: string = DEFAULT_GRAPH_DOCUMENT_ID,
): UseGraphReturn => {
  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeOriginal] = useEdgesState<Edge>([]);

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState<boolean>(false);

  const autoSaveTimerRef = useRef<number | null>(null);

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

  const saveDocument = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[]): Promise<void> => {
      try {
        await saveGraphDocument(documentId, currentNodes, currentEdges);
      } catch (error) {
        console.error('Failed to save document to IndexedDB:', error);
      }
    },
    [documentId],
  );

  useEffect(() => {
    if (!isDatabaseReady || !isDirty) {
      return;
    }

    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      void saveDocument(nodes, edges);
      setIsDirty(false);
    }, 250);

    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [edges, isDatabaseReady, isDirty, nodes, saveDocument]);

  useEffect(() => {
    let isMounted = true;

    const setupDatabase = async (): Promise<void> => {
      try {
        const flow = await loadOrCreateGraphDocument(documentId);

        if (!isMounted) return;

        setNodes(flow.nodes);
        setEdges(flow.edges);
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    void setupDatabase();

    return () => {
      isMounted = false;
    };
  }, [documentId, setEdges, setNodes]);

  const getNodeById = useCallback(
    (id: string | null): Node | undefined => {
      return findNodeById(nodes, id);
    },
    [nodes],
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    saveDocument,
    getNodeById,
    isDirty,
    isDatabaseReady,
  };
};
