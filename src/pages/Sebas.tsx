import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const SEBAS_KEY = import.meta.env.VITE_SEBAS_KEY ?? '';

export function Sebas() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <KeyForm onUnlock={() => setUnlocked(true)} />;

  return <p className="text-lg font-medium">Te amo hermanito♥</p>;
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
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Área privada</CardTitle>
        <CardDescription>Ingresa la clave para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="sebas-key">Clave</Label>
            <Input
              id="sebas-key"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              autoComplete="off"
            />
          </div>
          <Button type="submit">Entrar</Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
