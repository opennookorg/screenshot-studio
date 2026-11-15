"use client";

import { SparklesIcon } from "hugeicons-react";
import { useAutoBeautify } from "@/hooks/useAutoBeautify";
import { cn } from "@/lib/utils";

/**
 * One click styles the screenshot from its own colours; each further click
 * moves to the next ranked look. Always a single undo step.
 */
export function BeautifyButton({ compact = false, chip = false }: { compact?: boolean; chip?: boolean }) {
  const { source, isApplying, beautifyNext } = useAutoBeautify();
  if (!source) return null;

  return (
    <button
      type="button"
      onClick={() => void beautifyNext()}
      disabled={isApplying}
      aria-label="Beautify: style this image from its colours"
      title="Beautify (click again for another look)"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md",
        "text-sm font-medium leading-none transition-[color,background-color,border-color,transform] duration-150",
        "disabled:cursor-wait disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        chip
          ? "h-9 gap-2 border border-foreground/10 bg-card px-4 text-foreground shadow-lg hover:border-foreground/15 hover:bg-muted active:scale-[0.98]"
          : "text-muted-foreground hover:text-foreground active:scale-95",
        !chip && (compact ? "size-11" : "h-8 px-2"),
      )}
    >
      <SparklesIcon size={chip ? 15 : compact ? 16 : 14} className="shrink-0" />
      {compact ? null : <span>Beautify</span>}
    </button>
  );
}
