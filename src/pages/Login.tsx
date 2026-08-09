import { useState } from 'react';
import { useAuth } from '../auth/useAuth';

export function Login() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function enter() {
    setBusy(true);
    setError('');

    try {
      await signIn();
    } catch {
      // Incluye el caso de cerrar el popup: un mensaje unico basta.
      setError('No se pudo iniciar sesion. Intenta de nuevo.');
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <main className="app-content">
        <section className="page-intro" aria-labelledby="login-title">
          <p className="eyebrow">Kaizen</p>
          <h1 id="login-title">Inicia sesion</h1>
          <p>Entra con tu cuenta de Google para ver tu resumen financiero.</p>
        </section>

        <button type="button" onClick={enter} disabled={busy}>
          {busy ? 'Conectando...' : 'Entrar con Google'}
        </button>

        {error && <p className="state state-error">{error}</p>}
      </main>
    </div>
  );
}
