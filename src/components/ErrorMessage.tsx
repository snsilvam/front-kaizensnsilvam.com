import { Alert, AlertAction, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface ErrorMessageProps {
  message: string;
  /** Encabezado del error; por defecto el del resumen financiero. */
  title?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, title = 'No pudimos cargar tu resumen', onRetry }: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
