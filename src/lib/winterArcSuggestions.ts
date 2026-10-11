// Hábitos sugeridos para quien llega al Winter Arc sin hábitos.
//
// v1: quemados en código, uno por pilar del samurái (cuerpo, alimento y
// mente). Cuando lleguen las sugerencias con IA, esta lista se reemplaza por
// la respuesta del backend con la misma forma: así la pantalla no cambia.

import type { RegisterKaizenHabitInput } from '../services/kaizenHabits';

/** Un hábito listo para crear en Kaizen Habits; `pillar` sólo se muestra. */
export interface SuggestedHabit extends Omit<RegisterKaizenHabitInput, 'timezone' | 'active'> {
  /** Qué parte del samurái entrena: se muestra como etiqueta de la sugerencia. */
  pillar: string;
}

export const WINTER_ARC_SUGGESTED_HABITS: SuggestedHabit[] = [
  {
    pillar: 'Ejercicio',
    name: 'Entrenar 30 minutos',
    description: 'Mover el cuerpo cada día: fuerza, cardio o caminar rápido.',
    identity: 'Soy una persona que entrena',
    cue: 'Al levantarme, antes de mirar el celular',
    attractiveness: '',
    action: 'Ponerme la ropa de entrenar y moverme 30 minutos',
    minimumAction2min: 'Hacer 10 sentadillas',
    reward: '',
    time: '06:30',
    location: 'Casa',
  },
  {
    pillar: 'Comida sana',
    name: 'Comer limpio',
    description: 'Comida real: proteína, verdura y agua; sin ultraprocesados ni azúcar añadida.',
    identity: 'Soy una persona que cuida lo que come',
    cue: 'Al servir el almuerzo',
    attractiveness: '',
    action: 'Armar el plato con proteína y verdura, sin ultraprocesados',
    minimumAction2min: 'Comer una fruta o verdura y tomar un vaso de agua',
    reward: '',
    time: '12:30',
    location: 'Cocina',
  },
  {
    pillar: 'Enfoque',
    name: 'Meditar 10 minutos',
    description: 'Entrenar la atención: sentarse en silencio y volver a la respiración.',
    identity: 'Soy una persona enfocada',
    cue: 'Antes de acostarme',
    attractiveness: '',
    action: 'Sentarme en silencio y seguir la respiración 10 minutos',
    minimumAction2min: 'Tres respiraciones profundas con los ojos cerrados',
    reward: '',
    time: '21:30',
    location: 'Habitación',
  },
];
