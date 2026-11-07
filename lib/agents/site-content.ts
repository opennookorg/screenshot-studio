import { claimsNote, comparisons, type ComparisonData } from "@/lib/seo/comparisons";
import { SITE_URL } from "@/lib/seo/metadata";
import { atLeast, PRODUCT_FACTS } from "@/lib/seo/product-facts";
import { TOOLS, TOOLS_HUB_PATH } from "@/lib/seo/tools";

export const BASE_URL = SITE_URL;

export const MARKDOWN_PATH_HEADER = "x-markdown-path";

export interface AgentSection {
  heading: string;
  body: string;
}

export interface AgentPage {
  path: string;
  title: string;
  summary: string;
  points?: string[];
  /** Full page body, so the Markdown alternate carries the same substance as the HTML. */
  sections?: AgentSection[];
}

export const AGENT_PAGES: AgentPage[] = [
  {
    path: "/",
    title: "Screenshot Studio - Free Screenshot Editor & Image Tools",
    summary:
      "Start page. Pick a tool: the screenshot editor, code images, App Store screenshots, or image tools that compress, convert, resize, crop, rotate, and remove backgrounds. All free, no signup, no watermark.",
    points: [
      "Screenshot editor: /editor",
      `Code images, ${PRODUCT_FACTS.codeThemes} themes and ${PRODUCT_FACTS.codeLanguages} languages: /code`,
      "App Store screenshots: /store-screenshots",
      "Image tools: /tools",
    ],
  },
  {
    path: "/editor",
    title: "Screenshot Studio - Free Screenshot Editor & Mockup Maker",
    summary:
      "The Screenshot Studio editor. Drop in a screenshot and add gradient backgrounds, browser mockups, shadows, 3D perspective, and animation, then export a PNG, JPEG, WebP, MP4, WebM, or GIF. Editing runs client side, so imported images are not uploaded to edit them; only export compression sends the finished image to the server, which returns it without storing it. No signup, no watermark, no paid tier.",
    points: [
      `${atLeast(PRODUCT_FACTS.backgrounds)} gradient, mesh, and solid backgrounds`,
      "Safari, Chrome, and Arc browser mockups in light and dark",
      "3D perspective transforms and fully configurable shadows",
      `${PRODUCT_FACTS.animationPresets} animation presets with a keyframe timeline and video export`,
      "Import a tweet by URL and render it as an image",
      `Export up to ${PRODUCT_FACTS.maxExportScale}x resolution`,
    ],
  },
  {
    path: "/landing",
    title: "Screenshot Studio - Product Overview",
    summary:
      "Product landing page: what Screenshot Studio does, who it is for, and how it compares to paid screenshot beautifiers.",
  },
  {
    path: "/free-screenshot-editor",
    title: "Free Screenshot Editor Online - Screenshot Studio",
    summary:
      "Edit screenshots online for free: add text, annotate with arrows and shapes, blur or pixelate details, and save PNG, JPEG, or WebP with no watermark or signup.",
    points: [
      "Open /editor and choose a PNG, JPG, or WebP, or paste an image with Ctrl+V or Cmd+V on a computer.",
      "In Image mode, choose Design, then Add Text or Draw & Markup. On mobile, tap Edit design to find these controls.",
      "Text overlays add new captions and labels; existing words in the screenshot are pixels and cannot be automatically replaced.",
      "Open Save to choose your format and resolution, then export a new file without changing the original.",
      "Imported images are edited in the browser. Export compression sends the finished image to the server without storing it.",
    ],
  },
  {
    path: "/code",
    title: "Code to Image: Beautiful Screenshots - Screenshot Studio",
    summary:
      "A focused code to image editor. Paste code, pick a syntax theme and gradient background, toggle line numbers and a window frame, then export a PNG or copy a shareable link. Rendering happens in the browser, so code is not sent to a server to create the image. No signup, no watermark.",
    points: [
      `${PRODUCT_FACTS.codeThemes} syntax highlighting themes and ${PRODUCT_FACTS.codeLanguages} languages, with auto-detect`,
      "11 gradient backgrounds plus a transparent option",
      `Line numbers, macOS window frame, and ${PRODUCT_FACTS.codeFonts} monospace fonts`,
      "Shareable links that restore the exact design from the URL",
      "2x and 3x PNG export, plus copy image to clipboard",
    ],
  },
  {
    path: "/tweet",
    title: "Tweet to Image: Turn Posts on X into Images - Screenshot Studio",
    summary:
      "A focused tweet to image editor. Paste a link to a public post on X, pick a light or dark card and a gradient or transparent background, then export a PNG or copy it to the clipboard. No signup, no watermark.",
    points: [
      "Loads any public post from an x.com or twitter.com link",
      "Light and dark card styles with up to four photos",
      "Gradient, image, and pattern backgrounds, or a transparent backdrop",
      "2x and 4x PNG export, plus copy image to clipboard",
    ],
  },
  {
    path: "/remove-background",
    title: "Remove Background from Image: Free - Screenshot Studio",
    summary:
      "A standalone background remover. Drop in a PNG, JPG, WebP, or AVIF image and download a transparent PNG at the original resolution. The BiRefNet-lite model runs on the device with WebGPU, falling back to WebAssembly; the weights download once from Hugging Face and are cached, and the image itself is never uploaded. No signup, no watermark.",
    points: [
      "On-device AI background removal, no image upload",
      "WebGPU acceleration with an automatic WebAssembly fallback",
      "Crisp or soft edge styles, switchable without rerunning the model",
      "Before and after comparison slider",
      "PNG, JPG, WebP, and AVIF input up to 50 MB",
    ],
  },
  {
    path: "/compress-video",
    title: "Compress Video Online: Free, No Upload - Screenshot Studio",
    summary:
      "A standalone video compressor. Drop in an MP4, MOV, WebM, or MKV file up to 1 GB, choose a quality level or a target size in MB, and download an MP4 with H.264 video and AAC audio. FFmpeg compiled to WebAssembly does the work inside the browser tab; the engine downloads once from a public CDN and is cached, and the video itself is not uploaded. No signup, no watermark.",
    points: [
      "Four quality levels, from visually identical to smallest file",
      "Target size mode that works out the bitrate to fit a limit such as 10 or 25 MB",
      "Optional downscale to 1080p, 720p, or 480p, never upscaling",
      "Keep, shrink, or remove the audio track",
      "Before and after file sizes with a preview of the result",
    ],
  },
  {
    path: TOOLS_HUB_PATH,
    title: "Free Online Image Tools - Screenshot Studio",
    summary:
      "Index of the standalone image utilities: compress, convert, resize, crop, and rotate, plus six direct format converters. Every tool decodes, processes, and encodes in the browser using Canvas and Web Workers, so images are never uploaded. Batch input is supported and multiple results download as one zip. Free, no signup, no watermark.",
    points: [
      "Compress: four levels, live before and after file sizes",
      "Convert: PNG, JPG, and WebP in every direction",
      "Resize: exact pixels, percentage, or templates such as passport photos and social sizes, with an optional maximum file size",
      "Crop: drag a selection, type exact pixels, or draw a freehand shape for a transparent cutout",
      "Rotate and flip: quarter turns plus horizontal and vertical mirroring",
    ],
  },
  {
    path: "/features",
    title: "Features - Screenshot Studio",
    summary:
      "Index of every Screenshot Studio feature: backgrounds, browser mockups, device frames, 3D effects, animation, text and image overlays, and export formats.",
  },
  {
    path: "/features/screenshot-beautifier",
    title: "Screenshot Beautifier - Screenshot Studio",
    summary:
      "Background, padding, corner radius, and shadow controls that turn a raw screenshot into a presentable graphic.",
  },
  {
    path: "/features/social-media-graphics",
    title: "Social Media Graphics Maker - Screenshot Studio",
    summary:
      "Aspect ratio presets and styling for X/Twitter, Instagram, LinkedIn, and Product Hunt images.",
  },
  {
    path: "/features/animation-maker",
    title: "Animation Maker - Screenshot Studio",
    summary:
      `Keyframe timeline, ${PRODUCT_FACTS.animationPresets} animation presets, multi-slide slideshows, and in-browser MP4, WebM, and GIF encoding via FFmpeg WASM.`,
  },
  {
    path: "/features/3d-effects",
    title: "3D Effects - Screenshot Studio",
    summary:
      "Perspective transforms, tilt, depth, and shadow controls for pseudo-3D product shots.",
  },
  {
    path: "/features/browser-mockups",
    title: "Browser Mockups - Screenshot Studio",
    summary:
      "Safari, Chrome, and Arc browser frames plus macOS window chrome, with editable URL bar text.",
  },
  {
    path: "/features/code-snippets",
    title: "Code to Image Generator: Free - Screenshot Studio",
    summary:
      "Marketing overview of the code to image tool: syntax themes, gradient backgrounds, line numbers, window frame, and shareable links, positioned as a free ray.so and carbon.now.sh alternative.",
  },
  {
    path: "/for/developers",
    title: "Screenshot Studio for Developers",
    summary:
      "Ship README, changelog, and docs screenshots that look designed, plus a standalone code to image tool at /code.",
  },
  {
    path: "/for/marketers",
    title: "Screenshot Studio for Marketers",
    summary:
      "Launch graphics, ad creative, and social posts built from product screenshots.",
  },
  {
    path: "/for/designers",
    title: "Screenshot Studio for Designers",
    summary:
      "Present work with mockups, framing, and animation without leaving the browser.",
  },
  {
    path: "/docs",
    title: "Screenshot Studio API Documentation",
    summary:
      "Public HTTP API reference: endpoints, request and response schemas, rate limits, and error codes. The machine-readable contract is published at /openapi.json.",
    points: [
      "POST /api/screenshot - capture a live URL as a base64 PNG",
      "POST /api/export - recompress an image as PNG, JPEG, or WebP",
      "GET /api/tweet/{id} - fetch tweet JSON for tweet-to-image rendering",
      "GET /api/image-proxy - same-origin proxy for Twitter media",
      "OpenAPI 3.1 spec: /openapi.json",
    ],
  },
  {
    path: "/docs/authentication",
    title: "Screenshot Studio API Authentication",
    summary:
      "The public Screenshot Studio API needs no API key, token, or account. Requests are anonymous and shaped by per-IP rate limits instead of credentials.",
    points: [
      "No API key or Authorization header is required",
      "POST /api/screenshot is limited to 20 requests per minute per IP",
      "Rate-limited responses return HTTP 429 with Retry-After and X-RateLimit-* headers",
      "Only maintenance endpoints are credentialed, and they are not part of the public surface",
    ],
  },
  {
    path: "/developers",
    title: "Screenshot Studio Developer Portal",
    summary:
      "Developer entry point: API docs, OpenAPI spec, authentication and rate limits, quickstart requests, agent files, and the open-source repository.",
    points: [
      "API docs: /docs",
      "OpenAPI 3.1 spec: /openapi.json",
      "Authentication and rate limits: /docs/authentication",
      "Agent overview: /llms.txt and /llms-full.txt",
      "Source: https://github.com/opennookorg/screenshot-studio",
    ],
  },
  {
    path: "/changelog",
    title: "Changelog - Screenshot Studio",
    summary: "Release notes and shipped changes, newest first.",
  },
  {
    path: "/about",
    title: "About Screenshot Studio",
    summary:
      "Why Screenshot Studio exists, what it offers, and how the open-source project is run.",
  },
  {
    path: "/contact",
    title: "Contact Screenshot Studio",
    summary:
      "Ways to reach the maintainers: GitHub issues, X/Twitter, and email.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy - Screenshot Studio",
    summary:
      "How data is handled. Image editing is entirely client side and no image is uploaded to a server.",
  },
  {
    path: "/terms",
    title: "Terms & Conditions - Screenshot Studio",
    summary: "Terms of use for Screenshot Studio.",
  },
];

function cell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function renderFaqSection(
  faqs: { question: string; answer: string }[],
): AgentSection {
  return {
    heading: "FAQ",
    body: faqs
      .map((faq) => `### ${faq.question}\n\n${faq.answer}`)
      .join("\n\n"),
  };
}

function comparisonSections(comparison: ComparisonData): AgentSection[] {
  return [
    ...(comparison.scopeNote
      ? [{ heading: "These tools do different jobs", body: comparison.scopeNote }]
      : []),
    {
      heading: `${comparison.competitorName} pricing`,
      body: `${comparison.competitorPricing}

${claimsNote(comparison)}`,
    },
    {
      heading: `Where ${comparison.competitorName} falls short`,
      body: comparison.competitorLimitations
        .map((limitation) => `- ${limitation}`)
        .join("\n"),
    },
    {
      heading: "What Screenshot Studio does differently",
      body: comparison.studioAdvantages
        .map((advantage) => `- ${advantage}`)
        .join("\n"),
    },
    {
      heading: "Feature comparison",
      body: [
        `| Feature | Screenshot Studio | ${cell(comparison.competitorName)} |`,
        "| --- | --- | --- |",
        ...comparison.features.map(
          (feature) =>
            `| ${cell(feature.name)} | ${cell(feature.studio)} | ${cell(feature.competitor)} |`,
        ),
      ].join("\n"),
    },
    { heading: "Verdict", body: comparison.verdict },
    renderFaqSection(
      comparison.faqs.map((faq) => ({ question: faq.q, answer: faq.a })),
    ),
  ];
}

/**
 * One agent page per comparison and per image tool, generated from the same
 * registries that drive the routes and the sitemap so they can never drift apart.
 */
for (const comparison of comparisons) {
  AGENT_PAGES.push({
    path: `/compare/${comparison.slug}`,
    title: comparison.metaTitle,
    summary: `${comparison.tagline} ${comparison.metaDescription}`,
    sections: comparisonSections(comparison),
  });
}

for (const tool of TOOLS) {
  AGENT_PAGES.push({
    path: tool.slug,
    title: `${tool.title} - Screenshot Studio`,
    summary: `${tool.intro} Runs entirely in the browser: the image is decoded, processed, and re-encoded locally and never uploaded. Free, no signup, no watermark.`,
    points: tool.features,
    sections: [...(tool.sections ?? []), renderFaqSection(tool.faqs)],
  });
}

export const AGENT_RESOURCES = [
  { name: "API documentation", url: `${BASE_URL}/docs` },
  { name: "Developer portal", url: `${BASE_URL}/developers` },
  { name: "OpenAPI specification", url: `${BASE_URL}/openapi.json` },
  {
    name: "Authentication and rate limits",
    url: `${BASE_URL}/docs/authentication`,
  },
  { name: "llms.txt", url: `${BASE_URL}/llms.txt` },
  { name: "llms-full.txt", url: `${BASE_URL}/llms-full.txt` },
  { name: "Sitemap", url: `${BASE_URL}/sitemap.xml` },
  { name: "robots.txt", url: `${BASE_URL}/robots.txt` },
];

const LOCALE_PREFIX = /^\/(?:es|fr|de|ja|pt|ko|zh)(?=\/|$)/;

export function normalizeAgentPath(pathname: string): string {
  const withoutLocale = pathname.replace(LOCALE_PREFIX, "");
  const trimmed = withoutLocale.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function findAgentPage(pathname: string): AgentPage | undefined {
  const normalized = normalizeAgentPath(pathname);
  return AGENT_PAGES.find((page) => page.path === normalized);
}

export function renderAgentPageMarkdown(page: AgentPage): string {
  const lines = [`# ${page.title}`, "", page.summary];

  if (page.points?.length) {
    lines.push("", ...page.points.map((point) => `- ${point}`));
  }

  for (const section of page.sections ?? []) {
    lines.push("", `## ${section.heading}`, "", section.body);
  }

  lines.push(
    "",
    "## Canonical URL",
    "",
    `${BASE_URL}${page.path === "/" ? "/" : page.path}`,
    "",
    "## Machine-readable resources",
    "",
    ...AGENT_RESOURCES.map(
      (resource) => `- [${resource.name}](${resource.url})`,
    ),
  );

  return `${lines.join("\n")}\n`;
}

export function renderNotFoundMarkdown(pathname: string): string {
  return [
    "# 404 Not Found",
    "",
    `No page exists at \`${pathname}\` on Screenshot Studio.`,
    "",
    "## Where to look next",
    "",
    ...AGENT_RESOURCES.map(
      (resource) => `- [${resource.name}](${resource.url})`,
    ),
    "",
    "## Main pages",
    "",
    ...AGENT_PAGES.slice(0, 12).map(
      (page) => `- [${page.title}](${BASE_URL}${page.path})`,
    ),
    "",
  ].join("\n");
}

export function renderNotAcceptableMarkdown(accept: string): string {
  return [
    "# 406 Not Acceptable",
    "",
    `This URL cannot be represented as \`${accept}\`.`,
    "",
    "## Supported representations",
    "",
    "- `text/html` (default)",
    "- `text/markdown` (send `Accept: text/markdown`)",
    "",
    `Machine-readable index: ${BASE_URL}/llms.txt`,
    "",
  ].join("\n");
}
