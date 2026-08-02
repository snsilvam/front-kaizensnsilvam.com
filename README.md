# Kaizen — Frontend

React + TypeScript + Vite. Consume unicamente la API REST del backend Go.
Sin autenticacion, sin Redux, sin router: solo el Home.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar VITE_API_URL y VITE_API_KEY
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`.

## Estructura

```
src/
  components/   Card, Loading, ErrorMessage, PendingList
  pages/        Home.tsx
  services/     api.ts (fetch + header X-API-Key), dashboard.ts, format.ts
  hooks/        useDashboard.ts
  types/        dashboard.ts, api.ts
  App.tsx
```

Toda salida a red pasa por `services/api.ts`, que agrega el header
`X-API-Key` (valor de `VITE_API_KEY`) en cada peticion.

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
