/**
 * Shared types for the client-side image tools engine.
 *
 * Every tool (compress, convert, resize, crop, rotate) is the same pipeline
 * with a different subset of options filled in:
 *
 *   decode -> crop -> transform -> resize -> encode
 *
 * Nothing here touches the network. Files never leave the browser.
 */

export type RasterFormat = "png" | "jpeg" | "webp" | "avif";

/** Formats we can always decode via createImageBitmap in every target browser. */
export const DECODABLE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

export interface Dimensions {
  width: number;
  height: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A point in source pixel space. */
export interface Point {
  x: number;
  y: number;
}

/** A round brush stroke, in source pixels, that makes what it covers transparent. */
export interface EraseStroke {
  points: Point[];
  radius: number;
}

/**
 * Where a crop-to-fit sits and how tight it is. Fractions rather than pixels, so
 * it survives the target size changing.
 */
export interface CropPlacement {
  /** Position within the spare room, from 0 to 1 on each axis. */
  x: number;
  y: number;
  /** 1 is the largest crop that fits; 2 keeps half the width and height. */
  zoom: number;
}

/** Quarter-turn rotation, clockwise, in degrees. */
export type RotateAngle = 0 | 90 | 180 | 270;

export interface TransformOptions {
  rotate: RotateAngle;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export type ResizeMode = "pixels" | "percentage";

export interface ResizeOptions {
  mode: ResizeMode;
  /** Target width in px. Null means "derive from height". Used when mode is "pixels". */
  width: number | null;
  /** Target height in px. Null means "derive from width". Used when mode is "pixels". */
  height: number | null;
  /** 1-400. Used when mode is "percentage". */
  percentage: number;
  lockAspectRatio: boolean;
  /** When false, a target larger than the source is clamped to the source size. */
  allowUpscale: boolean;
  /**
   * Hits the exact width and height by centre-cropping whatever does not fit,
   * rather than stretching. Needs both axes; used when mode is "pixels".
   */
  cropToFit?: boolean;
  /** Defaults to the largest crop that fits, centred. */
  cropPlacement?: CropPlacement | null;
}

export interface EncodeOptions {
  format: RasterFormat;
  /** 0-1. Ignored for png. */
  quality: number;
  /**
   * Solid colour painted behind the image before encoding. Required for formats
   * without an alpha channel (jpeg) so transparency does not turn black.
   */
  background?: string;
  /** Lowers quality until the file fits. Dimensions are left alone. */
  maxBytes?: number | null;
}

export interface ProcessOptions {
  crop?: CropRect | null;
  /**
   * Closed polygon in source pixels, from a freehand crop. Pixels outside it
   * become transparent, so pair it with a format that keeps alpha.
   */
  mask?: Point[] | null;
  /** Brush strokes that erase to transparent. Same alpha caveat as `mask`. */
  erase?: EraseStroke[] | null;
  transform?: TransformOptions | null;
  resize?: ResizeOptions | null;
  encode: EncodeOptions;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  bytes: number;
  /** A size limit was set and this is the smallest the format could reach. */
  overLimit?: boolean;
}

export interface SourceImageInfo extends Dimensions {
  bytes: number;
  type: string;
}

export const IDENTITY_TRANSFORM: TransformOptions = {
  rotate: 0,
  flipHorizontal: false,
  flipVertical: false,
};
