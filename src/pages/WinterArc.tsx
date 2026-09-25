import { WinterArcGrid } from '../components/WinterArcGrid';
import { Button } from '../components/ui/button';

/** Vista principal del Winter Arc: /winter-arc?id=<winterArcId>. */
export function WinterArc() {
  const winterArcId = new URLSearchParams(window.location.search).get('id');

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <main className="grid w-full max-w-md gap-6" aria-labelledby="winter-arc-title">
        <h1 id="winter-arc-title" className="text-2xl font-bold tracking-[-0.04em]">
          Winter Arc
        </h1>

        {winterArcId ? (
          <WinterArcGrid winterArcId={winterArcId} />
        ) : (
          <div className="grid gap-3 text-sm text-muted-foreground">
            <p>No hay un Winter Arc seleccionado.</p>
            <Button type="button" variant="outline" className="w-fit" onClick={() => { window.location.href = '/winter-arc/setup'; }}>
              Iniciar un Winter Arc
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
