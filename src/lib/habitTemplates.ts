// Plantillas para crear un habito sin partir de la hoja en blanco, y el emoji
// con el que se reconoce cada habito en la lista de hoy.
//
// v1: quemadas aqui, como las sugerencias del Winter Arc. Cada plantilla ya
// trae el sistema completo (senal, accion, version minima, recompensa) para
// que el usuario vea como se ve un buen habito y solo ajuste lo suyo.

import type { KaizenHabit } from '../types/kaizenHabit';

/** Los campos del habito que el usuario escribe en el asistente. */
export interface HabitDraft {
  name: string;
  description: string;
  identity: string;
  cue: string;
  attractiveness: string;
  action: string;
  minimumAction2min: string;
  reward: string;
  time: string;
  location: string;
}

export interface HabitTemplate extends HabitDraft {
  id: string;
  emoji: string;
  /** Texto corto del chip. */
  label: string;
}

export const EMPTY_HABIT_DRAFT: HabitDraft = {
  name: '',
  description: '',
  identity: '',
  cue: '',
  attractiveness: '',
  action: '',
  minimumAction2min: '',
  reward: '',
  time: '',
  location: '',
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'leer',
    emoji: '📖',
    label: 'Leer',
    name: 'Leer 10 páginas',
    identity: 'Soy una persona que lee',
    description: '',
    cue: 'Después de cepillarme los dientes en la noche',
    attractiveness: 'Con una bebida caliente y el libro que más me intriga',
    action: 'Leer 10 páginas de mi libro',
    minimumAction2min: 'Leer una página',
    reward: 'Anotar en mi libreta la idea que más me gustó',
    time: '21:30',
    location: 'Habitación',
  },
  {
    id: 'moverme',
    emoji: '🏃',
    label: 'Moverme',
    name: 'Entrenar 30 minutos',
    identity: 'Soy una persona activa',
    description: '',
    cue: 'Después de servirme el café de la mañana',
    attractiveness: 'Con mi playlist favorita a todo volumen',
    action: 'Entrenar 30 minutos',
    minimumAction2min: 'Ponerme los tenis y hacer 10 sentadillas',
    reward: 'Una ducha larga y sin afán',
    time: '06:00',
    location: 'Sala',
  },
  {
    id: 'meditar',
    emoji: '🧘',
    label: 'Meditar',
    name: 'Meditar 10 minutos',
    identity: 'Soy una persona serena',
    description: '',
    cue: 'Después de tender la cama',
    attractiveness: 'En mi rincón favorito, con luz suave',
    action: 'Meditar 10 minutos con la respiración',
    minimumAction2min: 'Respirar profundo tres veces',
    reward: 'Notar cómo empiezo el día con calma',
    time: '05:30',
    location: 'Rincón tranquilo',
  },
  {
    id: 'diario',
    emoji: '✍️',
    label: 'Escribir',
    name: 'Escribir mi diario',
    identity: 'Soy una persona que se conoce',
    description: '',
    cue: 'Después de cenar',
    attractiveness: 'Con mi libreta y mi esfero favoritos',
    action: 'Escribir una página sobre mi día',
    minimumAction2min: 'Escribir una frase',
    reward: 'Releer lo que escribí hace una semana',
    time: '20:30',
    location: 'Escritorio',
  },
  {
    id: 'agua',
    emoji: '💧',
    label: 'Hidratarme',
    name: 'Tomar 2 litros de agua',
    identity: 'Soy una persona que cuida su cuerpo',
    description: '',
    cue: 'Después de levantarme',
    attractiveness: 'En mi botella favorita, siempre a la vista',
    action: 'Llenar la botella y terminarla antes de la noche',
    minimumAction2min: 'Tomar un vaso de agua',
    reward: 'Marcar el día y sentirme con energía',
    time: '06:30',
    location: 'Cocina',
  },
  {
    id: 'aprender',
    emoji: '🧠',
    label: 'Aprender',
    name: 'Estudiar inglés 20 minutos',
    identity: 'Soy una persona que aprende cada día',
    description: '',
    cue: 'Después de almorzar',
    attractiveness: 'Con una serie o canción que me guste en inglés',
    action: 'Estudiar 20 minutos',
    minimumAction2min: 'Repasar cinco palabras',
    reward: 'Ver un capítulo sin subtítulos el fin de semana',
    time: '13:00',
    location: 'Escritorio',
  },
];

/** Palabras clave (sin tildes) -> emoji. La primera que aparezca en el nombre gana. */
const EMOJI_KEYWORDS: [string[], string][] = [
  [['leer', 'libro', 'lectura', 'pagina'], '📖'],
  [['correr', 'trotar', 'caminar'], '🏃'],
  [['entren', 'ejercicio', 'gym', 'gimnasio', 'pesas', 'flexion', 'sentadilla', 'deporte', 'mover'], '💪'],
  [['medit', 'respir', 'yoga'], '🧘'],
  [['diario', 'escrib'], '✍️'],
  [['agua', 'hidrat'], '💧'],
  [['despert', 'madrug', '5am', 'dormir', 'sueno'], '🌅'],
  [['ingles', 'idioma', 'estudi', 'aprend', 'curso'], '🧠'],
  [['comer', 'comida', 'fruta', 'verdura', 'dieta', 'sano', 'azucar'], '🥗'],
  [['orar', 'rezar', 'biblia', 'gratitud', 'agradec'], '🙏'],
  [['ahorr', 'dinero', 'gasto', 'finanz'], '💰'],
  [['codigo', 'program', 'golang'], '💻'],
  [['music', 'guitarra', 'piano', 'cantar'], '🎸'],
  [['limpi', 'orden', 'tender', 'cama'], '🧹'],
];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Emoji del habito segun su nombre; un brote cuando no reconoce nada. */
export function habitEmoji(habit: Pick<KaizenHabit, 'name'>): string {
  const name = normalize(habit.name);
  const match = EMOJI_KEYWORDS.find(([keywords]) => keywords.some((keyword) => name.includes(keyword)));
  return match ? match[1] : '🌱';
}

/** Ordena por la hora del habito ("HH:MM" ordena como texto); sin hora, al final. */
export function byHabitTime(a: KaizenHabit, b: KaizenHabit): number {
  if (!a.time && !b.time) return a.name.localeCompare(b.name);
  if (!a.time) return 1;
  if (!b.time) return -1;
  return a.time.localeCompare(b.time);
}
