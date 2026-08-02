import { Skeleton } from './ui/skeleton';

export function Loading() {
  return (
    <div className="space-y-9" aria-busy="true" aria-label="Cargando resumen financiero">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-34 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
