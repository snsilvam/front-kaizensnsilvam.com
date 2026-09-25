interface SuggestionChipsProps {
  options: string[];
  /** Valor actual del campo: la sugerencia que coincide queda marcada. */
  value: string;
  onPick: (value: string) => void;
}

/** Atajos para llenar un campo de texto con los valores mas comunes. */
export function SuggestionChips({ options, value, onPick }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Sugerencias">
      {options.map((option) => {
        const selected = value.trim().toLowerCase() === option.toLowerCase();
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(option)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected
                ? 'border-primary bg-accent text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
