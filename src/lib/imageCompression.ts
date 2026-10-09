/**
 * Reduce la foto de una factura antes de subirla.
 *
 * Una foto de celular pesa 3-12 MB y tiene más resolución de la que el modelo
 * usa. Reducirla acelera la subida y baja el costo: el modelo cobra la imagen
 * por píxeles.
 *
 * El límite es por área y no solo por el lado largo porque las tirillas de
 * supermercado son muy altas y angostas: con un tope de 1600 px de alto, una
 * tirilla quedaría de 400 px de ancho y el texto sería ilegible.
 */

/** ~2,4 megapíxeles: legible para el modelo y ~2.000 tokens de imagen. */
const MAX_PIXELS = 2_400_000;

/** El lado más largo que el modelo procesa sin volver a reducir la imagen. */
const MAX_SIDE = 2576;

const JPEG_QUALITY = 0.85;

/** El backend rechaza imágenes de más de 10 MB. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function compressInvoiceImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    // from-image respeta la orientación EXIF: la foto vertical no llega acostada.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // El navegador no sabe abrir el formato (p. ej. HEIC fuera de Safari):
    // se sube tal cual y el backend decide si lo acepta.
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error('No pudimos abrir esa imagen. Intenta con una foto JPG o PNG.');
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)), MAX_SIDE / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No pudimos preparar la imagen.'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}
