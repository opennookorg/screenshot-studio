'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { SectionWrapper } from './SectionWrapper';
import { getR2ImageUrl } from '@/lib/r2';
import { isOverlayPath } from '@/lib/r2-overlays';
import { ArrowRight01Icon, LayersLogoIcon, Image01Icon } from 'hugeicons-react';

function getThumbSrc(overlay: { src: string; isCustom?: boolean }) {
  const isR2 =
    isOverlayPath(overlay.src) ||
    (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'));
  return isR2 && !overlay.isCustom
    ? getR2ImageUrl({ src: overlay.src })
    : overlay.src;
}

export function ImageOverlaySection() {
  const { uploadedImageUrl, imageOverlays, textOverlays, annotations, blurRegions, setActiveRightPanelTab, addImageOverlay } =
    useImageStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddImage = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      addImageOverlay({
        src: url,
        position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
        size: 250,
        rotation: 0,
        opacity: 1,
        flipX: false,
        flipY: false,
        isVisible: true,
        isCustom: true,
      });
    });
    e.target.value = '';
  }, [addImageOverlay]);

  const totalLayers =
    (uploadedImageUrl ? 1 : 0) + imageOverlays.length + textOverlays.length + annotations.length + blurRegions.length;

  // Show up to 4 thumbnails from image overlays for the stacked preview
  const previewOverlays = imageOverlays.slice(-4);

  return (
    <SectionWrapper title="Stickers" defaultOpen={true}>
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddImage}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-foreground/[0.04] border border-dashed border-foreground/15 hover:bg-foreground/[0.06] hover:border-foreground/25 transition-all duration-150 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground/[0.08] text-foreground">
            <Image01Icon size={16} />
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Add Image to Canvas
          </span>
        </button>

        <button
          onClick={() => setActiveRightPanelTab('depth')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-md bg-foreground/[0.04] border border-foreground/10 hover:bg-foreground/[0.06] hover:border-foreground/20 transition-all duration-150 group"
        >
        <div className="relative w-10 h-10 shrink-0">
          {previewOverlays.length > 0 ? (
            previewOverlays.map((overlay, i) => (
              <div
                key={overlay.id}
                className="absolute w-7 h-7 rounded-md bg-card border border-foreground/10 overflow-hidden"
                style={{
                  top: `${(previewOverlays.length - 1 - i) * 3}px`,
                  left: `${i * 3}px`,
                  zIndex: i,
                }}
              >
                <img
                  src={getThumbSrc(overlay)}
                  alt=""
                  draggable={false}
                  className="w-full h-full object-contain"
                />
              </div>
            ))
          ) : (
            <div className="w-10 h-10 rounded-md bg-foreground/[0.06] border border-foreground/10 flex items-center justify-center">
              <LayersLogoIcon size={18} className="text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium text-foreground">
            {totalLayers > 0 ? `${totalLayers} layer${totalLayers !== 1 ? 's' : ''}` : 'No layers'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {totalLayers > 0 ? 'Manage depth & assets' : 'Add stickers, overlays & more'}
          </p>
        </div>

        <ArrowRight01Icon
          size={16}
          className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors"
        />
      </button>
      </div>
    </SectionWrapper>
  );
}
