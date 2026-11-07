import { daysLabel, formatMoney } from '../services/format';
import type { DebtKind } from '../types/debt';

export const DEBT_CURRENCY = 'COP';

/** Codigo de "Otra entidad": la persona escribe el nombre y no hay boton PSE. */
export const OTHER_ENTITY_CODE = 'otra';

export const DEBT_KIND_LABELS: Record<DebtKind, string> = {
  credit_card: 'Tarjeta de crédito',
  consumer: 'Libre inversión',
  payroll: 'Libranza',
  vehicle: 'Vehículo',
  mortgage: 'Vivienda',
  education: 'Educativo',
  other: 'Otra deuda',
};

export const DEBT_KINDS = Object.keys(DEBT_KIND_LABELS) as DebtKind[];

export function money(amount: number): string {
  return formatMoney(amount, DEBT_CURRENCY);
}

/** 28.5 -> "28,5 % E.A." */
export function formatRate(rate: number): string {
  return `${rate.toLocaleString('es-CO', { maximumFractionDigits: 2 })} % E.A.`;
}

/** "2028-03" -> "marzo de 2028". */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(year, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

/** "2026-11-15" -> "15 nov". Se arma con la fecha local para no correrse por UTC. */
export function formatDay(day: string): string {
  const [year, m, d] = day.split('-').map(Number);
  if (!year || !m || !d) return day;
  return new Date(year, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/** Como se lee un vencimiento: la urgencia primero. */
export function dueText(daysUntil: number, dueDate: string): string {
  if (daysUntil < -1) return `Venció hace ${daysLabel(-daysUntil)}`;
  if (daysUntil === -1) return 'Venció ayer';
  if (daysUntil === 0) return 'Vence hoy';
  if (daysUntil === 1) return 'Vence mañana';
  if (daysUntil <= 7) return `Vence en ${daysLabel(daysUntil)}`;
  return `Vence el ${formatDay(dueDate)}`;
}

/** El sitio al que lleva el boton PSE, para que la persona vea que es el oficial. */
export function siteOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "28,5" -> 28.5: la tasa se escribe con coma decimal, como en los extractos. */
export function parseRate(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return normalized ? Number(normalized) : Number.NaN;
}

/** Hoy en hora de Colombia, "YYYY-MM-DD", para el campo de fecha del pago. */
export function todayInBogota(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(now);
}
