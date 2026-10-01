import './index.css';

import {
  addEdge,
  type Connection,
  type Edge,
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
  createGroupNode,
  updateNodeTitle,
} from '@/features/main/_utils/node-group';
import {
  calculateStandardLayout,
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

  const selectedNode = editingNodeId
    ? graph.getNodeById(editingNodeId)
    : undefined;
  const selectedNodeData = selectedNode?.data as
    NodeGroupCustomData | undefined;

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
      showToast('نود با موفقیت ویرایش شد');
    } else {
      const rawNode = createGroupNode(values.title, { x: 0, y: 0 });
      const rawNodes = [...graph.nodes, rawNode];
      const nextNodes = calculateStandardLayout(rawNodes, graph.edges);
      graph.setNodes(nextNodes);
      await graph.saveDocument(nextNodes, graph.edges);
      showToast('نود جدید با موفقیت افزوده شد');
      void fitView({ padding: 0.25, duration: 400 });
    }
    setIsGroupModalOpen(false);
    setEditingNodeId(null);
  };

  const handleOpenCreateModal = () => {
    setEditingNodeId(null);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditModal = (nodeId: string) => {
    setEditingNodeId(nodeId);
    setIsGroupModalOpen(true);
  };

  const handleDeleteNode = async (nodeId: string) => {
    const remainingNodes = graph.nodes.filter((node) => node.id !== nodeId);
    const remainingEdges = graph.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );
    const nextNodes = calculateStandardLayout(remainingNodes, remainingEdges);
    graph.setNodes(nextNodes);
    graph.setEdges(remainingEdges);
    await graph.saveDocument(nextNodes, remainingEdges);
    showToast('نود با موفقیت حذف شد');
    void fitView({ padding: 0.25, duration: 400 });
  };

  const handleCloneNode = async (nodeId: string) => {
    const sourceNode = graph.getNodeById(nodeId);
    if (!sourceNode) return;
    const title =
      (sourceNode.data as NodeGroupCustomData)?.title || 'گروه جدید';
    const rawNode = createGroupNode(title, { x: 0, y: 0 });

    const parentEdge = graph.edges.find((edge) => edge.target === nodeId);
    let nextEdges = graph.edges;
    if (parentEdge) {
      const newEdge: Edge = {
        id: `edge-${parentEdge.source}-${rawNode.id}`,
        source: parentEdge.source,
        target: rawNode.id,
        type: 'smoothstep',
      };
      nextEdges = [...graph.edges, newEdge];
      graph.setEdges(nextEdges);
    }

    const rawNodes = [...graph.nodes, rawNode];
    const nextNodes = calculateStandardLayout(rawNodes, nextEdges);
    graph.setNodes(nextNodes);
    await graph.saveDocument(nextNodes, nextEdges);
    showToast('نود با موفقیت کپی شد');
    void fitView({ padding: 0.25, duration: 400 });
  };

  const handleConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;

    if (wouldCreateCycle(connection.source, connection.target, graph.edges)) {
      showToast('ایجاد رابطه چرخه‌ای امکان‌پذیر نیست');
      return;
    }

    const newEdge: Edge = {
      id: `edge-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
    };

    const nextEdges = addEdge(newEdge, graph.edges);
    const nextNodes = calculateStandardLayout(graph.nodes, nextEdges);
    graph.setNodes(nextNodes);
    graph.setEdges(nextEdges);
    await graph.saveDocument(nextNodes, nextEdges);
    showToast('ارتباط بین نودها با موفقیت برقرار شد');
    void fitView({ padding: 0.25, duration: 400 });
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
    showToast('ارتباط با موفقیت حذف شد');
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
        onNodesChange={graph.onNodesChange}
        onEdgesChange={graph.onEdgesChange}
        onConnect={(connection) => {
          void handleConnect(connection);
        }}
        isSelectingZoomArea={isSelectingZoomArea}
        onSelectZoomAreaChange={setIsSelectingZoomArea}
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
