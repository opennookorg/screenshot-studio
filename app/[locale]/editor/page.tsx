import type { Metadata } from "next";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { FAQ } from "@/components/landing/FAQ";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AgentSummary } from "@/components/seo/AgentSummary";
import { OG_DEFAULTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Online Screenshot Editor & Mockup Maker",
  description:
    "Online screenshot editor and mockup maker that runs in your browser. Add gradient backgrounds, Safari and Chrome browser mockups, shadows, 3D effects, and animations. No signup.",
  keywords: [
    "screenshot editor online free",
    "free screenshot editor",
    "online image editor",
    "screenshot beautifier online",
    "auto beautify screenshot",
    "screenshot mockup tool",
    "pika style alternative",
    "shots.so alternative",
    "browser mockup generator",
    "safari browser mockup",
    "chrome browser mockup",
    "browser frame screenshot",
    "screenshot wrapper tool",
    "add background to screenshot free",
    "tweet to screenshot",
    "code snippet screenshot",
    "code to image generator",
    "mockup screenshot",
    "mockup online",
    "mockup screen",
    "mockups ui",
    "mockup ui ux",
    "app mockup generator",
    "ui mockup generator",
    "shots app alternative",
    "shots net alternative",
    "moqups alternative",
    "previewed app alternative",
    "appshots alternative",
    "goodmockups alternative",
    "mockup me alternative",
    "screenshot editor online free",
    "best screenshot editor online",
    "screenshot editor without watermark",
    "screenshot editor online free without watermark",
    "screenshot editor no download",
    "uizard screenshot editor alternative",
    "mockup generator",
    "free mockup generator",
    "mockup generator free",
    "mockup online generator",
    "mockup online editor",
    "mockup editor online free",
    "mockup design online",
    "mockup free online",
    "free online mockup generator no watermark",
    "free mockup generator without watermark",
    "app mockup generator",
    "website mockup generator",
    "free website mockup generator",
    "website mockup generator from url",
    "laptop mockup generator",
    "product mockup generator",
    "free online 3d mockup generator",
    "best mockup generator",
    "best online mockup generator",
    "mockup app",
  ],
  alternates: {
    canonical: "/editor",
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Screenshot Studio - Free Screenshot Editor & Mockup Maker",
    description:
      "Free screenshot editor online: add backgrounds, shadows, 3D effects, and animations. Export as PNG, JPG, or video.",
    url: "/editor",
  },
};

export default async function EditorPage() {
  return (
    <>
      <ErrorBoundary>
        <EditorLayout />
      </ErrorBoundary>
      <AgentSummary />
      <FAQ />
    </>
  );
}
