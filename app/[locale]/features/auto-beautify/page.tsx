import { Metadata } from "next";
import Link from "next/link";
import {
  ColorsIcon,
  GridViewIcon,
  LockIcon,
  ShuffleIcon,
  SparklesIcon,
  Undo02Icon,
} from "hugeicons-react";
import { FeaturePage } from "@/components/features/FeaturePage";
import { PREVIEW_SHADOW, MOTION, WindowDots } from "@/components/tools/ui";
import { OG_DEFAULTS, SITE_URL } from "@/lib/seo/metadata";

const PAGE_URL = `${SITE_URL}/features/auto-beautify`;

export const metadata: Metadata = {
  title: "Auto Beautify Screenshots in One Click",
  description:
    "Beautify a screenshot automatically: one click picks a background from your image's own colours, plus padding, rounded corners, and a shadow. Free, no signup, no AI upload.",
  keywords: [
    "auto beautify screenshot",
    "beautify screenshot automatically",
    "one click screenshot beautifier",
    "automatic screenshot background",
    "screenshot background from image colors",
    "make screenshot look good automatically",
    "instant screenshot mockup",
    "ai screenshot beautifier",
    "screenshot beautifier free",
    "beautify screenshot online",
  ],
  openGraph: {
    ...OG_DEFAULTS,
    title: "Auto Beautify - Style Any Screenshot in One Click",
    description:
      "Drop in a screenshot and click Beautify. Screenshot Studio picks a background from your image's colours and styles it for you. Free, no signup.",
    url: PAGE_URL,
  },
  alternates: {
    canonical: "/features/auto-beautify",
  },
};

const capabilities = [
  {
    icon: ColorsIcon,
    title: "Colours from your screenshot",
    description:
      "Reads your image's brand colour and brightness, so the background suits it instead of fighting it.",
  },
  {
    icon: ShuffleIcon,
    title: "Six looks, one button",
    description:
      "Vivid, Curated, Duotone, Pastel, Midnight, and Complement. Click again to move to the next look.",
  },
  {
    icon: Undo02Icon,
    title: "One step to undo",
    description:
      "Each look is a single undo step, and your text, overlays, 3D tilt, and animation stay as they were.",
  },
  {
    icon: LockIcon,
    title: "Runs in your browser",
    description:
      "Colours are picked on your device. Your screenshot is not sent to a server or an AI service to style it.",
  },
];

const steps = [
  {
    title: "Add your screenshot",
    description:
      "Open the editor and paste, drag and drop, or browse for a PNG, JPG, or WebP. No account needed.",
  },
  {
    title: "Click Beautify",
    description:
      "Find Beautify next to Animate under the canvas (the sparkles icon in the top bar on phones). Click again for another look, or open Templates to compare all six side by side.",
  },
  {
    title: "Fine-tune and export",
    description:
      "Every look is an ordinary design, so you can tweak the background, shadow, or corners, then export PNG, JPEG, or WebP.",
  },
];

const faqs = [
  {
    question: "How does auto beautify choose a background?",
    answer:
      "It shrinks a copy of your screenshot and finds its main colours and how light or dark it is. It then builds six gradients around your brand colour and checks that each one stands out from the edges of your screenshot, so the image never blends into the background.",
  },
  {
    question: "Is it AI? Is my screenshot uploaded?",
    answer:
      "It is colour maths, not a generative AI model. It runs in your browser, so your screenshot is not uploaded to pick a style, and it works instantly, even offline once the editor has loaded.",
  },
  {
    question: "What else does it change besides the background?",
    answer:
      "Padding, corner radius, and shadow. Transparent cut-outs keep sharp corners and get extra room. If your canvas is still the default 4:3, wide screenshots move to 16:9, phone screenshots to 4:5, and square ones to 1:1. A custom size is never changed.",
  },
  {
    question: "Does it work with dark mode screenshots?",
    answer:
      "Yes. Dark screenshots are detected and get lighter, pastel backgrounds first, so a dark UI never sits on a dark backdrop. Click again for darker options.",
  },
  {
    question: "Can I undo a look or keep editing after?",
    answer:
      "Yes. Press Cmd+Z (Ctrl+Z on Windows) to undo a look in one step. The result is a normal design, so every background, shadow, and frame control still works.",
  },
  {
    question: "Is auto beautify free?",
    answer:
      "Yes. Like the rest of Screenshot Studio, it is free with no signup, no watermark, and no export limit.",
  },
];

const relatedLinks = [
  { href: "/features/screenshot-beautifier", label: "Screenshot beautifier" },
  { href: "/features/browser-mockups", label: "Browser mockups" },
  { href: "/features/3d-effects", label: "3D effects" },
  { href: "/features/animation-maker", label: "Animation maker" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${PAGE_URL}#software`,
      name: "Screenshot Studio - Auto Beautify",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web Browser",
      description:
        "One-click screenshot styling that builds a background, padding, corners, and shadow from the colours of your own image, in the browser.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Background generated from the screenshot's own colours",
        "Six ranked looks, cycled with one button",
        "Contrast check against the screenshot's edges",
        "Single-step undo",
        "Runs in the browser, no upload to style",
        "No signup required",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "How to beautify a screenshot automatically",
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Features", item: `${SITE_URL}/features` },
        { "@type": "ListItem", position: 3, name: "Auto Beautify", item: PAGE_URL },
      ],
    },
  ],
};

/** A screenshot card with the brand-blue accent the generated gradient is built from. */
function AutoBeautifyPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-60 overflow-hidden rounded-xl bg-white transition-transform ${MOTION} group-hover:-translate-y-1 ${PREVIEW_SHADOW}`}
      >
        <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-2">
          <WindowDots />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="h-2.5 w-20 rounded-full bg-neutral-300" />
          <div className="h-2 w-32 rounded-full bg-neutral-200" />
          <div className="mt-1 h-6 w-16 rounded-md bg-[#3b82f6]" />
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-lg">
        <SparklesIcon size={13} />
        Beautify
      </span>
    </div>
  );
}

export default function AutoBeautifyPage() {
  return (
    <FeaturePage
      name="Auto Beautify"
      title="Auto Beautify Screenshots in One Click"
      intro="Drop in a screenshot and click Beautify. Screenshot Studio reads your image's colours and gives it a matching background, padding, rounded corners, and shadow. Click again for another look. Free, no signup, and it runs in your browser."
      ctaHref="/editor"
      ctaLabel="Beautify a Screenshot"
      previewGradient="linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #6366f1 100%)"
      preview={<AutoBeautifyPreview />}
      capabilities={capabilities}
      steps={steps}
      alternativesIntro="Most beautifiers make you pick from fixed templates. Auto Beautify starts from your own screenshot's colours, then leaves every control open for fine-tuning."
      alternativeSlugs={["shots-so", "pika-style", "xnapper", "screely"]}
      guideLinks={[
        { href: "/guides/how-to-beautify-screenshots", label: "How to make screenshots look professional" },
        { href: "/guides/best-free-shots-so-alternatives", label: "Best free Shots.so alternatives" },
      ]}
      faqs={faqs}
      relatedLinks={relatedLinks}
      closing={
        <>
          Want full control? Use the{" "}
          <Link href="/features/screenshot-beautifier" className="text-foreground underline underline-offset-4">
            screenshot beautifier
          </Link>{" "}
          controls, open the{" "}
          <Link href="/editor" className="text-foreground underline underline-offset-4">
            editor
          </Link>
          , or browse{" "}
          <Link href="/features" className="text-foreground underline underline-offset-4">
            every feature
          </Link>
          .
        </>
      }
      jsonLd={jsonLd}
    />
  );
}
