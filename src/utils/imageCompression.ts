export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0–1
  mimeType?: string;
}

/**
 * Compress image on the client using canvas.
 * Returns a new File with smaller size (or original if gagal compress).
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    mimeType,
  } = options;

  if (!file.type.startsWith('image/')) return file;

  const imageDataUrl = await readFileAsDataURL(file);
  const img = await loadImage(imageDataUrl);

  const { width, height } = getScaledSize(img.width, img.height, maxWidth, maxHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);

  const targetType = mimeType || (file.type === 'image/png' ? 'image/png' : 'image/jpeg');

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      targetType,
      quality
    );
  });

  if (!blob) return file;

  // Jika hasil compress lebih besar dari file asli, pakai file asli saja
  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], file.name, {
    type: targetType,
    lastModified: Date.now(),
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function getScaledSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  return { width: newWidth, height: newHeight };
}

