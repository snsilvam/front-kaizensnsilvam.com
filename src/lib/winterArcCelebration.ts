import { burst } from './confetti';

/** Lo que dice el dojo tras cada regla cumplida. Sale una al azar. */
const STRIKE_CHEERS = [
  'Un golpe más al acero.',
  'El placer pierde. El samurái gana.',
  'Disciplina, no motivación.',
  'Tu yo de enero lo nota.',
  'Cumplido, a su hora.',
  'La forja no descansa.',
  'Otra impureza fuera del acero.',
  'Así se templa el carácter.',
];

/**
 * El golpe de acero de una regla cumplida: escarcha y chispas desde
 * `origin` y una vibración corta en el móvil. Devuelve la frase que toca.
 */
export function strike(origin: Element | null): string {
  if (origin) {
    const rect = origin.getBoundingClientRect();
    burst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 45, speed: 10, embers: 0.3 });
  }
  vibrate(25);
  return STRIKE_CHEERS[Math.floor(Math.random() * STRIKE_CHEERS.length)];
}

/** Vibra si el navegador lo permite (Android sí, iOS no). */
export function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}
