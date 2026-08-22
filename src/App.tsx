import { Home } from './pages/Home';
import { RegisterIncome } from './pages/RegisterIncome';
import { RegisterPendingPayment } from './pages/RegisterPendingPayment';
import { RegisterHabit1 } from './pages/RegisterHabit1';
import { Sebas } from './pages/Sebas';
import { AppLayout } from './components/AppLayout';

export default function App() {
  const currentPath = window.location.pathname;

  return (
    <AppLayout currentPath={currentPath}>
      {currentPath === '/sebas' ? <Sebas /> : currentPath === '/ingresos' ? <RegisterIncome /> : currentPath === '/gastos' ? <RegisterPendingPayment /> : currentPath === '/habito-1' ? <RegisterHabit1 /> : <Home />}
    </AppLayout>
  );
}
