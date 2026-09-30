import './index.css';

import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CompactControls } from '@/features/layout/_components/compact-controls';
import { Canvas } from '@/features/main/_components/canvas';
import {
  type NodeGroupFormValues,
  NodeGroupModal,
} from '@/features/main/_components/node-group-modal';
import {
  createGroupNode,
  getClonedNodePosition,
  getMovedNodePosition,
  getNewNodePosition,
  updateNodeTitle,
} from '@/features/main/_utils/node-group';
import { AppToast } from '@/features/shared/_components/app-toast';
import { OperationToast } from '@/features/shared/_components/operation-toast';
import { useGraph } from '@/features/shared/_hooks/graph';
import { showToast } from '@/features/shared/_utils/toast';

interface NodeGroupCustomData {
  title?: string;
}

export const MindMapApp = () => {
  const graph = useGraph();
  const { screenToFlowPosition, setCenter } = useReactFlow();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSelectingZoomArea, setIsSelectingZoomArea] =
    useState<boolean>(false);

  const selectedNode = editingNodeId
    ? graph.getNodeById(editingNodeId)
    : undefined;
  const selectedNodeData = selectedNode?.data as
    NodeGroupCustomData | undefined;

  const handleNodeGroupSubmit = async (
    values: NodeGroupFormValues,
    nodeId: string | null,
  ): Promise<void> => {
    if (nodeId) {
      const nextNodes = updateNodeTitle(graph.nodes, nodeId, values.title);
      graph.setNodes(nextNodes);
      await graph.saveDocument(nextNodes, graph.edges);
      showToast('نود با موفقیت ویرایش شد');
    } else {
      const centerPosition = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const position = getNewNodePosition(centerPosition, graph.nodes);
      const newNode = createGroupNode(values.title, position);
      const nextNodes = [...graph.nodes, newNode];
      graph.setNodes(nextNodes);
      await graph.saveDocument(nextNodes, graph.edges);
      showToast('نود جدید با موفقیت افزوده شد');
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
    const nextNodes = graph.nodes.filter((node) => node.id !== nodeId);
    const nextEdges = graph.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId,
    );
    graph.setNodes(nextNodes);
    graph.setEdges(nextEdges);
    await graph.saveDocument(nextNodes, nextEdges);
    showToast('نود با موفقیت حذف شد');
  };

  const handleCloneNode = async (nodeId: string) => {
    const sourceNode = graph.getNodeById(nodeId);
    if (!sourceNode) return;
    const title =
      (sourceNode.data as NodeGroupCustomData)?.title || 'گروه جدید';
    const position = getClonedNodePosition(sourceNode, graph.nodes);
    const newNode = createGroupNode(title, position);
    const nextNodes = [...graph.nodes, newNode];
    graph.setNodes(nextNodes);
    await graph.saveDocument(nextNodes, graph.edges);
    showToast('نود با موفقیت کپی شد');
  };

  const handleMoveNode = async (nodeId: string) => {
    const node = graph.getNodeById(nodeId);
    if (!node) return;
    const nextPosition = getMovedNodePosition(node, graph.nodes);
    const nextNodes = graph.nodes.map((item) =>
      item.id === nodeId ? { ...item, position: nextPosition } : item,
    );
    graph.setNodes(nextNodes);
    await graph.saveDocument(nextNodes, graph.edges);
    showToast('موقعیت نود با موفقیت تغییر کرد');
  };

  const handleNodeDragStop = () => {
    showToast('موقعیت نود با موفقیت تغییر کرد');
  };

  const handleFocusNode = (nodeId: string) => {
    const node = graph.getNodeById(nodeId);
    if (!node) return;
    void setCenter(node.position.x, node.position.y, {
      zoom: 1.5,
      duration: 400,
    });
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
        onNodeDragStop={handleNodeDragStop}
        isSelectingZoomArea={isSelectingZoomArea}
        onSelectZoomAreaChange={setIsSelectingZoomArea}
        onEditNode={handleOpenEditModal}
        onDeleteNode={(nodeId) => {
          void handleDeleteNode(nodeId);
        }}
        onCloneNode={(nodeId) => {
          void handleCloneNode(nodeId);
        }}
        onMoveNode={(nodeId) => {
          void handleMoveNode(nodeId);
        }}
        onFocusNode={handleFocusNode}
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
