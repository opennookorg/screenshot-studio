"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { EditorPreview } from "./EditorPreview";
import { trackCTAClick } from "@/lib/analytics";

interface HeroProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function heroTiming(delay: number, duration: number, fadeY?: number): CSSProperties {
  return {
    "--hero-delay": `${delay}s`,
    "--hero-duration": `${duration}s`,
    ...(fadeY === undefined ? {} : { "--hero-fade-y": `${fadeY}px` }),
  } as CSSProperties;
}

export function Hero({
  title,
  subtitle,
  description,
  ctaLabel = "Start Creating",
  ctaHref = "/",
}: HeroProps) {
  const lines = subtitle ? [title, subtitle] : [title];

  return (
    <main className="relative z-10 pt-32 pb-24 sm:pt-36" role="banner">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-left">
          <a
            href="https://vercel.com/oss"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-fade-in mb-5 inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-3 py-1 text-xs ring-1 ring-border/60 transition-colors hover:bg-muted/55 hover:ring-border"
            style={heroTiming(0.12, 0.35, 6)}
          >
            <span className="text-muted-foreground">Backed by</span>
            <Image
              src="/vercel-icon.png"
              alt=""
              width={12}
              height={10}
              className="h-2.5 w-auto shrink-0 mix-blend-lighten"
              aria-hidden="true"
            />
            <span className="font-medium text-foreground">
              Vercel OSS Program
            </span>
          </a>

          <h1
            className="max-w-4xl text-[32px] leading-[38px] sm:text-[44px] sm:leading-[50px] md:text-[56px] md:leading-[64px] font-semibold tracking-[-0.03em] text-foreground"
            style={{
              fontFamily:
                'Inter, "Inter Fallback", Arial, Helvetica, sans-serif',
            }}
          >
            {lines.map((line, index) => (
              <div key={line} className="overflow-hidden">
                <span
                  className="hero-mask-in block md:whitespace-nowrap"
                  style={heroTiming(0.075 * index, 0.75)}
                >
                  {line}
                </span>
              </div>
            ))}
          </h1>

          <div className="mt-6 max-w-2xl overflow-hidden">
            <p
              className="hero-mask-in text-[15px] md:text-base leading-normal text-muted-foreground"
              style={heroTiming(0.42, 0.32)}
            >
              {description}
            </p>
          </div>

          <div className="hero-fade-in mt-8" style={heroTiming(0.62, 0.25)}>
            <Link
              href={ctaHref}
              onClick={() => trackCTAClick("hero", ctaLabel)}
              className="relative inline-flex h-auto cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--nav-cta-bg)] px-6 py-2.5 text-base font-medium text-[var(--nav-cta-fg)] shadow-none transition-[transform,box-shadow,background-color,color] duration-150 ease-out [text-shadow:var(--nav-cta-text-shadow)] hover:bg-[var(--nav-cta-bg)] hover:text-[var(--nav-cta-fg)] hover:shadow-[var(--nav-cta-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.97] active:bg-[var(--nav-cta-bg)] active:text-[var(--nav-cta-fg)] active:shadow-none"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>

        <div className="mt-14 md:mt-16">
          <EditorPreview />
        </div>
      </div>
    </main>
  );
}
