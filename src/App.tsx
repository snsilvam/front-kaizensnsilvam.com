import { Home } from './pages/Home';
import { RegisterIncome } from './pages/RegisterIncome';
import { RegisterPendingPayment } from './pages/RegisterPendingPayment';
import { RegisterHabit1 } from './pages/RegisterHabit1';
import { Sebas } from './pages/Sebas';
import { AppLayout } from './components/AppLayout';
import { Habits } from './pages/Habits';
import { Market } from './pages/Market';
import { Invoices } from './pages/Invoices';
import { WinterArc } from './pages/WinterArc';
import { WinterArcSetup } from './pages/WinterArcSetup';
import { WinterArcGate } from './components/WinterArcGate';
import { SelectApp } from './pages/SelectApp';
import { CHOOSER_PATH } from './lib/paths';

export default function App() {
  const currentPath = window.location.pathname;

  if (currentPath === CHOOSER_PATH) return <SelectApp />;
  if (currentPath === '/habits') return <Habits />;
  if (currentPath === '/winter-arc') return <WinterArcGate><WinterArc /></WinterArcGate>;
  if (currentPath === '/winter-arc/setup') return <WinterArcGate><WinterArcSetup /></WinterArcGate>;

  return (
    <AppLayout currentPath={currentPath}>
      {currentPath === '/sebas' ? <Sebas /> : currentPath === '/ingresos' ? <RegisterIncome /> : currentPath === '/gastos' ? <RegisterPendingPayment /> : currentPath === '/habito-1' ? <RegisterHabit1 /> : currentPath === '/mercado' ? <Market /> : currentPath === '/facturas' ? <Invoices /> : <Home />}
    </AppLayout>
  );
}
