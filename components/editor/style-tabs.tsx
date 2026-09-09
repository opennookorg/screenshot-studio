'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BorderControls } from '@/components/controls/BorderControls';
import { ShadowControls } from '@/components/controls/ShadowControls';
import { Perspective3DControls } from '@/components/controls/Perspective3DControls';
import {
  Image01Icon,
  Delete02Icon,
  Copy01Icon,
  LayerSendToBackIcon,
  LayerBringToFrontIcon,
  LayersLogoIcon,
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { getR2ImageUrl } from '@/lib/r2';
import { isOverlayPath } from '@/lib/r2-overlays';

function getThumbSrc(overlay: { src: string; isCustom?: boolean }) {
  const isR2 =
    isOverlayPath(overlay.src) ||
    (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'));
  return isR2 && !overlay.isCustom
    ? getR2ImageUrl({ src: overlay.src })
    : overlay.src;
}

export function StyleTabs() {
  const {
    uploadedImageUrl,
    borderRadius,
    imageOpacity,
    imageScale,
    imageShadow,
    imageOverlays,
    selectedOverlayId,
    setSelectedOverlayId,
    setIsMainImageSelected,
    updateImageOverlay,
    removeImageOverlay,
    addImageOverlay,
    setBorderRadius,
    setImageOpacity,
    setImageScale,
    setImageShadow,
  } = useImageStore();

  const selectedOverlay = selectedOverlayId
    ? imageOverlays.find((o) => o.id === selectedOverlayId)
    : null;

  const hasMultipleImages = imageOverlays.length > 0;

  const handleDuplicate = (overlay: typeof imageOverlays[0]) => {
    addImageOverlay({
      src: overlay.src,
      position: { x: overlay.position.x + 30, y: overlay.position.y + 30 },
      size: overlay.size,
      rotation: overlay.rotation,
      opacity: overlay.opacity,
      blur: overlay.blur,
      flipX: overlay.flipX,
      flipY: overlay.flipY,
      isVisible: overlay.isVisible,
      isCustom: overlay.isCustom,
      layer: overlay.layer,
    });
  };

  return (
    <div className="space-y-5">
      {/* Active Image Switcher (shown when multiple images exist) */}
      {hasMultipleImages && (
        <div className="space-y-2 pb-1 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <LayersLogoIcon size={14} className="text-primary" />
              Active Image
            </Label>
            <span className="text-[11px] text-muted-foreground font-medium">
              {selectedOverlay ? 'Overlay Selected' : 'Main Image Selected'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
            {/* Main Image Pill */}
            <button
              type="button"
              onClick={() => {
                setSelectedOverlayId(null);
                setIsMainImageSelected(true);
              }}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border',
                !selectedOverlayId
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background hover:bg-accent text-foreground border-border/60'
              )}
            >
              <div className="w-5 h-5 rounded overflow-hidden bg-background/20 flex items-center justify-center shrink-0">
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Main"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image01Icon size={12} />
                )}
              </div>
              <span className="truncate max-w-[90px]">Main Image</span>
            </button>

            {/* Overlay Images Pills */}
            {imageOverlays.map((overlay, index) => {
              const isSelected = selectedOverlayId === overlay.id;
              const thumbSrc = getThumbSrc(overlay);
              return (
                <button
                  key={overlay.id}
                  type="button"
                  onClick={() => {
                    setSelectedOverlayId(overlay.id);
                    setIsMainImageSelected(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background hover:bg-accent text-foreground border-border/60'
                  )}
                >
                  <div className="w-5 h-5 rounded overflow-hidden bg-background/20 flex items-center justify-center shrink-0">
                    <img
                      src={thumbSrc}
                      alt={`Overlay ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate max-w-[80px]">
                    Image {index + 2}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* When an overlay is selected, show Overlay-specific controls */}
      {selectedOverlay ? (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Overlay Top Card */}
          <div className="p-3 rounded-lg bg-foreground/[0.03] border border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-md bg-background border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={getThumbSrc(selectedOverlay)}
                    alt="Overlay preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    Selected Image Layer
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(selectedOverlay.layer || 'front') === 'front'
                      ? 'In front of main image'
                      : 'Behind main image'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title={(selectedOverlay.layer || 'front') === 'front' ? 'Send behind image' : 'Bring to front'}
                  onClick={() =>
                    updateImageOverlay(selectedOverlay.id, {
                      layer: (selectedOverlay.layer || 'front') === 'front' ? 'back' : 'front',
                    })
                  }
                >
                  {(selectedOverlay.layer || 'front') === 'front' ? (
                    <LayerSendToBackIcon size={14} />
                  ) : (
                    <LayerBringToFrontIcon size={14} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Duplicate"
                  onClick={() => handleDuplicate(selectedOverlay)}
                >
                  <Copy01Icon size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                  onClick={() => {
                    removeImageOverlay(selectedOverlay.id);
                    setSelectedOverlayId(null);
                    setIsMainImageSelected(true);
                  }}
                >
                  <Delete02Icon size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Sizing / Zoom Slider */}
          <div className="space-y-2">
            <Slider
              value={[selectedOverlay.size]}
              onValueChange={(value) =>
                updateImageOverlay(selectedOverlay.id, { size: value[0] })
              }
              min={20}
              max={1200}
              step={5}
              label="Overlay Size / Zoom"
              valueDisplay={`${selectedOverlay.size}px`}
            />
            <p className="text-[11px] text-muted-foreground">
              Adjust size and scaling of this selected image
            </p>
          </div>

          {/* Opacity Slider */}
          <div className="space-y-2">
            <Slider
              value={[selectedOverlay.opacity]}
              onValueChange={(value) =>
                updateImageOverlay(selectedOverlay.id, { opacity: value[0] })
              }
              min={0}
              max={1}
              step={0.01}
              label="Opacity"
              valueDisplay={`${Math.round(selectedOverlay.opacity * 100)}%`}
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-2">
            <Slider
              value={[selectedOverlay.rotation]}
              onValueChange={(value) =>
                updateImageOverlay(selectedOverlay.id, { rotation: value[0] })
              }
              min={-180}
              max={180}
              step={1}
              label="Rotation"
              valueDisplay={`${selectedOverlay.rotation}°`}
            />
          </div>

          {/* Blur Slider */}
          <div className="space-y-2">
            <Slider
              value={[selectedOverlay.blur ?? 0]}
              onValueChange={(value) =>
                updateImageOverlay(selectedOverlay.id, { blur: value[0] })
              }
              min={0}
              max={20}
              step={1}
              label="Blur Effect"
              valueDisplay={`${selectedOverlay.blur ?? 0}px`}
            />
          </div>

          {/* Flip Controls */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Flip</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedOverlay.flipX ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() =>
                  updateImageOverlay(selectedOverlay.id, {
                    flipX: !selectedOverlay.flipX,
                  })
                }
              >
                Flip Horizontal
              </Button>
              <Button
                variant={selectedOverlay.flipY ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() =>
                  updateImageOverlay(selectedOverlay.id, {
                    flipY: !selectedOverlay.flipY,
                  })
                }
              >
                Flip Vertical
              </Button>
            </div>
          </div>

          {/* Back to Main Image button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOverlayId(null);
              setIsMainImageSelected(true);
            }}
            className="w-full h-9 text-xs font-medium gap-1.5"
          >
            ← Back to Main Image Controls
          </Button>
        </div>
      ) : (
        /* Main Image Controls */
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-12 p-1.5 gap-1.5">
            <TabsTrigger
              value="style"
              className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200"
            >
              Style
            </TabsTrigger>
            <TabsTrigger
              value="Transforms"
              className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200"
            >
              Transforms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-4 space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-foreground">
                Border Radius
              </Label>
              <div className="flex gap-2 mb-3">
                <Button
                  variant={borderRadius === 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBorderRadius(0)}
                  className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                    borderRadius === 0
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                      : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
                  }`}
                >
                  Sharp Edge
                </Button>
                <Button
                  variant={borderRadius > 0 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBorderRadius(24)}
                  className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                    borderRadius > 0
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                      : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
                  }`}
                >
                  Rounded
                </Button>
              </div>
              <Slider
                value={[borderRadius]}
                onValueChange={(value) => setBorderRadius(value[0])}
                min={0}
                max={100}
                step={1}
                label="Radius"
                valueDisplay={`${borderRadius}px`}
              />
            </div>

            <div className="space-y-3">
              <Slider
                value={[imageScale]}
                onValueChange={(value) => setImageScale(value[0])}
                min={10}
                max={200}
                step={1}
                label="Image Size"
                valueDisplay={`${imageScale}%`}
              />
              <p className="text-xs text-muted-foreground">
                Adjust the size of the main image (10% - 200%)
              </p>
            </div>

            <Slider
              value={[imageOpacity]}
              onValueChange={(value) => setImageOpacity(value[0])}
              min={0}
              max={1}
              step={0.01}
              label="Opacity"
              valueDisplay={`${Math.round(imageOpacity * 100)}%`}
            />

            <BorderControls />

            <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />
          </TabsContent>

          <TabsContent value="Transforms" className="mt-4">
            <Perspective3DControls />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

