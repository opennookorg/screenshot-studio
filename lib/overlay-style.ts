import type { ImageOverlayTilt, ImageShadow } from "@/lib/store";
import { buildDropShadowFilter } from "@/lib/drop-shadow";

export const DEFAULT_OVERLAY_TILT: ImageOverlayTilt = {
  perspective: 200,
  rotateX: 0,
  rotateY: 0,
};

export const DEFAULT_OVERLAY_SHADOW: ImageShadow = {
  enabled: false,
  blur: 15,
  offsetX: 5,
  offsetY: 8,
  spread: 3,
  color: "rgba(0, 0, 0, 0.6)",
  opacity: 0.5,
};

export function hasOverlayTilt(tilt: ImageOverlayTilt | undefined): tilt is ImageOverlayTilt {
  return Boolean(tilt && (tilt.rotateX !== 0 || tilt.rotateY !== 0));
}

export function buildOverlayTiltTransform(tilt: ImageOverlayTilt | undefined): string | undefined {
  if (!hasOverlayTilt(tilt)) return undefined;
  return `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`;
}

export function buildOverlayShadowFilter(shadow: ImageShadow | undefined): string | undefined {
  if (!shadow?.enabled) return undefined;
  return buildDropShadowFilter(shadow);
}

export function fitOverlayImage(
  naturalWidth: number,
  naturalHeight: number
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) return { width: 100, height: 100 };
  const aspect = naturalWidth / naturalHeight;
  if (aspect >= 1) return { width: 100, height: 100 / aspect };
  return { width: 100 * aspect, height: 100 };
}
