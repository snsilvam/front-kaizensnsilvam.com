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

export default function App() {
  const currentPath = window.location.pathname;

  if (currentPath === '/habits') return <Habits />;
  if (currentPath === '/winter-arc') return <WinterArc />;
  if (currentPath === '/winter-arc/setup') return <WinterArcSetup />;

  return (
    <AppLayout currentPath={currentPath}>
      {currentPath === '/sebas' ? <Sebas /> : currentPath === '/ingresos' ? <RegisterIncome /> : currentPath === '/gastos' ? <RegisterPendingPayment /> : currentPath === '/habito-1' ? <RegisterHabit1 /> : currentPath === '/mercado' ? <Market /> : <Home />}
    </AppLayout>
  );
}
