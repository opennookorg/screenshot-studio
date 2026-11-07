/**
 * Fits an encoded image under a file size limit by lowering its quality. Pure
 * apart from the encoder it is handed, so it can be tested with a fake one.
 *
 * Only quality moves. The limit is usually paired with exact dimensions, as on
 * an application form, so shrinking the image to fit would break the other half
 * of the requirement.
 */

/** Below this a photo is mush; more steps would rarely change the answer. */
const MIN_LIMIT_QUALITY = 0.05;
const SEARCH_STEPS = 6;

/**
 * Forms write "250 KB" without saying which KB they mean. Using 1000 bytes is
 * the stricter reading, so the file passes under either one.
 */
export const BYTES_PER_KB = 1000;

export interface LimitedEncode<T> {
  blob: T;
  /** The smallest file this format can reach is still over the limit. */
  overLimit: boolean;
}

/**
 * Returns the highest quality encode that fits, or the smallest one possible
 * when nothing does. A lossless format ignores quality, so it gets one attempt.
 */
export async function encodeWithinLimit<T extends { size: number }>(
  encode: (quality: number) => Promise<T>,
  quality: number,
  maxBytes: number | null | undefined,
  canLowerQuality: boolean
): Promise<LimitedEncode<T>> {
  const first = await encode(quality);
  if (!maxBytes || first.size <= maxBytes) return { blob: first, overLimit: false };
  if (!canLowerQuality) return { blob: first, overLimit: true };

  const floor = await encode(MIN_LIMIT_QUALITY);
  if (floor.size > maxBytes) return { blob: floor, overLimit: true };

  let best = floor;
  let low = MIN_LIMIT_QUALITY;
  let high = quality;
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const middle = (low + high) / 2;
    const candidate = await encode(middle);
    if (candidate.size <= maxBytes) {
      best = candidate;
      low = middle;
    } else {
      high = middle;
    }
  }
  return { blob: best, overLimit: false };
}
