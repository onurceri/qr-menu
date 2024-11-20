// src/main.tsx
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { AppRouter } from './router';
import './index.css';
import './i18n';
import './lib/firebase'; // Import Firebase initialization

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);