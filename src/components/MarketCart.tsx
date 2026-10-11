import { useState } from 'react';
import { ArrowLeft, Check, Lock, Pencil, PartyPopper } from 'lucide-react';
import { Alert, AlertAction, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { ConfirmPaymentDialog } from './ConfirmPaymentDialog';
import { ErrorMessage } from './ErrorMessage';
import { MarketBudgetBar } from './MarketBudgetBar';
import { MarketItemRow } from './MarketItemRow';
import { MarketItemSheet } from './MarketItemSheet';
import { MarketListDialog } from './MarketListDialog';
import { MarketPurchaseSheet } from './MarketPurchaseSheet';
import { MarketQuickAdd } from './MarketQuickAdd';
import { formatShortDate } from '../services/format';
import { deleteMarketList } from '../services/market';
import { markPendingPaymentAsPaid, type PaymentMethod } from '../services/pendingPayments';
import { useMarket } from '../hooks/useMarket';
import { PATH_HOME } from '../lib/paths';
import type { MarketItem, MarketItemInput, MarketListInput, MarketPurchaseInput } from '../types/market';

const MARKET_HOME = '/mercado';

/** "Mercado quincena y sus 12 productos": lo que se pierde al borrar. */
function listDeletionName(name: string, itemsCount: number): string {
  if (itemsCount === 0) return name;
  return itemsCount === 1 ? `${name} y su producto` : `${name} y sus ${itemsCount} productos`;
}

interface MarketCartProps {
  budgetId: string;
}

/**
 * Pantalla de una lista de mercado: el presupuesto pegado arriba, agregar en
 * una linea, y la lista partida en lo que falta y lo que ya esta en el carro.
 * Esta pensada para usarse con una mano mientras se recorre el supermercado.
 */
export function MarketCart({ budgetId }: MarketCartProps) {
  const {
    summary,
    loading,
    error,
    actionError,
    clearActionError,
    busy,
    reload,
    addItem,
    updateItem,
    markPurchased,
    markPending,
    removeItem,
    updateList,
  } = useMarket(budgetId);

  const [purchasing, setPurchasing] = useState<MarketItem | null>(null);
  const [editing, setEditing] = useState<MarketItem | null>(null);
  const [removing, setRemoving] = useState<MarketItem | null>(null);
  const [editingList, setEditingList] = useState(false);
  const [confirmingDeleteList, setConfirmingDeleteList] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [deleteListError, setDeleteListError] = useState<string | null>(null);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const overlayOpen =
    purchasing !== null ||
    editing !== null ||
    removing !== null ||
    editingList ||
    confirmingDeleteList ||
    confirmingClose;

  function open(action: () => void) {
    clearActionError();
    action();
  }

  /** Comprado vuelve a la lista de un toque; pendiente pide el precio real. */
  function toggle(item: MarketItem) {
    if (item.purchased) {
      void markPending(item.id);
      return;
    }
    open(() => setPurchasing(item));
  }

  async function confirmPurchase(input: MarketPurchaseInput) {
    if (purchasing && (await markPurchased(purchasing.id, input))) setPurchasing(null);
  }

  async function saveItem(input: MarketItemInput) {
    if (editing && (await updateItem(editing.id, input))) setEditing(null);
  }

  async function confirmRemove() {
    if (removing && (await removeItem(removing.id))) setRemoving(null);
  }

  async function saveList(input: MarketListInput) {
    if (await updateList(input)) setEditingList(false);
  }

  async function deleteList() {
    setDeletingList(true);
    setDeleteListError(null);

    try {
      await deleteMarketList(budgetId);
      window.location.href = MARKET_HOME;
    } catch (requestError) {
      setDeleteListError(
        requestError instanceof Error ? requestError.message : 'No pudimos eliminar la lista.',
      );
      setDeletingList(false);
      setConfirmingDeleteList(false);
    }
  }

  /**
   * Cerrar la compra es marcar el gasto pendiente como pagado: el modulo no
   * inventa un estado propio y el dashboard no cuenta la plata dos veces.
   */
  async function close(paymentMethod: PaymentMethod) {
    setClosing(true);
    setCloseError(null);

    try {
      await markPendingPaymentAsPaid(budgetId, paymentMethod);
      window.location.href = PATH_HOME.finanzas;
    } catch (requestError) {
      setCloseError(
        requestError instanceof Error ? requestError.message : 'No fue posible cerrar la compra.',
      );
      setClosing(false);
      setConfirmingClose(false);
    }
  }

  const backButton = (
    <Button
      type="button"
      variant="ghost"
      className="mb-3 -ml-2 h-11 gap-1.5 text-muted-foreground"
      onClick={() => {
        window.location.href = MARKET_HOME;
      }}
    >
      <ArrowLeft aria-hidden="true" />
      Mis listas
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando tu lista">
        <Skeleton className="h-9 w-2/3 rounded-lg" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <>
        {backButton}
        <ErrorMessage title="No pudimos cargar tu lista" message={error} onRetry={reload} />
      </>
    );
  }

  if (!summary) return null;

  const closed = summary.closed;
  const pending = summary.items.filter((item) => !item.purchased);
  const inCart = summary.items.filter((item) => item.purchased);
  const withoutEstimate = pending.filter((item) => item.estimatedUnitPrice === 0).length;
  const rowsDisabled = closed || busy !== null;

  function renderRows(items: MarketItem[]) {
    return (
      <ul className="m-0 list-none divide-y divide-border/70 p-0">
        {items.map((item) => (
          <MarketItemRow
            key={item.id}
            item={item}
            busy={busy === item.id}
            disabled={rowsDisabled}
            onToggle={() => toggle(item)}
            onEdit={() => open(() => setEditing(item))}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      {backButton}

      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            id="market-title"
            className="font-heading text-2xl font-bold tracking-[-0.04em] break-words text-foreground sm:text-3xl"
          >
            {summary.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mercado del {formatShortDate(summary.dueDate)}
          </p>
        </div>
        {!closed && (
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 gap-1.5"
            onClick={() => open(() => setEditingList(true))}
          >
            <Pencil aria-hidden="true" />
            <span className="max-[359px]:sr-only">Editar</span>
          </Button>
        )}
      </header>

      <MarketBudgetBar summary={summary} />

      {/* Con todo en verde la etiqueta "Vas bien" ya lo dice; el mensaje se
          muestra cuando hay algo que advertir, para no gastar pantalla. */}
      {(summary.status !== 'ok' || summary.projectedStatus !== 'ok') && (
        <p
          className={`mt-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            summary.status === 'exceeded' || summary.projectedStatus === 'exceeded'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-warning-soft text-warning'
          }`}
          role="status"
        >
          {summary.message}
        </p>
      )}

      {closed && (
        <Alert className="mt-4">
          <Lock aria-hidden="true" />
          <AlertDescription>Esta compra ya se cerró. Puedes revisarla, pero no cambiarla.</AlertDescription>
        </Alert>
      )}

      {(deleteListError || closeError) && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{deleteListError || closeError}</AlertDescription>
        </Alert>
      )}

      {!closed && (
        <div className="mt-4">
          <MarketQuickAdd adding={busy === 'new-item'} onAdd={addItem} />
        </div>
      )}

      {summary.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed px-5 py-10 text-center">
          <p className="font-semibold text-foreground">Tu lista está vacía</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Agrega lo que necesitas. Con el precio estimado sabrás si te alcanza antes de salir.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-6" aria-labelledby="market-pending-title">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h2
                id="market-pending-title"
                className="text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
              >
                Por comprar · {pending.length}
              </h2>
              {withoutEstimate > 0 && (
                <span className="text-xs text-muted-foreground">
                  {withoutEstimate === 1 ? '1 sin precio' : `${withoutEstimate} sin precio`}
                </span>
              )}
            </div>
            {pending.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-medium text-success">
                <PartyPopper aria-hidden="true" className="size-4 shrink-0" />
                Todo está en el carro.
              </p>
            ) : (
              renderRows(pending)
            )}
          </section>

          {inCart.length > 0 && (
            <section className="mt-6" aria-labelledby="market-cart-title">
              <h2
                id="market-cart-title"
                className="mb-1 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase"
              >
                En el carro · {inCart.length}
              </h2>
              {renderRows(inCart)}
            </section>
          )}
        </>
      )}

      {!closed && summary.items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full sm:w-auto"
            disabled={closing}
            onClick={() => open(() => setConfirmingClose(true))}
          >
            <Check aria-hidden="true" />
            Terminar compra
          </Button>
        </div>
      )}

      {actionError && !overlayOpen && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md md:bottom-6" role="alert">
          <Alert variant="destructive" className="bg-card shadow-lg">
            <AlertDescription>{actionError}</AlertDescription>
            <AlertAction>
              <Button type="button" variant="outline" size="sm" onClick={clearActionError}>
                Cerrar
              </Button>
            </AlertAction>
          </Alert>
        </div>
      )}

      <MarketPurchaseSheet
        item={purchasing}
        saving={purchasing !== null && busy === purchasing.id}
        error={purchasing ? actionError : null}
        onCancel={() => setPurchasing(null)}
        onConfirm={confirmPurchase}
      />

      <MarketItemSheet
        item={editing}
        saving={editing !== null && busy === editing.id}
        error={editing ? actionError : null}
        onCancel={() => setEditing(null)}
        onSave={saveItem}
        onDelete={() => {
          setRemoving(editing);
          setEditing(null);
        }}
      />

      <ConfirmDeleteDialog
        open={removing !== null}
        itemName={removing?.name ?? 'este producto'}
        itemType="producto"
        isDeleting={removing !== null && busy === removing.id}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />

      <MarketListDialog
        open={editingList}
        initial={{ name: summary.name, budget: summary.budget, dueDate: summary.dueDate }}
        saving={busy === 'list'}
        error={editingList ? actionError : null}
        onCancel={() => setEditingList(false)}
        onSubmit={saveList}
        onDelete={() => {
          setEditingList(false);
          setConfirmingDeleteList(true);
        }}
      />

      <ConfirmDeleteDialog
        open={confirmingDeleteList}
        itemName={listDeletionName(summary.name, summary.itemsCount)}
        itemType="lista"
        isDeleting={deletingList}
        onCancel={() => setConfirmingDeleteList(false)}
        onConfirm={deleteList}
      />

      <ConfirmPaymentDialog
        open={confirmingClose}
        itemName={summary.name}
        isPaying={closing}
        onCancel={() => setConfirmingClose(false)}
        onConfirm={close}
      />
    </>
  );
}
