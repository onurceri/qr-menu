// src/main.tsx
import { createRoot } from 'react-dom/client';
import { AppRouter } from './router';
import './index.css';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <AppRouter />
);