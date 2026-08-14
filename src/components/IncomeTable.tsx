import { Trash2 } from 'lucide-react';
import { formatDate, formatMoney } from '../services/format';
import type { Income } from '../types/income';
import { Button } from './ui/button';

interface IncomeTableProps {
  items: Income[];
  currency: string;
  deletingId?: string | null;
  onDelete?: (incomeId: string) => void;
}

export function IncomeTable({ items, currency, deletingId, onDelete }: IncomeTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no registras ingresos.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-3 font-semibold text-muted-foreground">Nombre</th>
            <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">Monto</th>
            <th className="py-2 text-right font-semibold text-muted-foreground">Fecha</th>
            {onDelete && <th className="w-10 py-2" aria-label="Acciones" />}
          </tr>
        </thead>
        <tbody>
          {items.map((income) => (
            <tr key={income.id} className="border-b border-border last:border-b-0">
              <td className="py-3 pr-3 font-medium text-foreground">{income.name}</td>
              <td className="py-3 pr-3 text-right whitespace-nowrap text-foreground">
                {formatMoney(income.amount, currency)}
              </td>
              <td className="py-3 text-right whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(income.date)}
              </td>
              {onDelete && (
                <td className="py-3 pl-3 text-right">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Eliminar ${income.name}`}
                    title="Eliminar"
                    disabled={deletingId === income.id}
                    onClick={() => onDelete(income.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
