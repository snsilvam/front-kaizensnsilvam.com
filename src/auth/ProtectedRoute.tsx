import type { ReactNode } from 'react';
import { Loading } from '../components/Loading';
import { Login } from '../pages/Login';
import { SelectApp } from '../pages/SelectApp';
import { useAuth } from './useAuth';

/**
 * Muestra el contenido solo si hay sesion.
 * Mientras Firebase resuelve la sesion persistida muestra el estado de carga,
 * para no mostrar el Login a alguien que ya estaba autenticado.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, needsAppSelection } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Login />;
  if (needsAppSelection) return <SelectApp />;

  return <>{children}</>;
}
