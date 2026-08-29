import { useState } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * Foto del usuario autenticado, con sus iniciales como respaldo.
 *
 * Solo el login con Google entrega foto: con correo y contraseña Firebase no
 * guarda ninguna. Tampoco se puede confiar en que la URL cargue (la de Google
 * caduca y a veces responde 403), asi que un fallo de carga cae en las
 * iniciales igual que si no existiera.
 */
export function UserAvatar() {
  const { user } = useAuth();
  const [failed, setFailed] = useState(false);

  if (!user) return null;

  const name = user.displayName?.trim() || user.email || 'Tu cuenta';
  const photo = failed ? null : user.photoURL;

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        title={name}
        width={36}
        height={36}
        // Google responde 403 a las peticiones que llevan referer de otro sitio.
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="size-9 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }

  return (
    <span
      title={name}
      aria-label={name}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary"
    >
      {initialsOf(name)}
    </span>
  );
}

/** Iniciales de hasta dos palabras; para un correo, la primera letra. */
function initialsOf(name: string): string {
  if (name.includes('@')) return name[0].toUpperCase();

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
