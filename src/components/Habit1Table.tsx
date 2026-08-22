import { formatDate, formatSleepDuration } from '../services/format';
import type { Habit1Record } from '../types/habit1';

interface Habit1TableProps {
  items: Habit1Record[];
}

export function Habit1Table({ items }: Habit1TableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Aún no registras días del hábito.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-3 font-semibold text-muted-foreground">Repetición</th>
            <th className="py-2 pr-3 font-semibold text-muted-foreground">Fecha</th>
            <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">Despertar</th>
            <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">Dormir</th>
            <th className="py-2 pr-3 text-right font-semibold text-muted-foreground">Horas dormidas</th>
            <th className="py-2 pr-3 text-center font-semibold text-muted-foreground">Ritual noche</th>
            <th className="py-2 text-center font-semibold text-muted-foreground">Ritual día</th>
          </tr>
        </thead>
        <tbody>
          {items.map((record) => (
            <tr key={record.id} className="border-b border-border last:border-b-0">
              <td className="py-3 pr-3 font-medium text-foreground">{record.numeroDeRepeticion}</td>
              <td className="py-3 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(record.fecha)}
              </td>
              <td className="py-3 pr-3 text-right whitespace-nowrap text-foreground">{record.horaDespertar}</td>
              <td className="py-3 pr-3 text-right whitespace-nowrap text-foreground">{record.horaDormir}</td>
              <td className="py-3 pr-3 text-right whitespace-nowrap text-foreground">
                {formatSleepDuration(record.horasDormidas)}
              </td>
              <td className="py-3 pr-3 text-center">{record.ritualNoche ? 'Sí' : 'No'}</td>
              <td className="py-3 text-center">{record.ritualDia ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
