import { formatMoney } from '../services/format';
import { MARKET_CURRENCY } from '../services/market';
import type { MarketStatus } from '../types/market';

/**
 * Topes de un producto. Son los mismos del backend (internal/market): se
 * repiten aqui solo para avisar antes de enviar; quien decide es el backend.
 */
export const MAX_ITEM_NAME_LENGTH = 100;
export const MAX_QUANTITY = 999;
export const MAX_UNIT_PRICE = 100_000_000;

/** Pesos enteros con el simbolo, sin centavos. */
export function formatPesos(amount: number): string {
  return formatMoney(amount, MARKET_CURRENCY);
}

/** Como se nombra cada estado del semaforo en una etiqueta corta. */
export const STATUS_LABELS: Record<MarketStatus, string> = {
  ok: 'Vas bien',
  warning: 'Queda poco',
  exceeded: 'Se acabó',
};

/**
 * Valida un precio por unidad ya convertido a numero. `required` es para el
 * precio real, que no puede faltar; el estimado vacio es "no se".
 */
export function unitPriceError(value: number, required: boolean): string | null {
  if (Number.isNaN(value)) return required ? 'Ingresa el precio por unidad.' : null;
  if (required && value <= 0) return 'El precio debe ser mayor que cero.';
  if (value > MAX_UNIT_PRICE) return 'Ese precio es demasiado alto. Revísalo.';
  return null;
}

/** Valida el nombre de un producto. */
export function itemNameError(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Escribe qué vas a comprar.';
  if ([...trimmed].length > MAX_ITEM_NAME_LENGTH) {
    return `El nombre puede tener hasta ${MAX_ITEM_NAME_LENGTH} caracteres.`;
  }
  return null;
}

/** "2026-10-15" en hora local; sin fecha, hoy. Es lo que pide un input date. */
export function toDateInputValue(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  const month = String(safe.getMonth() + 1).padStart(2, '0');
  const day = String(safe.getDate()).padStart(2, '0');
  return `${safe.getFullYear()}-${month}-${day}`;
}

/**
 * "2026-10-15" -> ISO de la medianoche local de ese dia, igual que guardan
 * los gastos pendientes. Vacio si la fecha no es valida.
 */
export function dateInputToIso(value: string): string {
  const date = new Date(`${value}T00:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
