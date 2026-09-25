import { useState, type FormEvent } from 'react';
import { CalendarClock, Eye, EyeOff, Mail, TrendingUp, Wallet, type LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { MIN_PASSWORD_LENGTH, authErrorMessage } from '../auth/firebase';
import KaizenLogo from '../components/KaizenLogo';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type Mode = 'signin' | 'register';

export function Login() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | 'reset' | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setInfo('');
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Escribe tu correo.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setBusy('email');
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setBusy(null);
    }
  }

  async function enterWithGoogle() {
    setError('');
    setInfo('');
    setBusy('google');

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setBusy(null);
    }
  }

  async function recoverPassword() {
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }

    setBusy('reset');
    try {
      await sendPasswordReset(email);
      setInfo(`Te enviamos un correo a ${email.trim()} para restablecer tu contraseña.`);
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setBusy(null);
    }
  }

  const isRegister = mode === 'register';
  const working = busy !== null;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <div className="relative grid place-items-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="absolute -top-32 -right-28 size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-accent blur-3xl" aria-hidden="true" />

      <main className="relative w-full max-w-md" aria-labelledby="login-title">
        <div className="mb-6 flex justify-center lg:hidden">
          <KaizenLogo
            width={64}
            height={64}
            className="size-16 rounded-2xl object-cover shadow-lg shadow-primary/20"
            alt="Pastor, mascota de Kaizen"
          />
        </div>

        <Card className="border-[#dce5d9] py-7 shadow-[0_18px_50px_rgba(31,66,46,0.10)] sm:py-8">
          <CardHeader className="px-6 text-center sm:px-8">
            <p className="mb-2 text-xs font-bold tracking-[0.1em] text-primary uppercase">Bienvenido a Kaizen</p>
            <CardTitle id="login-title" className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
              Bienestar financiero y hábitos
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-sm leading-relaxed">
              {isRegister
                ? 'Crea tu cuenta con correo y contraseña para organizar tus finanzas y construir hábitos.'
                : 'Entra con tu correo o con Google para organizar tus finanzas y seguir construyendo hábitos.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 px-6 sm:px-8">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
              role="tablist"
              aria-label="Modo de acceso"
            >
              <ModeTab
                selected={!isRegister}
                onSelect={() => switchMode('signin')}
                label="Ya tengo cuenta"
              />
              <ModeTab
                selected={isRegister}
                onSelect={() => switchMode('register')}
                label="Crear cuenta"
              />
            </div>

            <form className="mt-5 grid gap-4" onSubmit={submitEmail}>
              {isRegister && (
                <div className="grid gap-2">
                  <Label htmlFor="login-name">Nombre (opcional)</Label>
                  <Input
                    id="login-name"
                    className="h-11"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="¿Cómo te llamamos?"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="login-email">Correo</Label>
                <Input
                  id="login-email"
                  className="h-11"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  // Claves para iOS: teclado de correo, sin mayuscula inicial y
                  // con autocompletado del llavero.
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  {!isRegister && (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0"
                      onClick={recoverPassword}
                      disabled={working}
                    >
                      {busy === 'reset' ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    className="h-11 pr-11"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    spellCheck={false}
                    minLength={MIN_PASSWORD_LENGTH}
                    placeholder={isRegister ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` : 'Tu contraseña'}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" size="lg" className="h-11 w-full" disabled={working}>
                <Mail aria-hidden="true" />
                {busy === 'email'
                  ? isRegister
                    ? 'Creando cuenta...'
                    : 'Entrando...'
                  : isRegister
                    ? 'Crear cuenta'
                    : 'Entrar'}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">o</span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full"
              onClick={enterWithGoogle}
              disabled={working}
            >
              <GoogleIcon />
              {busy === 'google' ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert className="mt-4">
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Una forma simple de tomar mejores decisiones con tu vida.
        </p>
      </main>
      </div>
    </div>
  );
}

/** Lo que Kaizen responde, contado antes de pedir la contraseña. */
const PROMISES: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: Wallet, title: '¿Cuánto puedo gastar hoy?', detail: 'Tu disponible real, ya descontando lo que debes.' },
  { icon: CalendarClock, title: '¿Cuántos días faltan para mi ingreso?', detail: 'Y cuánto te rinde cada uno de esos días.' },
  { icon: TrendingUp, title: '¿Voy bien con mi plan?', detail: 'Una respuesta clara, sin hojas de cálculo.' },
];

function BrandPanel() {
  return (
    <aside className="hero-surface relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
      <div className="flex items-center gap-3">
        <KaizenLogo width={48} height={48} className="size-12 rounded-2xl object-cover ring-1 ring-white/15" alt="" />
        <span className="text-lg font-bold tracking-tight">
          Kaizen <span lang="ja" className="ml-1 font-medium text-hero-foreground/50">改善</span>
        </span>
      </div>

      <div className="max-w-md">
        <h2 className="text-4xl leading-[1.1] font-bold tracking-[-0.04em] xl:text-5xl">
          Tu dinero y tus hábitos, con calma.
        </h2>
        <ul className="mt-10 grid list-none gap-5 p-0">
          {PROMISES.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex gap-4">
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-hero-accent ring-1 ring-white/10">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-0.5 block text-sm text-hero-foreground/65">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-hero-foreground/50">Un poco mejor cada día.</p>
    </aside>
  );
}

function ModeTab({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        selected ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.93 2.93v2.79h3.59c2.1-1.93 3.32-4.78 3.32-7.75Z" />
      <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.59-2.79c-.99.67-2.26 1.07-3.84 1.07-2.55 0-4.71-1.72-5.48-4.03H1.8v2.88A9.72 9.72 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M5.52 13.64A5.84 5.84 0 0 1 5.21 12c0-.57.1-1.12.31-1.64V7.48H1.8A9.72 9.72 0 0 0 1.8 16.52l3.72-2.88Z" />
      <path fill="#EA4335" d="M12 6.33c1.69 0 3.2.58 4.39 1.71l3.29-3.29C16.81 2.07 14.62.25 12 .25A9.72 9.72 0 0 0 1.8 7.48l3.72 2.88C6.29 8.05 8.45 6.33 12 6.33Z" />
    </svg>
  );
}
