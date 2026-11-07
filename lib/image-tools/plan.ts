/**
 * Turns a tool's UI settings into the options the pipeline runs and the name
 * the result downloads as. Pure, no DOM, safe to unit test.
 */

import {
  formatFromExtension,
  formatFromMime,
  isLossy,
  qualityForLevel,
  type CompressionLevel,
} from "./format";
import { extensionOf, outputFilename, sanitizeFilename } from "./filename";
import { IDENTITY_TRANSFORM } from "./types";
import type {
  CropPlacement,
  CropRect,
  ProcessOptions,
  RasterFormat,
  ResizeOptions,
  TransformOptions,
} from "./types";
import type { ResizeTemplateSelection } from "./resize-templates";
import { BYTES_PER_KB } from "./size-limit";

/** Every tool that produces a downloadable file, including the interactive one. */
export type ToolEngineName = "compress" | "convert" | "resize" | "crop" | "rotate";

/**
 * The tools driven by a shared settings panel over a batch queue.
 *
 * Crop is deliberately absent: it is a single-image, interactive tool with its
 * own drag state, and it builds its ProcessOptions directly rather than from a
 * ToolSettings object whose other six fields it would never use.
 */
export type BatchToolEngine = Exclude<ToolEngineName, "crop">;

/**
 * Quality used when re-encoding is incidental to the operation (a resize, a
 * rotate, or a crop) rather than the point of it. High enough that the tool
 * does not quietly degrade an image the user only meant to reshape.
 */
export const DEFAULT_REENCODE_QUALITY = 0.92;

/** "auto" keeps whatever format the source file already is. */
export type OutputFormatChoice = RasterFormat | "auto";

export interface ToolSettings {
  /** Compress: preset strength. */
  level: CompressionLevel;
  /** Convert / compress: target format. */
  format: OutputFormatChoice;
  /** Convert: manual quality, 0-1, used when useCustomQuality is on. */
  quality: number;
  useCustomQuality: boolean;
  /** Colour painted behind transparency when the target has no alpha channel. */
  background: string;
  resize: ResizeOptions;
  /** Resize: the template the size came from, kept while its numbers are edited. */
  resizeTemplateId: string | null;
  /** Resize: largest file to produce, in KB. Null means no limit. */
  maxFileKb: number | null;
  transform: TransformOptions;
  crop: CropRect | null;
}

export const DEFAULT_RESIZE: ResizeOptions = {
  mode: "pixels",
  width: null,
  height: null,
  percentage: 100,
  lockAspectRatio: true,
  allowUpscale: false,
  cropToFit: false,
};

export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  level: "medium",
  format: "auto",
  quality: 0.85,
  useCustomQuality: false,
  background: "#ffffff",
  resize: DEFAULT_RESIZE,
  resizeTemplateId: null,
  maxFileKb: null,
  transform: IDENTITY_TRANSFORM,
  crop: null,
};

/**
 * Settings for a resize template. A template promises an exact size, so it
 * crops rather than stretches and is allowed to enlarge a small image.
 */
export function applyResizeTemplate(
  resize: ResizeOptions,
  { template, group }: ResizeTemplateSelection
): Pick<ToolSettings, "resize" | "resizeTemplateId" | "format"> {
  return {
    resizeTemplateId: template.id,
    format: group.format ?? "auto",
    resize: {
      ...resize,
      mode: "pixels",
      width: template.width,
      height: template.height,
      lockAspectRatio: false,
      allowUpscale: true,
      cropToFit: true,
    },
  };
}

/** Back to a hand-typed size, with the form's normal defaults. */
export function clearResizeTemplate(
  resize: ResizeOptions
): Pick<ToolSettings, "resize" | "resizeTemplateId" | "format"> {
  return {
    resizeTemplateId: null,
    format: "auto",
    resize: {
      ...resize,
      width: null,
      height: null,
      lockAspectRatio: true,
      allowUpscale: false,
      cropToFit: false,
    },
  };
}

/**
 * The format a batch tool will actually write. Lossless files cannot be squeezed
 * by lowering quality, so a size limit moves them to JPEG; otherwise the limit
 * could only ever fail.
 */
export function resolveToolFormat(
  engine: BatchToolEngine,
  settings: ToolSettings,
  sourceMime: string
): RasterFormat {
  const format = resolveOutputFormat(settings.format, sourceMime);
  return engine === "resize" && settings.maxFileKb && !isLossy(format)
    ? "jpeg"
    : format;
}

/**
 * Crop-to-fit needs both axes. With one box left empty while editing a template
 * there is no shape to crop to, so the image scales proportionally instead of
 * being stretched.
 */
function resolveResize(resize: ResizeOptions): ResizeOptions {
  if (!resize.cropToFit || (resize.width && resize.height)) return resize;
  return { ...resize, cropToFit: false, lockAspectRatio: true };
}

/** Suffix appended only when the output would otherwise overwrite the input. */
const ENGINE_SUFFIX: Record<ToolEngineName, string> = {
  compress: "compressed",
  convert: "converted",
  resize: "resized",
  crop: "cropped",
  rotate: "rotated",
};

/**
 * Resolves the encoding format. "auto" keeps the source format, falling back to
 * PNG when the source format is not one we can write.
 */
export function resolveOutputFormat(
  choice: OutputFormatChoice,
  sourceMime: string
): RasterFormat {
  if (choice !== "auto") return choice;
  return formatFromMime(sourceMime) ?? "png";
}

function resolveQuality(
  engine: BatchToolEngine,
  settings: ToolSettings,
  format: RasterFormat
): number {
  if (engine === "compress") return qualityForLevel(settings.level, format);
  if (settings.useCustomQuality) return settings.quality;
  // Only compress and convert are about file size; resize and rotate re-encode
  // incidentally and should not lose quality doing it.
  return engine === "convert" ? settings.quality : DEFAULT_REENCODE_QUALITY;
}

/**
 * Builds the pipeline options for one batch engine, ignoring the settings it
 * does not use. Crop is not routed through here; see BatchToolEngine.
 */
export function buildProcessOptions(
  engine: BatchToolEngine,
  settings: ToolSettings,
  sourceMime: string,
  cropPlacement?: CropPlacement | null
): ProcessOptions {
  const format = resolveToolFormat(engine, settings, sourceMime);

  return {
    crop: null,
    transform: engine === "rotate" ? settings.transform : null,
    resize:
      engine === "resize"
        ? { ...resolveResize(settings.resize), cropPlacement: cropPlacement ?? null }
        : null,
    encode: {
      format,
      quality: resolveQuality(engine, settings, format),
      background: settings.background,
      maxBytes:
        engine === "resize" && settings.maxFileKb
          ? settings.maxFileKb * BYTES_PER_KB
          : null,
    },
  };
}

/**
 * Download name for a result. The engine suffix is added only when the name
 * would collide with the source file, so /png-to-jpg produces "shot.jpg"
 * rather than "shot-converted.jpg".
 */
export function buildOutputName(
  engine: ToolEngineName,
  sourceName: string,
  format: RasterFormat
): string {
  const sourceExtension = extensionOf(sourceName);
  const extension =
    sourceExtension && formatFromExtension(sourceExtension) === format
      ? sourceExtension
      : undefined;

  const plain = outputFilename(sourceName, format, undefined, extension);
  const collides =
    plain.toLowerCase() === sanitizeFilename(sourceName).toLowerCase();
  return collides
    ? outputFilename(sourceName, format, ENGINE_SUFFIX[engine], extension)
    : plain;
}
