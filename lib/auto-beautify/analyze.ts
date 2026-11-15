import { oklabDistance, oklabToOklch, rgbToOklab, type Oklab, type Oklch } from './color';

export interface PaletteColor {
  lab: Oklab;
  lch: Oklch;
  /** Share of opaque pixels in this cluster, 0–1. */
  weight: number;
}

export interface ImageAnalysis {
  width: number;
  height: number;
  /** width / height of the source image. */
  aspect: number;
  /** Mean OKLab lightness of opaque pixels. */
  meanLightness: number;
  /** Mean colour of the outer border, or null when the border is transparent. */
  edge: Oklab | null;
  /** Clusters sorted by weight, heaviest first. */
  palette: PaletteColor[];
  /**
   * The most characterful colour: chromatic and present, but not necessarily
   * the most common. Null for greyscale images.
   */
  accent: Oklch | null;
  isDark: boolean;
  /** Share of fully/mostly transparent pixels, 0–1. */
  transparency: number;
}

const ALPHA_THRESHOLD = 128;
const CLUSTER_COUNT = 6;
const KMEANS_ITERATIONS = 8;
const EDGE_THICKNESS = 2;
/** Minimum cluster weight and chroma for a colour to count as an accent. */
const ACCENT_MIN_WEIGHT = 0.02;
const ACCENT_MIN_CHROMA = 0.06;
const DARK_THRESHOLD = 0.55;

/**
 * Analyse RGBA pixels (row-major, 4 bytes per pixel). Pure and deterministic:
 * the same pixels always give the same analysis, so results are testable and
 * "shuffle" order is stable across clicks.
 */
export function analyzePixels(
  data: ArrayLike<number>,
  width: number,
  height: number,
): ImageAnalysis {
  const samples: Oklab[] = [];
  const edgeSamples: Oklab[] = [];
  let transparent = 0;
  const total = width * height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < ALPHA_THRESHOLD) {
        transparent++;
        continue;
      }
      const lab = rgbToOklab({ r: data[i], g: data[i + 1], b: data[i + 2] });
      samples.push(lab);
      const onEdge =
        x < EDGE_THICKNESS || y < EDGE_THICKNESS ||
        x >= width - EDGE_THICKNESS || y >= height - EDGE_THICKNESS;
      if (onEdge) edgeSamples.push(lab);
    }
  }

  const aspect = height > 0 ? width / height : 1;
  const transparency = total > 0 ? transparent / total : 1;

  if (samples.length === 0) {
    return {
      width,
      height,
      aspect,
      meanLightness: 1,
      edge: null,
      palette: [],
      accent: null,
      isDark: false,
      transparency,
    };
  }

  const meanLightness = samples.reduce((sum, s) => sum + s.l, 0) / samples.length;
  const edgeTotal = 2 * EDGE_THICKNESS * (width + height);
  // A mostly transparent border (logos, cut-outs) has no meaningful edge colour.
  const edge = edgeSamples.length >= edgeTotal * 0.5 ? mean(edgeSamples) : null;
  const palette = cluster(samples, CLUSTER_COUNT);

  return {
    width,
    height,
    aspect,
    meanLightness,
    edge,
    palette,
    accent: pickAccent(palette),
    isDark: meanLightness < DARK_THRESHOLD,
    transparency,
  };
}

/**
 * Stand-in when pixels can't be read (cross-origin images). Assumes the most
 * common case — a light UI screenshot — so the neutral looks still separate.
 */
export function neutralAnalysis(width = 1600, height = 1200): ImageAnalysis {
  return {
    width,
    height,
    aspect: height > 0 ? width / height : 1,
    meanLightness: 0.9,
    edge: null,
    palette: [],
    accent: null,
    isDark: false,
    transparency: 0,
  };
}

/**
 * Most screenshots are mostly white/grey UI with a small brand colour. Picking
 * the most frequent cluster would return grey every time, so score clusters by
 * chroma weighted by the square root of their presence instead.
 */
export function pickAccent(palette: PaletteColor[]): Oklch | null {
  let best: PaletteColor | null = null;
  let bestScore = 0;
  for (const color of palette) {
    const { l, c } = color.lch;
    if (color.weight < ACCENT_MIN_WEIGHT || c < ACCENT_MIN_CHROMA) continue;
    if (l < 0.2 || l > 0.95) continue;
    const score = c * Math.sqrt(color.weight);
    if (score > bestScore) {
      bestScore = score;
      best = color;
    }
  }
  return best ? best.lch : null;
}

function mean(samples: Oklab[]): Oklab {
  let l = 0;
  let a = 0;
  let b = 0;
  for (const s of samples) {
    l += s.l;
    a += s.a;
    b += s.b;
  }
  return { l: l / samples.length, a: a / samples.length, b: b / samples.length };
}

/** Deterministic k-means in OKLab with max-min (farthest point) seeding. */
function cluster(samples: Oklab[], k: number): PaletteColor[] {
  const centroids: Oklab[] = [mean(samples)];
  const nearest = new Float64Array(samples.length).fill(Infinity);

  while (centroids.length < Math.min(k, samples.length)) {
    const last = centroids[centroids.length - 1];
    let farthest = -1;
    let farthestDist = 0;
    for (let i = 0; i < samples.length; i++) {
      const d = oklabDistance(samples[i], last);
      if (d < nearest[i]) nearest[i] = d;
      if (nearest[i] > farthestDist) {
        farthestDist = nearest[i];
        farthest = i;
      }
    }
    // All remaining samples coincide with an existing centroid.
    if (farthest < 0 || farthestDist < 1e-4) break;
    centroids.push({ ...samples[farthest] });
  }

  const assignment = new Int32Array(samples.length);
  for (let iter = 0; iter < KMEANS_ITERATIONS; iter++) {
    for (let i = 0; i < samples.length; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = oklabDistance(samples[i], centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      assignment[i] = best;
    }

    const sums = centroids.map(() => ({ l: 0, a: 0, b: 0, n: 0 }));
    for (let i = 0; i < samples.length; i++) {
      const sum = sums[assignment[i]];
      sum.l += samples[i].l;
      sum.a += samples[i].a;
      sum.b += samples[i].b;
      sum.n++;
    }
    sums.forEach((sum, c) => {
      if (sum.n > 0) centroids[c] = { l: sum.l / sum.n, a: sum.a / sum.n, b: sum.b / sum.n };
    });
  }

  const counts = new Array<number>(centroids.length).fill(0);
  for (let i = 0; i < samples.length; i++) counts[assignment[i]]++;

  return centroids
    .map((lab, c) => ({ lab, lch: oklabToOklch(lab), weight: counts[c] / samples.length }))
    .filter((color) => color.weight > 0)
    .sort((x, y) => y.weight - x.weight);
}
