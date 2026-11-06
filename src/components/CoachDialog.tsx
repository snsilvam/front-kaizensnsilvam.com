import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SendHorizontal, X } from 'lucide-react';
import { Button } from './ui/button';
import { askCoach } from '../services/coach';
import { ApiError } from '../services/api';
import { COACH_MAX_QUESTION, COACH_QUICK_QUESTIONS, splitEmphasis } from '../lib/coach';
import type { CoachTurn } from '../types/coach';

const UNAVAILABLE = 'El coach no responde ahora. Intenta de nuevo en un momento.';

/**
 * Códigos cuyo mensaje del backend ya está en español y se muestra tal cual
 * (contracts/coach.md). Cualquier otro, o un fallo de red, es "no responde".
 */
const FRIENDLY_STATUSES = new Set([400, 429, 503]);

/**
 * El coach de la forja (spec 003): preguntas sobre los hábitos y el reto de
 * hoy, respondidas por un agente que solo lee. Lo abre el sello 侍 de los
 * headers de Hábitos y Winter Arc (CoachButton).
 *
 * La conversación vive solo aquí: se manda con cada pregunta y se pierde al
 * cerrar. Como SleepDialog, es una hoja desde abajo en móvil y un diálogo
 * centrado en escritorio, con la piel del Winter Arc en cualquier camino. Se
 * cierra con Escape, con la X o tocando fuera, salvo mientras espera.
 */
export function CoachDialog({ onClose }: { onClose: () => void }) {
  const [turns, setTurns] = useState<CoachTurn[]>([]);
  const [question, setQuestion] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !waiting) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [waiting, onClose]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [turns, waiting]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || waiting) return;
    setWaiting(true);
    setError('');
    setQuestion(trimmed);
    try {
      const result = await askCoach(trimmed, turns);
      setTurns((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'coach', text: result.answer }]);
      setRemaining(result.remainingToday);
      setQuestion('');
    } catch (err) {
      // Si falla, la pregunta se queda en el campo para reintentar.
      setError(err instanceof ApiError && FRIENDLY_STATUSES.has(err.status) ? err.message : UNAVAILABLE);
    } finally {
      setWaiting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  const showQuickQuestions = turns.length === 0 && COACH_QUICK_QUESTIONS.length > 0;

  return (
    <div
      className="winter-arc-theme fixed inset-0 z-50 flex animate-in items-end justify-center bg-[#0b1624]/45 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !waiting) onClose();
      }}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md animate-in flex-col rounded-t-3xl border border-border bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl duration-200 slide-in-from-bottom-6 sm:rounded-2xl sm:p-6 sm:zoom-in-95 sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-dialog-title"
        aria-describedby="coach-dialog-description"
      >
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />

        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-serif text-xl text-primary-foreground shadow-md"
          >
            侍
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.12em] text-primary uppercase">Coach de la forja</p>
            <h2 id="coach-dialog-title" className="mt-1 text-lg font-semibold text-foreground">
              ¿Qué forjamos hoy?
            </h2>
            <p id="coach-dialog-description" className="mt-0.5 text-sm text-muted-foreground">
              Pregunta por tus hábitos y tu reto. Solo lee: lo que marques lo haces tú.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="-mt-1 -mr-2 text-muted-foreground"
            aria-label="Cerrar"
            disabled={waiting}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-live="polite">
          {showQuickQuestions && (
            <div className="flex flex-wrap gap-2">
              {COACH_QUICK_QUESTIONS.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  disabled={waiting}
                  onClick={() => void ask(quick)}
                  className="rounded-full border border-border bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground transition-colors outline-none hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring disabled:opacity-60"
                >
                  {quick}
                </button>
              ))}
            </div>
          )}

          {turns.length > 0 && (
            <ol className="grid gap-3">
              {turns.map((turn, index) => (
                <li
                  key={index}
                  className={
                    turn.role === 'user'
                      ? 'ml-8 justify-self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground'
                      : 'mr-4 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-[0.95rem] leading-relaxed whitespace-pre-line text-foreground'
                  }
                >
                  {turn.role === 'coach' ? <CoachText text={turn.text} /> : turn.text}
                </li>
              ))}
            </ol>
          )}

          {waiting && (
            <p className="mt-3 animate-pulse text-sm text-muted-foreground" role="status">
              Forjando respuesta…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-3.5 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-3 flex items-end gap-2">
          <label htmlFor="coach-question" className="sr-only">
            Tu pregunta
          </label>
          <textarea
            id="coach-question"
            rows={2}
            maxLength={COACH_MAX_QUESTION}
            value={question}
            disabled={waiting}
            placeholder="Escribe tu pregunta…"
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void ask(question);
              }
            }}
            className="min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-60 sm:text-sm"
          />
          <Button type="submit" size="icon-lg" aria-label="Enviar pregunta" disabled={waiting || !question.trim()}>
            <SendHorizontal aria-hidden="true" />
          </Button>
        </form>

        {remaining !== null && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {remaining === 1 ? 'Te queda 1 pregunta hoy' : `Te quedan ${remaining} preguntas hoy`}
          </p>
        )}
      </div>
    </div>
  );
}

/** Respuesta del coach con su *énfasis* en negrita, sin HTML crudo. */
function CoachText({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((part, index) =>
        part.strong ? (
          <strong key={index} className="font-semibold">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
