/**
 * Minimal OKLab / OKLCH colour math for auto-beautify.
 *
 * OKLab is perceptually uniform, so distances, lightness thresholds and hue
 * rotations behave the way a designer expects — unlike HSL, where "50%
 * lightness" yellow and blue look wildly different.
 */

export interface Rgb {
  r: number; // 0–255
  g: number;
  b: number;
}

export interface Oklab {
  l: number; // 0–1
  a: number;
  b: number;
}

export interface Oklch {
  l: number; // 0–1
  c: number; // 0 – ~0.37
  h: number; // degrees 0–360
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const c = channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
  return c * 255;
}

export function rgbToOklab({ r, g, b }: Rgb): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** Linear-light RGB (unclamped, 0–1) so callers can test gamut membership. */
function oklabToLinearRgb({ l, a, b }: Oklab): [number, number, number] {
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

export function oklabToOklch({ l, a, b }: Oklab): Oklch {
  const c = Math.sqrt(a * a + b * b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l, c, h: h < 0 ? h + 360 : h };
}

export function oklchToOklab({ l, c, h }: Oklch): Oklab {
  const rad = (h * Math.PI) / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

const GAMUT_EPSILON = 0.0005;

function inGamut(linear: [number, number, number]): boolean {
  return linear.every((v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON);
}

/**
 * Convert OKLCH to sRGB, reducing chroma (never lightness or hue) until the
 * colour fits. This keeps the intended brightness and hue family intact.
 */
export function oklchToRgb(color: Oklch): Rgb {
  const target = { ...color, l: clamp(color.l, 0, 1), c: Math.max(0, color.c) };
  let linear = oklabToLinearRgb(oklchToOklab(target));

  if (!inGamut(linear)) {
    // Binary search the largest in-gamut chroma.
    let lo = 0;
    let hi = target.c;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToLinearRgb(oklchToOklab({ ...target, c: mid })))) lo = mid;
      else hi = mid;
    }
    linear = oklabToLinearRgb(oklchToOklab({ ...target, c: lo }));
  }

  const [r, g, b] = linear.map((v) => Math.round(clamp(linearToSrgb(clamp(v, 0, 1)), 0, 255)));
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function oklchToHex(color: Oklch): string {
  return rgbToHex(oklchToRgb(color));
}

/** Parse `#rrggbb`, `#rgb` or `rgb(r, g, b)` — the formats our gradient constants use. */
export function parseColor(value: string): Rgb | null {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3
      ? hex[1].split('').map((d) => d + d).join('')
      : hex[1];
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
    };
  }
  const rgb = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  return null;
}

export function oklabDistance(x: Oklab, y: Oklab): number {
  return Math.sqrt((x.l - y.l) ** 2 + (x.a - y.a) ** 2 + (x.b - y.b) ** 2);
}

export function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
