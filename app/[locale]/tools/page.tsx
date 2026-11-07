import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  RotateClockwiseIcon,
} from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { SectionTitle } from "@/components/tools/ToolLayout";
import { CARD_CLASS, INTER } from "@/components/tools/ui";
import { gradientColors } from "@/lib/constants/gradient-colors";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import { buildToolsHubJsonLd } from "@/lib/seo/tool-metadata";
import {
  CONVERTER_TOOLS,
  PRIMARY_TOOLS,
  TOOLS_HUB_PATH,
  type ToolDefinition,
} from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Compress, convert, resize, crop, and rotate images, remove a background, or compress a video, right in your browser. Batch processing, no signup, no watermark, and nothing is uploaded.";

export const metadata: Metadata = {
  title: "Free Online Image Tools: No Upload",
  description: DESCRIPTION,
  keywords: [
    "image tools",
    "online image tools",
    "free image editor tools",
    "compress image",
    "convert image",
    "resize image",
    "crop image",
    "rotate image",
    "remove background",
    "compress video",
    "batch image tools",
    "image tools without upload",
    "iloveimg alternative",
    "privacy friendly image tools",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Online Image Tools: No Upload",
    description:
      "Free image tools that run entirely in your browser. Batch processing, background removal, no signup, no watermark, no upload.",
    url: TOOLS_HUB_PATH,
  },
  alternates: {
    canonical: TOOLS_HUB_PATH,
  },
};

const REMOVE_BACKGROUND = { name: "Remove Background", slug: "/remove-background" };
const COMPRESS_VIDEO = { name: "Compress Video", slug: "/compress-video" };

const PROMISES = ["Nothing is uploaded", "Batch processing", "No signup or watermark", "Open source"];

const PREVIEW_SHADOW = "shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]";
const MOTION = "duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";

const CHECKERBOARD = "repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 0 0 / 12px 12px";

function Photo({ gradient, className }: { gradient: string; className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", className)} style={{ background: gradient }}>
      <span className="absolute right-[14%] top-[16%] aspect-square w-[14%] rounded-full bg-white/80" />
      <span className="absolute -bottom-[45%] -left-[15%] aspect-square w-[65%] rounded-full bg-black/20" />
      <span className="absolute -bottom-[60%] -right-[20%] aspect-square w-[80%] rounded-full bg-black/25" />
    </span>
  );
}

function Well({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="m-2 mb-0 flex h-44 items-center justify-center overflow-hidden rounded-xl"
      style={{ background: gradient }}
    >
      {children}
    </div>
  );
}

function CompressPreview() {
  return (
    <Well gradient={gradientColors.store_ocean}>
      <span className={cn("flex items-center gap-3 rounded-xl bg-white p-2.5 pr-3.5", PREVIEW_SHADOW)}>
        <Photo gradient={gradientColors.peach_pink_purple} className="size-10 rounded-md" />
        <span className="text-[11px] leading-4">
          <span className="block font-medium text-neutral-900">photo.jpg</span>
          <span className="block text-neutral-500">
            <span className="line-through">2.4 MB</span> → 412 KB
          </span>
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
          -83%
        </span>
      </span>
    </Well>
  );
}

function FormatFile({ label, gradient }: { label: string; gradient: string }) {
  return (
    <span className={cn("flex w-[72px] flex-col gap-1.5 rounded-lg bg-white p-1.5 pb-2", PREVIEW_SHADOW)}>
      <Photo gradient={gradient} className="h-12 rounded" />
      <span className="text-center font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold text-neutral-900">
        {label}
      </span>
    </span>
  );
}

function ConvertPreview() {
  return (
    <Well gradient={gradientColors.teal_navy}>
      <span className="flex items-center gap-3">
        <FormatFile label="PNG" gradient={gradientColors.peach_pink_purple} />
        <ArrowRight01Icon
          size={18}
          className={cn("text-white transition-transform group-hover:translate-x-1", MOTION)}
        />
        <FormatFile label="WEBP" gradient={gradientColors.peach_pink_purple} />
      </span>
    </Well>
  );
}

function ResizePreview() {
  return (
    <Well gradient={gradientColors.store_midnight}>
      <span className="relative block h-[104px] w-[168px]">
        <span className="absolute inset-0 rounded-lg border border-dashed border-white/40" />
        <span className="absolute right-1.5 top-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] text-white/60">
          3000 × 2000
        </span>
        <span
          className={cn(
            "absolute bottom-0 left-0 block origin-bottom-left transition-transform group-hover:scale-[1.12]",
            MOTION,
          )}
        >
          <Photo
            gradient={gradientColors.peach_pink_purple}
            className={cn("h-[60px] w-[96px] rounded-lg", PREVIEW_SHADOW)}
          />
          <span className="absolute bottom-1.5 left-1.5 rounded bg-white px-1 py-px font-[family-name:var(--font-geist-mono)] text-[9px] font-medium text-neutral-900">
            1200 × 800
          </span>
        </span>
      </span>
    </Well>
  );
}

function CropPreview() {
  return (
    <Well gradient={gradientColors.orange_pink_dark}>
      <span className={cn("relative block h-[104px] w-[168px] overflow-hidden rounded-lg", PREVIEW_SHADOW)}>
        <Photo gradient={gradientColors.green_teal_navy} className="absolute inset-0" />
        <span
          className={cn(
            "absolute inset-y-[14%] left-[24%] right-[22%] shadow-[0_0_0_999px_rgba(0,0,0,0.5)] ring-2 ring-white transition-[left,right] group-hover:left-[16%] group-hover:right-[30%]",
            MOTION,
          )}
        >
          <span className="absolute -left-1 -top-1 size-2 rounded-full bg-white" />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-white" />
          <span className="absolute -bottom-1 -left-1 size-2 rounded-full bg-white" />
          <span className="absolute -bottom-1 -right-1 size-2 rounded-full bg-white" />
        </span>
      </span>
    </Well>
  );
}

function RotatePreview() {
  return (
    <Well gradient={gradientColors.store_berry}>
      <span className="relative block">
        <span className={cn("block -rotate-[10deg] transition-transform group-hover:rotate-0", MOTION)}>
          <Photo
            gradient={gradientColors.store_ocean}
            className={cn("h-[92px] w-[140px] rounded-lg", PREVIEW_SHADOW)}
          />
        </span>
        <span
          className={cn(
            "absolute -right-4 -top-4 flex size-9 items-center justify-center rounded-full bg-white text-neutral-900",
            PREVIEW_SHADOW,
          )}
        >
          <RotateClockwiseIcon size={16} />
        </span>
      </span>
    </Well>
  );
}

function RemoveBackgroundPreview() {
  return (
    <Well gradient={gradientColors.green_teal_navy}>
      <span className={cn("relative block h-[104px] w-[168px] overflow-hidden rounded-lg", PREVIEW_SHADOW)}>
        <span className="absolute inset-0" style={{ background: gradientColors.peach_pink_purple }} />
        <span
          className={cn(
            "absolute inset-0 transition-[clip-path] [clip-path:inset(0_0_0_50%)] group-hover:[clip-path:inset(0_0_0_30%)]",
            MOTION,
          )}
          style={{ background: CHECKERBOARD }}
        />
        <span className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
          <span className="size-8 rounded-full bg-neutral-900" />
          <span className="mt-1 h-10 w-24 rounded-t-[48px] bg-neutral-900" />
        </span>
        <span
          className={cn(
            "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white transition-[left] group-hover:left-[30%]",
            MOTION,
          )}
        />
      </span>
    </Well>
  );
}

function CompressVideoPreview() {
  return (
    <Well gradient={gradientColors.store_graphite}>
      <span className={cn("flex w-[168px] flex-col gap-2 rounded-xl bg-white p-2", PREVIEW_SHADOW)}>
        <span className="relative block h-16 overflow-hidden rounded-md">
          <Photo gradient={gradientColors.teal_navy} className="absolute inset-0" />
          <span className="absolute inset-0 m-auto size-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
        </span>
        <span className="flex items-center justify-between px-0.5 text-[11px] leading-4">
          <span className="text-neutral-500">
            <span className="line-through">84 MB</span> → 9.6 MB
          </span>
          <span className="rounded-full bg-emerald-100 px-1.5 py-px font-semibold text-emerald-700 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
            -89%
          </span>
        </span>
      </span>
    </Well>
  );
}

const TASKS = [
  {
    href: "/compress-image",
    title: "Compress images",
    description: "Make files smaller without making them look worse.",
    preview: <CompressPreview />,
  },
  {
    href: "/convert-image",
    title: "Convert images",
    description: "Switch between PNG, JPG, WebP, and AVIF.",
    preview: <ConvertPreview />,
  },
  {
    href: "/resize-image",
    title: "Resize images",
    description: "Use ready-made sizes like passport photos, or set your own.",
    preview: <ResizePreview />,
  },
  {
    href: "/crop-image",
    title: "Crop an image",
    description: "Drag a frame, pick square or 16:9, or draw any shape.",
    preview: <CropPreview />,
  },
  {
    href: "/rotate-image",
    title: "Rotate and flip",
    description: "Turn images 90 degrees or mirror them, in bulk.",
    preview: <RotatePreview />,
  },
  {
    href: REMOVE_BACKGROUND.slug,
    title: "Remove background",
    description: "Cut out the subject and get a transparent PNG.",
    preview: <RemoveBackgroundPreview />,
  },
  {
    href: COMPRESS_VIDEO.slug,
    title: "Compress a video",
    description: "Shrink a video to a quality level or an exact size in MB.",
    preview: <CompressVideoPreview />,
  },
];

const CONVERTER_GROUPS = Array.from(
  CONVERTER_TOOLS.reduce((groups, tool) => {
    const source = tool.preset?.sourceLabel ?? "Other";
    groups.set(source, [...(groups.get(source) ?? []), tool]);
    return groups;
  }, new Map<string, ToolDefinition[]>()),
);

export default function ToolsHubPage() {
  const jsonLd = buildToolsHubJsonLd([...PRIMARY_TOOLS, REMOVE_BACKGROUND, COMPRESS_VIDEO, ...CONVERTER_TOOLS]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="flex-1 px-6 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          <header className="text-center">
            <h1
              className="text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl"
              style={{ fontFamily: INTER }}
            >
              Free online image tools
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick what you need to do. Every tool runs in your browser, so your
              images stay on your device.
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckmarkCircle02Icon size={15} className="text-emerald-500" aria-hidden="true" />
                  {promise}
                </li>
              ))}
            </ul>
          </header>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TASKS.map((task) => (
              <Link
                key={task.href}
                href={task.href}
                className={cn(
                  CARD_CLASS,
                  "group flex flex-col overflow-hidden transition-shadow duration-200 hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70",
                )}
              >
                {task.preview}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h2
                    className="flex items-center justify-between gap-2 text-lg font-semibold tracking-[-0.02em] text-foreground"
                    style={{ fontFamily: INTER }}
                  >
                    {task.title}
                    <ArrowRight01Icon
                      size={18}
                      className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {task.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-24">
            <SectionTitle>Convert between formats</SectionTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              One-click converters with the output format already picked.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CONVERTER_GROUPS.map(([source, tools]) => (
                <div key={source} className={cn(CARD_CLASS, "p-2")}>
                  <p className="px-3 pb-1.5 pt-2 text-xs font-medium text-muted-foreground">
                    From{" "}
                    <span className="font-[family-name:var(--font-geist-mono)] text-foreground">
                      {source}
                    </span>
                  </p>
                  <ul>
                    {tools.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={tool.slug}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70"
                        >
                          {tool.name}
                          <ArrowRight01Icon
                            size={15}
                            className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-20 text-center text-sm text-muted-foreground">
            Want a finished graphic instead? Open the{" "}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>{" "}
            or{" "}
            <Link href="/code" className="text-foreground underline underline-offset-4">
              turn code into an image
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
