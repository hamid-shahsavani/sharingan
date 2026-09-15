import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export function App() {
  return <h1>Hello World!</h1>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
