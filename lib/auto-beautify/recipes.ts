import { gradientColors, type GradientKey } from '../constants/gradient-colors';
import type { AspectRatioKey } from '../constants/aspect-ratios';
import type { BackgroundConfig } from '../constants/backgrounds';
import type { ImageShadow, ShadowPreset } from '../store';
import type { ImageAnalysis } from './analyze';
import {
  clamp,
  normalizeHue,
  oklabToOklch,
  oklchToHex,
  parseColor,
  rgbToOklab,
  type Oklab,
  type Oklch,
} from './color';

export type BeautifyRecipe =
  | 'vivid'
  | 'curated'
  | 'duotone'
  | 'pastel'
  | 'midnight'
  | 'complement';

/** The subset of editor state a look writes. Everything else is left alone. */
export interface BeautifyStyle {
  backgroundConfig: BackgroundConfig;
  borderRadius: number;
  imageScale: number;
  imageShadow: ImageShadow;
  shadowPreset: ShadowPreset;
  /** Null keeps the user's current canvas size. */
  aspectRatio: AspectRatioKey | null;
}

export interface BeautifyLook {
  id: BeautifyRecipe;
  name: string;
  style: BeautifyStyle;
}

export interface LookOptions {
  currentAspectRatio: AspectRatioKey;
  hasCustomDimensions: boolean;
}

/** The store's initial canvas size; only this is treated as "not chosen yet". */
export const DEFAULT_ASPECT_RATIO: AspectRatioKey = '4_3';

/**
 * The background must differ from the screenshot's edge by at least this much
 * OKLab lightness, or the screenshot visually melts into it.
 */
export const MIN_EDGE_CONTRAST = 0.15;
const CONTRAST_TARGET = 0.18;

/** Used when an image has no chromatic accent (docs, terminals, greyscale UI). */
const NEUTRAL_ACCENT: Oklch = { l: 0.6, c: 0.14, h: 265 };

const RECIPE_NAMES: Record<BeautifyRecipe, string> = {
  vivid: 'Vivid',
  curated: 'Curated',
  duotone: 'Duotone',
  pastel: 'Pastel',
  midnight: 'Midnight',
  complement: 'Complement',
};

/** Ranked so the first look is the best fit for each kind of screenshot. */
const RANKING: Record<'light' | 'dark', BeautifyRecipe[]> = {
  // Light UIs pop on saturated or deep backgrounds.
  light: ['vivid', 'curated', 'duotone', 'midnight', 'pastel', 'complement'],
  // Dark UIs pop on bright or pale backgrounds; dark-on-dark goes last.
  dark: ['vivid', 'pastel', 'curated', 'duotone', 'complement', 'midnight'],
};

// Mirrors the store's shadow presets so the Shadow panel shows the right one.
const SHADOWS: Record<'soft' | 'strong', ImageShadow> = {
  soft: { enabled: true, blur: 30, offsetX: 0, offsetY: 12, spread: 5, color: 'rgba(0,0,0,0.6)', opacity: 0.5 },
  strong: { enabled: true, blur: 60, offsetX: 0, offsetY: 24, spread: 10, color: 'rgba(0,0,0,0.6)', opacity: 0.8 },
};

interface GradientSpec {
  angle: number;
  stops: Oklch[];
}

/**
 * Generate ranked looks for an analysed image. Pure and deterministic, so the
 * nth click of "Beautify" always produces the same look for the same image.
 */
export function generateLooks(analysis: ImageAnalysis, options: LookOptions): BeautifyLook[] {
  const tone = analysis.isDark ? 'dark' : 'light';
  const accent = analysis.accent ?? NEUTRAL_ACCENT;
  const referenceL = analysis.edge?.l ?? analysis.meanLightness;
  const layout = pickLayout(analysis, options);

  return RANKING[tone].map((recipe) => {
    const background = recipe === 'curated'
      ? curatedBackground(accent, referenceL, tone)
      : gradientBackground(guardContrast(buildGradient(recipe, accent, tone), referenceL));
    const preset: 'soft' | 'strong' = background.lightness < 0.4 ? 'strong' : 'soft';

    return {
      id: recipe,
      name: RECIPE_NAMES[recipe],
      style: {
        backgroundConfig: background.config,
        borderRadius: layout.borderRadius,
        imageScale: layout.imageScale,
        imageShadow: { ...SHADOWS[preset] },
        shadowPreset: preset,
        aspectRatio: layout.aspectRatio,
      },
    };
  });
}

function buildGradient(recipe: Exclude<BeautifyRecipe, 'curated'>, accent: Oklch, tone: 'light' | 'dark'): GradientSpec {
  const h = accent.h;
  const vivid = clamp(Math.max(accent.c, 0.12), 0.12, 0.2);
  const light = tone === 'light';

  switch (recipe) {
    case 'vivid':
      return {
        angle: 135,
        stops: light
          ? [{ l: 0.62, c: vivid, h: h - 20 }, { l: 0.5, c: vivid, h: h + 25 }]
          : [{ l: 0.76, c: vivid, h: h - 20 }, { l: 0.62, c: vivid, h: h + 25 }],
      };
    case 'duotone':
      return {
        angle: 120,
        stops: light
          ? [{ l: 0.68, c: 0.18, h: h - 45 }, { l: 0.57, c: 0.19, h }, { l: 0.48, c: 0.17, h: h + 45 }]
          : [{ l: 0.78, c: 0.16, h: h - 45 }, { l: 0.68, c: 0.17, h }, { l: 0.6, c: 0.16, h: h + 45 }],
      };
    case 'pastel':
      return {
        angle: 160,
        stops: light
          ? [{ l: 0.88, c: 0.07, h: h - 20 }, { l: 0.8, c: 0.08, h: h + 20 }]
          : [{ l: 0.94, c: 0.05, h: h - 20 }, { l: 0.86, c: 0.07, h: h + 20 }],
      };
    case 'midnight':
      return {
        angle: 160,
        stops: [{ l: 0.3, c: 0.07, h }, { l: 0.17, c: 0.04, h: h + 20 }],
      };
    case 'complement':
      // Split-complementary reads as intentional; a straight 180° pair is garish.
      return {
        angle: 135,
        stops: light
          ? [{ l: 0.64, c: 0.14, h }, { l: 0.52, c: 0.14, h: h + 150 }]
          : [{ l: 0.74, c: 0.13, h }, { l: 0.63, c: 0.13, h: h + 150 }],
      };
  }
}

function averageLightness(stops: Oklch[]): number {
  return stops.reduce((sum, stop) => sum + stop.l, 0) / stops.length;
}

/**
 * Shift every stop's lightness away from the screenshot's edge until the
 * background clearly separates from it. Hue and chroma are preserved.
 */
export function guardContrast(spec: GradientSpec, referenceL: number): GradientSpec {
  const bgL = averageLightness(spec.stops);
  if (Math.abs(bgL - referenceL) >= MIN_EDGE_CONTRAST) return spec;

  // Go whichever way has room; a light edge forces a darker background.
  const target = referenceL >= 0.5 ? referenceL - CONTRAST_TARGET : referenceL + CONTRAST_TARGET;
  const shift = target - bgL;
  return {
    ...spec,
    stops: spec.stops.map((stop) => ({ ...stop, l: clamp(stop.l + shift, 0.08, 0.97) })),
  };
}

function gradientBackground(spec: GradientSpec): { config: BackgroundConfig; lightness: number } {
  const last = spec.stops.length - 1;
  const stops = spec.stops
    .map((stop, i) => `${oklchToHex({ ...stop, h: normalizeHue(stop.h) })} ${Math.round((i / last) * 100)}%`)
    .join(', ');
  return {
    config: { type: 'gradient', value: `linear-gradient(${spec.angle}deg, ${stops})`, opacity: 1 },
    lightness: averageLightness(spec.stops),
  };
}

interface CuratedGradient {
  key: GradientKey;
  mean: Oklab;
}

let curatedCache: CuratedGradient[] | null = null;

function curatedGradients(): CuratedGradient[] {
  if (curatedCache) return curatedCache;
  curatedCache = (Object.entries(gradientColors) as [GradientKey, string][])
    .map(([key, css]) => {
      const colors = (css.match(/rgba?\([^)]*\)|#[0-9a-f]{6}\b/gi) ?? [])
        .map(parseColor)
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map(rgbToOklab);
      if (colors.length < 2) return null;
      const n = colors.length;
      const mean = colors.reduce(
        (acc, c) => ({ l: acc.l + c.l / n, a: acc.a + c.a / n, b: acc.b + c.b / n }),
        { l: 0, a: 0, b: 0 },
      );
      return { key, mean };
    })
    .filter((g): g is CuratedGradient => g !== null);
  return curatedCache;
}

/**
 * The hand-made gradient closest to the accent colour that still separates
 * from the screenshot. Always a safe, designer-approved option.
 */
function curatedBackground(
  accent: Oklch,
  referenceL: number,
  tone: 'light' | 'dark',
): { config: BackgroundConfig; lightness: number } {
  const targetL = tone === 'light' ? 0.55 : 0.72;
  const target = { l: targetL, ...abFromLch(accent) };
  let best: CuratedGradient | null = null;
  let bestScore = Infinity;

  for (const gradient of curatedGradients()) {
    if (Math.abs(gradient.mean.l - referenceL) < CONTRAST_TARGET) continue;
    // Hue/chroma match matters more than exact lightness.
    const score = Math.hypot(gradient.mean.a - target.a, gradient.mean.b - target.b)
      + 0.5 * Math.abs(gradient.mean.l - target.l);
    if (score < bestScore) {
      bestScore = score;
      best = gradient;
    }
  }

  if (!best) {
    return gradientBackground(guardContrast(buildGradient('vivid', accent, tone), referenceL));
  }
  return {
    config: { type: 'gradient', value: best.key, opacity: 1 },
    lightness: oklabToOklch(best.mean).l,
  };
}

function abFromLch({ c, h }: Oklch): { a: number; b: number } {
  const rad = (h * Math.PI) / 180;
  return { a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

function pickLayout(analysis: ImageAnalysis, options: LookOptions): {
  borderRadius: number;
  imageScale: number;
  aspectRatio: AspectRatioKey | null;
} {
  const tall = analysis.aspect < 0.75;
  // Cut-outs and logos look oversized at screenshot scale and must not be clipped.
  const cutout = analysis.transparency > 0.2;

  return {
    borderRadius: cutout ? 0 : tall ? 20 : 12,
    imageScale: cutout ? 72 : tall ? 88 : 90,
    aspectRatio: pickAspectRatio(analysis.aspect, options),
  };
}

/**
 * Only reshape the canvas while it's still on the default size, so we never
 * override a size the user picked on purpose.
 */
export function pickAspectRatio(imageAspect: number, options: LookOptions): AspectRatioKey | null {
  if (options.hasCustomDimensions || options.currentAspectRatio !== DEFAULT_ASPECT_RATIO) return null;
  if (imageAspect >= 1.6) return '16_9';
  if (imageAspect < 0.8) return '4_5';
  if (imageAspect < 1.2) return '1_1';
  return null;
}
