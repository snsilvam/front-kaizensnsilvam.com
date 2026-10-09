import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { CHOOSER_PATH } from './lib/paths';
import './index.css';

// La raiz no tiene pagina propia: el indice de la app es el selector de
// caminos. La URL se cambia antes de montar nada y sin recargar, asi el splash,
// el login y la app ya ven /caminos, y "atras" no vuelve a la raiz.
if (window.location.pathname === '/') {
  window.history.replaceState(null, '', `${CHOOSER_PATH}${window.location.search}${window.location.hash}`);
}

const container = document.getElementById('root');
if (!container) throw new Error('No se encontro el elemento #root');

createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    </AuthProvider>
  </StrictMode>,
);
