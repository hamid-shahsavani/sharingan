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

import type { NodeGroupFormValues } from '@/features/main/_components/node-group-modal';
import type { CreateToolbarAction } from '@/features/shared/_types/workspace-types';
import {
  dbService,
  flowToTree,
  generateNumericId,
  type MindMapNode,
  treeToFlow,
} from '@/features/shared/_utils/database';

const DEFAULT_DOCUMENT_ID = '1';

const INITIAL_DEFAULT_TREE: MindMapNode[] = [
  {
    id: '1',
    title: 'گروه اصلی پروژه',
    position: { x: 0, y: 0 },
  },
];

export const useMindMapDocument = () => {
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChangeOriginal] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeOriginal] = useEdgesState<Edge>([]);

  const [activeDocumentId, setActiveDocumentId] =
    useState<string>(DEFAULT_DOCUMENT_ID);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState<boolean>(false);
  const [isSelectingZoomArea, setIsSelectingZoomArea] =
    useState<boolean>(false);

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

  useEffect(() => {
    if (!isDatabaseReady || !isDirty) {
      return;
    }

    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      const persistLiveChanges = async () => {
        try {
          setIsSaving(true);
          const treeData = flowToTree(nodes, edges);
          await dbService.documents.save(activeDocumentId, {
            data: treeData,
          });
          setIsDirty(false);
        } catch (error) {
          console.error('Failed to save document to IndexedDB:', error);
        } finally {
          setIsSaving(false);
        }
      };

      void persistLiveChanges();
    }, 250);

    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [activeDocumentId, edges, isDatabaseReady, isDirty, nodes]);

  useEffect(() => {
    let isMounted = true;

    const setupDatabase = async () => {
      try {
        let documentRecord =
          await dbService.documents.getById(DEFAULT_DOCUMENT_ID);
        if (!documentRecord) {
          documentRecord = await dbService.documents.create({
            id: DEFAULT_DOCUMENT_ID,
            title: 'نقشه ذهنی من',
            data: INITIAL_DEFAULT_TREE,
          });

          if (!isMounted) return;

          const flow = treeToFlow(documentRecord.data);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        } else {
          if (!isMounted) return;

          let treeData = documentRecord.data;
          const legacyRecord = documentRecord as unknown as Record<string, unknown>;
          if (!treeData && Array.isArray(legacyRecord.nodes)) {
            const legacyNodes = legacyRecord.nodes as Node[];
            const legacyEdges = (legacyRecord.edges as Edge[]) ?? [];
            treeData = flowToTree(legacyNodes, legacyEdges);
            await dbService.documents.save(documentRecord.id, { data: treeData });
          }

          setActiveDocumentId(documentRecord.id);
          const flow = treeToFlow(treeData ?? []);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }

        if (!isMounted) return;

        setIsDirty(false);
        setIsDatabaseReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    void setupDatabase();

    return () => {
      isMounted = false;
    };
  }, [setEdges, setNodes]);

  const handleCreateNodeGroup = useCallback(
    async (values: NodeGroupFormValues) => {
      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const randomOffset = (Math.random() - 0.5) * 60;
      const nodePosition = {
        x: Math.round(centerPosition.x + randomOffset),
        y: Math.round(centerPosition.y + randomOffset),
      };

      const newNodeId = generateNumericId();
      const newNode: Node = {
        id: newNodeId,
        type: 'group',
        position: nodePosition,
        data: {
          title: values.title,
        },
      };

      const nextNodes = [...nodes, newNode];
      setNodes(nextNodes);

      try {
        setIsSaving(true);
        const treeData = flowToTree(nextNodes, edges);
        await dbService.documents.save(activeDocumentId, {
          data: treeData,
        });
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to persist created node to IndexedDB:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [
      activeDocumentId,
      edges,
      nodes,
      screenToFlowPosition,
      setNodes,
    ],
  );

  const handleUpdateNodeGroup = useCallback(
    async (nodeId: string, values: NodeGroupFormValues) => {
      const nextNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              title: values.title,
            },
          };
        }
        return node;
      });

      setNodes(nextNodes);

      try {
        setIsSaving(true);
        const treeData = flowToTree(nextNodes, edges);
        await dbService.documents.save(activeDocumentId, {
          data: treeData,
        });
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to persist updated node to IndexedDB:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [activeDocumentId, edges, nodes, setNodes],
  );

  const handleCreateNode = useCallback(
    (_action: CreateToolbarAction = 'group') => {
      void handleCreateNodeGroup({
        title: 'گروه جدید',
      });
    },
    [handleCreateNodeGroup],
  );

  const getNodeById = useCallback(
    (id: string | null): Node | undefined => {
      if (!id) return undefined;
      return nodes.find((node) => node.id === id);
    },
    [nodes],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    activeDocumentId,
    isDirty,
    isSaving,
    isDatabaseReady,
    isSelectingZoomArea,
    setIsSelectingZoomArea,
    handleCreateNodeGroup,
    handleUpdateNodeGroup,
    handleCreateNode,
    getNodeById,
  };
};
