import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { syncUser } from '../services/users';
import { AuthContext, type AuthState, type AuthUser } from './AuthContext';
import {
  getIdToken,
  refreshIdToken,
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

  // UID ya sincronizado con el backend. Evita repetir el POST en cada render y
  // en el doble montaje que hace StrictMode en desarrollo.
  const syncedUid = useRef<string | null>(null);

  // Un registro nuevo lo sincroniza registerWithEmail, no el listener: el
  // nombre solo existe despues de updateProfile y de renovar el token.
  const registering = useRef(false);

  // Firebase ya persiste la sesion: este listener es la unica fuente de verdad.
  useEffect(
    () =>
      watchAuth((nextUser) => {
        setUser(nextUser);
        if (!nextUser) {
          setNeedsAppSelection(false);
          syncedUid.current = null;
        } else if (syncedUid.current !== nextUser.uid && !registering.current) {
          // Se sincroniza tambien al restaurar la sesion, no solo al entrar:
          // quien ya tenia sesion abierta nunca vuelve a pasar por el login y
          // se quedaria sin fila en users.
          syncedUid.current = nextUser.uid;
          void syncCurrentUser();
        }
        setLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      // Todo login recien hecho pasa por la seleccion de app, sin importar el canal.
      // El alta en el backend la dispara el listener de arriba, que se ejecuta
      // en los tres casos.
      signInWithGoogle: async () => {
        await signInWithGoogle();
        setNeedsAppSelection(true);
      },
      signInWithEmail: async (email, password) => {
        await signInWithEmail(email, password);
        setNeedsAppSelection(true);
      },
      registerWithEmail: async (email, password, displayName) => {
        registering.current = true;
        try {
          const registered = await registerWithEmail(email, password, displayName);
          setUser(registered);
          // El token emitido al crear la cuenta todavia no lleva el nombre.
          await refreshIdToken();
          syncedUid.current = registered.uid;
          await syncCurrentUser();
        } finally {
          registering.current = false;
        }
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

/**
 * Avisa al backend de quien acaba de entrar, para que guarde o refresque su
 * fila en users.
 *
 * No bloquea el login ni lo hace fallar: si el backend no responde el usuario
 * entra igual y la proxima visita vuelve a intentarlo, porque la operacion es
 * idempotente.
 */
function syncCurrentUser(): Promise<void> {
  return syncUser()
    .then(() => undefined)
    .catch((error: unknown) => {
      console.error('No se pudo sincronizar el usuario con el backend', error);
    });
}
