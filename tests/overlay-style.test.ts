import assert from "node:assert/strict";
import test from "node:test";
import { buildDropShadowFilter, parseShadowRgb } from "../lib/drop-shadow";
import {
  DEFAULT_OVERLAY_SHADOW,
  buildOverlayShadowFilter,
  buildOverlayTiltTransform,
  fitOverlayImage,
  hasOverlayTilt,
} from "../lib/overlay-style";

test("overlays without tilt keep rendering with no 3D transform", () => {
  assert.equal(hasOverlayTilt(undefined), false);
  assert.equal(buildOverlayTiltTransform(undefined), undefined);
  assert.equal(buildOverlayTiltTransform({ perspective: 200, rotateX: 0, rotateY: 0 }), undefined);
});

test("tilted overlays rotate around X then Y", () => {
  const tilt = { perspective: 200, rotateX: 12, rotateY: -20 };

  assert.equal(hasOverlayTilt(tilt), true);
  assert.equal(buildOverlayTiltTransform(tilt), "rotateX(12deg) rotateY(-20deg)");
});

test("overlay shadows use the same drop-shadow as the main image", () => {
  const shadow = { ...DEFAULT_OVERLAY_SHADOW, enabled: true, color: "#102030" };

  assert.equal(buildOverlayShadowFilter({ ...shadow, enabled: false }), undefined);
  assert.equal(buildOverlayShadowFilter(shadow), buildDropShadowFilter(shadow));
});

test("shadow colors parse from hex, legacy rgba and modern space-separated rgb", () => {
  assert.deepEqual(parseShadowRgb("#102030"), [16, 32, 48]);
  assert.deepEqual(parseShadowRgb("rgba(0, 0, 0, 0.6)"), [0, 0, 0]);
  assert.deepEqual(parseShadowRgb("rgb(10 20 30 / 50%)"), [10, 20, 30]);
});

test("overlay images keep their aspect ratio inside the square overlay box", () => {
  assert.deepEqual(fitOverlayImage(1600, 1000), { width: 100, height: 62.5 });
  assert.deepEqual(fitOverlayImage(500, 1000), { width: 50, height: 100 });
  assert.deepEqual(fitOverlayImage(0, 0), { width: 100, height: 100 });
});
