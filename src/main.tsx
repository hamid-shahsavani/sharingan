import './index.css';

import {
  addEdge,
  type Connection,
  type Edge,
  type OnNodesChange,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CompactControls } from '@/features/layout/_components/compact-controls';
import { Canvas } from '@/features/main/_components/canvas';
import {
  type NodeGroupFormValues,
  NodeGroupModal,
} from '@/features/main/_components/node-group-modal';
import {
  cloneSubtree,
  createGroupNode,
  updateNodeTitle,
} from '@/features/main/_utils/node-group';
import {
  calculateStandardLayout,
  getDescendantNodeIds,
  isParentChildEdge,
  wouldCreateCycle,
} from '@/features/main/_utils/node-layout';
import { AppToast } from '@/features/shared/_components/app-toast';
import { OperationToast } from '@/features/shared/_components/operation-toast';
import { useGraph } from '@/features/shared/_hooks/graph';
import { showToast } from '@/features/shared/_utils/toast';

interface NodeGroupCustomData {
  title?: string;
}

export const MindMapApp = () => {
  const graph = useGraph();
  const { fitView, setCenter } = useReactFlow();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSelectingZoomArea, setIsSelectingZoomArea] =
    useState<boolean>(false);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(
    null,
  );

  const selectedNode = editingNodeId
    ? graph.getNodeById(editingNodeId)
    : undefined;
  const selectedNodeData = selectedNode?.data as
    NodeGroupCustomData | undefined;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (connectingSourceId) {
          setConnectingSourceId(null);
        }
        if (isSelectingZoomArea) {
          setIsSelectingZoomArea(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingSourceId, isSelectingZoomArea]);

  useEffect(() => {
    if (!graph.isDatabaseReady || graph.nodes.length === 0) {
      return;
    }

    const nextNodes = calculateStandardLayout(graph.nodes, graph.edges);
    const hasDifference = nextNodes.some((node, index) => {
      const original = graph.nodes[index];
      return (
        !original ||
        original.position.x !== node.position.x ||
        original.position.y !== node.position.y
      );
    });

    if (hasDifference) {
      graph.setNodes(nextNodes);
      void graph.saveDocument(nextNodes, graph.edges);
    }
  }, [graph]);

  const handleNodeGroupSubmit = async (
    values: NodeGroupFormValues,
    nodeId: string | null,
  ): Promise<void> => {
    if (nodeId) {
      const updatedNodes = updateNodeTitle(graph.nodes, nodeId, values.title);
      const nextNodes = calculateStandardLayout(updatedNodes, graph.edges);
      graph.setNodes(nextNodes);
      await graph.saveDocument(nextNodes, graph.edges);
      showToast('نود با موفقیت ویرایش شد', 'success');
    } else {
      const rawNode = createGroupNode(values.title, { x: 0, y: 0 });
      const rawNodes = [...graph.nodes, rawNode];
      const nextNodes = calculateStandardLayout(rawNodes, graph.edges);
      graph.setNodes(nextNodes);
      await graph.saveDocument(nextNodes, graph.edges);
      showToast('نود جدید با موفقیت افزوده شد', 'success');
      void fitView({ padding: 0.25, duration: 400 });
    }
    setIsGroupModalOpen(false);
    setEditingNodeId(null);
  };

  const handleOpenCreateModal = () => {
    setConnectingSourceId(null);
    setEditingNodeId(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditModal = (nodeId: string) => {
    setConnectingSourceId(null);
    setEditingNodeId(nodeId);
    setIsGroupModalOpen(true);
  };

  const handleDeleteNodes = async (
    targetNodeIds: string[],
  ): Promise<void> => {
    if (targetNodeIds.length === 0) return;

    const toDeleteIds = new Set<string>();
    for (const id of targetNodeIds) {
      toDeleteIds.add(id);
      const descendantIds = getDescendantNodeIds(
        id,
        graph.nodes,
        graph.edges,
      );
      for (const descId of descendantIds) {
        toDeleteIds.add(descId);
      }
    }

    if (editingNodeId && toDeleteIds.has(editingNodeId)) {
      setEditingNodeId(null);
      setIsGroupModalOpen(false);
    }

    if (connectingSourceId && toDeleteIds.has(connectingSourceId)) {
      setConnectingSourceId(null);
    }

    const remainingNodes = graph.nodes.filter(
      (node) => !toDeleteIds.has(node.id),
    );
    const remainingEdges = graph.edges.filter(
      (edge) => !toDeleteIds.has(edge.source) && !toDeleteIds.has(edge.target),
    );

    const nextNodes = calculateStandardLayout(remainingNodes, remainingEdges);
    graph.setNodes(nextNodes);
    graph.setEdges(remainingEdges);
    await graph.saveDocument(nextNodes, remainingEdges);

    const hasDescendants = toDeleteIds.size > targetNodeIds.length;
    showToast(
      hasDescendants
        ? 'نود و فرزندان آن با موفقیت حذف شدند'
        : 'نود با موفقیت حذف شد',
      'success',
    );
    void fitView({ padding: 0.25, duration: 400 });
  };

  const handleDeleteNode = async (nodeId: string): Promise<void> => {
    await handleDeleteNodes([nodeId]);
  };

  const handleNodesChange: OnNodesChange = (changes) => {
    const removeChanges = changes.filter((change) => change.type === 'remove');
    const otherChanges = changes.filter((change) => change.type !== 'remove');

    if (otherChanges.length > 0) {
      graph.onNodesChange(otherChanges);
    }

    if (removeChanges.length > 0) {
      const idsToDelete = removeChanges
        .map((change) =>
          'id' in change && typeof change.id === 'string' ? change.id : null,
        )
        .filter((id): id is string => Boolean(id));

      if (idsToDelete.length > 0) {
        void handleDeleteNodes(idsToDelete);
      }
    }
  };

  const handleCloneNode = async (nodeId: string) => {
    const cloneResult = cloneSubtree(nodeId, graph.nodes, graph.edges);
    if (!cloneResult) return;

    const nextNodesRaw = [...graph.nodes, ...cloneResult.clonedNodes];
    const nextEdges = [...graph.edges, ...cloneResult.createdEdges];
    const nextNodes = calculateStandardLayout(nextNodesRaw, nextEdges);

    graph.setNodes(nextNodes);
    graph.setEdges(nextEdges);
    await graph.saveDocument(nextNodes, nextEdges);

    showToast(
      cloneResult.isSubtreeWithDescendants
        ? 'نود و فرزندان آن با موفقیت کپی شدند'
        : 'نود با موفقیت کپی شد',
      'success',
    );
    void fitView({ padding: 0.25, duration: 400 });
  };

  const handleStartConnect = (nodeId: string) => {
    setIsSelectingZoomArea(false);
    setConnectingSourceId(nodeId);
  };

  const handleSelectConnectTarget = async (targetId: string) => {
    if (!connectingSourceId) return;
    const sourceId = connectingSourceId;

    if (sourceId === targetId) {
      showToast('نمی‌توانید نود را به خودش متصل کنید', 'error');
      setConnectingSourceId(null);
      return;
    }

    const isAlreadyConnected = graph.edges.some(
      (edge) =>
        (edge.source === sourceId && edge.target === targetId) ||
        (edge.source === targetId && edge.target === sourceId),
    );

    if (isAlreadyConnected) {
      showToast('این نود به این نود متصل هست', 'error');
      setConnectingSourceId(null);
      return;
    }

    const parentId = targetId;
    const childId = sourceId;

    const parentChildEdges = graph.edges.filter(isParentChildEdge);

    if (wouldCreateCycle(parentId, childId, parentChildEdges)) {
      showToast('ایجاد رابطه چرخه‌ای در ساختار درختی امکان‌پذیر نیست', 'error');
      setConnectingSourceId(null);
      return;
    }

    const newEdge: Edge = {
      id: `edge-${parentId}-${childId}`,
      source: parentId,
      target: childId,
      sourceHandle: 'parent-source',
      targetHandle: 'parent-target',
      type: 'smoothstep',
    };

    const nextEdges = addEdge(newEdge, graph.edges);
    const nextNodes = calculateStandardLayout(graph.nodes, nextEdges);
    graph.setNodes(nextNodes);
    graph.setEdges(nextEdges);
    await graph.saveDocument(nextNodes, nextEdges);
    showToast('ارتباط بین نودها با موفقیت برقرار شد', 'success');
    void fitView({ padding: 0.25, duration: 400 });
    setConnectingSourceId(null);
  };

  const handleCancelConnect = () => {
    setConnectingSourceId(null);
  };

  const handleConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    await handleSelectConnectTarget(connection.target);
  };

  const handleFocusNode = (nodeId: string) => {
    const node = graph.getNodeById(nodeId);
    if (!node) return;
    void setCenter(node.position.x, node.position.y, {
      zoom: 1.5,
      duration: 400,
    });
  };

  const handleDeleteEdge = async (edgeId: string) => {
    const nextEdges = graph.edges.filter((edge) => edge.id !== edgeId);
    const nextNodes = calculateStandardLayout(graph.nodes, nextEdges);
    graph.setNodes(nextNodes);
    graph.setEdges(nextEdges);
    await graph.saveDocument(nextNodes, nextEdges);
    showToast('ارتباط با موفقیت حذف شد', 'success');
    void fitView({ padding: 0.25, duration: 400 });
  };

  const handleCloseModal = () => {
    setIsGroupModalOpen(false);
    setEditingNodeId(null);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <Canvas
        nodes={graph.nodes}
        edges={graph.edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={graph.onEdgesChange}
        onConnect={(connection) => {
          void handleConnect(connection);
        }}
        isSelectingZoomArea={isSelectingZoomArea}
        onSelectZoomAreaChange={setIsSelectingZoomArea}
        connectingSourceId={connectingSourceId}
        onStartConnect={handleStartConnect}
        onSelectConnectTarget={(targetId) => {
          void handleSelectConnectTarget(targetId);
        }}
        onCancelConnect={handleCancelConnect}
        onEditNode={handleOpenEditModal}
        onDeleteNode={(nodeId) => {
          void handleDeleteNode(nodeId);
        }}
        onCloneNode={(nodeId) => {
          void handleCloneNode(nodeId);
        }}
        onFocusNode={handleFocusNode}
        onDeleteEdge={(edgeId) => {
          void handleDeleteEdge(edgeId);
        }}
      />
      <OperationToast
        isVisible={Boolean(connectingSourceId)}
        onCancel={handleCancelConnect}
      >
        <span>اون نودی که میخوای بهش متصل بشه رو انتخاب کن</span>
      </OperationToast>
      <OperationToast
        isVisible={isSelectingZoomArea}
        onCancel={() => {
          setIsSelectingZoomArea(false);
        }}
      >
        <span>محدوده برای زوم شدن رو انتخاب کن</span>
      </OperationToast>
      <AppToast />
      <CompactControls
        onOpenCreateGroupModal={handleOpenCreateModal}
        onSelectZoomArea={() => {
          setConnectingSourceId(null);
          setIsSelectingZoomArea(true);
        }}
      />
      <NodeGroupModal
        isOpen={isGroupModalOpen}
        nodeId={editingNodeId}
        initialTitle={selectedNodeData?.title}
        onClose={handleCloseModal}
        onSubmit={handleNodeGroupSubmit}
      />
    </main>
  );
};

export const App = () => {
  return (
    <ReactFlowProvider>
      <MindMapApp />
    </ReactFlowProvider>
  );
};

document.documentElement.classList.add('dark');

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
