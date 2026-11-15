"use client";

import { useState } from "react";
import Link from "next/link";
import {
  atLeast,
  FRAMES_SENTENCE,
  IMAGE_FORMATS_SENTENCE,
  PRODUCT_FACTS,
  VIDEO_FORMATS_SENTENCE,
} from "@/lib/seo/product-facts";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  faqs?: FAQItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What is Screenshot Studio?",
    answer:
      `Screenshot Studio is a free, browser-based screenshot editor that turns plain screenshots into professional graphics. It offers ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds, Safari and Chrome browser mockups, 3D perspective effects, an animation timeline with ${PRODUCT_FACTS.animationPresets} presets, and video export. It is open source under ${PRODUCT_FACTS.license}, with no signup, no download, and no watermark.`,
  },
  {
    question: "Is Screenshot Studio really free?",
    answer:
      "Yes. Screenshot Studio is 100% free with no hidden costs. Unlimited exports, all features, no watermarks. No signup required.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Just open the editor and start creating. Your work saves automatically in your browser with unlimited undo/redo.",
  },
  {
    question: "Is there a free screenshot editor I can use online?",
    answer:
      "Yes. Screenshot Studio runs entirely in your browser, so there is nothing to download and nothing to install. Open the editor and start adding backgrounds, shadows, frames, and 3D effects to your screenshots straight away.",
  },
  {
    question: "What frames and styles are available?",
    answer:
      `${FRAMES_SENTENCE}, plus 3D perspective transforms and customizable shadows with blur, spread, and color controls.`,
  },
  {
    question: "What export formats are supported?",
    answer:
      `Still images export as ${IMAGE_FORMATS_SENTENCE}, and animations export as ${VIDEO_FORMATS_SENTENCE}. Export up to ${PRODUCT_FACTS.maxExportScale}x resolution, and PNG keeps transparency.`,
  },
  {
    question: "Can I create animations and videos?",
    answer:
      `Yes. The timeline editor ships ${PRODUCT_FACTS.animationPresets} animation presets covering zoom, pan, rotate, and 3D perspective moves. Add keyframes, preview in real time, and export as ${VIDEO_FORMATS_SENTENCE}.`,
  },
  {
    question: "Can I create tweet screenshots or code snippet images?",
    answer:
      `Yes. Paste a tweet URL to capture it as a high-resolution image in light or dark theme. The code snippet generator supports ${PRODUCT_FACTS.codeThemes} syntax themes, ${PRODUCT_FACTS.codeLanguages} programming languages, and ${PRODUCT_FACTS.codeFonts} monospace fonts.`,
  },
  {
    question: "What makes Screenshot Studio different from other screenshot editors?",
    answer:
      `It is purpose-built for making screenshots presentable rather than for general image editing: one-click Auto Beautify that styles a screenshot from its own colours, design presets, ${atLeast(PRODUCT_FACTS.backgrounds)} backgrounds, ${PRODUCT_FACTS.deviceMockups} device mockups, 3D perspective transforms, an animation timeline, and video export. All of it is free, watermark-free, and needs no account.`,
  },
  {
    question: "Is my data stored on your servers?",
    answer:
      "No. Editing runs in your browser and imported images are not uploaded to edit them. Only export compression sends the finished image to the server, which recompresses it in memory and returns it without storing it.",
  },
];

function FAQItemRow({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div
      className={`mb-3 overflow-hidden rounded-2xl ring-1 transition-[background-color,box-shadow,ring-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isOpen
          ? "bg-muted ring-ring/15 shadow-[var(--card-edge-shadow)]"
          : "bg-card ring-border shadow-[var(--card-edge-shadow)] hover:ring-ring/15"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="group relative flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left transition-transform duration-200 ease-out active:scale-[0.99] touch-manipulation sm:px-6 sm:py-5"
      >
        <span
          className={`min-w-0 text-[16px] leading-snug font-semibold tracking-tight transition-colors duration-200 sm:text-[17px] ${
            isOpen ? "text-foreground" : "text-foreground"
          }`}
        >
          {question}
        </span>

        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:size-9 ${
            isOpen
              ? "scale-[1.04] rotate-45 bg-primary ring-primary"
              : "bg-foreground/[0.04] ring-border group-hover:bg-foreground/[0.08] group-hover:scale-[1.04]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`size-4 transition-colors duration-300 ${
              isOpen ? "stroke-primary-foreground" : "stroke-muted-foreground"
            }`}
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-w-3xl px-5 pb-5 text-[14.5px] leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-[15px]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ({
  title = "Questions",
  faqs = defaultFAQs,
  ctaLabel = "Open Editor",
  ctaHref = "/editor",
}: FAQProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const items = faqs;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="w-full bg-background px-6 py-16 sm:py-20 md:py-24"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="h-fit lg:sticky lg:top-32 lg:w-[36%]">
          <h2
            className="landing-heading text-[28px] leading-[34px] font-semibold tracking-[-0.03em] sm:text-[36px] sm:leading-[42px] md:text-[44px] md:leading-[50px]"
            style={{
              fontFamily:
                'Inter, "Inter Fallback", Arial, Helvetica, sans-serif',
            }}
          >
            Common
            <br />
            {title}.
          </h2>
          <p className="mt-5 max-w-[300px] text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Quick answers about Screenshot Studio, exports, and how it works in
            your browser.
          </p>
        </div>

        <div className="flex flex-col lg:w-[64%]">
          <div className="flex flex-col">
            {items.map((item, idx) => (
              <FAQItemRow
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openId === idx}
                onClick={() => setOpenId(openId === idx ? null : idx)}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-card p-6 ring-1 ring-border shadow-[var(--card-edge-shadow)] sm:flex-row sm:items-center sm:p-7">
            <div>
              <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
                Ready to create?
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Join thousands of creators making beautiful images.
              </p>
            </div>
            <Link
              href={ctaHref}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[var(--nav-cta-bg)] px-5 text-sm font-medium text-[var(--nav-cta-fg)] shadow-sm [text-shadow:var(--nav-cta-text-shadow)] transition-all duration-200 hover:shadow-[var(--nav-cta-hover-shadow)] active:scale-[0.98]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
