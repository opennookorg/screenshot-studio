export { analyzePixels, neutralAnalysis, type ImageAnalysis } from './analyze';
export {
  generateLooks,
  type BeautifyLook,
  type BeautifyRecipe,
  type BeautifyStyle,
  type LookOptions,
} from './recipes';
export { analyzeImageUrl } from './sample';

import { neutralAnalysis } from './analyze';
import { generateLooks, type BeautifyLook, type LookOptions } from './recipes';
import { analyzeImageUrl } from './sample';

/** Ranked looks for an image URL; falls back to neutral looks if unreadable. */
export async function getLooksForImage(src: string, options: LookOptions): Promise<BeautifyLook[]> {
  const analysis = (await analyzeImageUrl(src)) ?? neutralAnalysis();
  return generateLooks(analysis, options);
}
