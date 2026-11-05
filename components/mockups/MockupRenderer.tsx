"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type Moveable from "react-moveable";
import { LazyMoveable } from "@/components/canvas/LazyMoveable";
import { DeviceShell } from "./DeviceShell";
import { CanvasObjectTopControls } from "@/components/canvas/html/CanvasObjectTopControls";
import { getMockupDefinition, MAX_DEVICE_MOCKUPS } from "@/lib/constants/mockups";
import { blobToDataUrl } from "@/lib/image-storage";
import { useDeviceUIStore } from "@/lib/store/device-ui";
import { useImageStore } from "@/lib/store";
import type { Mockup } from "@/types/mockup";

interface MockupRendererProps {
  mockup: Mockup;
  canvasWidth: number;
  canvasHeight: number;
  zIndex: number;
}

function MockupRenderer({ mockup, canvasWidth, canvasHeight, zIndex }: MockupRendererProps): React.JSX.Element | null {
  const definition = getMockupDefinition(mockup.definitionId);
  const updateMockup = useImageStore((state) => state.updateMockup);
  const removeMockup = useImageStore((state) => state.removeMockup);
  const sceneScale = useImageStore((state) => state.perspective3D.scale);
  const selectedDeviceId = useDeviceUIStore((state) => state.selectedDeviceId);
  const editingScreenDeviceId = useDeviceUIStore((state) => state.editingScreenDeviceId);
  const setSelectedDeviceId = useDeviceUIStore((state) => state.setSelectedDeviceId);
  const setEditingScreenDeviceId = useDeviceUIStore((state) => state.setEditingScreenDeviceId);
  const cropStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const rotateStartRef = useRef<{ centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null);
  const screenFileInputRef = useRef<HTMLInputElement | null>(null);
  const moveableRef = useRef<Moveable | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLDivElement | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const isSelected = selectedDeviceId === mockup.id;
  const isEditingScreen = editingScreenDeviceId === mockup.id;
  const width = mockup.size * canvasWidth;
  const height = definition ? width / definition.aspectRatio : width;
  const left = mockup.position.x * canvasWidth - width / 2;
  const top = mockup.position.y * canvasHeight - height / 2;

  useLayoutEffect(() => {
    if (!isSelected || !targetElement) return;
    moveableRef.current?.updateRect();
  }, [height, isSelected, left, mockup.rotation, sceneScale, targetElement, top, width]);

  useEffect(() => {
    if (!isEditingScreen) return;
    targetElement?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setEditingScreenDeviceId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditingScreen, setEditingScreenDeviceId, targetElement]);

  const handleDeviceKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) return;
    const directions: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    event.stopPropagation();

    if (isEditingScreen) {
      const step = event.shiftKey ? 5 : 1;
      updateMockup(mockup.id, {
        screen: {
          ...mockup.screen,
          offset: {
            x: Math.max(-75, Math.min(75, mockup.screen.offset.x + direction.x * step)),
            y: Math.max(-75, Math.min(75, mockup.screen.offset.y + direction.y * step)),
          },
        },
      });
      return;
    }

    const step = event.shiftKey ? 0.02 : 0.005;
    updateMockup(mockup.id, {
      position: {
        x: Math.max(0, Math.min(1, mockup.position.x + direction.x * step)),
        y: Math.max(0, Math.min(1, mockup.position.y + direction.y * step)),
      },
    });
  }, [isEditingScreen, mockup.id, mockup.position.x, mockup.position.y, mockup.screen, updateMockup]);

  useEffect(() => {
    if (!isRotating) return;

    const handleMove = (event: PointerEvent): void => {
      const start = rotateStartRef.current;
      if (!start) return;
      const angle = Math.atan2(event.clientY - start.centerY, event.clientX - start.centerX) * (180 / Math.PI);
      updateMockup(mockup.id, { rotation: Math.round(start.startRotation + angle - start.startAngle) });
    };
    const handleUp = (): void => {
      rotateStartRef.current = null;
      setIsRotating(false);
      setInteracting(false);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isRotating, mockup.id, updateMockup]);

  const handleRotatePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const rect = targetElement?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotateStartRef.current = {
      centerX,
      centerY,
      startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI),
      startRotation: mockup.rotation,
    };
    setInteracting(true);
    setIsRotating(true);
  }, [mockup.rotation, targetElement]);

  const handleRotateKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    const direction = ["ArrowLeft", "ArrowDown"].includes(event.key)
      ? -1
      : ["ArrowRight", "ArrowUp"].includes(event.key)
        ? 1
        : ["Enter", " "].includes(event.key)
          ? 15
          : 0;
    if (direction === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const step = Math.abs(direction) === 15 ? direction : direction * (event.shiftKey ? 15 : 1);
    updateMockup(mockup.id, {
      rotation: Math.max(-180, Math.min(180, mockup.rotation + step)),
    });
  }, [mockup.id, mockup.rotation, updateMockup]);

  const handleCropPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>): void => {
    if (!isEditingScreen) return;
    event.preventDefault();
    event.stopPropagation();
    cropStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: mockup.screen.offset.x,
      offsetY: mockup.screen.offset.y,
    };

    const handleMove = (moveEvent: PointerEvent): void => {
      const start = cropStartRef.current;
      if (!start) return;
      updateMockup(mockup.id, {
        screen: {
          ...mockup.screen,
          offset: {
            x: Math.max(-75, Math.min(75, start.offsetX + ((moveEvent.clientX - start.x) / width) * 100)),
            y: Math.max(-75, Math.min(75, start.offsetY + ((moveEvent.clientY - start.y) / height) * 100)),
          },
        },
      });
    };
    const handleUp = (): void => {
      cropStartRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [height, isEditingScreen, mockup.id, mockup.screen, updateMockup, width]);

  const openScreenPicker = useCallback((): void => {
    setSelectedDeviceId(mockup.id);
    setEditingScreenDeviceId(null);
    screenFileInputRef.current?.click();
  }, [mockup.id, setEditingScreenDeviceId, setSelectedDeviceId]);

  const replaceScreen = useCallback(async (file: File): Promise<void> => {
    const src = await blobToDataUrl(file);
    updateMockup(mockup.id, {
      screen: {
        ...mockup.screen,
        src,
        name: file.name,
        isCustom: true,
        scale: 1,
        offset: { x: 0, y: 0 },
      },
    });
  }, [mockup.id, mockup.screen, updateMockup]);

  if (!definition || !mockup.isVisible) return null;

  return (
    <>
      <div
        ref={setTargetElement}
        data-device-id={mockup.id}
        role="group"
        tabIndex={0}
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
        aria-label={isEditingScreen
          ? `Crop ${definition.name} screen. Use arrow keys to pan the image.`
          : `${definition.name}. Use arrow keys to move the device.`}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/70"
        onKeyDown={handleDeviceKeyDown}
        onFocus={() => setSelectedDeviceId(mockup.id)}
        onPointerDown={(event) => {
          event.stopPropagation();
          setSelectedDeviceId(mockup.id);
          event.currentTarget.focus({ preventScroll: true });
        }}
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          transform: `rotate(${mockup.rotation}deg)`,
          transformOrigin: "center",
          opacity: mockup.opacity,
          pointerEvents: "auto",
          cursor: isEditingScreen ? "move" : "grab",
          zIndex,
        }}
      >
        <DeviceShell
          definition={definition}
          screen={mockup.screen}
          editing={isEditingScreen}
          onScreenClick={mockup.screen.src ? undefined : openScreenPicker}
          onScreenDoubleClick={openScreenPicker}
          onScreenFile={mockup.screen.src ? undefined : replaceScreen}
          onScreenPointerDown={handleCropPointerDown}
        />
        <input
          ref={screenFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={`Upload image for ${definition.name}`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) replaceScreen(file);
            event.currentTarget.value = "";
          }}
        />
      </div>

      {isSelected && !interacting && !isEditingScreen ? (
        <div
          data-device-controls="true"
          data-export-exclude="true"
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            transform: `rotate(${mockup.rotation}deg)`,
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: zIndex + MAX_DEVICE_MOCKUPS + 1,
          }}
        >
          <CanvasObjectTopControls
            handleScale={sceneScale > 0 ? 1 / sceneScale : 1}
            onRotatePointerDown={handleRotatePointerDown}
            onRotateKeyDown={handleRotateKeyDown}
            onRemove={(event) => {
              event.preventDefault();
              event.stopPropagation();
              removeMockup(mockup.id);
              setSelectedDeviceId(null);
            }}
            objectLabel="device"
          />
        </div>
      ) : null}

      {isSelected && targetElement && !isEditingScreen ? (
        <LazyMoveable
          ref={moveableRef}
          target={targetElement}
          draggable
          resizable
          keepRatio
          origin={false}
          edge={false}
          renderDirections={["nw", "ne", "sw", "se"]}
          onDragStart={() => setInteracting(true)}
          onDrag={({ target, left: nextLeft, top: nextTop }) => {
            target.style.left = `${nextLeft}px`;
            target.style.top = `${nextTop}px`;
          }}
          onDragEnd={({ target }) => {
            setInteracting(false);
            const nextWidth = parseFloat(target.style.width);
            const nextHeight = parseFloat(target.style.height);
            updateMockup(mockup.id, {
              position: {
                x: (parseFloat(target.style.left) + nextWidth / 2) / canvasWidth,
                y: (parseFloat(target.style.top) + nextHeight / 2) / canvasHeight,
              },
            });
          }}
          onResizeStart={() => setInteracting(true)}
          onResize={({ target, width: nextWidth, height: nextHeight, drag }) => {
            target.style.width = `${nextWidth}px`;
            target.style.height = `${nextHeight}px`;
            target.style.left = `${drag.left}px`;
            target.style.top = `${drag.top}px`;
          }}
          onResizeEnd={({ target }) => {
            setInteracting(false);
            const nextWidth = parseFloat(target.style.width);
            const nextHeight = parseFloat(target.style.height);
            updateMockup(mockup.id, {
              size: Math.max(0.08, Math.min(0.9, nextWidth / canvasWidth)),
              position: {
                x: (parseFloat(target.style.left) + nextWidth / 2) / canvasWidth,
                y: (parseFloat(target.style.top) + nextHeight / 2) / canvasHeight,
              },
            });
          }}
        />
      ) : null}
    </>
  );
}

export function MockupSceneRenderer({ canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }): React.JSX.Element {
  const mockups = useImageStore((state) => state.mockups);
  const perspective3D = useImageStore((state) => state.perspective3D);
  const imageOpacity = useImageStore((state) => state.imageOpacity);

  return (
    <div
      data-device-scene="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "none",
        perspective: `${Math.max(100, perspective3D.perspective * 10)}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: imageOpacity,
          transform: `translate(${perspective3D.translateX}%, ${perspective3D.translateY}%) scale(${perspective3D.scale}) rotateX(${perspective3D.rotateX}deg) rotateY(${perspective3D.rotateY}deg) rotateZ(${perspective3D.rotateZ}deg)`,
          transformOrigin: "center",
          transformStyle: "preserve-3d",
        }}
      >
        {mockups.map((mockup, index) => (
          <MockupRenderer
            key={mockup.id}
            mockup={mockup}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            zIndex={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
