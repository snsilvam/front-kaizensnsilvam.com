import { Home } from './pages/Home';
import { RegisterIncome } from './pages/RegisterIncome';
import { RegisterPendingPayment } from './pages/RegisterPendingPayment';
import { Sebas } from './pages/Sebas';
import { AppLayout } from './components/AppLayout';

export default function App() {
  const currentPath = window.location.pathname;

  return (
    <AppLayout currentPath={currentPath}>
      {currentPath === '/sebas' ? <Sebas /> : currentPath === '/ingresos' ? <RegisterIncome /> : currentPath === '/gastos' ? <RegisterPendingPayment /> : <Home />}
    </AppLayout>
  );
}
