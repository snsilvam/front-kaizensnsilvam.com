import { FirebaseError, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
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

/** Minimo que exige Firebase para una contraseña. */
export const MIN_PASSWORD_LENGTH = 6;

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

/** Login con correo y contraseña: no depende de popups ni de cookies de terceros. */
export function signInWithEmail(email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth, email.trim(), password).then(() => undefined);
}

/**
 * Crea la cuenta y deja la sesion iniciada; el nombre es opcional.
 * Devuelve el usuario ya con el nombre aplicado: onAuthStateChanged se dispara
 * antes de updateProfile, asi que el listener por si solo veria displayName null.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  const name = displayName.trim();
  if (name) await updateProfile(credential.user, { displayName: name });

  return toAuthUser(credential.user);
}

/** Envia el correo con el enlace para restablecer la contraseña. */
export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email.trim());
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

/** ID Token para las llamadas al backend. Firebase lo renueva cuando expira. */
export function getIdToken(): Promise<string | null> {
  return auth.currentUser?.getIdToken() ?? Promise.resolve(null);
}

/**
 * Renueva el ID token a la fuerza.
 *
 * updateProfile no toca el token ya emitido: el claim `name` recien puesto no
 * llega al backend hasta que se renueva. Sin esto, el usuario que se registra
 * con correo quedaria guardado sin nombre.
 */
export function refreshIdToken(): Promise<string | null> {
  return auth.currentUser?.getIdToken(true) ?? Promise.resolve(null);
}

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL };
}

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/weak-password': `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'auth/network-request-failed': 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
  'auth/operation-not-allowed':
    'El acceso con correo y contraseña no está habilitado en Firebase Authentication.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
  // Safari en iPhone bloquea la ventana de Google: por eso existe el correo.
  'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Entra con tu correo y contraseña.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'Cerraste la ventana de Google antes de terminar.',
  'auth/operation-not-supported-in-this-environment':
    'Este navegador no soporta el acceso con Google. Entra con tu correo y contraseña.',
};

/** Traduce el codigo de error de Firebase a un mensaje accionable en español. */
export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] ?? `No se pudo completar la operación (${error.code}).`;
  }
  return 'No se pudo completar la operación. Intenta de nuevo.';
}
