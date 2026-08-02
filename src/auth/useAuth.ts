import { useContext } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

/** Unica forma de leer el estado de autenticacion desde la aplicacion. */
export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return state;
}
