import { Button } from '../components/ui/button';
import { useAuth } from '../auth/useAuth';

export function Habits() {
  const { signOut } = useAuth();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="text-center">
        <h1 className="text-3xl font-bold">Kaizen Habits</h1>
        <p className="mt-2 text-muted-foreground">Destino local de prueba.</p>
        <Button className="mt-6" onClick={() => { window.location.href = '/'; }}>
          Volver a Kaizen
        </Button>
        <Button variant="ghost" className="mt-6 ml-2" onClick={signOut}>
          Cerrar sesión
        </Button>
      </section>
    </main>
  );
}
