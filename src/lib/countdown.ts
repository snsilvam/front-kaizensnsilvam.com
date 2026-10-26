/** Parte milisegundos en días, horas, minutos y segundos; nunca baja de cero. */
export function splitRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/** 7 -> "07", para que los relojes no bailen de ancho. */
export function pad(value: number): string {
  return String(value).padStart(2, '0');
}
