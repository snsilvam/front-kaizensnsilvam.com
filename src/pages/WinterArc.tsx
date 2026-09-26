import { Snowflake, Sparkles, Trophy } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { WinterArcAnalytics } from '../components/WinterArcAnalytics';
import { WinterArcGrid } from '../components/WinterArcGrid';
import { WinterArcLayout } from '../components/WinterArcLayout';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useCurrentWinterArc } from '../hooks/useCurrentWinterArc';
import { WINTER_ARC_MAX_CONSECUTIVE_FAILURES, WINTER_ARC_MIN_RULES } from '../types/winterArc';

/**
 * Inicio del modulo Winter Arc: /winter-arc.
 *
 * Abre el reto mas reciente del usuario (GET /api/winter-arc/current). Si
 * llega ?id=<winterArcId> muestra ese reto, para no romper enlaces viejos.
 */
export function WinterArc() {
  const winterArcId = new URLSearchParams(window.location.search).get('id');

  return (
    <WinterArcLayout>
      <div className="grid gap-6">
        <h1 id="winter-arc-title" className="text-3xl font-bold tracking-[-0.04em]">
          Tu Winter Arc
        </h1>

        {winterArcId ? <ActiveArc winterArcId={winterArcId} /> : <CurrentArc />}
      </div>
    </WinterArcLayout>
  );
}

function CurrentArc() {
  const current = useCurrentWinterArc();

  if (current.loading) {
    return <Skeleton className="h-48 w-full rounded-xl" aria-label="Cargando tu Winter Arc" />;
  }

  if (current.error) {
    return <ErrorMessage title="No pudimos cargar tu Winter Arc" message={current.error} onRetry={current.reload} />;
  }

  if (current.notFound || !current.data) return <NoArc />;

  if (current.data.status === 'active') return <ActiveArc winterArcId={current.data.id} />;

  // Reto terminado (perdido o completado): su retrospectiva encabeza, el grid
  // queda debajo como registro y se puede empezar otro.
  return (
    <div className="grid gap-6">
      {current.data.status === 'completed' && (
        <Alert>
          <Trophy aria-hidden="true" />
          <AlertTitle>¡Completaste el Winter Arc!</AlertTitle>
          <AlertDescription>90 días sin dejar que se apagara la llama.</AlertDescription>
        </Alert>
      )}

      <WinterArcAnalytics winterArcId={current.data.id} />

      <Card>
        <CardContent>
          <WinterArcGrid winterArcId={current.data.id} />
        </CardContent>
      </Card>

      <Button type="button" size="lg" className="w-fit" onClick={goToSetup}>
        <Snowflake aria-hidden="true" />
        Comenzar otro Winter Arc
      </Button>
    </div>
  );
}

function ActiveArc({ winterArcId }: { winterArcId: string }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardContent>
          <WinterArcGrid winterArcId={winterArcId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo cumplo hoy?</CardTitle>
          <CardDescription>
            Registra hoy una repetición de cada una de tus Reglas Inquebrantables en Kaizen Habits y vuelve a
            sincronizar el día. Tienes hasta las 23:59.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => { window.location.href = '/habits'; }}>
            <Sparkles aria-hidden="true" />
            Registrar en Hábitos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NoArc() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todavía no has empezado tu Winter Arc</CardTitle>
        <CardDescription>90 días de disciplina, sin excusas.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <ol className="grid list-decimal gap-2 pl-5 text-sm text-muted-foreground">
          <li>Elige al menos {WINTER_ARC_MIN_RULES} hábitos activos: serán tus Reglas Inquebrantables.</li>
          <li>Cada día registra una repetición de todos ellos en Kaizen Habits y sincroniza el día.</li>
          <li>
            Si fallas {WINTER_ARC_MAX_CONSECUTIVE_FAILURES} días seguidos, la llama se apaga y el reto termina.
          </li>
        </ol>
        <Button type="button" size="lg" className="w-fit" onClick={goToSetup}>
          <Snowflake aria-hidden="true" />
          Iniciar un Winter Arc
        </Button>
      </CardContent>
    </Card>
  );
}

function goToSetup() {
  window.location.href = '/winter-arc/setup';
}
