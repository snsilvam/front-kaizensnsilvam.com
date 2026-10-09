// El reloj del día del Winter Arc. Las horas de los hábitos son "HH:MM" en
// 24 h y el "ahora" se toma en Bogotá, la zona con la que el backend decide
// qué día es hoy: así el horario no depende de la zona del navegador.

const BOGOTA_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Bogota',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Minutos desde la medianoche de una hora "HH:MM"; null si no es válida. */
export function clockMinutes(hhmm: string | null): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm ?? '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** La hora actual en Bogotá, en minutos desde la medianoche. */
export function bogotaMinutesNow(date = new Date()): number {
  const parts = BOGOTA_CLOCK.formatToParts(date);
  const hours = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minutes = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hours * 60 + minutes;
}

/** Minutos desde la medianoche en 12 h, como se dice en Colombia: "6:00" y "a. m.". */
export function formatClock(totalMinutes: number): { time: string; period: string } {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    time: `${hours % 12 || 12}:${String(minutes).padStart(2, '0')}`,
    period: hours < 12 ? 'a. m.' : 'p. m.',
  };
}

/** Una duración en minutos como "45 min", "2 h" o "2 h 15 min". */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
