import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, CircleCheck, ImageUp, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { FeatureUnavailableDialog } from '../components/FeatureUnavailableDialog';
import { InvoiceDetailDialog } from '../components/InvoiceDetailDialog';
import { InvoiceList, issuerLabel } from '../components/InvoiceList';
import { PageHeader } from '../components/PageHeader';
import { useInvoices } from '../hooks/useInvoices';
import { compressInvoiceImage } from '../lib/imageCompression';
import { formatMoney } from '../services/format';
import { captureErrorMessage, captureInvoice, deleteInvoice, isFeatureDisabled } from '../services/invoices';
import type { Invoice } from '../types/invoice';

const CURRENCY = 'COP';

/**
 * Facturas: se capturan con una foto, sin formulario. El backend lee los datos
 * con un modelo de lenguaje y guarda solo esos datos, no la foto.
 */
export function Invoices() {
  const invoices = useInvoices();
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [capturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState('');
  const [captured, setCaptured] = useState<Invoice | null>(null);

  const [selected, setSelected] = useState<Invoice | null>(null);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // El módulo exige users.ia_feature en true. El backend responde 403 en
  // cualquier operación si no: al abrir la página (listado) o, si se apagó
  // mientras estaba abierta, al capturar o borrar.
  const [actionForbidden, setActionForbidden] = useState(false);
  const unavailable = invoices.forbidden || actionForbidden;

  async function capture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpiar el input permite volver a elegir la misma foto tras un error.
    event.target.value = '';
    if (!file) return;

    setCaptureError('');
    setCaptured(null);
    setCapturing(true);
    let previewUrl: string | null = null;

    try {
      const image = await compressInvoiceImage(file);
      previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);

      const invoice = await captureInvoice(image);
      setCaptured(invoice);
      invoices.reload();
    } catch (error) {
      if (isFeatureDisabled(error)) setActionForbidden(true);
      else setCaptureError(captureErrorMessage(error));
    } finally {
      setCapturing(false);
      setPreview(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteInvoice(toDelete.id);
      if (captured?.id === toDelete.id) setCaptured(null);
      setSelected(null);
      setToDelete(null);
      invoices.reload();
    } catch (error) {
      if (isFeatureDisabled(error)) {
        setSelected(null);
        setActionForbidden(true);
      } else {
        setDeleteError(error instanceof Error ? error.message : 'No fue posible eliminar la factura.');
      }
      setToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const count = invoices.data?.length ?? 0;

  if (unavailable) {
    return (
      <section aria-labelledby="invoices-title">
        <PageHeader id="invoices-title" eyebrow="Facturas" title="Tus facturas" />
        <FeatureUnavailableDialog open />
      </section>
    );
  }

  return (
    <section aria-labelledby="invoices-title">
      <PageHeader
        id="invoices-title"
        eyebrow="Facturas"
        title="Tus facturas"
        description="Toma una foto de la factura y Kaizen la lee por ti. Sin formularios: todas tus facturas en un solo lugar."
        actions={
          <>
            <Button type="button" size="lg" disabled={capturing} onClick={() => cameraInput.current?.click()}>
              <Camera aria-hidden="true" />
              Tomar foto
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={capturing}
              onClick={() => fileInput.current?.click()}
            >
              <ImageUp aria-hidden="true" />
              Subir imagen
            </Button>
          </>
        }
      />

      {/* capture="environment" abre la cámara trasera en el celular; el otro
          input deja elegir una foto que ya está en la galería. */}
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={capture} />
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={capture} />

      <div className="mb-6 flex flex-col gap-3" aria-live="polite">
        {capturing && (
          <Card>
            <CardContent className="flex items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Factura que se está leyendo"
                  className="size-16 shrink-0 rounded-lg border border-border/70 object-cover"
                />
              ) : (
                <Skeleton className="size-16 shrink-0 rounded-lg" />
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-primary" />
                  Leyendo tu factura...
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">Puede tardar unos segundos.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {captureError && (
          <Alert variant="destructive">
            <AlertDescription>{captureError}</AlertDescription>
          </Alert>
        )}

        {captured && (
          <Alert variant="success">
            <CircleCheck aria-hidden="true" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              <span>
                Guardamos la factura de {issuerLabel(captured)} por {formatMoney(captured.total, CURRENCY)}.
              </span>
              <Button type="button" size="sm" variant="outline" onClick={() => setSelected(captured)}>
                Revisar
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Guardadas</CardTitle>
          <CardDescription>
            {count === 1 ? '1 factura' : `${count} facturas`}. Toca una para ver el detalle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.loading && !invoices.data ? (
            <div className="space-y-3" aria-busy="true" aria-label="Cargando facturas">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : invoices.error ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-destructive">{invoices.error}</p>
              <Button type="button" variant="outline" size="sm" onClick={invoices.reload}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              {deleteError && <p className="mb-3 text-sm text-destructive">{deleteError}</p>}
              <InvoiceList items={invoices.data ?? []} currency={CURRENCY} onSelect={setSelected} />
            </>
          )}
        </CardContent>
      </Card>

      <InvoiceDetailDialog
        invoice={selected}
        currency={CURRENCY}
        onClose={() => setSelected(null)}
        onDelete={setToDelete}
      />

      <ConfirmDeleteDialog
        open={toDelete !== null}
        itemName={toDelete ? `la factura de ${issuerLabel(toDelete)}` : 'esta factura'}
        itemType="factura"
        isDeleting={isDeleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
