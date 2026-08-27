import { createContext } from 'react';

/**
 * Usuario que ve la aplicacion. Deliberadamente minimo: evita que los tipos
 * del SDK de Firebase se filtren fuera de src/auth.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  /** true mientras Firebase resuelve la sesion que ya tenia persistida. */
  loading: boolean;
  /** Login con Google (popup). Puede fallar en Safari/iOS por bloqueo de popups. */
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  needsAppSelection: boolean;
  completeAppSelection: () => void;
  /** ID Token del usuario actual; null si no hay sesion. */
  getIdToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthState | null>(null);
