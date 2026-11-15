"use client";

import * as React from "react";
import { toast } from "sonner";
import { useImageStore } from "@/lib/store";
import {
  analyzeImageUrl,
  generateLooks,
  neutralAnalysis,
  type BeautifyLook,
  type ImageAnalysis,
  type LookOptions,
} from "@/lib/auto-beautify";
import { trackAutoBeautify } from "@/lib/analytics";
import type { BackgroundConfig } from "@/lib/constants/backgrounds";

type BeautifySource = "header" | "suggested";

interface ImageStateSlice {
  editorMode: "screenshot" | "browser" | "device";
  uploadedImageUrl: string | null;
  mockups: ReadonlyArray<{ screen: { src: string | null } }>;
}

/** The image the looks are derived from: the device screen in device mode. */
export function getBeautifySourceUrl(state: ImageStateSlice): string | null {
  if (state.editorMode === "device") {
    return state.mockups.find((mockup) => mockup.screen.src)?.screen.src ?? null;
  }
  return state.uploadedImageUrl;
}

function getLookOptions(): LookOptions {
  const { selectedAspectRatio, customDimensions } = useImageStore.getState();
  return { currentAspectRatio: selectedAspectRatio, hasCustomDimensions: !!customDimensions };
}

/** Index of the look currently on the canvas, matched by its background. */
function findActiveIndex(looks: BeautifyLook[], backgroundConfig: BackgroundConfig): number {
  return looks.findIndex(
    (look) =>
      look.style.backgroundConfig.type === backgroundConfig.type &&
      look.style.backgroundConfig.value === backgroundConfig.value,
  );
}

/**
 * Shared auto-beautify state for the header button and the suggestions grid.
 * The active look is derived from the canvas rather than stored, so undo,
 * manual edits and either entry point all agree on what "next" means.
 */
export function useAutoBeautify() {
  const source = useImageStore(getBeautifySourceUrl);
  const editorMode = useImageStore((state) => state.editorMode);
  const selectedAspectRatio = useImageStore((state) => state.selectedAspectRatio);
  const hasCustomDimensions = useImageStore((state) => !!state.customDimensions);
  const backgroundConfig = useImageStore((state) => state.backgroundConfig);
  const applyAutoBeautify = useImageStore((state) => state.applyAutoBeautify);

  const [analysis, setAnalysis] = React.useState<{ src: string; value: ImageAnalysis } | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);

  React.useEffect(() => {
    if (!source) return;
    let cancelled = false;
    analyzeImageUrl(source).then((value) => {
      if (!cancelled) setAnalysis({ src: source, value: value ?? neutralAnalysis() });
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const looks = React.useMemo(() => {
    if (!source || analysis?.src !== source) return null;
    return generateLooks(analysis.value, {
      currentAspectRatio: selectedAspectRatio,
      hasCustomDimensions,
    });
  }, [analysis, source, selectedAspectRatio, hasCustomDimensions]);

  const activeIndex = React.useMemo(
    () => (looks ? findActiveIndex(looks, backgroundConfig) : -1),
    [looks, backgroundConfig],
  );

  const applyLook = React.useCallback(
    (look: BeautifyLook, index: number, from: BeautifySource) => {
      applyAutoBeautify(look.style, { backgroundOnly: editorMode === "device" });
      trackAutoBeautify(look.id, index, from);
    },
    [applyAutoBeautify, editorMode],
  );

  /** Apply the best look, or the one after the current look on repeat clicks. */
  const beautifyNext = React.useCallback(async () => {
    if (!source || isApplying) return;
    setIsApplying(true);
    try {
      // Read fresh state: the analysis may still be loading on the first click.
      const value = (await analyzeImageUrl(source)) ?? neutralAnalysis();
      const fresh = generateLooks(value, getLookOptions());
      const current = useImageStore.getState().backgroundConfig;
      const index = (findActiveIndex(fresh, current) + 1) % fresh.length;
      const look = fresh[index];
      applyLook(look, index, "header");
      toast.success(`Beautified · ${look.name}`, {
        id: "auto-beautify",
        description: "Click again for another look. Undo with ⌘/Ctrl+Z.",
        duration: 2500,
      });
    } finally {
      setIsApplying(false);
    }
  }, [applyLook, isApplying, source]);

  return {
    source,
    looks,
    activeIndex,
    isApplying,
    applyLook,
    beautifyNext,
  };
}
