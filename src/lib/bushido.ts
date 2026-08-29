// Las siete virtudes del Bushido, el codigo de los samurais, tal como las
// enumero Nitobe Inazo en "Bushido: el alma de Japon" (1900).
//
// Son las etapas del camino del habito: no se compran ni se declaran, se
// alcanzan repitiendo. Por eso el umbral es el total de repeticiones y no la
// racha: el camino recorrido no se pierde por un dia malo.

/** Una virtud del Bushido convertida en etapa del habito. */
export interface BushidoVirtue {
  /** Kanji de la virtud. */
  kanji: string;
  /** Lectura en romaji. */
  romaji: string;
  /** Nombre de la virtud en espanol. */
  name: string;
  /** El precepto, dicho en terminos del habito diario. */
  precept: string;
  /** Repeticiones totales que abren esta etapa. */
  repetitions: number;
}

/**
 * Los umbrales suben como sube la constancia: la primera repeticion, la
 * primera semana, las tres semanas, el mes largo, los 66 dias que la
 * investigacion asocia con un habito automatico, el centenar y los doscientos.
 */
export const BUSHIDO_VIRTUES: BushidoVirtue[] = [
  {
    kanji: '義',
    romaji: 'Gi',
    name: 'Rectitud',
    precept: 'Decide lo correcto antes de que llegue el momento de hacerlo.',
    repetitions: 1,
  },
  {
    kanji: '勇',
    romaji: 'Yū',
    name: 'Coraje',
    precept: 'El coraje no es que se vuelva fácil, es empezar igual.',
    repetitions: 7,
  },
  {
    kanji: '仁',
    romaji: 'Jin',
    name: 'Compasión',
    precept: 'Sé firme con el hábito y amable contigo.',
    repetitions: 21,
  },
  {
    kanji: '礼',
    romaji: 'Rei',
    name: 'Respeto',
    precept: 'Honra el ritual: la misma hora, el mismo lugar.',
    repetitions: 40,
  },
  {
    kanji: '誠',
    romaji: 'Makoto',
    name: 'Sinceridad',
    precept: 'Lo que registras es lo que de verdad hiciste.',
    repetitions: 66,
  },
  {
    kanji: '名誉',
    romaji: 'Meiyo',
    name: 'Honor',
    precept: 'El honor es lo que haces cuando nadie lleva la cuenta.',
    repetitions: 100,
  },
  {
    kanji: '忠義',
    romaji: 'Chūgi',
    name: 'Lealtad',
    precept: 'Lealtad a la persona que estás construyendo.',
    repetitions: 200,
  },
];

/** En que punto del camino esta el habito. */
export interface BushidoProgress {
  /** Virtud alcanzada; null cuando todavia no hay ninguna repeticion. */
  current: BushidoVirtue | null;
  /** Siguiente virtud; null cuando ya se recorrio el camino completo. */
  next: BushidoVirtue | null;
  /** Repeticiones que faltan para la siguiente virtud. */
  missing: number;
  /** Avance hacia la siguiente virtud, de 0 a 100. */
  percent: number;
}

/**
 * Traduce las repeticiones totales en una etapa del camino.
 *
 * Sin repeticiones no hay virtud alcanzada: el camino se empieza andando, y el
 * avance se mide contra la primera.
 */
export function bushidoProgress(totalRepetitions: number): BushidoProgress {
  const reached = BUSHIDO_VIRTUES.filter((virtue) => totalRepetitions >= virtue.repetitions);
  const current = reached[reached.length - 1] ?? null;
  const next = BUSHIDO_VIRTUES[reached.length] ?? null;

  if (!next) {
    return { current, next: null, missing: 0, percent: 100 };
  }

  const from = current?.repetitions ?? 0;
  const advanced = totalRepetitions - from;
  const span = next.repetitions - from;

  return {
    current,
    next,
    missing: next.repetitions - totalRepetitions,
    percent: Math.max(0, Math.min(100, Math.round((advanced * 100) / span))),
  };
}
