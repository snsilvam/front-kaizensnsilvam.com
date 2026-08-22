import type { PlanStatus } from '../types/dashboard';

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount);
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

const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  on_track: 'En camino',
  at_risk: 'En riesgo',
  off_track: 'Fuera de plan',
  unknown: 'Sin datos',
};

export function planStatusLabel(status: PlanStatus): string {
  return PLAN_STATUS_LABELS[status] ?? PLAN_STATUS_LABELS.unknown;
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
