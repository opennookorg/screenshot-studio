import { analyzePixels, type ImageAnalysis } from './analyze';

/** ~9k pixels: enough for a stable palette, analysed in a few milliseconds. */
const SAMPLE_EDGE = 96;
const CACHE_LIMIT = 8;

const cache = new Map<string, Promise<ImageAnalysis | null>>();

/**
 * Analyse an image URL in the browser. Resolves to null when the pixels can't
 * be read (e.g. a cross-origin image without CORS headers taints the canvas);
 * callers then fall back to neutral looks rather than failing.
 *
 * Results are cached per URL so shuffling through looks is instant.
 */
export function analyzeImageUrl(src: string): Promise<ImageAnalysis | null> {
  const cached = cache.get(src);
  if (cached) return cached;

  const pending = loadAndAnalyze(src).catch(() => null);
  cache.set(src, pending);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return pending;
}

async function loadAndAnalyze(src: string): Promise<ImageAnalysis | null> {
  const img = new Image();
  // Same-origin blob/data URLs ignore this; remote URLs need it to stay readable.
  if (!src.startsWith('blob:') && !src.startsWith('data:')) img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  img.src = src;
  await img.decode();

  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  if (!naturalW || !naturalH) return null;

  const scale = Math.min(1, SAMPLE_EDGE / Math.max(naturalW, naturalH));
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);

  // Throws SecurityError for tainted canvases; handled by the caller's catch.
  const { data } = ctx.getImageData(0, 0, w, h);
  const analysis = analyzePixels(data, w, h);
  // Report the real aspect ratio, not the rounded thumbnail's.
  return { ...analysis, width: naturalW, height: naturalH, aspect: naturalW / naturalH };
}
