'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

interface HsvaColor {
  h: number;
  s: number;
  v: number;
  alpha: number;
}

const defaultColor = { r: 125, g: 212, b: 173, alpha: 1 };

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return [h, s, v];
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Parse the comma-separated rgba(...) format emitted by this picker.
function rgbaToColor(color: string): { r: number; g: number; b: number; alpha: number } | null {
  // Capture integer red, green, blue channels and a decimal alpha channel.
  const result = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d*\.?\d+)\s*\)$/i.exec(color);
  if (!result) return null;

  const r = Number(result[1]);
  const g = Number(result[2]);
  const b = Number(result[3]);
  const alpha = Number(result[4]);
  if (r > 255 || g > 255 || b > 255 || alpha > 1) return null;

  return { r, g, b, alpha };
}

function colorToHsva(color: string): HsvaColor {
  const rgb = hexToRgb(color);
  const parsed = rgb
    ? { r: rgb[0], g: rgb[1], b: rgb[2], alpha: 1 }
    : rgbaToColor(color) || defaultColor;
  const [h, s, v] = rgbToHsv(parsed.r, parsed.g, parsed.b);

  return { h, s, v, alpha: parsed.alpha };
}

function parseHexColor(input: string): string | null {
  const value = input.trim();
  if (!/^#?[0-9a-fA-F]{6}$/.test(value)) return null;
  return value.startsWith('#') ? value : `#${value}`;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { h, s, v, alpha } = colorToHsva(color);
  const currentRgb = hsvToRgb(h, s, v);
  const currentHex = rgbToHex(currentRgb[0], currentRgb[1], currentRgb[2]);
  const hueColor = rgbToHex(...hsvToRgb(h, 1, 1));

  const saturationRef = React.useRef<HTMLDivElement>(null);
  const hueRef = React.useRef<HTMLDivElement>(null);
  const alphaRef = React.useRef<HTMLDivElement>(null);

  const [hexInput, setHexInput] = React.useState(currentHex);
  const [hexError, setHexError] = React.useState(false);
  const alphaValue = alpha === 1 ? '1' : alpha.toFixed(2);
  const [alphaInput, setAlphaInput] = React.useState(alphaValue);

  React.useEffect(() => {
    setHexInput(currentHex);
    setHexError(false);
  }, [currentHex]);

  React.useEffect(() => {
    setAlphaInput(alphaValue);
  }, [alphaValue]);

  const updateColor = (newColor: HsvaColor) => {
    const [r, g, b] = hsvToRgb(newColor.h, newColor.s, newColor.v);
    if (newColor.alpha < 1) {
      onChange(`rgba(${r}, ${g}, ${b}, ${newColor.alpha.toFixed(2)})`);
      return;
    }
    onChange(rgbToHex(r, g, b));
  };

  // Handle saturation/brightness picker drag
  const handleSaturationMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (!saturationRef.current) return;
      const rect = saturationRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      updateColor({ h, s: x, v: 1 - y, alpha });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    handleMove(e.nativeEvent as unknown as MouseEvent);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Handle hue slider drag
  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updateColor({ h: x * 360, s, v, alpha });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    handleMove(e.nativeEvent as unknown as MouseEvent);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // Handle alpha slider drag
  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (!alphaRef.current) return;
      const rect = alphaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updateColor({ h, s, v, alpha: Math.round(x * 100) / 100 });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    handleMove(e.nativeEvent as unknown as MouseEvent);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleHexCommit = () => {
    const hex = parseHexColor(hexInput);
    if (!hex) {
      setHexError(true);
      return;
    }

    const rgb = hexToRgb(hex);
    if (!rgb) {
      setHexError(true);
      return;
    }

    const [newH, newS, newV] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    setHexInput(hex.toLowerCase());
    setHexError(false);
    updateColor({ h: newH, s: newS, v: newV, alpha });
  };

  const handleHexKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setHexInput(currentHex);
      setHexError(false);
    }
  };

  const handleAlphaCommit = () => {
    const value = Number(alphaInput);
    if (!Number.isFinite(value)) {
      setAlphaInput(alphaValue);
      return;
    }

    const nextAlpha = Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
    setAlphaInput(nextAlpha === 1 ? '1' : nextAlpha.toFixed(2));
    updateColor({ h, s, v, alpha: nextAlpha });
  };

  const handleAlphaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setAlphaInput(alphaValue);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-accent hover:border-border/60 transition-all',
            className
          )}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/20"
              style={{ backgroundColor: currentHex }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">{currentHex}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 border-2 border-primary/20"
        align="start"
        side="right"
      >
        <div className="space-y-3">
          {/* Saturation/Brightness picker */}
          <div
            ref={saturationRef}
            className="w-72 h-56 rounded-lg cursor-crosshair relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${hueColor})`,
            }}
            onMouseDown={handleSaturationMouseDown}
          >
            {/* Picker handle */}
            <div
              className="absolute w-6 h-6 rounded-full border-[3px] border-white shadow-lg pointer-events-none"
              style={{
                left: `${s * 100}%`,
                top: `${(1 - v) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: currentHex,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 w-5">HEX</span>
            <Input
              value={hexInput}
              onChange={(e) => {
                setHexInput(e.target.value);
                if (hexError) setHexError(false);
              }}
              onBlur={handleHexCommit}
              onKeyDown={handleHexKeyDown}
              aria-invalid={hexError}
              className="h-7 text-xs font-mono"
            />
          </div>

          {/* RGBA inputs */}
          <div className="grid w-72 grid-cols-4 gap-1.5">
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">R</span>
              <Input
                type="number"
                min={0}
                max={255}
                step={1}
                aria-label="Red"
                value={currentRgb[0]}
                onChange={(e) => {
                  const r = Math.max(0, Math.min(255, Math.trunc(Number(e.target.value) || 0)));
                  const [newH, newS, newV] = rgbToHsv(r, currentRgb[1], currentRgb[2]);
                  updateColor({ h: newH, s: newS, v: newV, alpha });
                }}
                className="h-7 w-full text-center text-xs font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">G</span>
              <Input
                type="number"
                min={0}
                max={255}
                step={1}
                aria-label="Green"
                value={currentRgb[1]}
                onChange={(e) => {
                  const g = Math.max(0, Math.min(255, Math.trunc(Number(e.target.value) || 0)));
                  const [newH, newS, newV] = rgbToHsv(currentRgb[0], g, currentRgb[2]);
                  updateColor({ h: newH, s: newS, v: newV, alpha });
                }}
                className="h-7 w-full text-center text-xs font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">B</span>
              <Input
                type="number"
                min={0}
                max={255}
                step={1}
                aria-label="Blue"
                value={currentRgb[2]}
                onChange={(e) => {
                  const b = Math.max(0, Math.min(255, Math.trunc(Number(e.target.value) || 0)));
                  const [newH, newS, newV] = rgbToHsv(currentRgb[0], currentRgb[1], b);
                  updateColor({ h: newH, s: newS, v: newV, alpha });
                }}
                className="h-7 w-full text-center text-xs font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">A</span>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.01}
                aria-label="Alpha"
                value={alphaInput}
                onChange={(e) => {
                  setAlphaInput(e.target.value);
                }}
                onBlur={handleAlphaCommit}
                onKeyDown={handleAlphaKeyDown}
                className="h-7 w-full text-center text-xs font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Hue slider */}
          <div
            ref={hueRef}
            className="w-72 h-4 rounded-full cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute w-5 h-5 rounded-full border-[3px] border-white shadow-lg pointer-events-none"
              style={{
                left: `${(h / 360) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: hueColor,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            />
          </div>

          {/* Alpha slider */}
          <div
            ref={alphaRef}
            className="w-72 h-4 rounded-full cursor-pointer relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, transparent, ${currentHex}), repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 8px 8px`,
            }}
            onMouseDown={handleAlphaMouseDown}
          >
            <div
              className="absolute w-5 h-5 rounded-full border-[3px] border-white shadow-lg pointer-events-none"
              style={{
                left: `${alpha * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: `rgba(${currentRgb[0]}, ${currentRgb[1]}, ${currentRgb[2]}, ${alpha})`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
