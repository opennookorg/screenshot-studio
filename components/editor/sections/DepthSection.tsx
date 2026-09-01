'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import type { ImageOverlay, ImageOverlayTilt, ImageShadow } from '@/lib/store';
import { SectionWrapper } from './SectionWrapper';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_OVERLAY_SHADOW, DEFAULT_OVERLAY_TILT } from '@/lib/overlay-style';
import { getR2ImageUrl } from '@/lib/r2';
import { getOverlayUrl } from '@/lib/r2-overlays';
import { isOverlayPath } from '@/lib/r2-overlays';
import {
  Delete02Icon,
  ViewIcon,
  ViewOffSlashIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Upload04Icon,
  RotateRight01Icon,
  RotateLeft01Icon,
  RefreshIcon,
  Image01Icon,
  TextIcon,
  PencilEdit02Icon,
  BlurIcon,
  LayersLogoIcon,
  LayerBringForwardIcon,
  LayerSendBackwardIcon,
} from 'hugeicons-react';

// ── Local overlay assets ─────────────────────────────────────────────────────

const LOCAL_OBJECTS = [
  '/overlay/Sphere-Black_J0R1G4FTa.webp',
  '/overlay/Cube Black.png',
  '/overlay/Cube-Blue_5neS6XLEm.webp',
  '/overlay/Cone-Black_MA6nEafnH.webp',
  '/overlay/Cylinder-Black.webp',
  '/overlay/Cuboid-Black.webp',
  '/overlay/Hemisphere-Black.webp',
  '/overlay/Icosahedron-Black.webp',
  '/overlay/Pill-Black.webp',
  '/overlay/Torus-Black.webp',
  '/overlay/Torus-Knot-Black.webp',
  '/overlay/Circle1-Blue_FcSXRpwI5.webp',
  '/overlay/Circle2-Blue_dbyn-_NY_6.webp',
  '/overlay/Circle3-Blue_QVRHMAzwt.webp',
  '/overlay/Circle4-Blue_XuA_U_Gsl.webp',
  '/overlay/Circle5-Blue_UO9IKLT23.webp',
  '/overlay/Circle6-Blue_qRAqS7z5q.webp',
  '/overlay/Circle7-Blue_ldTpkiWch.webp',
  '/overlay/Circle8-Blue_Gu4BG_oiD.webp',
  '/overlay/Circle9-Blue_xUeQSO_R4.webp',
  '/overlay/Circle10-Blue_2-PyL3V8e.webp',
  '/overlay/Circle11-Blue_Z6rqYW4kb.webp',
  '/overlay/Circle12-Blue_xVHP9isTC.webp',
  '/overlay/Circle13-Blue_WifYa5D9W.webp',
  '/overlay/Circle14-Blue_Q6rPGEiJM.webp',
];

// ── Layer type helpers ───────────────────────────────────────────────────────

type LayerType = 'image-overlay' | 'text-overlay' | 'annotation' | 'blur';

interface LayerItem {
  id: string;
  type: LayerType;
  label: string;
  isVisible: boolean;
  thumbnailSrc?: string;
  layerPosition?: 'front' | 'back';
}

// ── Component ────────────────────────────────────────────────────────────────

export function DepthSection() {
  const {
    uploadedImageUrl,
    imageName,
    imageOverlays,
    textOverlays,
    annotations,
    blurRegions,
    addImageOverlay,
    updateImageOverlay,
    removeImageOverlay,
    reorderImageOverlay,
    updateTextOverlay,
    removeTextOverlay,
    removeAnnotation,
    updateAnnotation,
    removeBlurRegion,
  } = useImageStore();

  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Build unified layer list (bottom to top: image overlays order, then text, then annotations, then blur)
  const layers = React.useMemo<LayerItem[]>(() => {
    const items: LayerItem[] = [];

    // Image overlays (array order = z-order, first = bottom)
    imageOverlays.forEach((overlay, i) => {
      const isR2 = isOverlayPath(overlay.src) || (typeof overlay.src === 'string' && overlay.src.startsWith('overlays/'));
      const thumbSrc = isR2 && !overlay.isCustom ? getR2ImageUrl({ src: overlay.src }) : overlay.src;
      // Derive a readable label from the filename
      const nameFromPath = overlay.src.startsWith('/')
        ? overlay.src.split('/').pop()?.replace(/\.\w+$/, '').replace(/[-_][A-Za-z0-9]{6,}$/, '').replace(/[-_]/g, ' ').trim() ?? `Asset ${i + 1}`
        : null;
      items.push({
        id: overlay.id,
        type: 'image-overlay',
        label: nameFromPath || (overlay.isCustom ? `Upload ${i + 1}` : `Overlay ${i + 1}`),
        isVisible: overlay.isVisible,
        thumbnailSrc: thumbSrc,
        layerPosition: overlay.layer || 'front',
      });
    });

    // Text overlays
    textOverlays.forEach((text, i) => {
      items.push({
        id: text.id,
        type: 'text-overlay',
        label: text.text?.slice(0, 16) || `Text ${i + 1}`,
        isVisible: text.isVisible,
      });
    });

    // Annotations
    annotations.forEach((ann, i) => {
      items.push({
        id: ann.id,
        type: 'annotation',
        label: `${ann.type.charAt(0).toUpperCase() + ann.type.slice(1)} ${i + 1}`,
        isVisible: ann.isVisible,
      });
    });

    // Blur regions
    blurRegions.forEach((blur, i) => {
      items.push({
        id: blur.id,
        type: 'blur',
        label: `Blur ${i + 1}`,
        isVisible: blur.isVisible,
      });
    });

    return items;
  }, [imageOverlays, textOverlays, annotations, blurRegions]);

  // Handle file upload for custom overlay
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    addImageOverlay({
      src: blobUrl,
      position: { x: 200 + Math.random() * 100, y: 200 + Math.random() * 100 },
      size: 150,
      rotation: 0,
      opacity: 1,
      flipX: false,
      flipY: false,
      isVisible: true,
      isCustom: true,
    });

    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  // Handle adding an asset from the gallery
  const handleAddAsset = (assetPath: string) => {
    const isLocal = assetPath.startsWith('/');
    addImageOverlay({
      src: isLocal ? assetPath : assetPath,
      position: { x: 250 + Math.random() * 60, y: 250 + Math.random() * 60 },
      size: 150,
      rotation: 0,
      opacity: 1,
      flipX: false,
      flipY: false,
      isVisible: true,
      isCustom: isLocal,
    });
  };

  // Toggle visibility for any layer type
  const handleToggleVisibility = (layer: LayerItem) => {
    switch (layer.type) {
      case 'image-overlay':
        updateImageOverlay(layer.id, { isVisible: !layer.isVisible });
        break;
      case 'text-overlay':
        updateTextOverlay(layer.id, { isVisible: !layer.isVisible });
        break;
      case 'annotation':
        updateAnnotation(layer.id, { isVisible: !layer.isVisible });
        break;
      case 'blur':
        // BlurRegion doesn't have isVisible toggle in store, skip
        break;
    }
  };

  // Remove any layer type
  const handleRemoveLayer = (layer: LayerItem) => {
    switch (layer.type) {
      case 'image-overlay':
        removeImageOverlay(layer.id);
        break;
      case 'text-overlay':
        removeTextOverlay(layer.id);
        break;
      case 'annotation':
        removeAnnotation(layer.id);
        break;
      case 'blur':
        removeBlurRegion(layer.id);
        break;
    }
    if (selectedLayerId === layer.id) {
      setSelectedLayerId(null);
    }
  };

  // Get icon for layer type
  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'image-overlay':
        return <Image01Icon size={14} />;
      case 'text-overlay':
        return <TextIcon size={14} />;
      case 'annotation':
        return <PencilEdit02Icon size={14} />;
      case 'blur':
        return <BlurIcon size={14} />;
    }
  };

  // Selected image overlay (for editing controls)
  const selectedOverlay = selectedLayerId
    ? imageOverlays.find((o) => o.id === selectedLayerId) ?? null
    : null;

  const activeAssets = LOCAL_OBJECTS;

  return (
    <div className="space-y-2">
      <SectionWrapper
        title="Layers"
        defaultOpen={true}
        action={
          layers.length + (uploadedImageUrl ? 1 : 0) > 0 ? (
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {layers.length + (uploadedImageUrl ? 1 : 0)}
            </span>
          ) : undefined
        }
      >
        {layers.length === 0 && !uploadedImageUrl ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <LayersLogoIcon size={28} className="text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No layers yet. Add assets below or use the Edit tab.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {[...layers].reverse().map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              const isImageOverlay = layer.type === 'image-overlay';

              return (
                <div
                  key={layer.id}
                  className={cn(
                    'rounded-md transition-all duration-150',
                    isSelected && 'bg-foreground/[0.04]'
                  )}
                >
                  <div
                    onClick={() => setSelectedLayerId(isSelected ? null : layer.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-150 group',
                      isSelected
                        ? 'bg-foreground/[0.06]'
                        : 'hover:bg-foreground/[0.04]'
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center shrink-0 overflow-hidden",
                      isSelected
                        ? "bg-foreground/[0.1] border border-foreground/20"
                        : "bg-foreground/[0.06] border border-foreground/10"
                    )}>
                      {layer.thumbnailSrc ? (
                        <img
                          src={layer.thumbnailSrc}
                          alt=""
                          draggable={false}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className={cn(
                          isSelected ? "text-foreground" : "text-muted-foreground/60"
                        )}>
                          {getLayerIcon(layer.type)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-medium truncate",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}>
                        {layer.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {layer.type === 'image-overlay' ? 'Image' : layer.type === 'text-overlay' ? 'Text' : layer.type === 'annotation' ? 'Drawing' : layer.type.replace('-', ' ')}
                        </p>
                        {isImageOverlay && layer.layerPosition === 'back' && (
                          <span className="text-[9px] px-1 py-px rounded bg-foreground/[0.06] text-muted-foreground leading-none border border-foreground/10">
                            behind
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(layer);
                        }}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          layer.isVisible
                            ? 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]'
                            : 'text-muted-foreground/30 hover:text-foreground hover:bg-foreground/[0.06]'
                        )}
                        title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.isVisible ? <ViewIcon size={14} /> : <ViewOffSlashIcon size={14} />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLayer(layer);
                        }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove layer"
                      >
                        <Delete02Icon size={13} />
                      </button>
                    </div>
                  </div>

                  {isSelected && isImageOverlay && (
                    <div className="flex items-center gap-1 px-2.5 pb-2 pt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderImageOverlay(layer.id, 'up');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors border border-foreground/10"
                        title="Move forward"
                      >
                        <ArrowUp01Icon size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderImageOverlay(layer.id, 'down');
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors border border-foreground/10"
                        title="Move backward"
                      >
                        <ArrowDown01Icon size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newLayer = layer.layerPosition === 'back' ? 'front' : 'back';
                          updateImageOverlay(layer.id, { layer: newLayer });
                        }}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors border',
                          layer.layerPosition === 'back'
                            ? 'text-foreground border-foreground/20 bg-foreground/[0.08] hover:bg-foreground/[0.1]'
                            : 'text-muted-foreground border-foreground/10 hover:text-foreground hover:bg-foreground/[0.06]'
                        )}
                        title={layer.layerPosition === 'back' ? 'Move to front' : 'Move behind image'}
                      >
                        {layer.layerPosition === 'back'
                          ? <><LayerBringForwardIcon size={12} /> Front</>
                          : <><LayerSendBackwardIcon size={12} /> Back</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {uploadedImageUrl && (
              <div
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md"
                title="Main image"
              >
                <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 overflow-hidden bg-foreground/[0.06] border border-foreground/10">
                  <img
                    src={uploadedImageUrl}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {imageName || 'Main image'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Main image · edit in the Edit tab</p>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionWrapper>

      {selectedOverlay && (
        <SectionWrapper title="Properties" defaultOpen={true}>
          <OverlayProperties
            overlay={selectedOverlay}
            onUpdate={(updates) => updateImageOverlay(selectedOverlay.id, updates)}
            onRemove={() => {
              removeImageOverlay(selectedOverlay.id);
              setSelectedLayerId(null);
            }}
          />
        </SectionWrapper>
      )}

      <SectionWrapper title="3D Objects" defaultOpen={layers.length === 0}>
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-dashed border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.04] text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <Upload04Icon size={16} />
            <span className="text-xs font-medium">Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="grid grid-cols-3 gap-2 p-1">
            {activeAssets.map((assetPath) => {
              const isLocal = assetPath.startsWith('/');
              const url = isLocal ? assetPath : getOverlayUrl(assetPath);
              const isSvg = assetPath.endsWith('.svg');
              return (
                <button
                  key={assetPath}
                  onClick={() => handleAddAsset(assetPath)}
                  className="aspect-square rounded-md border border-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.06] hover:border-foreground/20 transition-all duration-150 overflow-hidden p-2.5 group"
                  title="Click to add"
                >
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    className={cn(
                      'w-full h-full object-contain group-hover:scale-110 transition-transform duration-150',
                      isSvg && 'dark:invert dark:opacity-80'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}

// ── Overlay properties sub-component ─────────────────────────────────────────

function OverlayProperties({
  overlay,
  onUpdate,
  onRemove,
}: {
  overlay: ImageOverlay;
  onUpdate: (updates: Partial<ImageOverlay>) => void;
  onRemove: () => void;
}) {
  const normalizeRotation = (rotation: number): number => {
    let normalized = rotation % 360;
    if (normalized > 180) normalized -= 360;
    if (normalized < -180) normalized += 360;
    return normalized;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Slider
          value={[overlay.size]}
          onValueChange={(v) => onUpdate({ size: v[0] })}
          min={20}
          max={600}
          step={1}
          label="Size"
          valueDisplay={`${overlay.size}px`}
        />
        <Slider
          value={[overlay.rotation]}
          onValueChange={(v) => onUpdate({ rotation: v[0] })}
          min={-180}
          max={180}
          step={1}
          label="Rotation"
          valueDisplay={`${overlay.rotation}°`}
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => onUpdate({ rotation: normalizeRotation(overlay.rotation - 90) })}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-foreground/[0.04] border border-foreground/10 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <RotateLeft01Icon size={13} /> -90
          </button>
          <button
            onClick={() => onUpdate({ rotation: 0 })}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-foreground/[0.04] border border-foreground/10 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <RefreshIcon size={13} /> Reset
          </button>
          <button
            onClick={() => onUpdate({ rotation: normalizeRotation(overlay.rotation + 90) })}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-foreground/[0.04] border border-foreground/10 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
          >
            <RotateRight01Icon size={13} /> +90
          </button>
        </div>
        <Slider
          value={[overlay.opacity]}
          onValueChange={(v) => onUpdate({ opacity: v[0] })}
          min={0}
          max={1}
          step={0.01}
          label="Opacity"
          valueDisplay={`${Math.round(overlay.opacity * 100)}%`}
        />
        <Slider
          value={[overlay.blur ?? 0]}
          onValueChange={(v) => onUpdate({ blur: v[0] })}
          min={0}
          max={20}
          step={0.5}
          label="Blur"
          valueDisplay={`${overlay.blur ?? 0}px`}
        />
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => onUpdate({ flipX: !overlay.flipX })}
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-medium border transition-colors',
            overlay.flipX
              ? 'bg-foreground/[0.1] text-foreground border-foreground/20'
              : 'bg-foreground/[0.04] text-muted-foreground border-foreground/10 hover:text-foreground hover:bg-foreground/[0.06]'
          )}
        >
          Flip X
        </button>
        <button
          onClick={() => onUpdate({ flipY: !overlay.flipY })}
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-medium border transition-colors',
            overlay.flipY
              ? 'bg-foreground/[0.1] text-foreground border-foreground/20'
              : 'bg-foreground/[0.04] text-muted-foreground border-foreground/10 hover:text-foreground hover:bg-foreground/[0.06]'
          )}
        >
          Flip Y
        </button>
      </div>

      <OverlayCornerRadiusControls overlay={overlay} onUpdate={onUpdate} />
      <OverlayTiltControls overlay={overlay} onUpdate={onUpdate} />
      <OverlayShadowControls overlay={overlay} onUpdate={onUpdate} />

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Position</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onUpdate({ layer: 'front' })}
            className={cn(
              'flex-1 py-2 rounded-md text-xs font-medium border transition-colors',
              (overlay.layer || 'front') === 'front'
                ? 'bg-foreground/[0.1] text-foreground border-foreground/20'
                : 'bg-foreground/[0.04] text-muted-foreground border-foreground/10 hover:text-foreground hover:bg-foreground/[0.06]'
            )}
          >
            In Front
          </button>
          <button
            onClick={() => onUpdate({ layer: 'back' })}
            className={cn(
              'flex-1 py-2 rounded-md text-xs font-medium border transition-colors',
              overlay.layer === 'back'
                ? 'bg-foreground/[0.1] text-foreground border-foreground/20'
                : 'bg-foreground/[0.04] text-muted-foreground border-foreground/10 hover:text-foreground hover:bg-foreground/[0.06]'
            )}
          >
            Behind Image
          </button>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-colors"
      >
        <Delete02Icon size={14} />
        Remove
      </button>
    </div>
  );
}

interface OverlayControlProps {
  overlay: ImageOverlay;
  onUpdate: (updates: Partial<ImageOverlay>) => void;
}

function OverlayCornerRadiusControls({ overlay, onUpdate }: OverlayControlProps) {
  return (
    <Slider
      value={[overlay.radius ?? 0]}
      onValueChange={(v) => onUpdate({ radius: v[0] })}
      min={0}
      max={100}
      step={1}
      label="Corner radius"
      valueDisplay={`${overlay.radius ?? 0}px`}
    />
  );
}

function OverlayTiltControls({ overlay, onUpdate }: OverlayControlProps) {
  const tilt = overlay.tilt ?? DEFAULT_OVERLAY_TILT;
  const setTilt = (updates: Partial<ImageOverlayTilt>) =>
    onUpdate({ tilt: { ...tilt, ...updates } });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">3D Tilt</span>
        <button
          onClick={() => onUpdate({ tilt: undefined })}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors border border-foreground/10"
        >
          <RefreshIcon size={11} /> Reset
        </button>
      </div>
      <Slider
        value={[tilt.rotateX]}
        onValueChange={(v) => setTilt({ rotateX: v[0] })}
        min={-45}
        max={45}
        step={1}
        label="Rotate X"
        valueDisplay={`${tilt.rotateX}°`}
      />
      <Slider
        value={[tilt.rotateY]}
        onValueChange={(v) => setTilt({ rotateY: v[0] })}
        min={-45}
        max={45}
        step={1}
        label="Rotate Y"
        valueDisplay={`${tilt.rotateY}°`}
      />
      <Slider
        value={[tilt.perspective]}
        onValueChange={(v) => setTilt({ perspective: v[0] })}
        min={50}
        max={1000}
        step={10}
        label="Perspective"
        valueDisplay={`${tilt.perspective}px`}
      />
    </div>
  );
}

function OverlayShadowControls({ overlay, onUpdate }: OverlayControlProps) {
  const shadow = overlay.shadow ?? DEFAULT_OVERLAY_SHADOW;
  const setShadow = (updates: Partial<ImageShadow>) =>
    onUpdate({ shadow: { ...shadow, ...updates } });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Shadow</span>
        <Switch
          checked={shadow.enabled}
          onCheckedChange={(enabled) => setShadow({ enabled })}
          aria-label="Toggle overlay shadow"
        />
      </div>
      {shadow.enabled && (
        <>
          <Slider
            value={[shadow.blur]}
            onValueChange={(v) => setShadow({ blur: v[0] })}
            min={0}
            max={60}
            step={1}
            label="Blur"
            valueDisplay={`${shadow.blur}px`}
          />
          <Slider
            value={[shadow.offsetX]}
            onValueChange={(v) => setShadow({ offsetX: v[0] })}
            min={-50}
            max={50}
            step={1}
            label="Offset X"
            valueDisplay={`${shadow.offsetX}px`}
          />
          <Slider
            value={[shadow.offsetY]}
            onValueChange={(v) => setShadow({ offsetY: v[0] })}
            min={-50}
            max={50}
            step={1}
            label="Offset Y"
            valueDisplay={`${shadow.offsetY}px`}
          />
          <Slider
            value={[shadow.opacity]}
            onValueChange={(v) => setShadow({ opacity: v[0] })}
            min={0}
            max={1}
            step={0.01}
            label="Opacity"
            valueDisplay={`${Math.round(shadow.opacity * 100)}%`}
          />
        </>
      )}
    </div>
  );
}
