import { Home } from './pages/Home';
import { Sebas } from './pages/Sebas';
import { AppLayout } from './components/AppLayout';

export default function App() {
  const currentPath = window.location.pathname;

  return (
    <AppLayout currentPath={currentPath}>
      {currentPath === '/sebas' ? <Sebas /> : <Home />}
    </AppLayout>
  );
}
