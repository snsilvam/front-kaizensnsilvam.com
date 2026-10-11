/**
 * Los caminos de Kaizen: finanzas, habitos, Winter Arc y sueno. Comparten
 * sesion y backend; cada uno tiene su piel y su pagina de inicio.
 */
export type PathId = 'finanzas' | 'habitos' | 'winter-arc' | 'sleep';

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
  sleep: '/sleep',
};

/** Camino al que pertenece una ruta. Lo que no es de otro camino es finanzas. */
export function pathOf(pathname: string): PathId {
  if (pathname === '/habits' || pathname === '/habito-1') return 'habitos';
  if (pathname.startsWith('/winter-arc')) return 'winter-arc';
  if (pathname === PATH_HOME.sleep) return 'sleep';
  return 'finanzas';
}
