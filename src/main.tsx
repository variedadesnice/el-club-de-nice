import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import AppErrorBoundary from './shared/AppErrorBoundary.tsx';
import { installTranslatorGuard } from './lib/translatorGuard.ts';
import './index.css';

// Antes de montar nada: el traductor puede empezar a reescribir el DOM apenas
// se pinta la primera pantalla.
installTranslatorGuard();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
