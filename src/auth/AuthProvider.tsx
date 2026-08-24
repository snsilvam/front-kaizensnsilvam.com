import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState, type AuthUser } from './AuthContext';
import { getIdToken, signInWithGoogle, signOutUser, watchAuth } from './firebase';

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
      signIn: async () => {
        await signInWithGoogle();
        setNeedsAppSelection(true);
      },
      signOut: signOutUser,
      needsAppSelection,
      completeAppSelection: () => setNeedsAppSelection(false),
      getIdToken,
    }),
    [user, loading, needsAppSelection],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
