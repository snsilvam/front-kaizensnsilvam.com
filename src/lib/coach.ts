/** Largo máximo de una pregunta al coach (el backend lo valida igual). */
export const COACH_MAX_QUESTION = 500;

/** Turnos previos de la ventana que se mandan con cada pregunta. */
export const COACH_MAX_HISTORY = 10;

/**
 * Preguntas listas del coach: se envían con un toque. Cada una tiene detrás
 * una herramienta del agente que trae los datos para responderla.
 */
export const COACH_QUICK_QUESTIONS: string[] = [
  '¿Qué me falta hoy?',
  '¿Cómo voy en el reto?',
  '¿Qué hábito estoy dejando caer?',
];

export interface CoachTextPart {
  text: string;
  strong: boolean;
}

/**
 * Parte la respuesta en trozos normales y en *énfasis*, para pintarlos sin
 * HTML crudo. Un asterisco sin pareja se deja como texto.
 */
export function splitEmphasis(text: string): CoachTextPart[] {
  const parts: CoachTextPart[] = [];
  const pattern = /\*([^*\n]+)\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), strong: false });
    parts.push({ text: match[1], strong: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), strong: false });
  return parts;
}
