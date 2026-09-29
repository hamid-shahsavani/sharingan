import './index.css';

import { ReactFlowProvider } from '@xyflow/react';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { CompactControls } from '@/features/layout/_components/compact-controls';
import { Canvas } from '@/features/main/_components/canvas';
import { GroupNodeModal } from '@/features/main/_components/modals/group-node-modal';
import type { GroupNodeFormValues } from '@/features/main/_schemas/group-node-schema';
import { OperationToast } from '@/features/shared/_components/operation-toast';
import { useMindMapDocument } from '@/features/shared/_hooks/mind-map-document';

interface NodeGroupCustomData {
  title?: string;
}

export const MindMapApp = () => {
  const mindMap = useMindMapDocument();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const selectedNode = editingNodeId ? mindMap.getNodeById(editingNodeId) : undefined;
  const selectedNodeData = selectedNode?.data as NodeGroupCustomData | undefined;

  const handleGroupNodeSubmit = async (
    values: GroupNodeFormValues,
    nodeId: string | null,
  ): Promise<void> => {
    if (nodeId) {
      await mindMap.handleUpdateGroupNode(nodeId, values);
    } else {
      await mindMap.handleCreateGroupNode(values);
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

  const handleCloseModal = () => {
    setIsGroupModalOpen(false);
    setEditingNodeId(null);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <Canvas
        nodes={mindMap.nodes}
        edges={mindMap.edges}
        onNodesChange={mindMap.onNodesChange}
        onEdgesChange={mindMap.onEdgesChange}
        isSelectingZoomArea={mindMap.isSelectingZoomArea}
        onSelectZoomAreaChange={mindMap.setIsSelectingZoomArea}
        onEditNode={handleOpenEditModal}
      />
      <OperationToast
        isVisible={mindMap.isSelectingZoomArea}
        onCancel={() => {
          mindMap.setIsSelectingZoomArea(false);
        }}
      >
        <span>محدوده برای زوم شدن رو انتخاب کن</span>
      </OperationToast>
      <CompactControls
        nodes={mindMap.nodes}
        onOpenCreateGroupModal={handleOpenCreateModal}
        onCreateNode={mindMap.handleCreateNode}
        onSelectZoomArea={() => {
          mindMap.setIsSelectingZoomArea(true);
        }}
        activeVersionId={mindMap.activeVersionId}
        isDirty={mindMap.isDirty}
        isSaving={mindMap.isSaving}
        canUndo={mindMap.canUndo}
        canRedo={mindMap.canRedo}
        onUndo={mindMap.handleUndo}
        onRedo={mindMap.handleRedo}
        onSaveVersion={() => {
          void mindMap.handleSaveVersion();
        }}
        onSwitchVersion={(versionId) => {
          void mindMap.handleSwitchVersion(versionId);
        }}
        onDeleteVersion={(versionId) => {
          void mindMap.handleDeleteVersion(versionId);
        }}
        onDownloadVersion={mindMap.handleDownloadVersion}
        versions={mindMap.versions}
      />
      <GroupNodeModal
        isOpen={isGroupModalOpen}
        nodeId={editingNodeId}
        initialTitle={selectedNodeData?.title}
        onClose={handleCloseModal}
        onSubmit={handleGroupNodeSubmit}
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
