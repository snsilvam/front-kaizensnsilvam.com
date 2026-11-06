import { request } from './api';
import { COACH_MAX_HISTORY } from '../lib/coach';
import type { CoachAnswer, CoachTurn } from '../types/coach';

/**
 * POST /coach/questions. Manda la pregunta con los últimos turnos de la
 * ventana: el backend no guarda conversaciones y acepta como mucho 10.
 */
export async function askCoach(question: string, history: CoachTurn[]): Promise<CoachAnswer> {
  return request<CoachAnswer>(
    '/coach/questions',
    { method: 'POST', body: JSON.stringify({ question, history: history.slice(-COACH_MAX_HISTORY) }) },
    false,
  );
}
