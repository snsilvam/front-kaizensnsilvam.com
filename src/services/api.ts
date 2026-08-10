import { getIdToken } from '../auth/firebase';
import type { ApiErrorResponse } from '../types/api';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

/** Error de API con el status HTTP para poder distinguir casos en la UI. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Unico punto de salida hacia el backend.
 * Siempre envia el header X-API-Key y el ID Token de la sesion de Firebase.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
  includeApiKey = true,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(includeApiKey ? { 'X-API-Key': API_KEY } : {}),
      ...(await authorizationHeader()),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

/** Solicitud a un endpoint publico cuya URL no depende de variables de entorno. */
export async function publicRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await authorizationHeader()),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

/** `Authorization: Bearer <ID_TOKEN>`; vacio si no hay sesion activa. */
async function authorizationHeader(): Promise<Record<string, string>> {
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiErrorResponse>;
    if (body?.error) return body.error;
  } catch {
    // el cuerpo no era JSON; usamos el status
  }
  return `Error ${response.status}`;
}
