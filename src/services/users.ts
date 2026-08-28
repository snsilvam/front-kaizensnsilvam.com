import { request } from './api';
import type { AppUser } from '../types/user';

/**
 * POST /users/sync: da de alta al usuario o refresca sus datos.
 *
 * No lleva body: el backend toma la identidad del ID token que ya viaja en el
 * header. Es idempotente, asi que se puede llamar despues de cada login.
 */
export function syncUser(): Promise<AppUser> {
  return request<AppUser>('/users/sync', { method: 'POST' }, false);
}

