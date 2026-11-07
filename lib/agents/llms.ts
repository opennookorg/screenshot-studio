import { BASE_URL } from "@/lib/agents/site-content";
import { comparisons } from "@/lib/seo/comparisons";
import { guides } from "@/lib/seo/guides";
import { atLeast, PRODUCT_FACTS } from "@/lib/seo/product-facts";
import { CONVERTER_TOOLS, PRIMARY_TOOLS } from "@/lib/seo/tools";

const converterLinks = CONVERTER_TOOLS.map(
  (tool) => `${BASE_URL}${tool.slug}`,
).join(", ");

const primaryToolLines = PRIMARY_TOOLS.map(
  (tool) => `- ${tool.name}: ${BASE_URL}${tool.slug}`,
).join("\n");

const comparisonLines = comparisons
  .map((comparison) => `- vs ${comparison.competitorName}: ${BASE_URL}/compare/${comparison.slug}`)
  .join("\n");

const guideLines = guides
  .map((guide) => `- ${guide.title}: ${BASE_URL}/guides/${guide.slug}`)
  .join("\n");

const comparisonRows = comparisons
  .map(
    (comparison) =>
      `| vs ${comparison.competitorName} | ${BASE_URL}/compare/${comparison.slug} | Feature comparison with ${comparison.competitorName} |`,
  )
  .join("\n");

const guideRows = guides
  .map(
    (guide) =>
      `| ${guide.title} | ${BASE_URL}/guides/${guide.slug} | ${guide.kind === "roundup" ? "Dated roundup with prices and limits" : "Step-by-step how-to"} |`,
  )
  .join("\n");

export const llmsTxt = `# Screenshot Studio

> Free, open-source browser-based screenshot editor. Transform plain screenshots into professional graphics with backgrounds, browser mockups, 3D effects, animations, and video export. No signup, no watermarks.

## Overview

Screenshot Studio is a client-side image editor: imported images are not uploaded to edit them, and only export compression round-trips the finished image through the server without storing it. It is the best free alternative to Pika Style, Shots.so, and CleanShot X.

## Key Features

- ${atLeast(PRODUCT_FACTS.backgrounds)} gradient, mesh, and solid backgrounds
- Safari and Chrome browser mockups (light and dark)
- Device frames: Arc, Polaroid, glass, outline, border
- 3D perspective transforms and shadow effects
- ${PRODUCT_FACTS.animationPresets} animation presets with keyframe timeline editor
- Video export in MP4, WebM, and GIF
- Text and image overlays with ${PRODUCT_FACTS.fonts} Google Fonts
- Tweet-to-image and code-snippet-to-image capture
- On-device AI background remover with full-resolution transparent PNG output (${BASE_URL}/remove-background)
- In-browser video compressor with quality levels or a target size in MB, MP4 output (${BASE_URL}/compress-video)
- High-resolution export up to ${PRODUCT_FACTS.maxExportScale}x scale (PNG, JPEG, WebP)
- One-click professional styling presets
- Aspect ratio presets for every social platform

## Standalone Image Tools

Single-purpose utilities that run entirely in the browser (Canvas plus Web Workers) and do not call any API. Batch input is supported; several results download as one zip.

${primaryToolLines}
- Converters: ${converterLinks}

## Pages

- Start (choose a tool): ${BASE_URL}/
- Screenshot Editor: ${BASE_URL}/editor
- Product overview: ${BASE_URL}/landing
- Free Screenshot Editor: ${BASE_URL}/free-screenshot-editor
- App Store Screenshot Maker: ${BASE_URL}/store-screenshots
- Code to Image: ${BASE_URL}/code
- Mockup Generator: ${BASE_URL}/mockup-generator
- Image Tools Hub: ${BASE_URL}/tools
- Remove Background: ${BASE_URL}/remove-background
- Compress Video: ${BASE_URL}/compress-video
- Features: ${BASE_URL}/features
- Screenshot Beautifier: ${BASE_URL}/features/screenshot-beautifier
- Social Media Graphics: ${BASE_URL}/features/social-media-graphics
- Animation Maker: ${BASE_URL}/features/animation-maker
- 3D Effects: ${BASE_URL}/features/3d-effects
- Browser Mockups: ${BASE_URL}/features/browser-mockups
- Code Snippet Images: ${BASE_URL}/features/code-snippets
- Audience Hub: ${BASE_URL}/for
- For Developers: ${BASE_URL}/for/developers
- For Marketers: ${BASE_URL}/for/marketers
- For Designers: ${BASE_URL}/for/designers
- Comparison Hub: ${BASE_URL}/compare
- Guides Hub: ${BASE_URL}/guides
- Changelog: ${BASE_URL}/changelog
- About: ${BASE_URL}/about
- Contact: ${BASE_URL}/contact
- Privacy Policy: ${BASE_URL}/privacy-policy
- Terms & Conditions: ${BASE_URL}/terms

## Developer Resources

- API Documentation: ${BASE_URL}/docs
- Developer Portal: ${BASE_URL}/developers
- OpenAPI Specification (OpenAPI 3.1, JSON): ${BASE_URL}/openapi.json
- API Authentication and Rate Limits: ${BASE_URL}/docs/authentication
- llms.txt: ${BASE_URL}/llms.txt
- llms-full.txt: ${BASE_URL}/llms-full.txt
- Sitemap: ${BASE_URL}/sitemap.xml
- robots.txt: ${BASE_URL}/robots.txt
- Source code: https://github.com/opennookorg/screenshot-studio

The Screenshot Studio API is public and needs no API key, token, or account. Every error is JSON with a stable \`code\`, a \`message\`, and a \`hint\`. Any page also serves Markdown when the request sends \`Accept: text/markdown\`.

No official CLI tool and no MCP server are published yet. Use the HTTP API described at ${BASE_URL}/docs.

## Internationalization

Available in 8 languages: English (default), Spanish (/es), French (/fr), German (/de), Japanese (/ja), Portuguese (/pt), Korean (/ko), Chinese (/zh).

## Comparison Pages

${comparisonLines}

## Guides

${guideLines}

## Pricing

100% free. No signup, no watermarks, no hidden costs, no premium tier. Unlimited exports with full feature access.

## Technology

Next.js 16, React 19, TypeScript, HTML Canvas, Tailwind CSS, Zustand, FFmpeg WASM for video encoding, Cloudflare R2 for assets.

## Use Cases

- Social media graphics (Twitter/X, Instagram, LinkedIn, Product Hunt)
- SaaS product screenshots for landing pages and documentation
- Developer portfolio and project showcase images
- Marketing presentations and pitch decks
- Animated slideshows and video content

## Target Audience

Developers, designers, marketers, indie hackers, content creators, and anyone who needs professional visuals without design skills.

## Contact

- Website: ${BASE_URL}
- Twitter/X: https://x.com/screenshotstdio
- GitHub: https://github.com/opennookorg/screenshot-studio
- Email: kartik.labhshetwar@gmail.com

## Full Documentation

For the complete, detailed version of this document, see: ${BASE_URL}/llms-full.txt
`;

export const llmsFullTxt = `# Screenshot Studio - Complete Reference

> Free, open-source browser-based screenshot editor. Transform plain screenshots into professional graphics with backgrounds, browser mockups, 3D effects, animations, and video export. No signup, no watermarks.

## What is Screenshot Studio?

Screenshot Studio is a free, browser-based screenshot editor that transforms plain screenshots into professional-quality graphics. Editing runs in the browser, so imported images are not uploaded to edit them; export compression round-trips the finished image through the server without storing it. It is open source and available at https://github.com/opennookorg/screenshot-studio.

Built as a free alternative to paid tools like Pika Style, Shots.so, and CleanShot X, Screenshot Studio is used by developers, marketers, and designers to create polished images for social media, landing pages, documentation, and presentations.

## Complete Feature List

### Backgrounds
- ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds (linear, radial, mesh, conic, solid)
- Solid color backgrounds with custom color picker
- Paper texture backgrounds
- Pattern backgrounds
- Custom image backgrounds
- Transparent background support

### Browser Mockups
- Safari browser frame (light and dark mode)
- Chrome browser frame (light and dark mode)
- Arc browser frame
- Minimal window frame
- Custom URL bar text

### Device Frames
- macOS window chrome
- Polaroid-style frame
- Glass morphism frame
- Outline frame
- Border frame with customizable radius

### 3D Effects
- Perspective transforms (X, Y, Z rotation)
- Tilt effects
- Depth-of-field simulation
- Custom shadow with blur, spread, offset, and color

### Standalone Image Tools
- Compress: light, balanced, strong, and extreme levels
- Convert: PNG, JPG, and WebP, with a chosen background behind transparency
- Resize: by exact pixels or percentage, with stepped downscaling, or a template for passport photos, social media, print, and screens
- Resize extras: editable template sizes, a movable and zoomable crop for each image, and an optional maximum file size
- Crop: drag or type, with 1:1, 16:9, 4:3, 3:2, and 9:16 presets
- Crop freehand: draw any shape for a transparent cutout, split the image with a line, and erase leftovers with a brush
- Rotate and flip: 90, 180, 270 degrees plus mirroring
- Batch input for every tool except crop, downloaded as a zip
- All of it runs in the browser and calls no API

### Image Editing
- Resize and scale
- Opacity control
- Border radius (0 to fully rounded)
- Padding and inset controls
- Shadow with full customization
- Position and alignment

### Text Overlays
- Multiple text layers
- ${PRODUCT_FACTS.fonts} Google Fonts across sans-serif, serif, display, handwriting, and monospace
- Custom font size, weight, color
- Text shadow and positioning
- Letter spacing and line height

### Animation & Video
- ${PRODUCT_FACTS.animationPresets} animation presets (zoom in/out, pan, Ken Burns, tilt, fade, bounce, slide, etc.)
- Keyframe timeline editor
- Multi-slide slideshows
- Video export: MP4, WebM, GIF
- Custom duration and easing per animation
- FFmpeg WASM-based encoding (runs in browser)

### Import
- Drag and drop images
- Paste from clipboard
- Import tweets by URL (renders as image)
- Import code snippets (syntax highlighted)

### Export
- PNG (lossless, up to ${PRODUCT_FACTS.maxExportScale}x resolution)
- JPEG (configurable quality)
- WebP (configurable quality)
- MP4 video
- WebM video
- GIF animation
- Copy to clipboard
- Scale: 1x, 2x, 3x, 4x, 5x

### Templates & Presets
- One-click professional styling presets
- Aspect ratio presets: Auto, 1:1, 4:3, 16:9, 9:16, 4:5, 2:3, 3:2, 21:9
- Social platform presets (Twitter, Instagram, LinkedIn, etc.)

## All Pages

### Core
| Page | URL | Description |
|------|-----|-------------|
| Start | ${BASE_URL}/ | Choose the screenshot editor, code images, App Store screenshots, or image tools |
| Screenshot Editor | ${BASE_URL}/editor | Main canvas editor for creating designs |
| Landing | ${BASE_URL}/landing | Product landing page with overview |
| Free Screenshot Editor | ${BASE_URL}/free-screenshot-editor | SEO landing page for free editor |
| Mockup Generator | ${BASE_URL}/mockup-generator | iPhone, MacBook, and Apple Watch mockups with 3D angles and multi-device layouts |
| Image Tools Hub | ${BASE_URL}/tools | Index of the standalone image utilities |
| Remove Background | ${BASE_URL}/remove-background | On-device AI background remover that exports a transparent PNG |
| Compress Video | ${BASE_URL}/compress-video | FFmpeg WebAssembly video compressor: quality levels or a target size in MB, MP4 output |

### Image Tools
Standalone, single-purpose utilities. Each decodes, processes, and re-encodes the image locally with Canvas and a Web Worker, and calls no API. Batch input downloads as one zip.

| Page | URL | Description |
|------|-----|-------------|
| Compress Image | ${BASE_URL}/compress-image | Four compression levels with before and after sizes |
| Convert Image | ${BASE_URL}/convert-image | PNG, JPG, and WebP in every direction |
| Resize Image | ${BASE_URL}/resize-image | Exact pixels, percentage, or templates such as passport photos and social sizes, with an optional maximum file size |
| Crop Image | ${BASE_URL}/crop-image | Drag a selection, type pixels, or draw a freehand shape for a transparent cutout |
| Rotate Image | ${BASE_URL}/rotate-image | Quarter turns plus horizontal and vertical flips |
| PNG to JPG | ${BASE_URL}/png-to-jpg | Direct converter with a background colour for transparency |
| JPG to PNG | ${BASE_URL}/jpg-to-png | Direct converter to a lossless format |
| PNG to WebP | ${BASE_URL}/png-to-webp | Direct converter that keeps transparency |
| WebP to PNG | ${BASE_URL}/webp-to-png | Direct converter for tools that cannot read WebP |
| JPG to WebP | ${BASE_URL}/jpg-to-webp | Direct converter for smaller web images |
| WebP to JPG | ${BASE_URL}/webp-to-jpg | Direct converter for maximum compatibility |

### Features
| Page | URL | Description |
|------|-----|-------------|
| Features Hub | ${BASE_URL}/features | All features overview |
| Screenshot Beautifier | ${BASE_URL}/features/screenshot-beautifier | Background and styling features |
| Social Media Graphics | ${BASE_URL}/features/social-media-graphics | Social platform image creation |
| Animation Maker | ${BASE_URL}/features/animation-maker | Animation timeline and video export |
| 3D Effects | ${BASE_URL}/features/3d-effects | Perspective and depth effects |
| Browser Mockups | ${BASE_URL}/features/browser-mockups | Safari, Chrome, Arc frames |
| Background Remover | ${BASE_URL}/remove-background | On-device AI background removal |

### Audience Pages
| Page | URL | Description |
|------|-----|-------------|
| For Developers | ${BASE_URL}/for/developers | Developer-focused use cases |
| For Marketers | ${BASE_URL}/for/marketers | Marketing-focused use cases |
| For Designers | ${BASE_URL}/for/designers | Design-focused use cases |

### Comparison Pages
| Page | URL | Description |
|------|-----|-------------|
${comparisonRows}

### Guides
| Page | URL | Description |
|------|-----|-------------|
| Guides Hub | ${BASE_URL}/guides | Index of how-to guides and tool roundups |
${guideRows}

### Company
| Page | URL | Description |
|------|-----|-------------|
| About | ${BASE_URL}/about | About the project and team |
| Contact | ${BASE_URL}/contact | Ways to reach us |
| Privacy Policy | ${BASE_URL}/privacy-policy | How we handle data |
| Terms & Conditions | ${BASE_URL}/terms | Usage terms |
| Changelog | ${BASE_URL}/changelog | Release notes and updates |

## Internationalization

Screenshot Studio is available in 8 languages with subpath routing:

| Language | Prefix | Example |
|----------|--------|---------|
| English (default) | / | ${BASE_URL}/about |
| Spanish | /es | ${BASE_URL}/es/about |
| French | /fr | ${BASE_URL}/fr/about |
| German | /de | ${BASE_URL}/de/about |
| Japanese | /ja | ${BASE_URL}/ja/about |
| Portuguese | /pt | ${BASE_URL}/pt/about |
| Korean | /ko | ${BASE_URL}/ko/about |
| Chinese | /zh | ${BASE_URL}/zh/about |

Locale detection: URL path > cookie > Accept-Language header > default (English).

## Developer and API Reference

### Discovery

| Resource | URL | Format |
|----------|-----|--------|
| API Documentation | ${BASE_URL}/docs | HTML |
| Developer Portal | ${BASE_URL}/developers | HTML |
| OpenAPI Specification | ${BASE_URL}/openapi.json | OpenAPI 3.1 JSON |
| API Authentication and Rate Limits | ${BASE_URL}/docs/authentication | HTML |
| llms.txt | ${BASE_URL}/llms.txt | Markdown |
| llms-full.txt | ${BASE_URL}/llms-full.txt | Markdown |
| Sitemap | ${BASE_URL}/sitemap.xml | XML |
| robots.txt | ${BASE_URL}/robots.txt | text |

### Authentication

The public API needs no API key, token, or account. Requests are anonymous. Access is shaped by per-IP rate limits rather than credentials: \`POST /api/screenshot\` allows 20 requests per minute per IP and answers 429 with \`Retry-After\` and \`X-RateLimit-*\` headers.

### Endpoints

| Operation ID | Method | Path | Description |
|--------------|--------|------|-------------|
| captureScreenshot | POST | /api/screenshot | Capture a live URL as a base64 PNG |
| optimizeExportImage | POST | /api/export | Recompress an image as PNG, JPEG, or WebP |
| getTweet | GET | /api/tweet/{id} | Fetch a tweet payload by status ID |
| proxyTwitterImage | GET | /api/image-proxy | Same-origin proxy for Twitter media |
| getOpenApiSpec | GET | /openapi.json | This API's OpenAPI 3.1 document |
| getLlmsTxt | GET | /llms.txt | Markdown site overview |
| getLlmsFullTxt | GET | /llms-full.txt | Full Markdown reference |

### Error format

Every failing request returns JSON:

\`\`\`json
{
  "error": "URL is required",
  "code": "invalid_request",
  "message": "URL is required",
  "hint": "Send a JSON body with a url string.",
  "status": 400,
  "documentation": "${BASE_URL}/docs#errors"
}
\`\`\`

\`code\` is stable and safe to branch on. \`error\` and \`message\` carry the same human-readable text.

### Markdown content negotiation

Every page URL serves Markdown when the request prefers it:

\`\`\`
curl -H "Accept: text/markdown" ${BASE_URL}/
\`\`\`

Responses set \`Content-Type: text/markdown; charset=utf-8\` and \`Vary: Accept, Accept-Encoding\`. A request that accepts neither \`text/html\` nor \`text/markdown\` is answered with 406. Unknown paths return 404 with a Markdown body listing where to look next.

### CLI and MCP

No official CLI tool and no MCP server are published yet. Agents should use the HTTP API above.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS, Radix UI primitives
- **State**: Zustand with temporal (undo/redo)
- **Canvas**: HTML Canvas with modern-screenshot for rendering
- **Video**: FFmpeg WASM for browser-based encoding
- **Assets**: Cloudflare R2
- **i18n**: next-intl with 8 locales
- **TypeScript**: Full type safety throughout

## Pricing

100% free forever. No signup required, no watermarks, no premium tier, no hidden costs. Every feature is available to every user with unlimited exports.

## Privacy

All image processing happens in the browser. No images are uploaded to any server. The only data collected is basic analytics (page views, feature usage) via privacy-respecting analytics. No cookies for advertising or tracking.

## Use Cases

1. **Social Media Graphics**: Create eye-catching images for Twitter/X, Instagram, LinkedIn, and Product Hunt launches
2. **SaaS Screenshots**: Beautify product screenshots for landing pages, documentation, and app stores
3. **Developer Portfolios**: Showcase projects with professional-looking screenshots
4. **Marketing Materials**: Create graphics for presentations, pitch decks, and ads
5. **Documentation**: Add polished screenshots to docs and READMEs
6. **Animated Content**: Create animated slideshows and export as video

## Contact & Links

- **Website**: ${BASE_URL}
- **GitHub**: https://github.com/opennookorg/screenshot-studio
- **Twitter/X**: https://x.com/screenshotstdio
- **Email**: kartik.labhshetwar@gmail.com
- **Bug Reports**: https://github.com/opennookorg/screenshot-studio/issues
- **Feature Requests**: https://github.com/opennookorg/screenshot-studio/issues/new?labels=enhancement
`;
