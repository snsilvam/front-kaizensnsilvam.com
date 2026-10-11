/** Tope de una noche, el mismo del backend: 24 horas. */
export const MAX_SLEEP_MINUTES = 24 * 60;

/** "HH:MM" de 24 horas con dos digitos, lo que manda un input type="time". */
const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isTimeOfDay(value: string): boolean {
  return TIME_OF_DAY.test(value);
}

/** 338 -> "5 h 38 min"; 360 -> "6 h"; 45 -> "45 min". */
export function formatSleepMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** 338 -> { hours: "5", minutes: "38" }, para rellenar el formulario. */
export function splitSleepMinutes(total: number): { hours: string; minutes: string } {
  return { hours: String(Math.floor(total / 60)), minutes: String(total % 60) };
}

/**
 * Horas y minutos escritos -> minutos totales, o un mensaje si no valen. Los
 * dos campos son enteros; los minutos van de 0 a 59 y el total, de 1 minuto a
 * 24 horas.
 */
export function toSleepMinutes(hours: string, minutes: string): number | string {
  if (!/^\d{1,2}$/.test(hours) || !/^\d{1,2}$/.test(minutes || '0')) {
    return 'Escribe las horas y los minutos con números enteros.';
  }
  const h = Number(hours);
  const m = Number(minutes || '0');
  if (m > 59) return 'Los minutos van de 0 a 59.';
  const total = h * 60 + m;
  if (total < 1) return 'Escribe cuánto dormiste.';
  if (total > MAX_SLEEP_MINUTES) return 'No puede ser más de 24 horas.';
  return total;
}

/** "22:30" -> "10:30 p. m.", como se lee la hora en Colombia. */
export function formatTimeOfDay(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "2026-10-11" -> "sábado, 11 de octubre". La fecha es local, sin zona. */
export function formatRecordDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const local = new Date(year, month - 1, day);
  if (Number.isNaN(local.getTime())) return date;
  return local.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
