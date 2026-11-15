'use client';

import * as React from 'react';
import { SparklesIcon, Tick02Icon } from 'hugeicons-react';
import { PresetPreview } from '@/components/presets/PresetGallery';
import { useAutoBeautify } from '@/hooks/useAutoBeautify';
import type { BeautifyLook } from '@/lib/auto-beautify';
import type { PresetConfig } from '@/lib/constants/presets';
import { useImageStore } from '@/lib/store';
import { isTemplateDemoMedia } from '@/lib/templates/demo-media';
import { cn } from '@/lib/utils';

/** Render a look with the user's untouched settings, exactly as it will apply. */
function useLookPreset(look: BeautifyLook): PresetConfig {
  const selectedAspectRatio = useImageStore((state) => state.selectedAspectRatio);
  const backgroundBorderRadius = useImageStore((state) => state.backgroundBorderRadius);
  const backgroundNoise = useImageStore((state) => state.backgroundNoise);
  const imageOpacity = useImageStore((state) => state.imageOpacity);
  const imageBorder = useImageStore((state) => state.imageBorder);

  return React.useMemo(() => ({
    id: `beautify-${look.id}`,
    name: look.name,
    description: '',
    aspectRatio: look.style.aspectRatio ?? selectedAspectRatio,
    backgroundConfig: look.style.backgroundConfig,
    borderRadius: look.style.borderRadius,
    backgroundBorderRadius,
    imageOpacity,
    imageScale: look.style.imageScale,
    imageBorder,
    imageShadow: look.style.imageShadow,
    backgroundBlur: 0,
    backgroundNoise,
  }), [look, selectedAspectRatio, backgroundBorderRadius, backgroundNoise, imageOpacity, imageBorder]);
}

function SuggestedLookCard({
  look,
  previewImageUrl,
  isActive,
  onApply,
}: {
  look: BeautifyLook;
  previewImageUrl: string;
  isActive: boolean;
  onApply: () => void;
}) {
  const preset = useLookPreset(look);

  return (
    <button
      type="button"
      onClick={onApply}
      aria-pressed={isActive}
      aria-label={`Apply ${look.name} look`}
      className={cn(
        'group min-w-0 text-left outline-none transition-transform duration-150 ease-out active:scale-[0.99]',
        'focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-foreground/30',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-muted/30 transition-[border-color,opacity] duration-150 ease-out',
          isActive
            ? 'border-foreground/25'
            : 'border-foreground/[0.08] group-hover:border-foreground/15 group-hover:opacity-95',
        )}
      >
        <PresetPreview preset={preset} previewImageUrl={previewImageUrl} />
        {isActive ? (
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border border-border/50 bg-background/70 text-foreground backdrop-blur-md">
            <Tick02Icon size={11} />
          </span>
        ) : null}
      </div>
      <span className="block truncate px-0.5 pt-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
        {look.name}
      </span>
    </button>
  );
}

/**
 * Looks generated from the user's own screenshot, shown above the fixed
 * templates. One click applies (one undo step) and keeps the drawer open so
 * looks can be compared on the canvas.
 */
export function SuggestedLooks() {
  const { source, looks, activeIndex, applyLook } = useAutoBeautify();
  const editorMode = useImageStore((state) => state.editorMode);
  const imageName = useImageStore((state) => state.imageName);

  // Suggestions are only meaningful for the user's own screenshot; device
  // scenes render differently from these flat previews.
  if (!source || editorMode === 'device' || isTemplateDemoMedia(source, imageName)) return null;

  return (
    <section aria-labelledby="suggested-looks-heading" className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <SparklesIcon size={13} className="text-muted-foreground" aria-hidden />
        <h3 id="suggested-looks-heading" className="text-xs font-medium text-muted-foreground">
          Suggested for your image
        </h3>
      </div>
      {looks ? (
        <div className="grid grid-cols-2 gap-3 min-[390px]:grid-cols-3">
          {looks.map((look, index) => (
            <SuggestedLookCard
              key={look.id}
              look={look}
              previewImageUrl={source}
              isActive={index === activeIndex}
              onApply={() => applyLook(look, index, 'suggested')}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 min-[390px]:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-foreground/[0.06]" />
          ))}
        </div>
      )}
    </section>
  );
}
