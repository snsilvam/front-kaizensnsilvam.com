import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import type { AuthUser } from './AuthContext';

/**
 * Unico archivo que conoce el SDK de Firebase.
 * El resto de la aplicacion trabaja contra AuthContext / useAuth.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

// Falla temprano y con un mensaje claro en lugar de un error opaco del SDK.
if (!config.apiKey || !config.authDomain || !config.projectId) {
  throw new Error('Falta configurar las variables VITE_FIREBASE_* (ver .env.example)');
}

const auth = getAuth(initializeApp(config));

const google = new GoogleAuthProvider();

/**
 * Escucha los cambios de sesion (login, logout y sesion restaurada al cargar).
 * Devuelve la funcion para dejar de escuchar.
 */
export function watchAuth(onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => onChange(user ? toAuthUser(user) : null));
}

export function signInWithGoogle(): Promise<void> {
  return signInWithPopup(auth, google).then(() => undefined);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

/** ID Token para las llamadas al backend. Firebase lo renueva cuando expira. */
export function getIdToken(): Promise<string | null> {
  return auth.currentUser?.getIdToken() ?? Promise.resolve(null);
}

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}
