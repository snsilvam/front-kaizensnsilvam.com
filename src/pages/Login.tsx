import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import KaizenLogo from '../components/KaizenLogo';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

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
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="absolute -top-32 -right-28 size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-accent blur-3xl" aria-hidden="true" />

      <main className="relative w-full max-w-md" aria-labelledby="login-title">
        <div className="mb-6 flex justify-center">
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
              Tus finanzas, con calma
            </CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-sm leading-relaxed">
              Ingresa con tu cuenta de Google para consultar tu resumen financiero.
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 px-6 sm:px-8">
            <div className="flex flex-col gap-4">
              <Button type="button" size="lg" className="h-11 w-full" onClick={enter} disabled={busy}>
                <GoogleIcon />
                {busy ? 'Conectando...' : 'Continuar con Google'}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Una forma simple de tomar mejores decisiones con tu dinero.
        </p>
      </main>
    </div>
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
