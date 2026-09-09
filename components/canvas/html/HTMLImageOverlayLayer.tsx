'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';
import type { ImageOverlay } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Delete02Icon,
  Copy01Icon,
  LayerSendToBackIcon,
  LayerBringToFrontIcon,
} from 'hugeicons-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface HTMLImageOverlayLayerProps {
  imageOverlays: ImageOverlay[];
  loadedOverlayImages: Record<string, HTMLImageElement>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  setIsMainImageSelected: (selected: boolean) => void;
  setSelectedTextId: (id: string | null) => void;
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  zIndex?: number;
}

// ── Single overlay element ───────────────────────────────────────────────────

function OverlayElement({
  overlay,
  overlayImg,
  onSelect,
  elRef,
}: {
  overlay: ImageOverlay;
  overlayImg: HTMLImageElement;
  onSelect: () => void;
  elRef?: (el: HTMLDivElement | null) => void;
}) {
  const isShadow = useMemo(
    () => typeof overlay.src === 'string' && overlay.src.includes('overlay-shadow'),
    [overlay.src]
  );

  if (!overlay.isVisible) return null;

  if (isShadow) {
    return (
      <div
        ref={elRef}
        data-overlay-id={overlay.id}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: overlay.opacity,
          userSelect: 'none',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <img
          src={overlayImg.src}
          alt="Shadow overlay"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  const flipTransform = [
    overlay.flipX ? 'scaleX(-1)' : '',
    overlay.flipY ? 'scaleY(-1)' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={elRef}
      data-overlay-id={overlay.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'absolute',
        left: `${overlay.position.x - overlay.size / 2}px`,
        top: `${overlay.position.y - overlay.size / 2}px`,
        width: `${overlay.size}px`,
        height: `${overlay.size}px`,
        transform: `rotate(${overlay.rotation}deg)`,
        opacity: overlay.opacity,
        filter: (overlay.blur ?? 0) > 0 ? `blur(${overlay.blur}px)` : undefined,
        cursor: 'grab',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <img
        src={overlayImg.src}
        alt="Overlay"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          transform: flipTransform || undefined,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ── Context toolbar (minimal, bottom-anchored) ──────────────────────────────

function ContextToolbar({
  overlay,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  overlay: ImageOverlay;
  onUpdate: (updates: Partial<ImageOverlay>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isFront = (overlay.layer || 'front') === 'front';

  return (
    <div
      className={cn(
        'absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[calc(100%+8px)]',
        'z-[999] flex h-8 items-center gap-0.5 rounded-md px-1',
        'bg-card border border-foreground/10',
        'shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-100'
      )}
      style={{ pointerEvents: 'auto' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpdate({ layer: isFront ? 'back' : 'front' });
        }}
        className={cn(
          'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors duration-150',
          'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
        )}
        title={isFront ? 'Send behind image' : 'Bring to front'}
      >
        {isFront ? <LayerSendToBackIcon size={14} /> : <LayerBringToFrontIcon size={14} />}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground"
        title="Duplicate"
      >
        <Copy01Icon size={14} />
      </button>
      <div className="mx-0.5 h-3.5 w-px bg-foreground/10" aria-hidden />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-destructive/15 hover:text-destructive"
        title="Delete"
      >
        <Delete02Icon size={14} />
      </button>
    </div>
  );
}

// ── Main layer component ─────────────────────────────────────────────────────

export function HTMLImageOverlayLayer({
  imageOverlays,
  loadedOverlayImages,
  selectedOverlayId,
  setSelectedOverlayId,
  setIsMainImageSelected,
  setSelectedTextId,
  updateImageOverlay,
  onDuplicate,
  onDelete,
  zIndex = 200,
}: HTMLImageOverlayLayerProps) {
  const [selectedEl, setSelectedEl] = useState<HTMLDivElement | null>(null);
  const [interacting, setInteracting] = useState(false);
  const moveableRef = useRef<Moveable | null>(null);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedOverlayId(id);
      setIsMainImageSelected(false);
      setSelectedTextId(null);
    },
    [setSelectedOverlayId, setIsMainImageSelected, setSelectedTextId]
  );

  const selectedOverlay = selectedOverlayId
    ? imageOverlays.find((o) => o.id === selectedOverlayId)
    : null;

  const isShadow = selectedOverlay?.src.includes('overlay-shadow');

  // Keep Moveable bounding box synchronized with external slider / store changes
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [
    selectedOverlay?.size,
    selectedOverlay?.position.x,
    selectedOverlay?.position.y,
    selectedOverlay?.rotation,
    selectedOverlay?.flipX,
    selectedOverlay?.flipY,
    selectedOverlay?.blur,
  ]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex,
        overflow: 'visible',
      }}
    >
      {imageOverlays.map((overlay) => {
        if (!overlay.isVisible) return null;
        const overlayImg = loadedOverlayImages[overlay.id];
        if (!overlayImg) return null;

        return (
          <OverlayElement
            key={overlay.id}
            overlay={overlay}
            overlayImg={overlayImg}
            onSelect={() => handleSelect(overlay.id)}
            elRef={overlay.id === selectedOverlayId ? setSelectedEl : undefined}
          />
        );
      })}

      {selectedOverlay && selectedEl && !isShadow && (
        <>
          <Moveable
            ref={moveableRef}
            target={selectedEl}
            draggable={true}
            resizable={true}
            rotatable={true}
            keepRatio={true}
            throttleDrag={0}
            throttleResize={0}
            throttleRotate={0}
            renderDirections={['nw', 'ne', 'sw', 'se']}
            rotationPosition={'top'}
            origin={false}
            edge={false}
            onDragStart={() => setInteracting(true)}
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`;
              target.style.top = `${top}px`;
            }}
            onDragEnd={({ target }) => {
              setInteracting(false);
              const left = parseFloat(target.style.left);
              const top = parseFloat(target.style.top);
              const w = parseFloat(target.style.width);
              const h = parseFloat(target.style.height);
              updateImageOverlay(selectedOverlay.id, {
                position: { x: left + w / 2, y: top + h / 2 },
              });
            }}
            onResizeStart={() => setInteracting(true)}
            onResize={({ target, width, height, drag }) => {
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              target.style.left = `${drag.left}px`;
              target.style.top = `${drag.top}px`;
            }}
            onResizeEnd={({ target }) => {
              setInteracting(false);
              const w = parseFloat(target.style.width);
              const h = parseFloat(target.style.height);
              const left = parseFloat(target.style.left);
              const top = parseFloat(target.style.top);
              updateImageOverlay(selectedOverlay.id, {
                size: Math.round(Math.max(w, h)),
                position: { x: left + w / 2, y: top + h / 2 },
              });
            }}
            onRotateStart={() => setInteracting(true)}
            onRotate={({ target, transform }) => {
              target.style.transform = transform;
            }}
            onRotateEnd={({ target }) => {
              setInteracting(false);
              const match = target.style.transform.match(/rotate\(([-\d.]+)deg\)/);
              if (match) {
                let deg = parseFloat(match[1]) % 360;
                if (deg > 180) deg -= 360;
                if (deg < -180) deg += 360;
                updateImageOverlay(selectedOverlay.id, { rotation: Math.round(deg) });
              }
            }}
          />

          {!interacting && (
            <div
              style={{
                position: 'absolute',
                left: `${selectedOverlay.position.x - selectedOverlay.size / 2}px`,
                top: `${selectedOverlay.position.y - selectedOverlay.size / 2}px`,
                width: `${selectedOverlay.size}px`,
                height: `${selectedOverlay.size}px`,
                pointerEvents: 'none',
              }}
            >
              <ContextToolbar
                overlay={selectedOverlay}
                onUpdate={(updates) => updateImageOverlay(selectedOverlay.id, updates)}
                onDuplicate={() => onDuplicate?.(selectedOverlay.id)}
                onDelete={() => onDelete?.(selectedOverlay.id)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
