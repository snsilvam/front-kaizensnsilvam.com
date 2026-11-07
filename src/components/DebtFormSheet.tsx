import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { DEBT_KIND_LABELS, DEBT_KINDS, OTHER_ENTITY_CODE, parseRate } from '../lib/debts';
import type { Debt, DebtEntity, DebtInput, DebtKind } from '../types/debt';

interface DebtFormSheetProps {
  open: boolean;
  /** Sin deuda es registrar; con deuda es editar (sin el saldo). */
  debt?: Debt;
  entities: DebtEntity[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (input: DebtInput) => void | Promise<void>;
  onDelete?: () => void;
}

const SELECT_CLASS =
  'h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm';

/**
 * Registrar o editar una deuda. Solo pide lo de FR-002: nunca numeros de
 * tarjeta o de cuenta, usuarios ni claves (FR-020).
 */
export function DebtFormSheet({ open, debt, entities, saving, error, onCancel, onSubmit, onDelete }: DebtFormSheetProps) {
  const editing = debt !== undefined;
  const [entityCode, setEntityCode] = useState('');
  const [entityName, setEntityName] = useState('');
  const [kind, setKind] = useState<DebtKind>('credit_card');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minimum, setMinimum] = useState('');
  const [day, setDay] = useState('');
  const [formError, setFormError] = useState('');

  const debtId = debt?.id;
  useEffect(() => {
    if (!open) return;
    setEntityCode(debt?.entityCode ?? '');
    setEntityName(debt?.entityCode === OTHER_ENTITY_CODE ? debt.entityName : '');
    setKind(debt?.kind ?? 'credit_card');
    setName(debt?.name ?? '');
    setBalance('');
    setRate(debt ? String(debt.annualRate).replace('.', ',') : '');
    setMinimum(debt ? debt.minimumPayment.toLocaleString('es-CO') : '');
    setDay(debt ? String(debt.paymentDay) : '');
    setFormError('');
    // Se rellena al abrir o al cambiar de deuda, no en cada render del padre:
    // un `debt` nuevo con el mismo id no debe borrar lo que se esta escribiendo.
  }, [open, debtId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const annualRate = parseRate(rate);
    const minimumPayment = parseMoney(minimum);
    const paymentDay = Number(day);
    const amount = parseMoney(balance);
    if (!entityCode) return setFormError('Elige la entidad.');
    if (entityCode === OTHER_ENTITY_CODE && !entityName.trim()) return setFormError('Escribe el nombre de la entidad.');
    if (!editing && (!Number.isFinite(amount) || amount <= 0)) return setFormError('Escribe cuánto debes hoy.');
    if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100)
      return setFormError('La tasa E.A. va de 0 a 100 %.');
    if (!Number.isFinite(minimumPayment) || minimumPayment <= 0) return setFormError('Escribe la cuota o pago mínimo.');
    if (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31)
      return setFormError('El día de pago va del 1 al 31.');

    void onSubmit({
      entityCode,
      entityName: entityCode === OTHER_ENTITY_CODE ? entityName.trim() : '',
      kind,
      name: name.trim(),
      annualRate,
      minimumPayment,
      paymentDay,
      ...(editing ? {} : { balance: amount }),
    });
  }

  return (
    <MarketSheet
      open={open}
      title={editing ? 'Editar deuda' : 'Registrar deuda'}
      description="Kaizen nunca te pide números de tarjeta, de cuenta ni claves."
      busy={saving}
      onClose={onCancel}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="debt-entity">Entidad</Label>
          <select id="debt-entity" className={SELECT_CLASS} value={entityCode} onChange={(e) => setEntityCode(e.target.value)}>
            <option value="" disabled>
              Elige tu banco o entidad
            </option>
            {entities.map((entity) => (
              <option key={entity.code} value={entity.code}>
                {entity.name}
              </option>
            ))}
            <option value={OTHER_ENTITY_CODE}>Otra entidad</option>
          </select>
        </div>
        {entityCode === OTHER_ENTITY_CODE && (
          <div className="space-y-1.5">
            <Label htmlFor="debt-entity-name">Nombre de la entidad</Label>
            <Input id="debt-entity-name" maxLength={60} value={entityName} onChange={(e) => setEntityName(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="debt-kind">Tipo</Label>
            <select id="debt-kind" className={SELECT_CLASS} value={kind} onChange={(e) => setKind(e.target.value as DebtKind)}>
              {DEBT_KINDS.map((value) => (
                <option key={value} value={value}>
                  {DEBT_KIND_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debt-name">Nombre (opcional)</Label>
            <Input id="debt-name" maxLength={60} placeholder="Visa, carro…" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        {!editing && (
          <div className="space-y-1.5">
            <Label htmlFor="debt-balance">¿Cuánto debes hoy?</Label>
            <MoneyInput id="debt-balance" value={balance} onChange={setBalance} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="debt-rate">Tasa E.A. (%)</Label>
            <Input
              id="debt-rate"
              inputMode="decimal"
              placeholder="28,5"
              value={rate}
              aria-describedby="debt-rate-help"
              onChange={(e) => setRate(e.target.value.replace(/[^\d.,]/g, ''))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debt-day">Día de pago</Label>
            <Input
              id="debt-day"
              inputMode="numeric"
              placeholder="15"
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            />
          </div>
        </div>
        <p id="debt-rate-help" className="-mt-2 text-xs text-muted-foreground">
          Está en tu extracto o en la app del banco como "tasa E.A." (efectiva anual).
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="debt-minimum">Cuota o pago mínimo mensual</Label>
          <MoneyInput id="debt-minimum" value={minimum} onChange={setMinimum} />
        </div>

        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 pt-1 *:h-11 sm:flex-row sm:justify-between">
          {editing && onDelete ? (
            <Button type="button" variant="destructive" disabled={saving} onClick={onDelete}>
              <Trash2 aria-hidden="true" />
              Eliminar
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar deuda'}
          </Button>
        </div>
      </form>
    </MarketSheet>
  );
}
