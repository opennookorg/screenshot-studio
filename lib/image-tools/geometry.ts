/**
 * Dimension maths for the image tools. Pure, no DOM, safe to unit test.
 *
 * Every function here answers "what size is the output?" without touching a
 * canvas, which keeps the pixel-pushing code in ops.ts trivially thin.
 */

import type {
  CropPlacement,
  CropRect,
  Dimensions,
  ResizeOptions,
  RotateAngle,
} from "./types";

/** Canvas dimensions must be whole positive pixels. */
function toPixel(value: number): number {
  return Math.max(1, Math.round(value));
}

export function aspectRatioOf({ width, height }: Dimensions): number {
  return height === 0 ? 1 : width / height;
}

/** A quarter turn of 90 or 270 degrees swaps width and height. */
export function dimensionsAfterRotation(
  source: Dimensions,
  angle: RotateAngle
): Dimensions {
  return angle === 90 || angle === 270
    ? { width: source.height, height: source.width }
    : { width: source.width, height: source.height };
}

/** Normalises any angle onto the four quarter turns, e.g. -90 becomes 270. */
export function normalizeAngle(angle: number): RotateAngle {
  const snapped = (Math.round(angle / 90) * 90) % 360;
  const positive = snapped < 0 ? snapped + 360 : snapped;
  return positive as RotateAngle;
}

/**
 * Works out the output size for a resize.
 *
 * - "percentage" scales both axes together.
 * - "pixels" honours whichever axis the user typed; with the aspect ratio
 *   locked the other axis is derived, otherwise it stretches.
 * - With `allowUpscale` false the result never exceeds the source, so a user
 *   asking for 4000px from a 800px source gets 800px rather than a blurry crop.
 */
export function computeResizeDimensions(
  source: Dimensions,
  options: ResizeOptions
): Dimensions {
  const ratio = aspectRatioOf(source);

  let width: number;
  let height: number;

  if (options.mode === "percentage") {
    const scale = Math.max(1, options.percentage) / 100;
    width = source.width * scale;
    height = source.height * scale;
  } else {
    const hasWidth = options.width !== null && options.width > 0;
    const hasHeight = options.height !== null && options.height > 0;

    if (!hasWidth && !hasHeight) {
      return { width: toPixel(source.width), height: toPixel(source.height) };
    }

    if (options.lockAspectRatio) {
      if (hasWidth && hasHeight) {
        // Both axes given but the ratio is locked: fit inside the box the user
        // described rather than picking one axis and ignoring the other.
        const scale = Math.min(
          (options.width as number) / source.width,
          (options.height as number) / source.height
        );
        width = source.width * scale;
        height = source.height * scale;
      } else if (hasWidth) {
        width = options.width as number;
        height = width / ratio;
      } else {
        height = options.height as number;
        width = height * ratio;
      }
    } else {
      width = hasWidth ? (options.width as number) : source.width;
      height = hasHeight ? (options.height as number) : source.height;
    }
  }

  if (!options.allowUpscale) {
    const shrink = Math.min(
      1,
      source.width / Math.max(width, 1),
      source.height / Math.max(height, 1)
    );
    width *= shrink;
    height *= shrink;
  }

  return { width: toPixel(width), height: toPixel(height) };
}

/**
 * Given one edited axis, returns the other so a locked aspect ratio stays true.
 * Used by the resize form as the user types.
 */
export function matchLockedAxis(
  source: Dimensions,
  axis: "width" | "height",
  value: number
): Dimensions {
  const ratio = aspectRatioOf(source);
  if (axis === "width") {
    return { width: toPixel(value), height: toPixel(value / ratio) };
  }
  return { width: toPixel(value * ratio), height: toPixel(value) };
}

/**
 * Forces a crop rectangle inside the image. Out-of-bounds rectangles are moved
 * back in before being trimmed, so dragging past an edge slides the selection
 * instead of shrinking it.
 */
export function clampCropRect(rect: CropRect, source: Dimensions): CropRect {
  const width = Math.min(Math.max(1, Math.round(rect.width)), source.width);
  const height = Math.min(Math.max(1, Math.round(rect.height)), source.height);
  const x = Math.min(Math.max(0, Math.round(rect.x)), source.width - width);
  const y = Math.min(Math.max(0, Math.round(rect.y)), source.height - height);
  return { x, y, width, height };
}

/**
 * Reshapes a crop rectangle to a target aspect ratio, keeping it centred on its
 * current middle and inside the image.
 */
export function applyCropAspectRatio(
  rect: CropRect,
  source: Dimensions,
  ratio: number
): CropRect {
  if (!Number.isFinite(ratio) || ratio <= 0) return clampCropRect(rect, source);

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  // Start from the current area so the selection keeps roughly its size.
  let width = rect.width;
  let height = width / ratio;

  if (height > source.height) {
    height = source.height;
    width = height * ratio;
  }
  if (width > source.width) {
    width = source.width;
    height = width / ratio;
  }

  return clampCropRect(
    { x: centerX - width / 2, y: centerY - height / 2, width, height },
    source
  );
}

/** Largest rectangle of `ratio` that fits inside `source`, centred. */
export function centeredCropForRatio(
  source: Dimensions,
  ratio: number
): CropRect {
  return applyCropAspectRatio(
    { x: 0, y: 0, width: source.width, height: source.height },
    source,
    ratio
  );
}

export const DEFAULT_CROP_PLACEMENT: CropPlacement = { x: 0.5, y: 0.5, zoom: 1 };

export const MAX_CROP_ZOOM = 5;

/**
 * The crop that gives `source` the shape of a crop-to-fit resize, sized and
 * positioned by its placement, or null when this resize is not one. Lives apart
 * from the batch plan because each image in a batch has its own size.
 */
export function coverCropForResize(
  source: Dimensions,
  options: ResizeOptions
): CropRect | null {
  if (!options.cropToFit || options.mode !== "pixels") return null;
  if (!options.width || !options.height) return null;
  const largest = centeredCropForRatio(source, options.width / options.height);
  const { x, y, zoom } = options.cropPlacement ?? DEFAULT_CROP_PLACEMENT;
  const width = largest.width / zoom;
  const height = largest.height / zoom;
  return clampCropRect(
    {
      x: (source.width - width) * x,
      y: (source.height - height) * y,
      width,
      height,
    },
    source
  );
}

/** Fraction of the spare room on one axis; an axis with none keeps `fallback`. */
function shareOfRoom(offset: number, room: number, fallback: number): number {
  return room > 0 ? Math.min(1, Math.max(0, offset / room)) : fallback;
}

/**
 * Moves a crop by a drag measured in source pixels. A crop with no spare room on
 * an axis cannot move along it.
 */
export function moveCropPlacement(
  placement: CropPlacement,
  deltaX: number,
  deltaY: number,
  source: Dimensions,
  crop: Dimensions
): CropPlacement {
  const roomX = source.width - crop.width;
  const roomY = source.height - crop.height;
  return {
    ...placement,
    x: shareOfRoom(placement.x * roomX + deltaX, roomX, placement.x),
    y: shareOfRoom(placement.y * roomY + deltaY, roomY, placement.y),
  };
}

/**
 * Changes the zoom while holding the crop's centre still, so the part the user
 * lined up stays in the frame. Near an edge the crop slides just enough to stay
 * inside the image.
 */
export function zoomCropPlacement(
  placement: CropPlacement,
  zoom: number,
  source: Dimensions,
  options: ResizeOptions
): CropPlacement {
  const nextZoom = Math.min(MAX_CROP_ZOOM, Math.max(1, zoom));
  const current = coverCropForResize(source, { ...options, cropPlacement: placement });
  const next = coverCropForResize(source, {
    ...options,
    cropPlacement: { ...DEFAULT_CROP_PLACEMENT, zoom: nextZoom },
  });
  if (!current || !next) return placement;

  const centerX = current.x + current.width / 2;
  const centerY = current.y + current.height / 2;
  return {
    x: shareOfRoom(centerX - next.width / 2, source.width - next.width, placement.x),
    y: shareOfRoom(centerY - next.height / 2, source.height - next.height, placement.y),
    zoom: nextZoom,
  };
}

/** Scales `source` down to fit inside `box`, never up. Used for previews. */
export function fitWithin(source: Dimensions, box: Dimensions): Dimensions {
  const scale = Math.min(
    1,
    box.width / Math.max(source.width, 1),
    box.height / Math.max(source.height, 1)
  );
  return { width: toPixel(source.width * scale), height: toPixel(source.height * scale) };
}
