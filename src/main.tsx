import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Canvas } from '@/features/main/_components/canvas';

export const App = () => {
  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      <Canvas />
    </main>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
