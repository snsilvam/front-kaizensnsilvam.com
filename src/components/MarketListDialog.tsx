import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MarketSheet } from './MarketSheet';
import { MoneyInput, parseMoney } from './MoneyInput';
import { dateInputToIso, toDateInputValue } from '../lib/marketList';
import type { MarketListInput } from '../types/market';

interface MarketListDialogProps {
  open: boolean;
  /** Sin lista es crear; con lista es editar sus datos. */
  initial?: MarketListInput;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (input: MarketListInput) => void | Promise<void>;
  /** Solo al editar: abre la confirmacion de borrar la lista. */
  onDelete?: () => void;
}

/**
 * Nombre, presupuesto y dia de mercado: lo minimo para empezar una lista.
 * La fecha arranca en hoy, que es lo comun cuando uno ya va camino al
 * supermercado.
 */
export function MarketListDialog({
  open,
  initial,
  saving,
  error,
  onCancel,
  onSubmit,
  onDelete,
}: MarketListDialogProps) {
  const editing = initial !== undefined;
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState('');
  const [formError, setFormError] = useState('');

  // Se rellena al abrir, y con los valores y no con el objeto: un `initial`
  // nuevo en cada render del padre no debe borrar lo que se esta escribiendo.
  const initialName = initial?.name;
  const initialBudget = initial?.budget;
  const initialDueDate = initial?.dueDate;
  useEffect(() => {
    if (!open) return;
    setName(initialName ?? '');
    setBudget(initialBudget ? initialBudget.toLocaleString('es-CO') : '');
    setDate(toDateInputValue(initialDueDate));
    setFormError('');
  }, [open, initialName, initialBudget, initialDueDate]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const amount = parseMoney(budget);
    const dueDate = dateInputToIso(date);
    if (!name.trim()) {
      setFormError('Ponle un nombre a la lista.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('El presupuesto debe ser mayor que cero.');
      return;
    }
    if (!dueDate) {
      setFormError('Elige el día en que vas a hacer mercado.');
      return;
    }

    void onSubmit({ name: name.trim(), budget: amount, dueDate });
  }

  return (
    <MarketSheet
      open={open}
      title={editing ? 'Editar lista' : 'Nueva lista de mercado'}
      description={
        editing
          ? 'Cambia el nombre, el presupuesto o el día.'
          : 'Define cuánto vas a gastar. Quedará como un gasto pendiente en tus finanzas.'
      }
      busy={saving}
      onClose={onCancel}
    >
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <div className="grid gap-2">
          <Label htmlFor="market-list-name">Nombre</Label>
          <Input
            id="market-list-name"
            className="h-11"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Mercado de la quincena"
            autoComplete="off"
            enterKeyHint="next"
            autoFocus={!editing}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="market-list-budget">Presupuesto</Label>
          <MoneyInput id="market-list-budget" size="lg" value={budget} onChange={setBudget} placeholder="300.000" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="market-list-date">Día de mercado</Label>
          <Input
            id="market-list-date"
            type="date"
            className="h-11"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        {(formError || error) && (
          <Alert variant="destructive">
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-1 flex flex-col-reverse gap-2 *:h-11 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear lista'}
          </Button>
        </div>

        {editing && onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={saving}
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
            Eliminar lista
          </Button>
        )}
      </form>
    </MarketSheet>
  );
}
