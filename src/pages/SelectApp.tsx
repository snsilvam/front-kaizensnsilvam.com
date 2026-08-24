import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../auth/useAuth';

export function SelectApp() {
  const { completeAppSelection } = useAuth();

  function useKaizen() {
    completeAppSelection();
  }

  function useKaizenHabits() {
    completeAppSelection();
    window.location.href = '/habits';
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-8">
      <main className="relative w-full max-w-md" aria-labelledby="select-app-title">
        <Card className="border-[#dce5d9] py-7 shadow-[0_18px_50px_rgba(31,66,46,0.10)]">
          <CardHeader className="px-6 text-center">
            <CardTitle id="select-app-title" className="text-2xl font-bold tracking-[-0.04em]">
              ¿Qué quieres usar?
            </CardTitle>
            <CardDescription className="mt-2">
              Elige una aplicación para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 grid gap-3 px-6">
            <Button type="button" size="lg" className="h-11 w-full" onClick={useKaizen}>
              Kaizen
            </Button>
            <Button type="button" size="lg" variant="outline" className="h-11 w-full" onClick={useKaizenHabits}>
              Kaizen Habits
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
