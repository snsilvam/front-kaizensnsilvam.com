import type { ReactNode } from 'react';
import { Swords, Trophy } from 'lucide-react';
import { ErrorMessage } from '../components/ErrorMessage';
import { WinterArcAnalytics } from '../components/WinterArcAnalytics';
import { WinterArcGrid } from '../components/WinterArcGrid';
import { WinterArcSchedule } from '../components/WinterArcSchedule';
import { WinterArcLayout } from '../components/WinterArcLayout';
import { WinterArcBodyStatus, WinterArcManifesto } from '../components/WinterArcManifesto';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useCurrentWinterArc } from '../hooks/useCurrentWinterArc';
import { useWinterArcGrid } from '../hooks/useWinterArcGrid';
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

  if (current.data.status === 'active') {
    return <ActiveArc winterArcId={current.data.id} commitment={current.data.commitment} />;
  }

  // Reto terminado (perdido o completado): su retrospectiva encabeza, el grid
  // queda debajo como registro y se puede volver a la forja.
  return (
    <div className="grid gap-6">
      {current.data.status === 'completed' && (
        <Alert>
          <Trophy aria-hidden="true" />
          <AlertTitle>Completaste el Winter Arc: eres un samurái</AlertTitle>
          <AlertDescription>90 días en los que el placer no mandó. El reto terminó; el código sigue.</AlertDescription>
        </Alert>
      )}

      <Commitment text={current.data.commitment} />

      <WinterArcAnalytics winterArcId={current.data.id} />

      <ArcGridCard winterArcId={current.data.id} />

      <Button type="button" size="lg" className="w-fit" onClick={goToSetup}>
        <Swords aria-hidden="true" />
        Volver a la forja
      </Button>
    </div>
  );
}

/**
 * El reto en curso: lo que toca hoy va primero (la orden del día, en el orden
 * de las horas) y el progreso de los 90 días debajo. Los dos leen el mismo
 * grid, así que al sincronizar se actualizan juntos.
 */
function ActiveArc({ winterArcId, commitment }: { winterArcId: string; commitment?: string }) {
  const grid = useWinterArcGrid(winterArcId);

  return (
    <div className="grid gap-6">
      <WinterArcBodyStatus />

      <Commitment text={commitment} />

      <WinterArcSchedule grid={grid} />

      <Card>
        <CardContent>
          <WinterArcGrid winterArcId={winterArcId} grid={grid} />
        </CardContent>
      </Card>
    </div>
  );
}

/** El grid de un reto terminado, como registro bajo su retrospectiva. */
function ArcGridCard({ winterArcId }: { winterArcId: string }) {
  const grid = useWinterArcGrid(winterArcId);

  return (
    <Card>
      <CardContent>
        <WinterArcGrid winterArcId={winterArcId} grid={grid} />
      </CardContent>
    </Card>
  );
}

/** El propósito que el usuario escribió al iniciar el reto. Los retos anteriores a la pregunta no lo tienen. */
function Commitment({ text }: { text?: string }) {
  if (!text) return null;

  return (
    <figure className="grid gap-1.5 border-l-2 border-[#7cc4e8] pl-4">
      <figcaption className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        Tu compromiso con tu yo de enero
      </figcaption>
      <blockquote className="text-base leading-relaxed whitespace-pre-line">{text}</blockquote>
    </figure>
  );
}

function NoArc() {
  return (
    <div className="grid gap-6">
      <WinterArcManifesto />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-[-0.03em]">El código del Winter Arc</CardTitle>
          <CardDescription>Tres reglas. Sin excepciones.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <ol className="grid gap-4">
            <CodeRule number={1} title="Elige tu código">
              Al menos {WINTER_ARC_MIN_RULES} hábitos activos serán tus Reglas Inquebrantables: lo único que el cuerpo
              obedece durante 90 días.
            </CodeRule>
            <CodeRule number={2} title="Forja cada día">
              Registra en el dojo una repetición de todos ellos y sincroniza el día. Cada día cumplido es acero
              forjado.
            </CodeRule>
            <CodeRule number={3} title="No cedas al placer">
              {WINTER_ARC_MAX_CONSECUTIVE_FAILURES} días seguidos cedidos al placer apagan la llama y el reto termina.
            </CodeRule>
          </ol>
          <Button type="button" size="lg" className="w-full sm:w-fit" onClick={goToSetup}>
            <Swords aria-hidden="true" />
            Activar modo samurái
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CodeRule({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-full bg-[#0b1624] font-mono text-xs font-bold text-[#cfe8f5]"
      >
        {number}
      </span>
      <div className="grid gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </div>
    </li>
  );
}

function goToSetup() {
  window.location.href = '/winter-arc/setup';
}
