import { useState, type FormEvent } from 'react';

/**
 * OJO: al ser una app de navegador, esta clave queda visible en el bundle.
 * Sirve para reservar la ruta, no como seguridad real.
 */
const SEBAS_KEY = import.meta.env.VITE_SEBAS_KEY ?? '';

export function Sebas() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <KeyForm onUnlock={() => setUnlocked(true)} />;

  return <p>Te amo hermanito♥</p>;
}

function KeyForm({ onUnlock }: { onUnlock: () => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!SEBAS_KEY) {
      setError('Falta configurar VITE_SEBAS_KEY.');
      return;
    }

    if (key !== SEBAS_KEY) {
      setError('Clave incorrecta.');
      return;
    }

    setError('');
    onUnlock();
  }

  return (
    <form className="key-form" onSubmit={submit}>
      <label htmlFor="sebas-key">Clave</label>
      <input
        id="sebas-key"
        type="password"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        autoComplete="off"
      />
      <button type="submit">Entrar</button>
      {error && <p className="state state-error">{error}</p>}
    </form>
  );
}
