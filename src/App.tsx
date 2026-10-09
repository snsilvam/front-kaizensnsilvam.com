import type { ReactNode } from 'react';
import { Home } from './pages/Home';
import { RegisterIncome } from './pages/RegisterIncome';
import { RegisterPendingPayment } from './pages/RegisterPendingPayment';
import { RegisterHabit1 } from './pages/RegisterHabit1';
import { Sebas } from './pages/Sebas';
import { AppLayout } from './components/AppLayout';
import { Habits } from './pages/Habits';
import { Market } from './pages/Market';
import { WinterArc } from './pages/WinterArc';
import { WinterArcSetup } from './pages/WinterArcSetup';
import { WinterArcNewHabit } from './pages/WinterArcNewHabit';
import { WinterArcGate } from './components/WinterArcGate';
import { SelectApp } from './pages/SelectApp';
import { CHOOSER_PATH, PATH_HOME } from './lib/paths';

export default function App() {
  const currentPath = window.location.pathname;

  if (currentPath === CHOOSER_PATH) return <SelectApp />;
  if (currentPath === '/habits') return <Habits />;
  if (currentPath === '/winter-arc') return <WinterArcGate><WinterArc /></WinterArcGate>;
  if (currentPath === '/winter-arc/setup') return <WinterArcGate><WinterArcSetup /></WinterArcGate>;
  if (currentPath === '/winter-arc/nuevo-habito') return <WinterArcGate><WinterArcNewHabit /></WinterArcGate>;

  const page = layoutPage(currentPath);
  // Una ruta desconocida cae en el indice de la app: el selector de caminos.
  // La raiz ya llega como /caminos (ver main.tsx).
  if (!page) return <SelectApp />;

  return <AppLayout currentPath={currentPath}>{page}</AppLayout>;
}

/** Las paginas que viven dentro de AppLayout: finanzas y el habito 1. */
function layoutPage(path: string): ReactNode | null {
  switch (path) {
    case PATH_HOME.finanzas:
      return <Home />;
    case '/ingresos':
      return <RegisterIncome />;
    case '/gastos':
      return <RegisterPendingPayment />;
    case '/mercado':
      return <Market />;
    case '/habito-1':
      return <RegisterHabit1 />;
    case '/sebas':
      return <Sebas />;
    default:
      return null;
  }
}
