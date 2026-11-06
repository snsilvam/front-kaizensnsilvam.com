/** Quién dijo un turno de la conversación con el coach. */
export type CoachRole = 'user' | 'coach';

/** Un turno de la ventana del coach. Solo vive en el diálogo: el backend no guarda conversaciones. */
export interface CoachTurn {
  role: CoachRole;
  text: string;
}

/** Respuesta de POST /coach/questions. */
export interface CoachAnswer {
  answer: string;
  /** Preguntas que le quedan hoy (día de Bogotá), de 0 a 20. */
  remainingToday: number;
}
