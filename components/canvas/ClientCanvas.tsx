"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditorStore, useImageStore, useEditorStoreSync } from "@/lib/store";
import { generatePattern } from "@/lib/patterns";
import { useResponsiveCanvasDimensions } from "@/hooks/useAspectRatioDimensions";
import { generateNoiseTexture } from "@/lib/export/export-utils";
import { MockupSceneRenderer } from "@/components/mockups/MockupRenderer";
import { useDeviceUIStore } from "@/lib/store/device-ui";
import { calculateCanvasDimensions } from "./utils/canvas-dimensions";
import { CanvasStageShell } from "./CanvasStageShell";
import { Perspective3DOverlay } from "./overlays/Perspective3DOverlay";
import { useOverlayImages } from "./hooks/useImageLoading";
import {
  HTMLCanvasRenderer,
  HTMLBackgroundLayer,
  HTMLPatternLayer,
  HTMLNoiseLayer,
  HTMLMainImageLayer,
  HTMLTextOverlayLayer,
  HTMLImageOverlayLayer,
  SVGAnnotationLayer,
  HTMLBlurRegionLayer,
  SnapAlignmentGuides,
  HTMLGridLayer,
} from "./html";
import { CanvasRulers } from "./CanvasRulers";
import {
  hasVisibleMockups,
  shouldRenderSourceImage,
} from "@/lib/device-mockups/layouts";

// Reference to the HTML canvas container for export
let globalCanvasContainer: HTMLDivElement | null = null;

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  useEditorStoreSync();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const {
    screenshot,
    setScreenshot,
    shadow,
    pattern: patternStyle,
    frame: editorFrame,
    canvas,
    noise,
  } = useEditorStore();

  const {
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
    imageOpacity,
    imageFilters,
    textOverlays,
    imageOverlays,
    mockups,
    editorMode,
    imageBorder,
    updateTextOverlay,
    updateImageOverlay,
    removeImageOverlay,
    addImageOverlay,
    removeMockup,
    // Annotations
    annotations,
    activeAnnotationTool,
    selectedAnnotationId,
    setSelectedAnnotationId,
    annotationDefaults,
    addAnnotation,
    updateAnnotation: updateAnnotationShape,
    removeAnnotation,
    setActiveAnnotationTool,
    // Blur
    blurRegions,
    addBlurRegion,
    updateBlurRegion,
    removeBlurRegion,
    browserHeaderSize,
    showRulers,
    showGrid,
    rulerInterval,
    selectedOverlayId,
    setSelectedOverlayId,
    isMainImageSelected,
    setIsMainImageSelected,
  } = useImageStore();

  // Split overlays into front (default) and back (behind main image)
  const backOverlays = imageOverlays.filter((o) => o.layer === 'back');
  const frontOverlays = imageOverlays.filter((o) => o.layer !== 'back');

  // Build frame from imageBorder directly (editorStore sync may be stale)
  const frame = {
    ...editorFrame,
    enabled: imageBorder.enabled,
    type: imageBorder.type,
    width: imageBorder.width,
    color: imageBorder.color,
    padding: imageBorder.padding,
    title: imageBorder.title,
    opacity: imageBorder.opacity,
  };

  const hasDeviceScene = editorMode === "device" && hasVisibleMockups(mockups);
  const selectedDeviceId = useDeviceUIStore((state) => state.selectedDeviceId);
  const setSelectedDeviceId = useDeviceUIStore((state) => state.setSelectedDeviceId);
  const setEditingScreenDeviceId = useDeviceUIStore((state) => state.setEditingScreenDeviceId);
  const responsiveDimensions = useResponsiveCanvasDimensions();

  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });

  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null);
  const [noiseTexture, setNoiseTexture] = useState<HTMLCanvasElement | null>(
    null
  );

  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDraggingMainImage, setIsDraggingMainImage] = useState(false);
  const [selectedBlurId, setSelectedBlurId] = useState<string | null>(null);

  // 3D transform drag state — differentiates click (select) from drag (move)
  const [is3DDragging, setIs3DDragging] = useState(false);
  const [is3DPointerDown, setIs3DPointerDown] = useState(false);
  const drag3DStartRef = useRef<{
    clientX: number; clientY: number;
    tX: number; tY: number;
    moved: boolean;
  } | null>(null);

  const handle3DDragDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p3d = useImageStore.getState().perspective3D;
    drag3DStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      tX: p3d.translateX,
      tY: p3d.translateY,
      moved: false,
    };
    setIs3DPointerDown(true);
    // Select the image on click/drag start
    setIsMainImageSelected(true);
    setSelectedOverlayId(null);
    setSelectedTextId(null);
  }, []);

  useEffect(() => {
    if (!is3DPointerDown) return;

    const DRAG_THRESHOLD = 3;

    const handleMove = (e: PointerEvent) => {
      const s = drag3DStartRef.current;
      if (!s) return;

      const dx = e.clientX - s.clientX;
      const dy = e.clientY - s.clientY;

      // Only start actual drag after threshold — clicks pass through
      if (!s.moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
      s.moved = true;
      setIs3DDragging(true);

      const sensitivity = 0.15;
      const newTX = Math.max(-30, Math.min(30, s.tX + dx * sensitivity));
      const newTY = Math.max(-30, Math.min(30, s.tY + dy * sensitivity));

      useImageStore.getState().setPerspective3D({
        translateX: Math.round(newTX * 10) / 10,
        translateY: Math.round(newTY * 10) / 10,
      });
    };

    const handleUp = () => {
      setIs3DDragging(false);
      setIs3DPointerDown(false);
      drag3DStartRef.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [is3DPointerDown]);

  const containerWidth = responsiveDimensions.width;
  const containerHeight = responsiveDimensions.height;

  const loadedOverlayImages = useOverlayImages(imageOverlays);

  // Update global reference for export
  useEffect(() => {
    if (canvasContainerRef.current) {
      globalCanvasContainer = canvasContainerRef.current;
    }
    return () => {
      globalCanvasContainer = null;
    };
  }, []);

  // Clear selection when clicking outside of canvas
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const container = containerRef.current;
      if (!container) return;

      if (!container.contains(target)) {
        // Don't deselect when interacting with editor panel controls
        // (sliders, inputs, buttons, etc.) so users can tweak selected items
        const el = target as HTMLElement;
        if (el.closest?.('[data-slot="slider"], input, button, [role="button"], [data-radix-collection-item], .moveable-control-box, [data-resize-handle]')) return;

        setSelectedOverlayId(null);
        setIsMainImageSelected(false);
        setSelectedTextId(null);
        setSelectedBlurId(null);
        setSelectedAnnotationId(null);
        setSelectedDeviceId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [setSelectedAnnotationId, setSelectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    setSelectedOverlayId(null);
    setIsMainImageSelected(false);
    setSelectedTextId(null);
    setSelectedBlurId(null);
    setSelectedAnnotationId(null);
  }, [selectedDeviceId, setSelectedAnnotationId]);

  // Keyboard shortcuts for delete and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Delete selected overlay or main image (only when not typing)
      if ((e.key === "Delete" || e.key === "Backspace") && !isTyping) {
        if (selectedDeviceId && editorMode === "device") {
          e.preventDefault();
          removeMockup(selectedDeviceId);
          setSelectedDeviceId(null);
        } else if (selectedOverlayId) {
          e.preventDefault();
          removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        } else if (isMainImageSelected) {
          e.preventDefault();
          useImageStore.getState().clearImage();
          setIsMainImageSelected(false);
        }
      }

      // Undo/Redo (only when not typing)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !isTyping) {
        e.preventDefault();
        const { undo, redo } = useImageStore.temporal.getState();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorMode, isMainImageSelected, removeImageOverlay, removeMockup, selectedDeviceId, selectedOverlayId, setSelectedDeviceId]);

  // Get selected overlay for toolbar positioning
  const selectedOverlay = selectedOverlayId
    ? imageOverlays.find(o => o.id === selectedOverlayId)
    : null;

  // Handle duplicate overlay
  const handleDuplicateOverlay = () => {
    if (!selectedOverlay) return;

    const { id: _id, ...overlayWithoutId } = selectedOverlay;
    addImageOverlay({
      ...overlayWithoutId,
      position: {
        x: selectedOverlay.position.x + 30,
        y: selectedOverlay.position.y + 30,
      },
    });
  };

  // Handle delete overlay
  const handleDeleteOverlay = () => {
    if (!selectedOverlayId) return;
    removeImageOverlay(selectedOverlayId);
    setSelectedOverlayId(null);
  };

  useEffect(() => {
    if (backgroundNoise > 0) {
      const intensity = backgroundNoise / 100;
      const noiseCanvas = generateNoiseTexture(200, 200, intensity);
      setNoiseTexture(noiseCanvas);
    } else {
      setNoiseTexture(null);
    }
  }, [backgroundNoise]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    if (!patternStyle.enabled) {
      setPatternImage(null);
      return;
    }

    const newPattern = generatePattern(
      patternStyle.type,
      patternStyle.scale,
      patternStyle.spacing,
      patternStyle.color,
      patternStyle.rotation,
      patternStyle.blur
    );
    setPatternImage(newPattern);
  }, [
    patternStyle.enabled,
    patternStyle.type,
    patternStyle.scale,
    patternStyle.spacing,
    patternStyle.color,
    patternStyle.rotation,
    patternStyle.blur,
  ]);

  useEffect(() => {
    if (!noise.enabled || noise.type === "none") {
      setNoiseImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setNoiseImage(img);
    img.onerror = () => setNoiseImage(null);
    img.src = `/${noise.type}.jpg`;
  }, [noise.enabled, noise.type]);

  const dimensions = calculateCanvasDimensions(
    image,
    containerWidth,
    containerHeight,
    viewportSize,
    canvas,
    screenshot,
    frame,
    browserHeaderSize
  );

  const {
    canvasW,
    canvasH,
    imageScaledW,
    imageScaledH,
    framedW,
    framedH,
    frameOffset,
    windowPadding,
    windowHeader,
    eclipseBorder,
    groupCenterX,
    groupCenterY,
  } = dimensions;

  // Store canvas dimensions so editor panels can calculate position presets
  const setCanvasDimensions = useImageStore((s) => s.setCanvasDimensions);
  useEffect(() => {
    setCanvasDimensions({ canvasW, canvasH, framedW, framedH });
  }, [canvasW, canvasH, framedW, framedH, setCanvasDimensions]);

  const showFrame = frame.enabled && frame.type !== "none";

  let selectedSelector: string | null = null;
  if (isMainImageSelected) {
    selectedSelector = '[data-main-image-layer="true"]';
  } else if (selectedOverlayId) {
    selectedSelector = `[data-overlay-id="${CSS.escape(selectedOverlayId)}"]`;
  }

  const has3DTransform =
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1;

  // Deselect everything on mousedown on the canvas background.
  // Child elements (image, overlays) call e.stopPropagation() on mousedown,
  // so this only fires when clicking empty canvas area.
  const handleCanvasDeselect = (e: React.PointerEvent) => {
    // Don't deselect when interacting with resize/rotate handles
    const target = e.target as HTMLElement;
    if (target.closest?.('.moveable-control-box, [data-resize-handle]')) return;

    setSelectedOverlayId(null);
    setIsMainImageSelected(false);
    setSelectedTextId(null);
    setSelectedBlurId(null);
    setSelectedAnnotationId(null);
    setEditingScreenDeviceId(null);
    setSelectedDeviceId(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{
        lineHeight: 0,
        ...(showRulers ? { marginTop: 20, marginLeft: 20 } : {}),
      }}
    >
      {showRulers && (
        <CanvasRulers
          canvasRef={canvasContainerRef}
          canvasW={canvasW}
          majorEvery={rulerInterval}
          selectedSelector={selectedSelector}
        />
      )}
      <HTMLCanvasRenderer
        ref={canvasContainerRef}
        width={canvasW}
        height={canvasH}
        borderRadius={backgroundBorderRadius}
        onPointerDown={handleCanvasDeselect}
        style={{
          isolation: "isolate",
        }}
      >
        <HTMLBackgroundLayer
          backgroundConfig={backgroundConfig}
          backgroundBlur={backgroundBlur}
          backgroundBorderRadius={backgroundBorderRadius}
          width={canvasW}
          height={canvasH}
          noiseTexture={noiseTexture}
          backgroundNoise={backgroundNoise}
        />

        <HTMLPatternLayer
          patternImage={patternImage}
          width={canvasW}
          height={canvasH}
          patternOpacity={patternStyle.opacity}
        />

        <HTMLNoiseLayer
          noiseImage={noiseImage}
          width={canvasW}
          height={canvasH}
          noiseOpacity={noise.opacity}
        />

        {!hasDeviceScene ? <Perspective3DOverlay
          has3DTransform={has3DTransform}
          perspective3D={perspective3D}
          screenshot={screenshot}
          shadow={shadow}
          frame={frame}
          showFrame={showFrame}
          framedW={framedW}
          framedH={framedH}
          frameOffset={frameOffset}
          windowPadding={windowPadding}
          windowHeader={windowHeader}
          eclipseBorder={eclipseBorder}
          imageScaledW={imageScaledW}
          imageScaledH={imageScaledH}
          groupCenterX={groupCenterX}
          groupCenterY={groupCenterY}
          canvasW={canvasW}
          canvasH={canvasH}
          image={image}
          imageOpacity={imageOpacity}
          imageFilters={imageFilters}
        /> : null}

        {!hasDeviceScene && has3DTransform && (
          <div
            onPointerDown={handle3DDragDown}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${canvasW}px`,
              height: `${canvasH}px`,
              zIndex: 16,
              cursor: is3DDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          />
        )}

        {backOverlays.length > 0 && (
          <HTMLImageOverlayLayer
            imageOverlays={backOverlays}
            loadedOverlayImages={loadedOverlayImages}
            selectedOverlayId={selectedOverlayId}
            setSelectedOverlayId={setSelectedOverlayId}
            setIsMainImageSelected={setIsMainImageSelected}
            setSelectedTextId={setSelectedTextId}
            updateImageOverlay={updateImageOverlay}
            onDuplicate={handleDuplicateOverlay}
            onDelete={handleDeleteOverlay}
            zIndex={10}
          />
        )}

        {!hasDeviceScene && !has3DTransform && (
          <>
            <SnapAlignmentGuides
              canvasW={canvasW}
              canvasH={canvasH}
              offsetX={screenshot.offsetX}
              offsetY={screenshot.offsetY}
              isDragging={isDraggingMainImage}
            />
            <HTMLMainImageLayer
              image={image}
              canvasW={canvasW}
              canvasH={canvasH}
              framedW={framedW}
              framedH={framedH}
              frameOffset={frameOffset}
              windowPadding={windowPadding}
              windowHeader={windowHeader}
              imageScaledW={imageScaledW}
              imageScaledH={imageScaledH}
              screenshot={screenshot}
              frame={frame}
              shadow={shadow}
              showFrame={showFrame}
              imageOpacity={imageOpacity}
              imageFilters={imageFilters}
              isMainImageSelected={isMainImageSelected}
              setIsMainImageSelected={setIsMainImageSelected}
              setSelectedOverlayId={setSelectedOverlayId}
              setSelectedTextId={setSelectedTextId}
              setScreenshot={setScreenshot}
              onDragStateChange={setIsDraggingMainImage}
            />
          </>
        )}

        {hasDeviceScene ? (
          <MockupSceneRenderer canvasWidth={canvasW} canvasHeight={canvasH} />
        ) : null}

        <HTMLTextOverlayLayer
          textOverlays={textOverlays}
          canvasW={canvasW}
          canvasH={canvasH}
          selectedTextId={selectedTextId}
          setSelectedTextId={setSelectedTextId}
          setSelectedOverlayId={setSelectedOverlayId}
          setIsMainImageSelected={setIsMainImageSelected}
          updateTextOverlay={updateTextOverlay}
        />

        <HTMLImageOverlayLayer
          imageOverlays={frontOverlays}
          loadedOverlayImages={loadedOverlayImages}
          selectedOverlayId={selectedOverlayId}
          setSelectedOverlayId={setSelectedOverlayId}
          setIsMainImageSelected={setIsMainImageSelected}
          setSelectedTextId={setSelectedTextId}
          updateImageOverlay={updateImageOverlay}
          onDuplicate={handleDuplicateOverlay}
          onDelete={handleDeleteOverlay}
        />

        <HTMLBlurRegionLayer
          blurRegions={blurRegions}
          selectedBlurId={selectedBlurId}
          setSelectedBlurId={setSelectedBlurId}
          updateBlurRegion={updateBlurRegion}
          removeBlurRegion={removeBlurRegion}
        />

        <SVGAnnotationLayer
          annotations={annotations}
          activeAnnotationTool={activeAnnotationTool}
          selectedAnnotationId={selectedAnnotationId}
          setSelectedAnnotationId={setSelectedAnnotationId}
          canvasW={canvasW}
          canvasH={canvasH}
          addAnnotation={addAnnotation}
          updateAnnotation={updateAnnotationShape}
          removeAnnotation={removeAnnotation}
          setActiveAnnotationTool={setActiveAnnotationTool}
          annotationDefaults={annotationDefaults}
          onDrawBlurRegion={(rect) => {
            addBlurRegion({
              position: { x: rect.x, y: rect.y },
              size: { width: rect.w, height: rect.h },
              blurAmount: 10,
              isVisible: true,
            });
          }}
        />


        {showGrid && <HTMLGridLayer canvasW={canvasW} canvasH={canvasH} />}
      </HTMLCanvasRenderer>
    </div>
  );
}

export function getCanvasContainer(): HTMLDivElement | null {
  return globalCanvasContainer;
}

type ClientCanvasProps = {
  embedded?: boolean;
  onReady?: () => void;
};

export default function ClientCanvas({
  embedded = false,
  onReady,
}: ClientCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { screenshot, setScreenshot } = useEditorStore();
  const { uploadedImageUrl, editorMode, mockups } = useImageStore();
  const hasDeviceScene = editorMode === "device" && hasVisibleMockups(mockups);
  const hasSourceImage = !!screenshot.src
    && !!uploadedImageUrl
    && shouldRenderSourceImage(editorMode, mockups);

  // Load primary image from screenshot.src
  useEffect(() => {
    setLoadError(false);

    if (!hasSourceImage && !hasDeviceScene) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    const timeoutId = setTimeout(() => {
      if (!img.complete) {
        console.warn("Image load timeout");
        setLoadError(true);
        setScreenshot({ src: null });
      }
    }, 10000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImage(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      console.warn("Image load error");
      setLoadError(true);
      setScreenshot({ src: null });
    };

    img.src = hasSourceImage && screenshot.src
      ? screenshot.src
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='1200'/%3E";

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasDeviceScene, hasSourceImage, screenshot.src, setScreenshot]);

  useEffect(() => {
    if (image) {
      onReady?.();
    }
  }, [image, onReady]);

  if (loadError || (!hasSourceImage && !hasDeviceScene)) {
    return null;
  }

  if (!image) {
    if (embedded) return null;
    return (
      <CanvasStageShell breathe showBackground className="overflow-hidden" />
    );
  }

  return <CanvasRenderer image={image} />;
}
