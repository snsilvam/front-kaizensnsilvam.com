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
 * Siempre envia el header X-API-Key.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
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
