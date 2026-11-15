import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzePixels, neutralAnalysis, type ImageAnalysis } from '../lib/auto-beautify/analyze';
import {
  oklabToOklch,
  oklchToRgb,
  parseColor,
  rgbToOklab,
  type Rgb,
} from '../lib/auto-beautify/color';
import {
  generateLooks,
  MIN_EDGE_CONTRAST,
  pickAspectRatio,
  type LookOptions,
} from '../lib/auto-beautify/recipes';
import { gradientColors, type GradientKey } from '../lib/constants/gradient-colors';
import { useImageStore } from '../lib/store';

type Pixel = [number, number, number, number];

function makeImage(width: number, height: number, paint: (x: number, y: number) => Pixel) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) data.set(paint(x, y), (y * width + x) * 4);
  }
  return { data, width, height };
}

function analyze(image: ReturnType<typeof makeImage>): ImageAnalysis {
  return analyzePixels(image.data, image.width, image.height);
}

const BLUE: Pixel = [59, 130, 246, 255];
const WHITE: Pixel = [255, 255, 255, 255];
const LIGHT_GRAY: Pixel = [229, 231, 235, 255];
const EDITOR_DARK: Pixel = [30, 30, 30, 255];

/** A typical light SaaS screenshot: white page, grey rows, one blue button. */
const lightUi = () => makeImage(96, 60, (x, y) => {
  if (x >= 10 && x < 26 && y >= 40 && y < 48) return BLUE;
  if (y % 10 === 5) return LIGHT_GRAY;
  return WHITE;
});

/** A dark IDE: near-black background with light grey and pink code. */
const darkUi = () => makeImage(96, 60, (x, y) => {
  if (y % 6 === 3 && x > 8 && x < 60) return x < 20 ? [249, 38, 114, 255] : [200, 200, 200, 255];
  return EDITOR_DARK;
});

const DEFAULT_OPTIONS: LookOptions = { currentAspectRatio: '4_3', hasCustomDimensions: false };

/** Mean OKLab lightness of a generated background, CSS gradient or preset key. */
function backgroundLightness(value: string): number {
  const css = value in gradientColors ? gradientColors[value as GradientKey] : value;
  const colors = (css.match(/rgba?\([^)]*\)|#[0-9a-f]{6}\b/gi) ?? [])
    .map(parseColor)
    .filter((c): c is Rgb => c !== null)
    .map((c) => rgbToOklab(c).l);
  assert.ok(colors.length >= 2, `expected a multi-stop gradient, got ${value}`);
  return colors.reduce((a, b) => a + b, 0) / colors.length;
}

test('OKLab conversion round-trips sRGB colours', () => {
  for (const rgb of [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 59, g: 130, b: 246 }, { r: 249, g: 38, b: 114 }]) {
    const back = oklchToRgb(oklabToOklch(rgbToOklab(rgb)));
    assert.ok(Math.abs(back.r - rgb.r) <= 1 && Math.abs(back.g - rgb.g) <= 1 && Math.abs(back.b - rgb.b) <= 1, JSON.stringify({ rgb, back }));
  }
  assert.ok(rgbToOklab({ r: 255, g: 255, b: 255 }).l > 0.99);
  assert.ok(rgbToOklab({ r: 0, g: 0, b: 0 }).l < 0.01);
});

test('out-of-gamut OKLCH keeps lightness and hue by reducing chroma', () => {
  const rgb = oklchToRgb({ l: 0.6, c: 0.4, h: 145 });
  for (const v of [rgb.r, rgb.g, rgb.b]) assert.ok(v >= 0 && v <= 255);
  const lch = oklabToOklch(rgbToOklab(rgb));
  assert.ok(Math.abs(lch.l - 0.6) < 0.02, `lightness drifted to ${lch.l}`);
  assert.ok(Math.abs(lch.h - 145) < 8, `hue drifted to ${lch.h}`);
});

test('the accent is the brand colour, not the dominant grey', () => {
  const analysis = analyze(lightUi());

  assert.ok(analysis.palette[0].lch.c < 0.02, 'dominant cluster should be neutral');
  assert.ok(analysis.accent, 'a small blue button should still be found');
  const blueHue = oklabToOklch(rgbToOklab({ r: 59, g: 130, b: 246 })).h;
  assert.ok(Math.abs(analysis.accent.h - blueHue) < 10, `accent hue ${analysis.accent.h}`);
  assert.equal(analysis.isDark, false);
  assert.ok(analysis.edge && analysis.edge.l > 0.95);
});

test('greyscale images have no accent', () => {
  const analysis = analyze(makeImage(40, 40, (x) => (x % 2 ? WHITE : LIGHT_GRAY)));
  assert.equal(analysis.accent, null);
});

test('dark UIs are detected with a dark edge', () => {
  const analysis = analyze(darkUi());
  assert.equal(analysis.isDark, true);
  assert.ok(analysis.edge && analysis.edge.l < 0.3);
});

test('transparent borders have no edge colour and count as transparency', () => {
  const analysis = analyze(makeImage(40, 40, (x, y) => (
    x > 10 && x < 30 && y > 10 && y < 30 ? BLUE : [0, 0, 0, 0]
  )));
  assert.equal(analysis.edge, null);
  assert.ok(analysis.transparency > 0.7);
});

test('fully transparent images analyse without throwing', () => {
  const analysis = analyze(makeImage(8, 8, () => [0, 0, 0, 0]));
  assert.equal(analysis.palette.length, 0);
  assert.equal(analysis.accent, null);
  assert.equal(generateLooks(analysis, DEFAULT_OPTIONS).length, 6);
});

test('looks are ranked, unique and deterministic', () => {
  const analysis = analyze(lightUi());
  const looks = generateLooks(analysis, DEFAULT_OPTIONS);

  assert.equal(looks.length, 6);
  assert.equal(new Set(looks.map((l) => l.id)).size, 6);
  assert.equal(new Set(looks.map((l) => l.style.backgroundConfig.value)).size, 6, 'backgrounds should differ');
  assert.equal(looks[0].id, 'vivid');
  assert.deepEqual(generateLooks(analyze(lightUi()), DEFAULT_OPTIONS), looks);

  for (const look of looks) {
    const { type, value } = look.style.backgroundConfig;
    assert.equal(type, 'gradient');
    assert.ok(/^linear-gradient\(\d+deg, #[0-9a-f]{6} /.test(value) || value in gradientColors, value);
  }
});

test('dark UIs rank a pale look second and dark-on-dark last', () => {
  const ids = generateLooks(analyze(darkUi()), DEFAULT_OPTIONS).map((l) => l.id);
  assert.equal(ids[1], 'pastel');
  assert.equal(ids.at(-1), 'midnight');
});

test('every look separates from the screenshot edge', () => {
  for (const [name, image] of [['light', lightUi()], ['dark', darkUi()]] as const) {
    const analysis = analyze(image);
    const edgeL = analysis.edge!.l;
    for (const look of generateLooks(analysis, DEFAULT_OPTIONS)) {
      const bgL = backgroundLightness(look.style.backgroundConfig.value);
      assert.ok(
        Math.abs(bgL - edgeL) >= MIN_EDGE_CONTRAST - 0.01,
        `${name}/${look.id}: background L ${bgL.toFixed(3)} vs edge ${edgeL.toFixed(3)}`,
      );
    }
  }
});

test('shadows get stronger on dark backgrounds', () => {
  const looks = generateLooks(analyze(lightUi()), DEFAULT_OPTIONS);
  const midnight = looks.find((l) => l.id === 'midnight')!;
  assert.equal(midnight.style.shadowPreset, 'strong');
  const pastel = looks.find((l) => l.id === 'pastel')!;
  assert.equal(pastel.style.shadowPreset, 'soft');
});

test('cut-outs are not clipped and get extra breathing room', () => {
  const analysis = analyze(makeImage(40, 40, (x, y) => (
    x > 10 && x < 30 && y > 10 && y < 30 ? BLUE : [0, 0, 0, 0]
  )));
  const [look] = generateLooks(analysis, DEFAULT_OPTIONS);
  assert.equal(look.style.borderRadius, 0);
  assert.ok(look.style.imageScale < 80);
});

test('canvas shape only changes while it is still the default', () => {
  assert.equal(pickAspectRatio(16 / 9, DEFAULT_OPTIONS), '16_9');
  assert.equal(pickAspectRatio(9 / 19.5, DEFAULT_OPTIONS), '4_5');
  assert.equal(pickAspectRatio(1, DEFAULT_OPTIONS), '1_1');
  assert.equal(pickAspectRatio(4 / 3, DEFAULT_OPTIONS), null);
  assert.equal(pickAspectRatio(16 / 9, { currentAspectRatio: '1_1', hasCustomDimensions: false }), null);
  assert.equal(pickAspectRatio(16 / 9, { ...DEFAULT_OPTIONS, hasCustomDimensions: true }), null);
});

test('unreadable images still get neutral looks', () => {
  const looks = generateLooks(neutralAnalysis(), DEFAULT_OPTIONS);
  assert.equal(looks.length, 6);
  assert.equal(looks[0].style.aspectRatio, null, 'an unknown image keeps the current canvas shape');
});

test('applying a look is one undo step and leaves the rest of the design alone', () => {
  useImageStore.setState(useImageStore.getInitialState(), true);
  useImageStore.temporal.getState().clear();
  const textId = useImageStore.getState().addTextOverlay();
  useImageStore.getState().setPerspective3D({ rotateY: 12 });
  const before = useImageStore.getState();
  const historyBefore = useImageStore.temporal.getState().pastStates.length;

  const [look] = generateLooks(analyze(lightUi()), DEFAULT_OPTIONS);
  useImageStore.getState().applyAutoBeautify({ ...look.style, aspectRatio: '16_9' });
  const after = useImageStore.getState();

  assert.equal(useImageStore.temporal.getState().pastStates.length, historyBefore + 1);
  assert.deepEqual(after.backgroundConfig, look.style.backgroundConfig);
  assert.equal(after.imageScale, look.style.imageScale);
  assert.equal(after.borderRadius, look.style.borderRadius);
  assert.equal(after.shadowPreset, look.style.shadowPreset);
  assert.equal(after.selectedAspectRatio, '16_9');
  assert.equal(after.textOverlays[0]?.id, textId);
  assert.deepEqual(after.perspective3D, before.perspective3D);

  useImageStore.temporal.getState().undo();
  assert.deepEqual(useImageStore.getState().backgroundConfig, before.backgroundConfig);
  assert.equal(useImageStore.getState().selectedAspectRatio, before.selectedAspectRatio);
});

test('device scenes only get a new backdrop', () => {
  useImageStore.setState(useImageStore.getInitialState(), true);
  const before = useImageStore.getState();
  const [look] = generateLooks(analyze(lightUi()), DEFAULT_OPTIONS);

  useImageStore.getState().applyAutoBeautify({ ...look.style, aspectRatio: '16_9' }, { backgroundOnly: true });
  const after = useImageStore.getState();

  assert.deepEqual(after.backgroundConfig, look.style.backgroundConfig);
  assert.equal(after.imageScale, before.imageScale);
  assert.equal(after.borderRadius, before.borderRadius);
  assert.equal(after.selectedAspectRatio, before.selectedAspectRatio);
});
