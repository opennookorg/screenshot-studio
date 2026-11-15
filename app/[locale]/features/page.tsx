import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight01Icon,
  BrowserIcon,
  CubeIcon,
  EraserAutoIcon,
  MagicWand01Icon,
  Share08Icon,
  SmartPhone01Icon,
  SourceCodeIcon,
  SparklesIcon,
  Video01Icon,
} from "hugeicons-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { SectionTitle } from "@/components/tools/ToolLayout";
import { CARD_CLASS, INTER, PREVIEW_SHADOW, MOTION } from "@/components/tools/ui";
import { gradientColors } from "@/lib/constants/gradient-colors";
import { buildCollectionJsonLd } from "@/lib/seo/json-ld";
import { OG_DEFAULTS } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

const TITLE = "Features: Screenshot & Mockup Tools";
const DESCRIPTION =
  "All Screenshot Studio features: screenshot beautifier, browser and device mockups, social media graphics, animations, 3D effects, and code images. Free, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "screenshot editor features",
    "image editing tools",
    "free design tools",
    "screenshot beautifier",
    "social media graphics",
    "animation maker",
    "3d effects",
    "screenshot mockup features",
    "browser frame mockup",
    "app mockup generator",
    "ui mockup generator",
    "mockup generator free",
    "free mockup generator no watermark",
    "shots.so alternative",
    "pika.style alternative",
    "free shots.so alternative",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Features - Screenshot Studio",
    description:
      "All tools and capabilities in one free editor. Beautify, animate, and transform screenshots.",
    url: "/features",
  },
  alternates: {
    canonical: "/features",
  },
};

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

function IconBadge({ icon: Icon }: { icon: typeof MagicWand01Icon }) {
  return (
    <span
      className={cn(
        "flex size-14 items-center justify-center rounded-full bg-white text-neutral-900 transition-transform",
        MOTION,
        "group-hover:-translate-y-1",
        PREVIEW_SHADOW,
      )}
    >
      <Icon size={26} />
    </span>
  );
}

const FEATURES = [
  {
    href: "/features/screenshot-beautifier",
    title: "Screenshot Beautifier",
    description:
      "Add backgrounds, shadows, and rounded corners to turn plain screenshots into professional visuals.",
    icon: MagicWand01Icon,
    gradient: gradientColors.vibrant_orange_pink,
  },
  {
    href: "/features/auto-beautify",
    title: "Auto Beautify",
    description:
      "One click styles your screenshot with a background built from its own colours. Click again for another look.",
    icon: SparklesIcon,
    gradient: gradientColors.cyan_blue_purple,
  },
  {
    href: "/features/social-media-graphics",
    title: "Social Media Graphics",
    description:
      "Perfectly sized graphics for Twitter, LinkedIn, and Instagram. No design skills needed.",
    icon: Share08Icon,
    gradient: gradientColors.pink_purple_blue,
  },
  {
    href: "/features/animation-maker",
    title: "Animation Maker",
    description:
      "Bring screenshots to life with zoom, pan, and fade animations. Export as video or GIF.",
    icon: Video01Icon,
    gradient: gradientColors.cyan_blue_purple,
  },
  {
    href: "/features/3d-effects",
    title: "3D Effects",
    description:
      "Add 3D perspective, rotation, and depth to flat screenshots with a real-time preview.",
    icon: CubeIcon,
    gradient: gradientColors.store_midnight,
  },
  {
    href: "/features/browser-mockups",
    title: "Browser Mockups",
    description:
      "Add realistic Safari and Chrome browser frames to screenshots, in light and dark mode.",
    icon: BrowserIcon,
    gradient: gradientColors.store_ocean,
  },
  {
    href: "/mockup-generator",
    title: "Device Mockup Generator",
    description:
      "Put screenshots on iPhone, MacBook, and Apple Watch mockups, including 3D angles and multi-device layouts.",
    icon: SmartPhone01Icon,
    gradient: gradientColors.store_berry,
  },
  {
    href: "/features/code-snippets",
    title: "Code Images",
    description:
      "Turn code into shareable images with syntax themes, gradient backgrounds, and a window frame.",
    icon: SourceCodeIcon,
    gradient: gradientColors.store_graphite,
  },
  {
    href: "/remove-background",
    title: "Background Remover",
    description:
      "Remove image backgrounds with on-device AI. Full-resolution transparent PNG, nothing uploaded.",
    icon: EraserAutoIcon,
    gradient: gradientColors.green_teal_navy,
  },
] as const;

export default function FeaturesPage() {
  const jsonLd = buildCollectionJsonLd(
    "/features",
    TITLE,
    DESCRIPTION,
    FEATURES.map((feature) => ({ name: feature.title, url: feature.href })),
  );

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
              All features
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Everything you need to turn a screenshot into a finished visual.
              100% free, no signup, no watermark.
            </p>
          </header>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={cn(
                  CARD_CLASS,
                  "group flex flex-col overflow-hidden transition-shadow duration-200 hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70",
                )}
              >
                <Well gradient={feature.gradient}>
                  <IconBadge icon={feature.icon} />
                </Well>
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h2
                    className="flex items-center justify-between gap-2 text-lg font-semibold tracking-[-0.02em] text-foreground"
                    style={{ fontFamily: INTER }}
                  >
                    {feature.title}
                    <ArrowRight01Icon
                      size={18}
                      className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-24 border-t border-border pt-16">
            <SectionTitle>Mockups for every screen</SectionTitle>
            <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Screenshot Studio is a free mockup maker that runs entirely in
                your browser. Drop in a screenshot of an app, website, or UI
                design and turn it into a polished mockup in seconds. No
                account, no watermark, and nothing to install.
              </p>
              <p>
                Wrap any screen in a Safari or Chrome browser frame, place it
                on a gradient or solid background, and add shadows, padding,
                and rounded corners. Tilt it in 3D for a perspective mockup,
                or animate it into a short product video for a launch post.
              </p>
              <p>
                If you have used{" "}
                <Link href="/compare/shots-so" className="text-foreground underline underline-offset-4">
                  Shots.so
                </Link>{" "}
                or{" "}
                <Link href="/compare/pika-style" className="text-foreground underline underline-offset-4">
                  Pika Style
                </Link>
                , you will feel at home here. Screenshot Studio covers the
                same backgrounds, browser frames, and animation workflow for
                free, with no signup and no watermark. See the full{" "}
                <Link
                  href="/guides/best-free-shots-so-alternatives"
                  className="text-foreground underline underline-offset-4"
                >
                  Shots.so alternatives guide
                </Link>{" "}
                for a feature-by-feature breakdown.
              </p>
            </div>
          </section>

          <p className="mt-20 text-center text-sm text-muted-foreground">
            Ready to start? Open the{" "}
            <Link href="/editor" className="text-foreground underline underline-offset-4">
              screenshot editor
            </Link>{" "}
            or browse{" "}
            <Link href="/tools" className="text-foreground underline underline-offset-4">
              every image tool
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
