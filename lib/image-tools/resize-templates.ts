/**
 * Ready-made output sizes for the resize tool, grouped by what people need them
 * for. Pure data and lookups, safe to unit test.
 *
 * Physical sizes are stored through mm() and inches() so the pixel numbers can
 * be checked against the size printed on the form or the paper box.
 */

import type { RasterFormat } from "./types";

/** Resolution that physical sizes are converted at. */
export const PRINT_DPI = 300;

const inches = (value: number): number => Math.round(value * PRINT_DPI);
const mm = (value: number): number => inches(value / 25.4);

export interface ResizeTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  /** The physical size or spec behind the pixels. */
  detail?: string;
  /** Extra words people search for that the name does not contain. */
  keywords?: string;
}

export interface ResizeTemplateGroup {
  id: string;
  label: string;
  /** Shown while one of this group's templates is selected. */
  hint?: string;
  /** Output format, for destinations that are picky about it. */
  format?: RasterFormat;
  templates: ResizeTemplate[];
}

export interface ResizeTemplateSelection {
  template: ResizeTemplate;
  group: ResizeTemplateGroup;
}

export const RESIZE_TEMPLATE_GROUPS: ResizeTemplateGroup[] = [
  {
    id: "passport",
    label: "Passport & ID photos",
    hint: "This sets the size only. Background and head-size rules still apply, and they change, so check the official site before you submit.",
    // Application portals commonly ask for JPEG and can refuse a PNG.
    format: "jpeg",
    templates: [
      {
        id: "passport-us",
        name: "US passport",
        width: inches(2),
        height: inches(2),
        detail: "2 × 2 in (51 × 51 mm)",
        keywords: "america usa visa",
      },
      {
        id: "passport-35x45",
        name: "35 × 45 mm photo",
        width: mm(35),
        height: mm(45),
        detail: "UK, Schengen and many other countries",
        keywords: "passport europe eu visa exam form 3.5 4.5 cm",
      },
      {
        id: "passport-uk-digital",
        name: "UK passport, online",
        width: 600,
        height: 750,
        detail: "Online application upload",
        keywords: "britain digital",
      },
      {
        id: "passport-india",
        name: "India Passport Seva",
        width: 630,
        height: 810,
        detail: "Online upload, 3.5 × 4.5 cm",
        keywords: "indian digital",
      },
      {
        id: "passport-canada",
        name: "Canada passport",
        width: mm(50),
        height: mm(70),
        detail: "50 × 70 mm",
      },
      {
        id: "visa-china",
        name: "China visa",
        width: mm(33),
        height: mm(48),
        detail: "33 × 48 mm",
        keywords: "passport",
      },
    ],
  },
  {
    id: "social",
    label: "Social media",
    templates: [
      { id: "instagram-square", name: "Instagram square post", width: 1080, height: 1080 },
      { id: "instagram-portrait", name: "Instagram portrait post", width: 1080, height: 1350 },
      {
        id: "instagram-story",
        name: "Instagram story or reel",
        width: 1080,
        height: 1920,
        keywords: "tiktok vertical",
      },
      { id: "instagram-profile", name: "Instagram profile photo", width: 320, height: 320, keywords: "dp avatar" },
      { id: "youtube-thumbnail", name: "YouTube thumbnail", width: 1280, height: 720 },
      { id: "youtube-banner", name: "YouTube channel banner", width: 2560, height: 1440, keywords: "cover art" },
      { id: "facebook-cover", name: "Facebook cover", width: 851, height: 315 },
      { id: "facebook-link", name: "Facebook link image", width: 1200, height: 630, keywords: "post share" },
      { id: "linkedin-post", name: "LinkedIn post", width: 1200, height: 627 },
      { id: "linkedin-banner", name: "LinkedIn banner", width: 1584, height: 396, keywords: "cover" },
      { id: "x-post", name: "X post", width: 1600, height: 900, keywords: "twitter" },
      { id: "x-header", name: "X header", width: 1500, height: 500, keywords: "twitter banner cover" },
      { id: "pinterest-pin", name: "Pinterest pin", width: 1000, height: 1500 },
      { id: "whatsapp-profile", name: "WhatsApp profile photo", width: 500, height: 500, keywords: "dp avatar" },
    ],
  },
  {
    id: "print",
    label: "Print",
    hint: `Sized for printing at ${PRINT_DPI} DPI. Choose the paper size in your print dialog.`,
    templates: [
      { id: "print-a4", name: "A4", width: mm(210), height: mm(297), detail: "210 × 297 mm", keywords: "paper document" },
      { id: "print-a5", name: "A5", width: mm(148), height: mm(210), detail: "148 × 210 mm", keywords: "paper flyer" },
      { id: "print-letter", name: "US Letter", width: inches(8.5), height: inches(11), detail: "8.5 × 11 in", keywords: "paper document" },
      { id: "print-4x6", name: "4 × 6 in photo", width: inches(4), height: inches(6), detail: "10 × 15 cm", keywords: "postcard" },
      { id: "print-5x7", name: "5 × 7 in photo", width: inches(5), height: inches(7), detail: "13 × 18 cm" },
      { id: "print-8x10", name: "8 × 10 in photo", width: inches(8), height: inches(10), detail: "20 × 25 cm", keywords: "frame" },
    ],
  },
  {
    id: "web",
    label: "Web & screens",
    templates: [
      { id: "web-hd", name: "HD", width: 1280, height: 720, detail: "720p" },
      { id: "web-full-hd", name: "Full HD", width: 1920, height: 1080, detail: "1080p", keywords: "wallpaper desktop" },
      { id: "web-4k", name: "4K", width: 3840, height: 2160, detail: "Ultra HD", keywords: "wallpaper desktop" },
      { id: "web-link-preview", name: "Blog or link preview", width: 1200, height: 630, keywords: "open graph og article" },
      { id: "web-product", name: "Product photo", width: 2000, height: 2000, keywords: "shop store ecommerce square" },
    ],
  },
];

export function findResizeTemplate(id: string | null): ResizeTemplateSelection | null {
  for (const group of RESIZE_TEMPLATE_GROUPS) {
    const template = group.templates.find((entry) => entry.id === id);
    if (template) return { template, group };
  }
  return null;
}

/**
 * Filters the groups down to the templates matching every word of the query,
 * so "passport india" and "india passport" both land on the same result. Empty
 * groups are dropped.
 */
export function searchResizeTemplates(query: string): ResizeTemplateGroup[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return RESIZE_TEMPLATE_GROUPS;

  return RESIZE_TEMPLATE_GROUPS.map((group) => ({
    ...group,
    templates: group.templates.filter((template) => {
      const searchable = [
        group.label,
        template.name,
        template.detail,
        template.keywords,
        `${template.width}x${template.height}`,
      ]
        .join(" ")
        .toLowerCase();
      return words.every((word) => searchable.includes(word));
    }),
  })).filter((group) => group.templates.length > 0);
}
