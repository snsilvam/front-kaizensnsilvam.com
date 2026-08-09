# Kaizen — Frontend

React + TypeScript + Vite. Consume unicamente la API REST del backend Go.
Autenticacion con Firebase Authentication (Google). Sin Redux, sin router.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar VITE_API_URL, VITE_API_KEY y VITE_FIREBASE_*
npm run dev
```

Requisitos en Firebase Console: habilitar **Google** en Authentication ->
Sign-in method y agregar el dominio del frontend en **Authorized domains**
(`localhost` ya viene incluido).

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`.

## Despliegue

Push a `main` dispara `.github/workflows/deploy.yml`: typecheck, build de la
imagen Docker (Vite → nginx en el puerto 8080), push a Artifact Registry
(`us-central1-docker.pkg.dev/kaizensnsilvam/frontend/kaizensnsilvam-frontend`)
y `gcloud run deploy` en `us-central1`. Autenticacion por OIDC (Workload
Identity) con provider y service account propios del frontend
(`github-frontend-provider` / `github-actions-frontend@`), separados de los del
backend.

`VITE_API_URL` y `VITE_API_KEY` se inyectan como build args porque Vite las
incrusta en el bundle; configurarlas en el repo de GitHub como variable
(`vars.VITE_API_URL`) y secreto (`secrets.VITE_API_KEY`).

Las cuatro `VITE_FIREBASE_*` tambien van como build args, configuradas como
variables del repo (`vars.VITE_FIREBASE_*`). No son secretos: la config web de
Firebase es publica por diseno.

## Estructura

```
src/
  auth/         capa de autenticacion (ver mas abajo)
  components/   Card, Loading, ErrorMessage, PendingList, AppLayout
  pages/        Home.tsx, Login.tsx, Sebas.tsx
  services/     api.ts (fetch + header X-API-Key), dashboard.ts, format.ts
  hooks/        useDashboard.ts
  types/        dashboard.ts, api.ts
  App.tsx
```

Toda salida a red pasa por `services/api.ts`, que agrega el header
`X-API-Key` (valor de `VITE_API_KEY`) en cada peticion.

## Autenticacion

```
src/auth/
  firebase.ts        unico archivo que importa el SDK de Firebase
  AuthContext.tsx    tipos AuthUser / AuthState + createContext
  AuthProvider.tsx   listener onAuthStateChanged
  useAuth.ts         hook de acceso al contexto
  ProtectedRoute.tsx guard: Loading -> Login -> contenido
```

`main.tsx` envuelve la app en `<AuthProvider><ProtectedRoute><App /></...>`, asi
que todo el frontend queda detras del login. El estado viene solo de
`onAuthStateChanged()`; Firebase persiste la sesion, no se guarda nada en
LocalStorage.

Los componentes de negocio nunca importan Firebase: usan `useAuth()`, que
devuelve `{ user, loading, signIn, signOut, getIdToken }` con un `AuthUser`
propio (`uid`, `email`, `displayName`).

Para proteger solo una parte de la UI, envolver ese bloque en
`<ProtectedRoute>` en lugar de `App` completo.

El backend sigue autenticando con `X-API-Key`. Cuando valide Firebase ID
Tokens, el cambio se limita a `services/api.ts`: usar `getIdToken()` del
contexto y enviarlo como `Authorization: Bearer <token>`.

> Nota: al ser una app de navegador, `VITE_API_KEY` queda incrustada en el
> bundle y es visible para cualquiera. Sirve como clave de aplicacion frente
> al backend, no como secreto de usuario.

## Contrato esperado: `GET /dashboard`

El Home consume este endpoint. El backend actual (Gin) todavia expone solo
`/health`, `/families` y `/users`, asi que la respuesta esperada se declara
en `src/types/dashboard.ts`:

```json
{
  "availableMoney": 1250000,
  "currency": "COP",
  "nextIncome": {
    "amount": 3200000,
    "date": "2026-08-15T00:00:00Z",
    "source": "Nomina"
  },
  "planStatus": "on_track",
  "pending": [
    { "id": "p1", "title": "Pagar arriendo", "amount": 900000, "dueDate": "2026-08-05T00:00:00Z" }
  ]
}
```

- `nextIncome` puede ser `null`.
- `planStatus`: `on_track` | `at_risk` | `off_track` | `unknown`.
- `pending` puede ser un array vacio.
- Errores: se espera `{"error": "mensaje"}`, igual que el resto del backend.

Si el backend define otros nombres de campo, ajustar solo
`src/types/dashboard.ts` (y el mapeo en `services/dashboard.ts` si hace falta).

No hay datos falsos ni mocks: mientras el endpoint no exista, el Home muestra
el estado de error con boton de reintentar.
