import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState, type AuthUser } from './AuthContext';
import { getIdToken, signInWithGoogle, signOutUser, watchAuth } from './firebase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase ya persiste la sesion: este listener es la unica fuente de verdad.
  useEffect(
    () =>
      watchAuth((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn: signInWithGoogle,
      signOut: signOutUser,
      getIdToken,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
