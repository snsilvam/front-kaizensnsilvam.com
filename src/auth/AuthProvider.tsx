import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState, type AuthUser } from './AuthContext';
import {
  getIdToken,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  watchAuth,
} from './firebase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAppSelection, setNeedsAppSelection] = useState(false);

  // Firebase ya persiste la sesion: este listener es la unica fuente de verdad.
  useEffect(
    () =>
      watchAuth((nextUser) => {
        setUser(nextUser);
        if (!nextUser) setNeedsAppSelection(false);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      // Todo login recien hecho pasa por la seleccion de app, sin importar el canal.
      signInWithGoogle: async () => {
        await signInWithGoogle();
        setNeedsAppSelection(true);
      },
      signInWithEmail: async (email, password) => {
        await signInWithEmail(email, password);
        setNeedsAppSelection(true);
      },
      registerWithEmail: async (email, password, displayName) => {
        setUser(await registerWithEmail(email, password, displayName));
        setNeedsAppSelection(true);
      },
      sendPasswordReset,
      signOut: signOutUser,
      needsAppSelection,
      completeAppSelection: () => setNeedsAppSelection(false),
      getIdToken,
    }),
    [user, loading, needsAppSelection],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
