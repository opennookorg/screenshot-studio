/**
 * Client-side image tools engine.
 *
 * One pipeline (decode, crop, transform, resize, encode) drives every tool.
 * Everything runs in the browser; no image is uploaded to process it.
 */

export * from "./types";
export * from "./format";
export * from "./geometry";
export * from "./freehand";
export * from "./resize-templates";
export * from "./size-limit";
export * from "./filename";
export * from "./plan";

export { decodeImage, readImageSize, detectEncodeSupport, processBitmap, processFile } from "./ops";
export { imageToolsWorker } from "./worker-client";
export { downloadBlob, downloadAsZip, downloadResults } from "./download";
export type { DownloadableFile } from "./download";
