/**
 * The image tools registry: one definition per landing page.
 *
 * This is the single source of truth behind the tool routes, the /tools hub,
 * the sitemap, and the agent-readable site content. Adding a tool page means
 * adding an entry here plus a four-line route file that renders <ToolPage>.
 *
 * Several entries share an engine on purpose: /png-to-jpg and /jpg-to-png run
 * the same converter with a different preset, but each targets its own query
 * and gets its own copy, FAQs, and structured data.
 */

import type { RasterFormat } from "@/lib/image-tools/types";

export type ToolEngine = "compress" | "convert" | "resize" | "crop" | "rotate";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolPreset {
  /** Converter pages preselect the output format. */
  targetFormat?: RasterFormat;
  /** Copy shown on the dropzone, e.g. "PNG" for /png-to-jpg. */
  sourceLabel?: string;
}

export interface ToolDefinition {
  /** Route path, without a locale prefix. */
  slug: string;
  engine: ToolEngine;
  preset?: ToolPreset;
  /** Short label for the hub grid and related-tool links. */
  name: string;
  h1: string;
  /** <title>. Kept under ~40 characters so the brand suffix fits the SERP budget. */
  title: string;
  /** Meta description. Kept under ~155 characters. */
  description: string;
  keywords: string[];
  /** Paragraph under the H1. */
  intro: string;
  /** Bullets for the SoftwareApplication featureList and the "how it works" list. */
  features: string[];
  faqs: ToolFaq[];
  /** Prose sections rendered between the feature list and the FAQ. */
  sections?: { heading: string; body: string }[];
  /** Slugs of related tools, for internal linking. */
  related: string[];
  /** Primary tools lead the hub grid and carry higher sitemap priority. */
  primary: boolean;
}

/** FAQ answers every tool repeats, phrased once so the claims stay consistent. */
const PRIVACY_FAQ: ToolFaq = {
  question: "Are my images uploaded to a server?",
  answer:
    "No. Every tool on this page runs entirely in your browser using the Canvas and Web Worker APIs. Your files are read from disk, processed in the tab, and written straight back to your downloads folder. Nothing is uploaded, stored, or logged, which also means the tool keeps working if you go offline after the page loads.",
};

const FREE_FAQ: ToolFaq = {
  question: "Is it free, and is there a watermark?",
  answer:
    "It is completely free with no signup, no account, no daily limit, and no watermark. Screenshot Studio is open source under the Apache 2.0 licence.",
};

const BATCH_FAQ: ToolFaq = {
  question: "Can I process several images at once?",
  answer:
    "Yes. Drop in as many images as you like and they are processed one after another in the background. A single image downloads directly; multiple images are bundled into one zip file.",
};

export const TOOLS: ToolDefinition[] = [
  {
    slug: "/compress-image",
    engine: "compress",
    name: "Compress Image",
    h1: "Compress Image",
    title: "Compress Image Online: Free, No Upload",
    description:
      "Shrink JPG, PNG, and WebP files in your browser. Batch compression with a live size preview. Free, no signup, no watermark, no upload.",
    keywords: [
      "compress image",
      "compress image online",
      "image compressor",
      "reduce image file size",
      "compress jpeg",
      "compress png",
      "compress webp",
      "shrink image size",
      "image compressor free",
      "batch image compression",
      "compress image without losing quality",
      "iloveimg alternative",
    ],
    intro:
      "Make image files smaller without sending them anywhere. Pick a compression level, see exactly how many kilobytes each file saves, and download the results one by one or as a zip.",
    features: [
      "Four compression levels from light to extreme",
      "Live before and after file size for every image",
      "Batch compression with a single zip download",
      "Optional format switch to WebP for the biggest savings",
      "Runs fully in the browser, no upload",
    ],
    faqs: [
      {
        question: "How much smaller will my images get?",
        answer:
          "It depends on the source. A screenshot saved as PNG often drops 60-80% when compressed to WebP or JPG, while a photo that is already a JPG typically saves 30-60% at the medium level. Each file shows its exact saving after processing, so you can try a level and adjust.",
      },
      {
        question: "Does compressing lose quality?",
        answer:
          "JPG and WebP are lossy formats, so higher compression does discard detail. The Low level is visually lossless for most images and still saves meaningful space. PNG is lossless, so compressing to PNG only re-encodes the file; to make a PNG substantially smaller, convert it to WebP.",
      },
      BATCH_FAQ,
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
    sections: [
      {
        heading: "How to compress an image",
        body: "Drop one or more images onto the page. Pick a compression level (Balanced is selected by default), and either keep each file in its own format or pick an output format such as WebP. Each file is processed in turn and shows its new size and the percentage saved. Download a single file directly, or all of them as one zip. If a result looks too soft, choose a lighter level and run it again; the original files on your disk are never changed.",
      },
      {
        heading: "Choosing a compression level",
        body: "The four levels map to fixed encoder quality settings. For JPG, Light uses 92% quality, Balanced 85%, Strong 75%, and Extreme 60%; WebP uses 90%, 82%, 72%, and 55%. Light is right for photos you may print or edit again. Balanced suits most images on websites and in email. Strong works for thumbnails and previews that are shown small. Extreme is for cases where size matters more than looks, such as an upload form with a strict limit. PNG output ignores the level because it is lossless, and if the result is not smaller your original is kept; to shrink a PNG substantially, compress it to WebP.",
      },
      {
        heading: "Screenshots versus photos",
        body: "Photos hide compression well because their detail is soft and noisy. Screenshots do not: JPG compression leaves visible halos around text and blotches in flat areas of colour. For screenshots, slides, and diagrams, compress to WebP, which keeps text sharp at a much smaller size than PNG. For photos, JPG or WebP at the Balanced level is usually indistinguishable from the original.",
      },
    ],
    related: ["/convert-image", "/resize-image", "/png-to-webp"],
    primary: true,
  },
  {
    slug: "/convert-image",
    engine: "convert",
    name: "Convert Image",
    h1: "Convert Image Format",
    title: "Convert Image Online: PNG, JPG, WebP",
    description:
      "Convert between PNG, JPG, WebP, and AVIF in your browser. Batch conversion, quality control, no upload. Free, no signup, no watermark.",
    keywords: [
      "convert image",
      "image converter",
      "convert image format",
      "png to jpg",
      "jpg to png",
      "convert to webp",
      "image format converter online",
      "free image converter",
      "batch image converter",
      "convert image without uploading",
    ],
    intro:
      "Change an image's format without installing anything. Choose PNG, JPG, WebP, or AVIF, set the quality, and convert a whole folder at once.",
    features: [
      "PNG, JPG, WebP, and AVIF in every direction",
      "Quality slider for the lossy formats",
      "Choose the background colour behind transparency",
      "Batch conversion with a single zip download",
      "Runs fully in the browser, no upload",
    ],
    faqs: [
      {
        question: "Which formats are supported?",
        answer:
          "Drop in PNG, JPG, WebP, or AVIF, and convert to any of the same four. The output picker only ever shows formats your browser can produce, so whatever you pick is what you get.",
      },
      {
        question: "What happens to transparency when I convert to JPG?",
        answer:
          "JPG has no alpha channel, so transparent areas have to be filled with a solid colour. The tool paints white behind the image by default and lets you pick a different colour before converting.",
      },
      {
        question: "Which format should I choose?",
        answer:
          "WebP for the web, where it is typically 25-35% smaller than JPG at the same quality. JPG for maximum compatibility with older software. PNG when you need transparency or a pixel-exact lossless copy, such as a UI screenshot.",
      },
      BATCH_FAQ,
      PRIVACY_FAQ,
    ],
    sections: [
      {
        heading: "How to convert an image",
        body: "Drop in your files, choose the output format, and, for JPG, WebP, or AVIF, set the quality (85% by default). When converting to JPG, choose the colour that should replace transparent areas. Files are converted one at a time in the background, and you can download each result or a single zip of the whole batch. The original files are not modified.",
      },
      {
        heading: "What the quality slider does",
        body: "Quality only applies to the lossy formats: JPG, WebP, and AVIF. It controls how much fine detail the encoder is allowed to discard. Around 85% most images are indistinguishable from the source while being much smaller. Below about 70%, artifacts start to show at sharp edges, in text, and in smooth gradients such as skies. PNG ignores the slider because it always stores every pixel exactly.",
      },
    ],
    related: ["/png-to-jpg", "/png-to-webp", "/compress-image"],
    primary: true,
  },
  {
    slug: "/resize-image",
    engine: "resize",
    name: "Resize Image",
    h1: "Resize Image",
    title: "Resize Image: Passport & Social Sizes",
    description:
      "Resize images online to exact pixels or ready-made sizes like passport photos and Instagram posts. Set a max file size. Free, no signup, no upload.",
    keywords: [
      "resize image",
      "resize image online",
      "image resizer",
      "change image dimensions",
      "resize photo",
      "bulk image resizer",
      "resize image by percentage",
      "resize image in pixels",
      "resize photo to passport size",
      "resize image for instagram",
      "resize image to kb",
      "scale image online",
      "free image resizer",
    ],
    intro:
      "Pick a ready-made size like a passport photo or Instagram post, set an exact width and height, or scale by a percentage. Resize one image or a hundred, and images are downscaled in steps so text stays sharp.",
    features: [
      "Ready-made sizes for passport photos, social media, print, and screens",
      "Every template size stays editable, and you can move and zoom the crop on each image",
      "Optional maximum file size for application forms",
      "Resize by exact pixels or by percentage",
      "Aspect ratio lock with automatic second axis",
      "Optional upscaling, off by default for custom sizes",
      "Stepped downscaling that keeps screenshot text legible",
      "Batch resize with a single zip download",
    ],
    faqs: [
      {
        question: "Can I resize a photo to passport size?",
        answer:
          "Yes. Choose a template such as US passport or 35 by 45 mm, drag and zoom the frame to choose what stays, and the photo is cropped and resized to that exact size. You can also set a maximum file size if the form has one. Templates set the size only, so check the official rules for background and head size before you submit.",
      },
      {
        question: "Can I resize a photo to a specific file size in KB?",
        answer:
          "Yes. Type a maximum file size and the quality is lowered just enough to fit, while the width and height stay exactly as you set them. PNG files are saved as JPG to fit, because PNG cannot shrink by lowering quality. If the limit cannot be reached at that size, you get the smallest possible file and a warning.",
      },
      {
        question: "Will resizing make my image blurry?",
        answer:
          "Downscaling is done in successive halving steps rather than one large jump, which preserves far more detail than a single resize. The difference is obvious on screenshots containing small text. Upscaling cannot invent detail, so it is off by default for custom sizes. Templates turn it on so a small image can still reach the exact size, and warn you when the result may look soft.",
      },
      {
        question: "How do I keep the aspect ratio?",
        answer:
          "The lock is on by default: type one dimension and the other is calculated for you. Unlock it if you deliberately want to stretch an image to exact dimensions.",
      },
      {
        question: "Can I resize images to the same size in bulk?",
        answer:
          "Yes. Drop in a batch, set one target width, and every image is resized to that width with its own height derived from its aspect ratio. Choose a template instead and every image comes out at exactly that size, with its own crop you can adjust. Percentage mode scales each image relative to its own size.",
      },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
    sections: [
      {
        heading: "How to resize an image",
        body: "Drop in one image or a batch. Pick a template for a ready-made size, then drag and zoom the frame to choose what stays. Or choose Pixels to set an exact width or height, or Percentage to scale every image relative to its own size. With the aspect ratio locked, type one dimension and the other is calculated for you. Leave upscaling off unless you specifically need a larger file, then download each image or a zip of all of them.",
      },
      {
        heading: "Common target sizes",
        body: "A full-width website image rarely needs to be wider than 1920 pixels, and an image inside an article column rarely more than 1200. Link previews on most social networks use 1200 by 630. Instagram posts are 1080 pixels wide, square at 1080 by 1080 or portrait at 1080 by 1350. YouTube thumbnails are 1280 by 720. All of these are templates, along with passport photos, print sizes, and banners. When a size has a different shape from your image, the template crops to fit and you choose which part to keep.",
      },
      {
        heading: "Sizing for high-density screens",
        body: "Phones and most laptops have screens with two or three device pixels per CSS pixel, so an image shown 600 pixels wide on a page looks sharpest when the file is 1200 pixels wide. Sizing to twice the displayed width is a good default; going beyond three times adds bytes without visible benefit.",
      },
    ],
    related: ["/crop-image", "/compress-image", "/convert-image"],
    primary: true,
  },
  {
    slug: "/crop-image",
    engine: "crop",
    name: "Crop Image",
    h1: "Crop Image",
    title: "Crop Image Online: Freehand & Ratios",
    description:
      "Crop an image by dragging a selection, typing exact pixels, or drawing any shape by hand for a transparent cutout. Free, in your browser, no upload.",
    keywords: [
      "crop image",
      "crop image online",
      "image cropper",
      "crop photo",
      "crop picture online",
      "crop image to square",
      "crop image to 16:9",
      "free image cropper",
      "crop screenshot",
      "crop image without uploading",
      "freehand crop",
      "crop image in any shape",
    ],
    intro:
      "Drag a selection over your image, type exact pixel values, or draw any shape by hand. Ratio presets cover square, 16:9, 4:3, and the common social sizes, and the crop is applied at full source resolution.",
    features: [
      "Drag to select, or enter exact pixel coordinates",
      "Freehand mode: draw around any shape and get a transparent cutout",
      "Draw a line across the image and click the side to keep",
      "Eraser brush to remove leftover bits from a cutout",
      "Ratio presets: free, square, 16:9, 4:3, 3:2, 9:16",
      "Cropped at full source resolution, not preview resolution",
      "Live output dimensions as you drag",
      "Runs fully in the browser, no upload",
    ],
    faqs: [
      {
        question: "Does cropping reduce the resolution?",
        answer:
          "Only by the amount you crop away. The selection is mapped back onto the original pixels, so cropping the middle 50% of a 4000px-wide image gives you a 2000px-wide result at full quality, not a scaled-down preview.",
      },
      {
        question: "Can I crop an image in a custom shape?",
        answer:
          "Yes. Switch to Freehand and draw around the part you want with your mouse or finger, and everything outside it becomes transparent. Draw a line from one edge to another to split the image, then click the side to keep. An eraser brush removes anything left over. JPG files are saved as PNG, because JPG cannot store transparency.",
      },
      {
        question: "Can I crop to a specific aspect ratio?",
        answer:
          "Yes. Pick a ratio preset and the selection is constrained to it while you drag. Choose Free for a rectangle of any proportions.",
      },
      {
        question: "Can I crop several images at once?",
        answer:
          "Cropping is per-image, because the right selection depends on what is in each picture. To apply identical dimensions across a batch, use the resize tool instead.",
      },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
    sections: [
      {
        heading: "How to crop an image",
        body: "Drop in an image and pick a ratio preset, or Free for no fixed ratio. Drag the selection over the part you want to keep, or type the exact position and size in pixels. For a shape that is not a rectangle, switch to Freehand and draw it by hand. The output dimensions update as you drag. When you download, the crop is applied to the original full-resolution pixels, not to the preview on screen.",
      },
      {
        heading: "Which ratio to use",
        body: "Square (1:1) fits Instagram feed posts and profile pictures. 16:9 is the shape of YouTube thumbnails, presentation slides, and most video. 4:3 matches classic slide decks and many tablet screenshots. 3:2 is the native shape of most camera sensors and of 4 by 6 inch prints. 9:16 is the vertical format used by Stories, Reels, TikTok, and phone wallpapers.",
      },
      {
        heading: "Cropping screenshots before you share them",
        body: "Cropping is the quickest way to remove a browser toolbar, a notification bar, or a busy desktop around the window you care about. It is not a way to hide something in the middle of an image, though. To cover an email address, a name, or an API key that sits inside the area you keep, blur or pixelate it in the screenshot editor instead.",
      },
    ],
    related: ["/resize-image", "/rotate-image", "/compress-image"],
    primary: true,
  },
  {
    slug: "/rotate-image",
    engine: "rotate",
    name: "Rotate Image",
    h1: "Rotate and Flip Image",
    title: "Rotate Image Online: Turn and Flip, Free",
    description:
      "Rotate images 90, 180, or 270 degrees and flip them horizontally or vertically. Batch rotate in your browser. Free, no upload.",
    keywords: [
      "rotate image",
      "rotate image online",
      "flip image",
      "rotate photo",
      "mirror image online",
      "rotate image 90 degrees",
      "flip image horizontally",
      "batch rotate images",
      "free image rotator",
      "turn image sideways",
    ],
    intro:
      "Turn an image in quarter steps and mirror it on either axis. Rotation is lossless in shape: the pixels are re-drawn at full size, and a batch can be corrected in one pass.",
    features: [
      "Rotate 90, 180, or 270 degrees",
      "Flip horizontally or vertically",
      "Live preview before you commit",
      "Batch rotate with a single zip download",
      "Runs fully in the browser, no upload",
    ],
    faqs: [
      {
        question: "Why is my photo sideways in the first place?",
        answer:
          "Phone cameras usually store the picture in one orientation and record the intended rotation in an EXIF tag. Software that ignores the tag shows it sideways. This tool reads the EXIF orientation on load, so what you see is already upright, and any rotation you add is baked into the output pixels.",
      },
      {
        question: "What is the difference between rotating and flipping?",
        answer:
          "Rotating turns the image around its centre. Flipping mirrors it, so text becomes reversed. Flips are applied first and the rotation second, matching what you see in the preview.",
      },
      BATCH_FAQ,
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
    sections: [
      {
        heading: "How to rotate or flip an image",
        body: "Drop in your images, choose a clockwise rotation of 90, 180, or 270 degrees, and switch on a horizontal or vertical flip if you need one. Press Apply and every image in the batch gets the same rotation and flip. Download them one at a time or as a single zip.",
      },
      {
        heading: "When to flip instead of rotate",
        body: "Rotate when an image is simply the wrong way up, such as a sideways phone photo or a scanned page. Flip when it is mirrored: front-facing phone cameras often save selfies mirrored, so any text in the shot reads backwards. Designers also flip a photo so the subject faces into a layout rather than off the edge. Avoid flipping images that contain text, logos, or recognisable places unless you mean to.",
      },
    ],
    related: ["/crop-image", "/resize-image", "/convert-image"],
    primary: true,
  },
];

/** Per-format background used to give each converter page format-specific prose. */
const FORMAT_FACTS: Record<
  string,
  { strengths: string; alpha: boolean; lossy: boolean; note: string }
> = {
  PNG: {
    strengths:
      "PNG stores every pixel exactly as it was, with 8 or 16 bits per channel and a full alpha channel. That makes it the right format for screenshots, UI exports, logos, and line art, where a single softened edge or a shifted flat colour is visible. The cost is size: because it never discards detail, a photograph saved as PNG is routinely several times larger than the same photograph as JPG or WebP.",
    alpha: true,
    lossy: false,
    note: "opens in every browser, operating system, and image editor released since the late 1990s",
  },
  JPG: {
    strengths:
      "JPG compresses by discarding the fine detail the eye is least sensitive to, which works extremely well on photographs and continuous-tone images and poorly on sharp text and flat colour. It has no alpha channel, and every re-save compounds the artifacts of the previous one, so it is a format to export to rather than to work in.",
    alpha: false,
    lossy: true,
    note: "accepted by effectively every upload form, print service, and photo editor in existence",
  },
  WebP: {
    strengths:
      "WebP has both a lossy and a lossless mode and supports transparency in both, which is what lets it replace PNG and JPG at once. At matching visual quality it is typically 25 to 35 percent smaller than JPG and meaningfully smaller than PNG for the same graphic. Its one hard limit is dimensional: neither side can exceed 16,383 pixels.",
    alpha: true,
    lossy: true,
    note: "supported by every current browser, though some older desktop software still cannot open it",
  },
  AVIF: {
    strengths:
      "AVIF applies the AV1 video codec to still images, which buys it the best compression in general use: lossy and lossless modes, an alpha channel, and 10 and 12-bit colour with HDR. Files are commonly half the size of an equivalent JPG and a small fraction of a PNG. Encoding is slower than the older formats, which is the price of the ratio.",
    alpha: true,
    lossy: true,
    note: "supported by Chrome, Firefox, and Safari 16 and later, but not by much older software",
  },
};

function conversionSections(
  from: string,
  toLabel: string,
  why: string,
): { heading: string; body: string }[] {
  const source = FORMAT_FACTS[from];
  const target = FORMAT_FACTS[toLabel];
  const losesAlpha = source.alpha && !target.alpha;
  const losesDetail = !source.lossy && target.lossy;

  const tradeoffs = [
    why,
    losesAlpha
      ? `Because ${toLabel} has no alpha channel, any transparent pixel has to become a solid colour. Pick that colour before you convert rather than discovering it afterwards.`
      : `Transparency survives the conversion, so a ${from} with a cut-out subject stays cut out as ${toLabel}.`,
    losesDetail
      ? `The move from lossless ${from} to lossy ${toLabel} is one-way: the discarded detail is gone, so keep the original if you expect to edit the image again.`
      : `Re-encoding always costs something, so convert from the highest-quality copy you have rather than from an already-compressed export.`,
    `The result ${target.note}.`,
  ];

  return [
    { heading: `What ${from} is good at`, body: source.strengths },
    { heading: `What ${toLabel} gives you`, body: target.strengths },
    { heading: `Converting ${from} to ${toLabel}`, body: tradeoffs.join(" ") },
  ];
}

/** Converter landing pages: one engine, one preset, one keyword each. */
const CONVERSION_PAGES: {
  slug: string;
  from: string;
  to: RasterFormat;
  toLabel: string;
  why: string;
  keywords: string[];
  extraFaqs?: ToolFaq[];
}[] = [
  {
    slug: "/png-to-jpg",
    from: "PNG",
    to: "jpeg",
    toLabel: "JPG",
    why: "JPG files are far smaller than PNG for photographs and are accepted everywhere, which makes the conversion useful for email attachments and upload forms with a size limit.",
    keywords: ["png to jpg", "png to jpeg", "convert png to jpg", "png to jpg converter"],
    extraFaqs: [
      {
        question: "Will converting a screenshot from PNG to JPG make it smaller?",
        answer:
          "Usually, but at a cost. JPG is designed for photographs, and on screenshots it softens sharp text and adds faint blocks around flat areas of colour. For screenshots, slides, and diagrams, try PNG to WebP first: it stays crisp and is often smaller than the JPG too. Use JPG when the destination only accepts JPG.",
      },
    ],
  },
  {
    slug: "/jpg-to-png",
    from: "JPG",
    to: "png",
    toLabel: "PNG",
    why: "PNG is lossless, so converting to it stops further quality loss when you plan to edit and re-save an image repeatedly.",
    keywords: ["jpg to png", "jpeg to png", "convert jpg to png", "jpg to png converter"],
    extraFaqs: [
      {
        question: "Will converting JPG to PNG improve the quality?",
        answer:
          "No. The detail JPG discarded when the file was first saved cannot be recovered, so the PNG looks identical to the JPG, artifacts included, and is usually several times larger. Convert when you need a lossless working copy to edit and re-save repeatedly, or when a tool only accepts PNG.",
      },
    ],
  },
  {
    slug: "/png-to-webp",
    from: "PNG",
    to: "webp",
    toLabel: "WebP",
    why: "WebP keeps transparency like PNG but is dramatically smaller, which usually makes it the best format for images on a website.",
    keywords: ["png to webp", "convert png to webp", "png to webp converter"],
    extraFaqs: [
      {
        question: "Is WebP a good format for screenshots and logos?",
        answer:
          "Yes. WebP keeps sharp edges and transparency, and at high quality text stays crisp while the file is far smaller than the PNG. For UI assets you will edit again, keep the PNG as your master copy and publish the WebP.",
      },
    ],
  },
  {
    slug: "/webp-to-png",
    from: "WebP",
    to: "png",
    toLabel: "PNG",
    why: "Some older software and design tools still cannot open WebP. Converting to PNG keeps transparency and works everywhere.",
    keywords: ["webp to png", "convert webp to png", "webp to png converter"],
    extraFaqs: [
      {
        question: "Why do images I save from websites end up as WebP?",
        answer:
          "Many sites serve WebP to browsers that support it because it loads faster, so saving an image from a web page gives you a .webp file even when the site's author uploaded a PNG or JPG. Converting to PNG gives you a file that opens in any app and keeps any transparency.",
      },
    ],
  },
  {
    slug: "/jpg-to-webp",
    from: "JPG",
    to: "webp",
    toLabel: "WebP",
    why: "WebP is typically 25-35% smaller than JPG at the same visual quality, which is the single easiest page-speed win for an image-heavy site.",
    keywords: ["jpg to webp", "jpeg to webp", "convert jpg to webp"],
    extraFaqs: [
      {
        question: "Can I use WebP images in email?",
        answer:
          "Not reliably. Several desktop versions of Outlook and some other email clients do not display WebP. Keep JPG for newsletters and attachments, and use WebP for images on your own website, where every current browser supports it.",
      },
    ],
  },
  {
    slug: "/webp-to-jpg",
    from: "WebP",
    to: "jpeg",
    toLabel: "JPG",
    why: "JPG is the safest format to hand to software that predates WebP, including many print services and older photo editors.",
    keywords: ["webp to jpg", "webp to jpeg", "convert webp to jpg"],
    extraFaqs: [
      {
        question: "Should I convert WebP to JPG or to PNG?",
        answer:
          "Choose JPG when the WebP is a photo and you want a small file that any printer, upload form, or older app will accept. Choose PNG when the image has transparency or sharp text, because JPG fills transparent areas with a solid colour and softens fine edges.",
      },
    ],
  },
  {
    slug: "/avif-to-jpg",
    from: "AVIF",
    to: "jpeg",
    toLabel: "JPG",
    why: "AVIF is very efficient but still unsupported by plenty of older apps, editors, and upload forms. JPG is the safest thing to hand them.",
    keywords: ["avif to jpg", "convert avif to jpg", "avif to jpeg"],
    extraFaqs: [
      {
        question: "Why can't I open an AVIF file on my computer?",
        answer:
          "Browsers added AVIF support before many operating systems and apps did. Windows needs the free AV1 Video Extension from the Microsoft Store to show AVIF in the Photos app, and older versions of macOS and many image editors and viewers cannot open it at all. Converting to JPG gives you a file that opens everywhere.",
      },
    ],
  },
  {
    slug: "/avif-to-png",
    from: "AVIF",
    to: "png",
    toLabel: "PNG",
    why: "PNG opens anywhere and keeps transparency, which AVIF also supports, so nothing is lost in the move apart from file size.",
    keywords: ["avif to png", "convert avif to png", "avif to png converter"],
    extraFaqs: [
      {
        question: "Does AVIF to PNG keep HDR or 10-bit colour?",
        answer:
          "No. The conversion runs through the browser canvas, which works with 8 bits per channel, so 10-bit, 12-bit, and HDR AVIF files are converted to standard dynamic range. For ordinary photos and graphics the difference is not visible.",
      },
    ],
  },
  {
    slug: "/png-to-avif",
    from: "PNG",
    to: "avif",
    toLabel: "AVIF",
    why: "AVIF is the most efficient image format in wide use and keeps transparency like PNG. A screenshot or graphic converted to AVIF is routinely 80-95% smaller than the PNG it came from.",
    keywords: ["png to avif", "convert png to avif", "png to avif converter"],
    extraFaqs: [
      {
        question: "Is the AVIF output lossless like the PNG?",
        answer:
          "No. This converter encodes AVIF with the quality setting you choose, so the result is lossy. At the default quality, screenshots and graphics look the same to the eye at a small fraction of the size. Keep the original PNG if you ever need an exact pixel copy.",
      },
    ],
  },
  {
    slug: "/jpg-to-avif",
    from: "JPG",
    to: "avif",
    toLabel: "AVIF",
    why: "AVIF typically halves a JPG at the same visual quality, which makes it the biggest single page-speed win available for a photo-heavy site.",
    keywords: ["jpg to avif", "jpeg to avif", "convert jpg to avif"],
    extraFaqs: [
      {
        question: "Why does converting to AVIF take longer than other formats?",
        answer:
          "AVIF uses the AV1 video codec, which spends much more computation searching for the smallest encoding. This tool runs the AV1 encoder as WebAssembly in your browser, so a large photo can take a few seconds where JPG or WebP takes a fraction of a second.",
      },
    ],
  },
  {
    slug: "/webp-to-avif",
    from: "WebP",
    to: "avif",
    toLabel: "AVIF",
    why: "AVIF usually beats WebP by another 20% or so at matching quality, so it is worth the move for anything you serve at scale.",
    keywords: ["webp to avif", "convert webp to avif"],
    extraFaqs: [
      {
        question: "Do all browsers support AVIF?",
        answer:
          "Current versions of Chrome, Edge, Firefox, and Safari 16 and later display AVIF. If your site needs to support older browsers, serve the AVIF with a WebP or JPG fallback using the HTML picture element, and the browser picks the first format it understands.",
      },
    ],
  },
  {
    slug: "/avif-to-webp",
    from: "AVIF",
    to: "webp",
    toLabel: "WebP",
    why: "WebP is supported by every browser and by plenty of older software that still cannot open AVIF, while staying far smaller than PNG or JPG.",
    keywords: ["avif to webp", "convert avif to webp"],
    extraFaqs: [
      {
        question: "Should I convert AVIF to WebP or to JPG?",
        answer:
          "Pick WebP when the image is going on a website or has transparency: it stays small and every current browser supports it. Pick JPG when the file is going to an older app, a print service, or an email, where WebP support is patchy.",
      },
    ],
  },
];

/**
 * Links each converter to its reverse, its format siblings, and the generic
 * converter, so no conversion page sits on a single inbound link.
 */
function conversionRelated(slug: string, from: string, toLabel: string): string[] {
  const others = CONVERSION_PAGES.filter((page) => page.slug !== slug);
  const reverse = others.find(
    (page) => page.from === toLabel && page.toLabel === from,
  );
  const sameTarget = others.filter(
    (page) => page.toLabel === toLabel && page !== reverse,
  );
  const sameSource = others.filter(
    (page) => page.from === from && page !== reverse,
  );

  const ordered = [
    ...(reverse ? [reverse.slug] : []),
    ...sameSource.map((page) => page.slug),
    ...sameTarget.map((page) => page.slug),
  ];

  return [...new Set(ordered)].slice(0, 5).concat("/convert-image");
}

for (const page of CONVERSION_PAGES) {
  const { slug, from, to, toLabel, why, keywords, extraFaqs } = page;

  TOOLS.push({
    slug,
    engine: "convert",
    preset: { targetFormat: to, sourceLabel: from },
    name: `${from} to ${toLabel}`,
    h1: `Convert ${from} to ${toLabel}`,
    title: `${from} to ${toLabel} Converter: Free, No Upload`,
    description: `Convert ${from} to ${toLabel} in your browser. Batch conversion with quality control, no signup, no watermark, and nothing uploaded.`,
    keywords: [
      ...keywords,
      `${from.toLowerCase()} to ${toLabel.toLowerCase()} online`,
      `free ${from.toLowerCase()} to ${toLabel.toLowerCase()}`,
      `batch ${from.toLowerCase()} to ${toLabel.toLowerCase()}`,
      "convert image without uploading",
    ],
    intro: `Turn ${from} files into ${toLabel} without uploading anything. Drop in one image or a whole folder, adjust the quality, and download the results.`,
    features: [
      `${from} to ${toLabel} at full resolution`,
      "Batch conversion with a single zip download",
      "Quality control for the output file size",
      "Runs fully in the browser, no upload",
      "Free, no signup, no watermark",
    ],
    faqs: [
      {
        question: `Why convert ${from} to ${toLabel}?`,
        answer: why,
      },
      ...(extraFaqs ?? []),
      ...(to === "jpeg"
        ? [
            {
              question: "What happens to transparent areas?",
              answer:
                "JPG cannot store transparency, so transparent pixels are filled with a solid colour. White is used by default and you can choose a different colour before converting.",
            },
          ]
        : []),
      {
        question: `Is there a limit on how many ${from} files I can convert?`,
        answer:
          "No. Because the conversion happens on your own machine there is no server quota to hit. The practical limit is your device's memory, and files are processed one at a time to keep that manageable.",
      },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
    sections: conversionSections(from, toLabel, why),
    related: conversionRelated(slug, from, toLabel),
    primary: false,
  });
}

export const TOOL_SLUGS: string[] = TOOLS.map((tool) => tool.slug);

export const PRIMARY_TOOLS: ToolDefinition[] = TOOLS.filter(
  (tool) => tool.primary
);

export const CONVERTER_TOOLS: ToolDefinition[] = TOOLS.filter(
  (tool) => !tool.primary
);

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

/**
 * Throwing accessor for route files, so a typo in a slug fails the build
 * rather than rendering an empty page.
 */
export function requireTool(slug: string): ToolDefinition {
  const tool = getTool(slug);
  if (!tool) throw new Error(`Unknown image tool slug: ${slug}`);
  return tool;
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related
    .map((slug) => getTool(slug))
    .filter((related): related is ToolDefinition => Boolean(related));
}

export const TOOLS_HUB_PATH = "/tools";
