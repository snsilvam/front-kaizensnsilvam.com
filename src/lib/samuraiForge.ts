// La forja del samurái: las etapas del Winter Arc.
//
// Una katana no sale de un golpe: el acero en bruto se pliega, se templa y se
// pule hasta tener filo. El Winter Arc forja al samurái igual, con cada día en
// que se cumplen todas las Reglas Inquebrantables. Por eso el umbral son los
// días forjados (exitosos) y no la racha: un día cedido al placer no deshace
// el acero ya trabajado.
//
// La última etapa no se alcanza contando días: es la del reto completado.

/** Una etapa de la forja. */
export interface ForgeStage {
  /** Un solo ideograma, para el sello de la etapa. */
  mark: string;
  /** La palabra completa en japonés. */
  kanji: string;
  /** Lectura en romaji. */
  romaji: string;
  /** Nombre de la etapa en español. */
  name: string;
  /** Lo que significa la etapa, dicho en términos del reto. */
  precept: string;
  /** Días forjados que abren la etapa; null en la última, que se alcanza completando el reto. */
  days: number | null;
}

/**
 * Los umbrales siguen la curva del hábito: el primer día, la primera semana,
 * las tres semanas, la mitad del reto y los 66 días que la investigación
 * asocia con un hábito automático (los mismos que usa el camino del Bushidō).
 */
export const FORGE_STAGES: ForgeStage[] = [
  {
    mark: '浪',
    kanji: '浪人',
    romaji: 'Rōnin',
    name: 'Rōnin',
    precept: 'Un guerrero sin código: el cuerpo todavía obedece al placer. Tu primer día forjado lo cambia.',
    days: 0,
  },
  {
    mark: '鋼',
    kanji: '玉鋼',
    romaji: 'Tamahagane',
    name: 'Acero en bruto',
    precept: 'El primer golpe sobre el metal. El placer ya no decide solo.',
    days: 1,
  },
  {
    mark: '鍛',
    kanji: '鍛錬',
    romaji: 'Tanren',
    name: 'Plegado',
    precept: 'Cada día cumplido pliega el acero y le saca una impureza.',
    days: 7,
  },
  {
    mark: '焼',
    kanji: '焼入れ',
    romaji: 'Yakiire',
    name: 'Temple',
    precept: 'El frío del invierno endurece el filo: ya no negocias cada mañana.',
    days: 21,
  },
  {
    mark: '研',
    kanji: '研ぎ',
    romaji: 'Togi',
    name: 'Pulido',
    precept: 'La disciplina ya no se nota: se ve.',
    days: 45,
  },
  {
    mark: '刀',
    kanji: '刀',
    romaji: 'Katana',
    name: 'Filo',
    precept: 'Tus hábitos cortan solos. El cuerpo cumple sin pedir recompensa.',
    days: 66,
  },
  {
    mark: '侍',
    kanji: '侍',
    romaji: 'Samurái',
    name: 'Samurái',
    precept: '90 días. El cuerpo dejó de ser una máquina de placer: ahora es un samurái.',
    days: null,
  },
];

/** En qué punto de la forja va el reto. */
export interface ForgeProgress {
  /** Etapa alcanzada; sin días forjados es Rōnin. */
  current: ForgeStage;
  /** Posición de `current` en FORGE_STAGES. */
  index: number;
  /** Siguiente etapa; null cuando el samurái ya está forjado. */
  next: ForgeStage | null;
  /** Días forjados que faltan para `next`; null si no se mide en días. */
  missing: number | null;
  /** Avance hacia `next`, de 0 a 100; null si no se mide en días. */
  percent: number | null;
}

/**
 * Traduce los días forjados en una etapa de la forja. Un reto completado es
 * siempre un samurái: llegar vivo al día 90 es la prueba.
 */
export function forgeProgress(forgedDays: number, completed: boolean): ForgeProgress {
  const last = FORGE_STAGES.length - 1;
  if (completed) {
    return { current: FORGE_STAGES[last], index: last, next: null, missing: null, percent: 100 };
  }

  let index = 0;
  FORGE_STAGES.forEach((stage, i) => {
    if (stage.days !== null && forgedDays >= stage.days) index = i;
  });

  const current = FORGE_STAGES[index];
  const next = FORGE_STAGES[index + 1] ?? null;
  if (!next || next.days === null) {
    return { current, index, next, missing: null, percent: null };
  }

  const from = current.days ?? 0;
  const percent = Math.round(((forgedDays - from) * 100) / (next.days - from));
  return {
    current,
    index,
    next,
    missing: next.days - forgedDays,
    percent: Math.max(0, Math.min(100, percent)),
  };
}
