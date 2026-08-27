/**
 * Utilidades para el "dia contable" de un habito: la cadena YYYY-MM-DD que el
 * backend usa en repeticiones y calendarios. Todo el calculo se hace sobre la
 * cadena (no sobre objetos Date locales) para que la zona horaria del navegador
 * nunca corra un dia hacia adelante o hacia atras.
 */

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Etiquetas de la cabecera del calendario; la semana arranca en lunes. */
export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Dia contable de hoy en la zona horaria del habito (o la del navegador). */
export function todayKey(timezone?: string): string {
  try {
    // en-CA formatea como YYYY-MM-DD, que es exactamente el formato del backend.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    // timezone invalida: caemos a la del navegador
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}

/** Zona horaria IANA del navegador, usada al crear habitos. */
export function browserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function parseDayKey(dayKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dayKey.split('-').map(Number);
  return { year, month, day };
}

function toDayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Primer dia del mes al que pertenece `dayKey`. */
export function monthStart(dayKey: string): string {
  const { year, month } = parseDayKey(dayKey);
  return toDayKey(year, month, 1);
}

/** Rango completo del mes de `dayKey`, listo para GET /calendar. */
export function monthRange(dayKey: string): { from: string; to: string } {
  const { year, month } = parseDayKey(dayKey);
  return { from: toDayKey(year, month, 1), to: toDayKey(year, month, daysInMonth(year, month)) };
}

/** Mueve `dayKey` `delta` meses y devuelve el primer dia del mes resultante. */
export function shiftMonth(dayKey: string, delta: number): string {
  const { year, month } = parseDayKey(dayKey);
  const index = (year * 12 + (month - 1)) + delta;
  return toDayKey(Math.floor(index / 12), (index % 12) + 1, 1);
}

/** "2026-08-01" -> "Agosto 2026". */
export function monthLabel(dayKey: string): string {
  const { year, month } = parseDayKey(dayKey);
  const name = MONTH_NAMES[month - 1] ?? '';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** "2026-08-22" -> "22 de agosto de 2026". */
export function formatDayKey(dayKey: string): string {
  const { year, month, day } = parseDayKey(dayKey);
  return `${day} de ${MONTH_NAMES[month - 1] ?? ''} de ${year}`;
}

/** Dia del mes como numero, para pintar la celda del calendario. */
export function dayOfMonth(dayKey: string): number {
  return parseDayKey(dayKey).day;
}

/**
 * Celdas del mes en filas de 7, con `null` en los huecos previos al dia 1 y
 * posteriores al ultimo dia.
 */
export function monthGrid(dayKey: string): (string | null)[] {
  const { year, month } = parseDayKey(dayKey);
  const total = daysInMonth(year, month);
  // getUTCDay(): 0 = domingo. Con la semana en lunes, el offset es (dia + 6) % 7.
  const leading = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= total; day += 1) cells.push(toDayKey(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

/** Compara dos dias contables; el formato YYYY-MM-DD ordena alfabeticamente. */
export function isAfter(dayKey: string, reference: string): boolean {
  return dayKey > reference;
}
