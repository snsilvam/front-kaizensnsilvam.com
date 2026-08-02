interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="state state-error">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
