'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { type ShadowConfig } from '../utils/shadow-utils';
import { buildDropShadowFilter as buildSharedDropShadowFilter, parseShadowRgb } from '@/lib/drop-shadow';
import { type ImageFilters, useImageStore } from '@/lib/store';
import { SafariToolbar, ChromeToolbar } from '../frames/BrowserToolbar';
import { CanvasObjectTopControls } from './CanvasObjectTopControls';

export interface FrameConfig {
  enabled: boolean;
  type: 'none' | 'arc-light' | 'arc-dark' | 'macos-light' | 'macos-dark' | 'windows-light' | 'windows-dark' | 'photograph' | 'glass-light' | 'glass-dark' | 'outline-light' | 'border-light' | 'border-dark';
  width: number;
  color: string;
  padding?: number;
  title?: string;
  opacity?: number;
}

interface HTMLMainImageLayerProps {
  image: HTMLImageElement;
  canvasW: number;
  canvasH: number;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  imageScaledW: number;
  imageScaledH: number;
  screenshot: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    radius: number;
    scale: number;
  };
  frame: FrameConfig;
  shadow: ShadowConfig;
  showFrame: boolean;
  imageOpacity: number;
  imageFilters?: ImageFilters;
  isMainImageSelected: boolean;
  setIsMainImageSelected: (selected: boolean) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  setScreenshot: (updates: Partial<HTMLMainImageLayerProps['screenshot']>) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  onRemoveImage?: () => void;
}

const SNAP_THRESHOLD = 6;

/**
 * Builds CSS filter string from imageFilters
 */
function buildImageFilter(imageFilters?: ImageFilters): string | undefined {
  if (!imageFilters) return undefined;

  const filters: string[] = [];

  if (imageFilters.brightness !== 100) {
    filters.push(`brightness(${imageFilters.brightness / 100})`);
  }
  if (imageFilters.contrast !== 100) {
    filters.push(`contrast(${imageFilters.contrast / 100})`);
  }
  if (imageFilters.saturate !== 100) {
    filters.push(`saturate(${imageFilters.saturate / 100})`);
  }
  if (imageFilters.grayscale > 0) {
    filters.push(`grayscale(${imageFilters.grayscale / 100})`);
  }
  if (imageFilters.sepia > 0) {
    filters.push(`sepia(${imageFilters.sepia / 100})`);
  }
  if (imageFilters.hueRotate !== 0) {
    filters.push(`hue-rotate(${imageFilters.hueRotate}deg)`);
  }
  if (imageFilters.blur > 0) {
    filters.push(`blur(${imageFilters.blur}px)`);
  }
  if (imageFilters.invert > 0) {
    filters.push(`invert(${imageFilters.invert / 100})`);
  }

  return filters.length > 0 ? filters.join(' ') : undefined;
}

function buildDropShadowFilter(shadow: ShadowConfig): string | undefined {
  if (!shadow.enabled) return undefined;
  return buildSharedDropShadowFilter({
    blur: shadow.softness,
    spread: shadow.spread || 0,
    color: shadow.color,
    opacity: shadow.intensity,
    offsetX: shadow.offsetX ?? 0,
    offsetY: shadow.offsetY ?? 0,
  });
}

/**
 * Builds a CSS box-shadow string for style frames.
 * Unlike drop-shadow, box-shadow follows border-radius and ignores content transparency,
 * so it wraps the entire frame+image uniformly.
 */
function buildBoxShadow(shadow: ShadowConfig): string | undefined {
  if (!shadow.enabled) return undefined;

  const { softness, spread, color, intensity, offsetX, offsetY } = shadow;
  const [r, g, b] = parseShadowRgb(color);

  const x = offsetX ?? 0;
  const y = offsetY ?? 0;
  const blur = softness + (spread || 0);
  const opacity = Math.min(1, Math.max(0, intensity));

  return [
    `${x}px ${y}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})`,
    `0px 0px ${blur * 0.5}px rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`,
  ].join(', ');
}

/**
 * HTML/CSS-based main image layer that replaces Konva MainImageLayer.
 * Renders the main image with frames, shadows, and filters.
 */
export function HTMLMainImageLayer({
  image,
  canvasW,
  canvasH,
  framedW,
  framedH,
  frameOffset,
  windowPadding,
  windowHeader,
  imageScaledW,
  imageScaledH,
  screenshot,
  frame,
  shadow,
  showFrame,
  imageOpacity,
  imageFilters,
  isMainImageSelected,
  setIsMainImageSelected,
  setSelectedOverlayId,
  setSelectedTextId,
  setScreenshot,
  onDragStateChange,
  onRemoveImage,
}: HTMLMainImageLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; scale: number; handle: string } | null>(null);
  const rotateStartRef = useRef<{ centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null);

  const imageFilter = useMemo(() => buildImageFilter(imageFilters), [imageFilters]);
  const isStyleFrame = ['glass-light', 'glass-dark', 'outline-light', 'border-light', 'border-dark'].includes(frame.type);
  // Style frames use box-shadow on the frame container; others use drop-shadow filter on the outer div
  const shadowFilter = useMemo(() => isStyleFrame ? undefined : buildDropShadowFilter(shadow), [shadow, isStyleFrame]);
  const frameBoxShadow = useMemo(() => isStyleFrame ? buildBoxShadow(shadow) : undefined, [shadow, isStyleFrame]);

  const isDark = frame.type.includes('dark');
  const isArcFrame = frame.type === 'arc-light' || frame.type === 'arc-dark';
  const isMacFrame = frame.type === 'macos-light' || frame.type === 'macos-dark';
  const isWinFrame = frame.type === 'windows-light' || frame.type === 'windows-dark';
  const isPolaroid = frame.type === 'photograph';

  // Handle drag start
  const handleMouseDown = useCallback((e: React.PointerEvent) => {
    if (isResizing || isRotating) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    onDragStateChange?.(true);
    setDragStart({
      x: e.clientX - screenshot.offsetX,
      y: e.clientY - screenshot.offsetY,
    });
    setIsMainImageSelected(true);
    setSelectedOverlayId(null);
    setSelectedTextId(null);
  }, [isResizing, isRotating, screenshot.offsetX, screenshot.offsetY, setIsMainImageSelected, setSelectedOverlayId, setSelectedTextId, onDragStateChange]);

  // Handle resize start
  const handleResizeMouseDown = useCallback((e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      scale: useImageStore.getState().imageScale,
      handle,
    };
  }, []);

  // Handle drag move with snap-to-center
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newOffsetX = e.clientX - dragStart.x;
      let newOffsetY = e.clientY - dragStart.y;

      // Snap to center when close
      if (Math.abs(newOffsetX) < SNAP_THRESHOLD) newOffsetX = 0;
      if (Math.abs(newOffsetY) < SNAP_THRESHOLD) newOffsetY = 0;

      setScreenshot({ offsetX: newOffsetX, offsetY: newOffsetY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragStateChange?.(false);
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [isDragging, dragStart, setScreenshot, onDragStateChange]);

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: PointerEvent) => {
      const start = resizeStartRef.current;
      if (!start) return;

      // Calculate diagonal movement based on handle position
      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;

      // Determine direction multiplier based on handle corner
      let dirX = 1, dirY = 1;
      if (start.handle === 'tl') { dirX = -1; dirY = -1; }
      else if (start.handle === 'tr') { dirX = 1; dirY = -1; }
      else if (start.handle === 'bl') { dirX = -1; dirY = 1; }
      // 'br' is default (1, 1)

      // Project mouse movement onto diagonal direction
      const diagonal = (dx * dirX + dy * dirY) / 2;
      // Sensitivity: ~1 scale unit per 2px of movement
      const scaleDelta = diagonal * 0.5;
      const newScale = Math.round(Math.min(200, Math.max(10, start.scale + scaleDelta)));

      useImageStore.getState().setImageScale(newScale);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle rotate start
  const handleRotateMouseDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    rotateStartRef.current = {
      centerX,
      centerY,
      startAngle,
      startRotation: screenshot.rotation,
    };
  }, [screenshot.rotation]);

  // Handle rotate move
  useEffect(() => {
    if (!isRotating) return;

    const handleMouseMove = (e: PointerEvent) => {
      const start = rotateStartRef.current;
      if (!start) return;

      const currentAngle = Math.atan2(e.clientY - start.centerY, e.clientX - start.centerX) * (180 / Math.PI);
      const delta = currentAngle - start.startAngle;
      const newRotation = Math.round(start.startRotation + delta);
      setScreenshot({ rotation: newRotation });
    };

    const handleMouseUp = () => {
      setIsRotating(false);
      rotateStartRef.current = null;
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [isRotating, setScreenshot]);

  // Handle remove image
  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveImage) {
      onRemoveImage();
    } else {
      useImageStore.getState().clearImage();
    }
  }, [onRemoveImage]);

  // Calculate position
  const centerX = canvasW / 2 + screenshot.offsetX;
  const centerY = canvasH / 2 + screenshot.offsetY;
  const left = centerX - framedW / 2;
  const top = centerY - framedH / 2;

  const handleScale = screenshot.scale > 0 ? 1 / screenshot.scale : 1;

  const browserRadius = screenshot.radius;

  // Image border radius based on frame type
  const getImageBorderRadius = () => {
    if (isMacFrame || isWinFrame) {
      // For frames with title bar, only round bottom corners
      // Use slightly smaller radius to fit inside the container
      const innerRadius = Math.max(0, browserRadius - windowPadding);
      return `0 0 ${innerRadius}px ${innerRadius}px`;
    }
    return `${screenshot.radius}px`;
  };

  // Arc frame styles
  const arcBorderWidth = frame.width || 8;
  const arcDefaultOpacity = frame.type === 'arc-light' ? 0.5 : 0.7;
  const arcOpacity = frame.opacity ?? arcDefaultOpacity;
  const arcBorderColor = frame.type === 'arc-light'
    ? `rgba(255, 255, 255, ${arcOpacity})`
    : `rgba(0, 0, 0, ${arcOpacity})`;

  // Safari toolbar — uses shared component
  const renderMacOSTitleBar = () => (
    <SafariToolbar windowHeader={windowHeader} isDark={isDark} title={frame.title} />
  );

  // Chrome toolbar — uses shared component
  const renderWindowsTitleBar = () => (
    <ChromeToolbar windowHeader={windowHeader} isDark={isDark} title={frame.title} />
  );

  // Get frame container styles based on frame type
  const getFrameContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      width: `${framedW}px`,
      height: `${framedH}px`,
      overflow: 'hidden',
    };

    if (isArcFrame) {
      return {
        ...baseStyle,
        border: `${arcBorderWidth}px solid ${arcBorderColor}`,
        borderRadius: `${screenshot.radius}px`,
      };
    }

    if (isMacFrame) {
      return {
        ...baseStyle,
        backgroundColor: isDark ? '#3A3A3C' : '#F6F6F6',
        borderRadius: `${browserRadius}px`,
      };
    }

    if (isWinFrame) {
      return {
        ...baseStyle,
        backgroundColor: isDark ? '#292A2D' : '#FFFFFF',
        borderRadius: `${browserRadius}px`,
      };
    }

    if (isPolaroid) {
      return {
        ...baseStyle,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '8px 8px 24px 8px',
      };
    }

    if (isStyleFrame) {
      const styleConfig: Record<string, { bg: string }> = {
        'glass-light': { bg: `rgba(255, 255, 255, ${frame.opacity ?? 0.25})` },
        'glass-dark': { bg: `rgba(0, 0, 0, ${frame.opacity ?? 0.7})` },
        'outline-light': { bg: `rgba(255, 255, 255, ${frame.opacity ?? 0.35})` },
        'border-light': { bg: 'rgb(255, 255, 255)' },
        'border-dark': { bg: 'rgb(26, 26, 26)' },
      };
      const config = styleConfig[frame.type] || styleConfig['glass-light'];
      // Outer radius = inner radius + padding so curves are concentric (0 when no rounding)
      const outerRadius = screenshot.radius > 0 ? screenshot.radius + windowPadding : 0;
      return {
        ...baseStyle,
        backgroundColor: config.bg,
        borderRadius: `${outerRadius}px`,
        boxShadow: frameBoxShadow,
      };
    }

    // No frame
    return {
      ...baseStyle,
      borderRadius: `${screenshot.radius}px`,
    };
  };

  // Get image container styles
  const getImageContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${imageScaledW}px`,
      height: `${imageScaledH}px`,
      overflow: 'hidden',
    };

    if (isArcFrame) {
      return {
        ...baseStyle,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: `${Math.max(0, screenshot.radius - arcBorderWidth)}px`,
      };
    }

    if (isMacFrame) {
      return {
        ...baseStyle,
        left: `${windowPadding}px`,
        top: `${windowHeader}px`,
        borderRadius: getImageBorderRadius(),
      };
    }

    if (isWinFrame) {
      return {
        ...baseStyle,
        left: `${windowPadding}px`,
        top: `${windowHeader}px`,
        borderRadius: getImageBorderRadius(),
      };
    }

    if (isPolaroid) {
      return {
        ...baseStyle,
        top: '8px',
        left: '8px',
        width: `calc(100% - 16px)`,
        height: `calc(100% - 32px)`,
        borderRadius: `${screenshot.radius}px`,
      };
    }

    if (isStyleFrame) {
      return {
        ...baseStyle,
        left: `${windowPadding}px`,
        top: `${windowPadding}px`,
        width: `${imageScaledW}px`,
        height: `${imageScaledH}px`,
        borderRadius: `${screenshot.radius}px`,
      };
    }

    // No frame
    return {
      ...baseStyle,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: `${screenshot.radius}px`,
    };
  };

  return (
    <div
      ref={containerRef}
      data-main-image-layer="true"
      data-export-clean-outline={isMainImageSelected ? 'true' : undefined}
      onPointerDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${framedW}px`,
        height: `${framedH}px`,
        transform: `rotate(${screenshot.rotation}deg) scale(${screenshot.scale})`,
        transformOrigin: 'center center',
        cursor: isResizing ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: 10,
        outline: isMainImageSelected ? '2px solid rgba(59, 130, 246, 0.5)' : 'none',
        outlineOffset: '2px',
        filter: shadowFilter,
      }}
    >
      {/* Frame container */}
      <div style={getFrameContainerStyle()}>
        {/* macOS title bar */}
        {showFrame && isMacFrame && renderMacOSTitleBar()}

        {/* Windows title bar */}
        {showFrame && isWinFrame && renderWindowsTitleBar()}

        {/* Image container */}
        <div style={getImageContainerStyle()}>
          <img
            src={image.src}
            alt="Main image"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageOpacity,
              filter: imageFilter,
              display: 'block',
              borderRadius: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Resize handles — visible when selected, excluded from export */}
      {isMainImageSelected && (
        <>
          {(['tl', 'tr', 'bl', 'br'] as const).map((handle) => {
            const isTop = handle[0] === 't';
            const isLeft = handle[1] === 'l';
            const cursor = (handle === 'tl' || handle === 'br') ? 'nwse-resize' : 'nesw-resize';
            return (
              <div
                key={handle}
                data-resize-handle="true"
                onPointerDown={(e) => handleResizeMouseDown(e, handle)}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'white',
                  border: '2px solid rgba(59, 130, 246, 0.8)',
                  borderRadius: '2px',
                  top: isTop ? '-5px' : undefined,
                  bottom: isTop ? undefined : '-5px',
                  left: isLeft ? '-5px' : undefined,
                  right: isLeft ? undefined : '-5px',
                  cursor,
                  zIndex: 20,
                  pointerEvents: 'auto',
                  transform: `scale(${handleScale})`,
                }}
              />
            );
          })}

          <CanvasObjectTopControls
            handleScale={handleScale}
            onRotatePointerDown={handleRotateMouseDown}
            onRemove={handleRemoveImage}
            objectLabel="image"
          />
        </>
      )}
    </div>
  );
}
