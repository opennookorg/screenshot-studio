export interface DropShadowInput {
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

export function parseShadowRgb(color: string): [number, number, number] {
  const functional = color.match(/rgba?\(([^)]+)\)/);
  if (functional) {
    const channels = functional[1]
      .split("/")[0]
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((channel) => parseInt(channel, 10) || 0);
    return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
  }
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16) || 0,
      parseInt(hex.slice(2, 4), 16) || 0,
      parseInt(hex.slice(4, 6), 16) || 0,
    ];
  }
  return [0, 0, 0];
}

export function buildDropShadowFilter(shadow: DropShadowInput): string {
  const [r, g, b] = parseShadowRgb(shadow.color);
  const blur = shadow.blur + shadow.spread;
  const opacity = Math.min(1, Math.max(0, shadow.opacity));
  const ambientOpacity = Math.round(opacity * 200) / 1000;
  return [
    `drop-shadow(${shadow.offsetX}px ${shadow.offsetY}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity}))`,
    `drop-shadow(0px 0px ${blur * 0.5}px rgba(${r}, ${g}, ${b}, ${ambientOpacity}))`,
  ].join(" ");
}
