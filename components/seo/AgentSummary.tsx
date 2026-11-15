import Link from "next/link";
import { comparisons } from "@/lib/seo/comparisons";
import {
  EXPORT_FORMATS_SENTENCE,
  FRAMES_SENTENCE,
  PRODUCT_FACTS,
  atLeast,
} from "@/lib/seo/product-facts";
import { CONVERTER_TOOLS, PRIMARY_TOOLS, TOOLS_HUB_PATH } from "@/lib/seo/tools";

const FEATURES = [
  `${atLeast(PRODUCT_FACTS.backgrounds)} gradient, mesh, and solid backgrounds`,
  "Safari and Chrome browser mockups in light and dark mode",
  `Arc, macOS, and Windows window frames plus Polaroid, glass, outline, and border image frames`,
  "3D perspective transforms with fully configurable shadows",
  `${atLeast(PRODUCT_FACTS.animationPresets)} animation presets driven by a keyframe timeline editor`,
  "Video export to MP4, WebM, and GIF, encoded in the browser with FFmpeg WASM",
  `Text and image overlays with ${PRODUCT_FACTS.fonts} Google Fonts`,
  `Tweet-to-image and code-snippet capture with ${PRODUCT_FACTS.codeThemes} syntax themes`,
  `High-resolution PNG, JPEG, and WebP export up to ${PRODUCT_FACTS.maxExportScale}x scale`,
  `${PRODUCT_FACTS.deviceMockups} iPhone, MacBook, and Apple Watch device mockups`,
];

const FEATURE_PAGES = [
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/auto-beautify", label: "Auto beautify" },
  { href: "/features/browser-mockups", label: "Browser mockups" },
  { href: "/features/3d-effects", label: "3D effects" },
  { href: "/features/animation-maker", label: "Animation maker" },
  { href: "/features/code-snippets", label: "Code snippet images" },
  { href: "/features/social-media-graphics", label: "Social media graphics" },
];

const AUDIENCE_PAGES = [
  { href: "/for/developers", label: "Developers" },
  { href: "/for/designers", label: "Designers" },
  { href: "/for/marketers", label: "Marketers" },
];

const RESOURCE_LINKS = [
  { href: "/docs", label: "API documentation" },
  { href: "/docs/authentication", label: "API authentication and rate limits" },
  { href: "/developers", label: "Developer portal" },
  { href: "/changelog", label: "Changelog" },
  { href: "/about", label: "About Screenshot Studio" },
  { href: "/contact", label: "Contact" },
  { href: "/openapi.json", label: "OpenAPI specification" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

const headingClass = "text-lg font-semibold text-foreground";
const listClass = "mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2";
const linkClass = "underline underline-offset-4 hover:text-foreground";

function LinkList({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  return (
    <ul className={listClass}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={linkClass}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AgentSummary() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8"
    >
      <h1 id="about-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
        Online Screenshot Editor and Mockup Maker
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Screenshot Studio is an open-source screenshot editor that runs entirely
        in your browser. Drop in a screenshot and turn it into a professional
        graphic: add a gradient background, wrap it in a Safari or Chrome browser
        mockup, tune the padding, corner radius, and shadow, tilt it in 3D, then
        export {EXPORT_FORMATS_SENTENCE}. Editing runs on your device and
        imported images are not uploaded to edit them; only export compression
        sends the finished image to the server, which returns it without storing
        it. There is no signup, no watermark, and no paid tier.
      </p>

      <div className="mt-10 grid gap-10">
        <div>
          <h2 className={headingClass}>What you can do here</h2>
          <ul className={listClass}>
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Who it is for</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Developers polishing README, changelog, and documentation images;
            marketers building launch graphics and social posts; and designers
            presenting work without leaving the browser.
          </p>
          <LinkList items={AUDIENCE_PAGES} />
        </div>

        <div>
          <h2 className={headingClass}>Explore the editor</h2>
          <LinkList items={FEATURE_PAGES} />
        </div>

        <div>
          <h2 className={headingClass}>Standalone editors</h2>
          <LinkList
            items={[
              { href: "/free-screenshot-editor", label: "Free screenshot editor" },
              { href: "/code", label: "Code to image" },
              { href: "/tweet", label: "Tweet to image" },
              { href: "/remove-background", label: "Background remover" },
              { href: "/compress-video", label: "Video compressor" },
              { href: "/store-screenshots", label: "App store screenshots" },
            ]}
          />
        </div>

        <div>
          <h2 className={headingClass}>Image tools</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Browser-based utilities that never upload your files. See the{" "}
            <Link href={TOOLS_HUB_PATH} className={linkClass}>
              full image tools hub
            </Link>
            .
          </p>
          <LinkList
            items={[...PRIMARY_TOOLS, ...CONVERTER_TOOLS].map((tool) => ({
              href: tool.slug,
              label: tool.name,
            }))}
          />
        </div>

        <div>
          <h2 className={headingClass}>How it compares</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Side-by-side breakdowns against the tools people weigh this one
            against. Start at the{" "}
            <Link href="/compare" className={linkClass}>
              comparison hub
            </Link>
            .
          </p>
          <LinkList
            items={comparisons.map((comparison) => ({
              href: `/compare/${comparison.slug}`,
              label: `vs ${comparison.competitorName}`,
            }))}
          />
        </div>

        <div>
          <h2 className={headingClass}>Documentation and machine-readable resources</h2>
          <LinkList items={RESOURCE_LINKS} />
          <p className="mt-3 text-sm text-muted-foreground">
            Any page on this site also serves Markdown to clients that send an{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              Accept: text/markdown
            </code>{" "}
            request header. Frames available: {FRAMES_SENTENCE}.
          </p>
        </div>
      </div>
    </section>
  );
}
