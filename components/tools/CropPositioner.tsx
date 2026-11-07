"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  coverCropForResize,
  moveCropPlacement,
  zoomCropPlacement,
  DEFAULT_CROP_PLACEMENT,
  MAX_CROP_ZOOM,
  type CropPlacement,
  type ResizeOptions,
} from "@/lib/image-tools";
import type { QueueItem } from "./useToolQueue";

/** How far one arrow key press moves the frame, as a share of the image. */
const KEY_STEP = 0.02;

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startPlacement: CropPlacement;
  /** Source pixels per preview pixel, measured when the drag starts. */
  scale: number;
}

interface CropPositionerProps {
  items: QueueItem[];
  resize: ResizeOptions;
  placementById: Record<string, CropPlacement>;
  onPlacementChange: (itemId: string, placement: CropPlacement) => void;
  disabled?: boolean;
}

/**
 * Shows what a crop-to-fit resize will keep from each image and lets the user
 * move and zoom it. Each image has its own placement, since their subjects differ.
 */
export function CropPositioner({
  items,
  resize,
  placementById,
  onPlacementChange,
  disabled = false,
}: CropPositionerProps) {
  const [index, setIndex] = React.useState(0);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<DragState | null>(null);

  const ready = items.filter((item) => item.source);
  const activeIndex = Math.min(index, ready.length - 1);
  const item = ready[activeIndex];
  const source = item?.source;
  if (!item || !source) return null;

  const placement = placementById[item.id] ?? DEFAULT_CROP_PLACEMENT;
  const crop = coverCropForResize(source, { ...resize, cropPlacement: placement });
  if (!crop) return null;

  const canMove = crop.width < source.width || crop.height < source.height;
  // The crop is what actually gets scaled, so a large photo can still need
  // enlarging once it is cut to a tall shape or zoomed in.
  const needsEnlarging =
    crop.width < (resize.width ?? 0) || crop.height < (resize.height ?? 0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const preview = previewRef.current;
    if (!canMove || disabled || !preview) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPlacement: placement,
      scale: source.width / preview.getBoundingClientRect().width,
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    onPlacementChange(
      item.id,
      moveCropPlacement(
        drag.startPlacement,
        (event.clientX - drag.startX) * drag.scale,
        (event.clientY - drag.startY) * drag.scale,
        source,
        crop
      )
    );
  };

  const endDrag = (event: React.PointerEvent) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction || !canMove || disabled) return;
    event.preventDefault();
    onPlacementChange(
      item.id,
      moveCropPlacement(
        placement,
        direction[0] * source.width * KEY_STEP,
        direction[1] * source.height * KEY_STEP,
        source,
        crop
      )
    );
  };

  return (
    <div className="mt-2 border-t border-border px-3 pb-2 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Choose what stays</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {canMove
              ? "Drag the frame over the part you want to keep."
              : "All of this image fits. Zoom in to keep a smaller part."}
          </p>
        </div>
        {ready.length > 1 ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous image"
              disabled={activeIndex === 0}
              onClick={() => setIndex(activeIndex - 1)}
            >
              <ArrowLeft01Icon size={16} aria-hidden="true" />
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {activeIndex + 1} of {ready.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next image"
              disabled={activeIndex === ready.length - 1}
              onClick={() => setIndex(activeIndex + 1)}
            >
              <ArrowRight01Icon size={16} aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center rounded-xl bg-background/70 p-3">
        <div
          ref={previewRef}
          className="relative inline-block select-none overflow-hidden rounded-md"
        >
          <Image
            src={item.previewUrl}
            alt={`Preview of ${item.name}`}
            width={source.width}
            height={source.height}
            unoptimized
            draggable={false}
            className="block h-auto max-h-[50vh] w-auto max-w-full"
          />
          {/* The oversized shadow dims the rest; the wrapper clips it to the image. */}
          <div
            role="group"
            tabIndex={canMove && !disabled ? 0 : undefined}
            aria-label="Crop frame. Use the arrow keys to move it."
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              canMove && !disabled && "cursor-move touch-none"
            )}
            style={{
              left: `${(crop.x / source.width) * 100}%`,
              top: `${(crop.y / source.height) * 100}%`,
              width: `${(crop.width / source.width) * 100}%`,
              height: `${(crop.height / source.height) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3">
        <Slider
          value={[placement.zoom]}
          min={1}
          max={MAX_CROP_ZOOM}
          step={0.1}
          disabled={disabled}
          onValueChange={([zoom]) =>
            onPlacementChange(
              item.id,
              zoomCropPlacement(placement, zoom, source, resize)
            )
          }
          label="Zoom"
          aria-label="Zoom"
          valueDisplay={`${placement.zoom.toFixed(1)}×`}
        />
      </div>

      {needsEnlarging ? (
        <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/[0.07] p-3 text-xs leading-relaxed text-muted-foreground">
          {resize.allowUpscale
            ? "This part of your image is smaller than the final size, so it will be enlarged and may look soft."
            : `Upscaling is off, so the result will be smaller than ${resize.width} × ${resize.height}.`}
        </p>
      ) : null}
    </div>
  );
}
