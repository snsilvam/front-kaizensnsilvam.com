import type { PlanStatus } from '../types/dashboard';

/**
 * Los montos son pesos enteros: los centavos ",00" solo agregan ruido a la
 * cifra que el usuario tiene que leer de un vistazo.
 */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // currency invalido o vacio
    return amount.toLocaleString('es-CO');
  }
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * "05 oct 2026" a partir de una fecha sin hora ("2026-10-05"). new Date() la
 * leería como medianoche UTC, que en Colombia todavía es el día anterior: se
 * arma como fecha local.
 */
export function formatDateOnly(yyyyMmDd: string): string {
  const [year, month, day] = yyyyMmDd.split('-').map(Number);
  if (!year || !month || !day) return yyyyMmDd;
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** "12 oct": la fecha corta para listas, donde el año casi siempre sobra. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/** "jueves, 25 de septiembre". */
export function formatLongToday(now = new Date()): string {
  return now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** "1 día" / "3 días". */
export function daysLabel(days: number): string {
  return `${days} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
}

/**
 * Dias de calendario (locales) entre hoy y la fecha: 0 es hoy, negativo es
 * pasado. Se comparan medianoches para que las 23:59 de hoy no cuenten como
 * "mañana".
 */
export function calendarDaysUntil(iso: string, now = new Date()): number | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export type DueTone = 'overdue' | 'soon' | 'later';

/** Como se lee el vencimiento de un pago: la urgencia antes que la fecha. */
export function dueLabel(iso: string, now = new Date()): { text: string; tone: DueTone } {
  const days = calendarDaysUntil(iso, now);
  if (days === null) return { text: iso, tone: 'later' };

  if (days < -1) return { text: `Venció hace ${daysLabel(-days)}`, tone: 'overdue' };
  if (days === -1) return { text: 'Venció ayer', tone: 'overdue' };
  if (days === 0) return { text: 'Vence hoy', tone: 'soon' };
  if (days === 1) return { text: 'Vence mañana', tone: 'soon' };
  if (days <= 7) return { text: `Vence en ${daysLabel(days)}`, tone: 'soon' };
  return { text: `Vence el ${formatShortDate(iso)}`, tone: 'later' };
}

const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  on_track: 'Vas bien',
  at_risk: 'En riesgo',
  off_track: 'Fuera de plan',
  unknown: 'Sin datos',
};

export function planStatusLabel(status: PlanStatus): string {
  return PLAN_STATUS_LABELS[status] ?? PLAN_STATUS_LABELS.unknown;
}

/** El primer nombre para saludar; del correo, lo que va antes de la arroba. */
export function firstNameOf(displayName: string | null | undefined, email: string | null | undefined): string {
  const name = displayName?.trim().split(/\s+/)[0];
  if (name) return name;
  return email?.split('@')[0] ?? '';
}

/**
 * "07:30" -> "7 horas 30 minutos". Las horas dormidas llegan del backend con el
 * mismo formato "HH:MM" que las horas del reloj, pero son una duración.
 */
export function formatSleepDuration(hhmm: string): string {
  const [rawHours, rawMinutes] = hhmm.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return hhmm;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
  return parts.length > 0 ? parts.join(' ') : 'Sin registrar';
}
