import { useState } from 'react';

interface DateTimePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function dateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayValue(value: string): string {
  if (!value) return 'Selecciona fecha y hora';

  const [date, time = '00:00'] = value.split('T');
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} · ${time}`;
}

export function DateTimePicker({ id, value, onChange }: DateTimePickerProps) {
  const selectedDate = value ? new Date(`${value}:00`) : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : new Date(),
  );

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const selectedDay = selectedDate && !Number.isNaN(selectedDate.getTime()) ? dateValue(selectedDate) : '';
  const currentTime = value.split('T')[1] ?? '00:00';

  function selectDay(day: number) {
    const selected = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    onChange(`${dateValue(selected)}T${currentTime}`);
  }

  function updateTime(time: string) {
    const selected = selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : new Date();
    onChange(`${dateValue(selected)}T${time}`);
  }

  function selectToday() {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVisibleMonth(now);
    onChange(`${dateValue(now)}T${time}`);
  }

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {displayValue(value)}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-80 rounded-lg border border-border bg-popover p-3 shadow-lg" role="dialog" aria-label="Seleccionar fecha límite">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-md px-2 py-1 text-primary hover:bg-accent"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <span className="text-sm font-semibold capitalize">
              {visibleMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-md px-2 py-1 text-primary hover:bg-accent"
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekdays.map((day) => <span key={day} className="py-1 text-muted-foreground">{day}</span>)}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dayValue = dateValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
              const isSelected = dayValue === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`rounded-md py-1.5 transition-colors hover:bg-accent ${isSelected ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary' : 'text-foreground'}`}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button type="button" onClick={selectToday} className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-accent">
              Hoy
            </button>
            <label htmlFor={`${id}-time`} className="text-sm font-medium">Hora</label>
            <input
              id={`${id}-time`}
              type="time"
              value={currentTime}
              onChange={(event) => updateTime(event.target.value)}
              className="rounded-md border border-input px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-md bg-primary px-2 py-1 text-sm font-medium text-primary-foreground">
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
