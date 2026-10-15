import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, Timer, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';
import { browserTimezone } from '../lib/habitDates';
import { EMPTY_HABIT_DRAFT, HABIT_TEMPLATES, type HabitDraft, type HabitTemplate } from '../lib/habitTemplates';
import { registerKaizenHabit, updateKaizenHabit } from '../services/kaizenHabits';
import type { KaizenHabit } from '../types/kaizenHabit';

/** Los pasos siguen las leyes de Hábitos atómicos, empezando por la identidad. */
const STEPS = [
  {
    tab: 'Hábito',
    law: 'Identidad',
    title: '¿Qué hábito quieres construir?',
    hint: 'Piensa en quién quieres ser, no solo en la meta. Cada repetición es un voto por esa persona.',
  },
  {
    tab: 'Cuándo',
    law: 'Hazlo obvio',
    title: '¿Cuándo y dónde lo harás?',
    hint: 'Átalo a algo que ya haces cada día. Una señal clara vale más que la fuerza de voluntad.',
  },
  {
    tab: 'Acción',
    law: 'Hazlo fácil',
    title: '¿Qué harás exactamente?',
    hint: 'Y para los días difíciles, una versión de 2 minutos: hacer poco es mejor que romper la cadena.',
  },
  {
    tab: 'Disfrute',
    law: 'Hazlo atractivo y satisfactorio',
    title: '¿Cómo lo vas a disfrutar?',
    hint: 'Lo que se disfruta se repite. Es opcional, pero ayuda mucho.',
  },
];

const LAST_STEP = STEPS.length - 1;

interface HabitWizardProps {
  /** Habito a editar; null para crear uno nuevo. */
  existing: KaizenHabit | null;
  /** Plantilla con la que arranca la creacion. */
  template?: HabitTemplate | null;
  onClose: () => void;
  onSaved: (habit: KaizenHabit) => void;
}

function draftOf(source: HabitDraft): HabitDraft {
  return {
    name: source.name,
    description: source.description,
    identity: source.identity,
    cue: source.cue,
    attractiveness: source.attractiveness,
    action: source.action,
    minimumAction2min: source.minimumAction2min,
    reward: source.reward,
    time: source.time,
    location: source.location,
  };
}

/**
 * Crear o editar un habito, paso a paso. Crear guia por los cuatro pasos;
 * editar deja saltar a cualquiera y guardar desde donde estes. Solo el nombre
 * es obligatorio (igual que en el backend): un habito pequeño ya sirve.
 *
 * Es una hoja inferior en movil y un dialogo en escritorio. No se cierra al
 * tocar fuera para no perder lo escrito; si con Escape, la X o Cancelar.
 */
export function HabitWizard({ existing, template = null, onClose, onSaved }: HabitWizardProps) {
  const editing = existing !== null;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<HabitDraft>(() =>
    existing ? draftOf(existing) : template ? draftOf(template) : EMPTY_HABIT_DRAFT,
  );
  const [templateId, setTemplateId] = useState<string | null>(template?.id ?? null);
  const [active, setActive] = useState(existing?.active ?? true);
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hintId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saving, onClose]);

  // Cada paso arranca arriba; si falta el nombre, el foco va al campo.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);
  useEffect(() => {
    if (nameError && step === 0) nameRef.current?.focus();
  }, [nameError, step]);

  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    if (name === 'name') setNameError('');
    setError('');
  }

  function applyTemplate(chosen: HabitTemplate) {
    setDraft(draftOf(chosen));
    setTemplateId(chosen.id);
    setNameError('');
  }

  function nameIsValid(): boolean {
    if (draft.name.trim()) return true;
    setNameError('Ponle un nombre a tu hábito.');
    setStep(0);
    return false;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameIsValid()) return;
    if (!editing && step < LAST_STEP) {
      setStep(step + 1);
      return;
    }
    void save();
  }

  async function save() {
    setSaving(true);
    setError('');

    const trimmed = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()]),
    ) as unknown as HabitDraft;
    // La zona horaria define el dia contable de cada repeticion. Al editar se
    // conserva la del habito: cambiarla movería los dias ya registrados.
    const input = {
      ...trimmed,
      timezone: existing?.timezone ?? browserTimezone(),
      active: editing ? active : true,
    };

    try {
      const saved = existing ? await updateKaizenHabit(existing.id, input) : await registerKaizenHabit(input);
      onSaved(saved);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : editing
            ? 'No fue posible guardar los cambios.'
            : 'No fue posible crear el hábito.',
      );
      setSaving(false);
    }
  }

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-end justify-center bg-foreground/40 backdrop-blur-[2px] fade-in duration-150 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        className="flex max-h-[94dvh] w-full max-w-lg animate-in flex-col rounded-t-3xl border border-border bg-card text-card-foreground shadow-2xl duration-200 slide-in-from-bottom-6 sm:max-h-[90dvh] sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <div className="shrink-0 px-5 pt-3 sm:px-6 sm:pt-5">
          <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">
              {editing ? 'Editar hábito' : `Paso ${step + 1} de ${STEPS.length}`} · {current.law}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="-mt-1.5 -mr-2 text-muted-foreground"
              aria-label="Cerrar"
              disabled={saving}
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <h2 id={titleId} className="text-xl font-bold tracking-tight text-foreground">
            {current.title}
          </h2>
          <p id={hintId} className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {current.hint}
          </p>

          {editing ? (
            <nav aria-label="Secciones del hábito" className="mt-4 flex gap-1 rounded-xl bg-muted p-1">
              {STEPS.map((item, index) => (
                <button
                  key={item.tab}
                  type="button"
                  aria-current={index === step ? 'step' : undefined}
                  onClick={() => setStep(index)}
                  className={cn(
                    'flex-1 rounded-lg px-1 py-1.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    index === step ? 'bg-card text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.tab}
                </button>
              ))}
            </nav>
          ) : (
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span
                  key={item.tab}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                    index <= step ? 'bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit} noValidate>
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            {step === 0 && (
              <div className="grid gap-5">
                {!editing && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Inspírate</p>
                    <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                      {HABIT_TEMPLATES.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            aria-pressed={templateId === item.id}
                            onClick={() => applyTemplate(item)}
                            className={cn(
                              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                              templateId === item.id
                                ? 'border-primary bg-accent text-primary'
                                : 'border-border bg-background text-foreground hover:border-primary/40',
                            )}
                          >
                            <span aria-hidden="true">{item.emoji}</span>
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Field label="Nombre del hábito" htmlFor="habit-name" error={nameError}>
                  <Input
                    ref={nameRef}
                    id="habit-name"
                    name="name"
                    value={draft.name}
                    onChange={update}
                    placeholder="Ej. Leer 10 páginas"
                    aria-invalid={nameError ? true : undefined}
                    aria-describedby={nameError ? 'habit-name-error' : undefined}
                    maxLength={120}
                  />
                </Field>
                <Field
                  label="¿Quién eres cuando lo haces?"
                  htmlFor="habit-identity"
                  hint="Escríbelo en presente, como algo que ya eres."
                >
                  <Input
                    id="habit-identity"
                    name="identity"
                    value={draft.identity}
                    onChange={update}
                    placeholder="Soy una persona que…"
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5">
                <Field label="Tu señal" htmlFor="habit-cue" hint="Algo que ya haces sin pensar y que dispara el hábito.">
                  <Input
                    id="habit-cue"
                    name="cue"
                    value={draft.cue}
                    onChange={update}
                    placeholder="Después de servirme el café…"
                  />
                </Field>
                <div className="grid grid-cols-[minmax(0,8.5rem)_1fr] gap-3">
                  <Field label="Hora" htmlFor="habit-time">
                    <Input id="habit-time" name="time" type="time" value={draft.time} onChange={update} />
                  </Field>
                  <Field label="Lugar" htmlFor="habit-location">
                    <Input
                      id="habit-location"
                      name="location"
                      value={draft.location}
                      onChange={update}
                      placeholder="Ej. Habitación"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5">
                <Field label="La acción" htmlFor="habit-action" hint="Concreta y observable: que sepas cuándo terminaste.">
                  <TextArea
                    id="habit-action"
                    name="action"
                    value={draft.action}
                    onChange={update}
                    placeholder="Ej. Leer 10 páginas de mi libro"
                  />
                </Field>
                <Field
                  label="Versión de 2 minutos"
                  htmlFor="habit-minimum"
                  hint="Lo mínimo que harías incluso en tu peor día. También cuenta para tu racha."
                >
                  <Input
                    id="habit-minimum"
                    name="minimumAction2min"
                    value={draft.minimumAction2min}
                    onChange={update}
                    placeholder="Ej. Leer una página"
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5">
                <Field label="Hazlo atractivo" htmlFor="habit-attractiveness" hint="Júntalo con algo que disfrutes.">
                  <Input
                    id="habit-attractiveness"
                    name="attractiveness"
                    value={draft.attractiveness}
                    onChange={update}
                    placeholder="Ej. Con mi café favorito"
                  />
                </Field>
                <Field label="Tu recompensa" htmlFor="habit-reward" hint="Una pequeña celebración al terminar.">
                  <Input
                    id="habit-reward"
                    name="reward"
                    value={draft.reward}
                    onChange={update}
                    placeholder="Ej. Marcarlo y ver crecer la cadena"
                  />
                </Field>
                <Field label="Notas" htmlFor="habit-description">
                  <TextArea
                    id="habit-description"
                    name="description"
                    value={draft.description}
                    onChange={update}
                    placeholder="Por qué te importa, o lo que quieras recordar"
                  />
                </Field>
                {editing && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3.5 py-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(event) => setActive(event.target.checked)}
                      className="mt-0.5 size-4 accent-primary"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">Hábito activo</span>
                      <span className="block text-xs text-muted-foreground">
                        Si lo pausas, sale de tu día pero conservas su historial.
                      </span>
                    </span>
                  </label>
                )}
                {!editing && <PlanPreview draft={draft} />}
              </div>
            )}

            {error && (
              <p role="alert" className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
            {editing ? (
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
            ) : step === 0 ? (
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} disabled={saving}>
                <ArrowLeft aria-hidden="true" />
                Atrás
              </Button>
            )}

            <Button type="submit" size="lg" disabled={saving}>
              {editing ? (
                <>
                  <Check aria-hidden="true" />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </>
              ) : step < LAST_STEP ? (
                <>
                  Siguiente
                  <ArrowRight aria-hidden="true" />
                </>
              ) : (
                <>
                  <Check aria-hidden="true" />
                  {saving ? 'Creando…' : 'Crear hábito'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Asi queda el habito: la intencion en una frase, como la leeras cada dia. */
function PlanPreview({ draft }: { draft: HabitDraft }) {
  const action = draft.action || draft.name;

  return (
    <div className="rounded-2xl border border-primary/20 bg-accent/60 p-4">
      <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase">Así queda tu plan</p>
      {draft.identity && <p className="mt-2 text-base font-semibold text-foreground">{draft.identity}.</p>}
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
        {draft.cue ? `${draft.cue}, ` : 'Cada día, '}
        voy a <strong>{lowerFirst(action) || 'hacer mi hábito'}</strong>.
      </p>
      {(draft.time || draft.location) && (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {draft.time && (
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              {draft.time}
            </span>
          )}
          {draft.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {draft.location}
            </span>
          )}
        </p>
      )}
      {draft.minimumAction2min && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-primary">
          <Timer aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>
            En un mal día: <strong>{draft.minimumAction2min}</strong>
          </span>
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function TextArea(props: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={2}
      {...props}
      className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
    />
  );
}

function lowerFirst(text: string): string {
  return text ? `${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;
}
