import { Home } from './pages/Home';
import { Sebas } from './pages/Sebas';

function currentPage() {
  if (window.location.pathname === '/sebas') return <Sebas />;
  return <Home />;
}

export default function App() {
  return (
    <main className="app">
      <h1>Kaizen</h1>
      {currentPage()}
    </main>
  );
}
