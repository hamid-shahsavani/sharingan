import './index.css';

import { ReactFlowProvider } from '@xyflow/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CompactControls } from '@/features/layout/_components/compact-controls';
import { Canvas } from '@/features/main/_components/canvas';
import { OperationToast } from '@/features/shared/_components/operation-toast';
import { useMindMapDocument } from '@/features/shared/_hooks/mind-map-document';

export const MindMapApp = () => {
  const mindMap = useMindMapDocument();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <Canvas
        nodes={mindMap.nodes}
        edges={mindMap.edges}
        onNodesChange={mindMap.onNodesChange}
        onEdgesChange={mindMap.onEdgesChange}
        isSelectingZoomArea={mindMap.isSelectingZoomArea}
        onSelectZoomAreaChange={mindMap.setIsSelectingZoomArea}
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
