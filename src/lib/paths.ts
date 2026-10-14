/**
 * Los caminos de Kaizen: finanzas, habitos y Winter Arc. Comparten sesion y
 * backend; cada uno tiene su piel y su pagina de inicio. El sueno no es un
 * camino: es el modal del boton 💤 de Habitos y Winter Arc (SleepButton).
 */
export type PathId = 'finanzas' | 'habitos' | 'winter-arc';

/**
 * Donde se eligen los caminos. Es el indice de la app: la raiz y cualquier
 * ruta desconocida llevan aqui. Tambien aparece sola despues de cada login.
 */
export const CHOOSER_PATH = '/caminos';

/** Pagina de inicio de cada camino. */
export const PATH_HOME: Record<PathId, string> = {
  finanzas: '/finanzas',
  habitos: '/habits',
  'winter-arc': '/winter-arc',
};

/** Camino al que pertenece una ruta. Lo que no es de otro camino es finanzas. */
export function pathOf(pathname: string): PathId {
  if (pathname === '/habits' || pathname === '/habito-1') return 'habitos';
  if (pathname.startsWith('/winter-arc')) return 'winter-arc';
  return 'finanzas';
}
