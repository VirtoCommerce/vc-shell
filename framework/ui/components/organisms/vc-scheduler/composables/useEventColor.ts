// Deterministic auto-coloring for scheduler events. A color is derived from a stable
// seed (the event title by default) so the same input always yields the same color —
// nothing needs to be stored on the event or the backend, and recurring occurrences
// (which share the master's title) stay visually consistent. An explicit `event.color`
// always wins; this is only the fallback.
//
// Palette is intentionally mid/dark (≈600-level). Bar ink is chosen per fill by
// readableInk() below, so a lighter member (green) still gets a legible label.
const AUTO_PALETTE = [
  "#2563eb", // blue
  "#16a34a", // green
  "#c2410c", // orange
  "#dc2626", // red
  "#7c3aed", // violet
  "#db2777", // pink
  "#0f766e", // teal
  "#475569", // slate
];

// djb2 string hash → unsigned 32-bit.
function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Deterministic palette color for a seed (e.g. an event title). Empty seed → default fill. */
export function autoEventColor(seed: string | undefined | null): string {
  if (!seed) return "var(--primary-500)";
  return AUTO_PALETTE[hashSeed(seed) % AUTO_PALETTE.length];
}

const INK_LIGHT = "#ffffff";
// Fixed near-black, not a theme token: the fill is a theme-independent hex, so the ink
// must not flip with light/dark mode.
const INK_DARK = "#18181b";

function parseColor(c: string): [number, number, number] | null {
  const s = c.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((x) => x + x).join("") : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(s);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];
  return null;
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const DARK_LUM = relLuminance(parseColor(INK_DARK)!);

/**
 * Legible text color (near-white or near-black) for text laid over `fill`, chosen by
 * whichever gives higher WCAG contrast. Only hex/rgb() fills can be measured; a CSS-var
 * or unknown fill can't be resolved at runtime, so it falls back to white — the historical
 * default, safe for the framework's mid-tone token fills.
 */
export function readableInk(fill: string | undefined | null): string {
  if (!fill) return INK_LIGHT;
  const rgb = parseColor(fill);
  if (!rgb) return INK_LIGHT;
  const l = relLuminance(rgb);
  return contrast(l, 1) >= contrast(l, DARK_LUM) ? INK_LIGHT : INK_DARK;
}

/**
 * Inline background + text color for an event surface (bar/chip/popover header).
 * A past event renders as a pale tint of its fill with dark text: de-emphasized, but
 * high-contrast (AA) — unlike a wash-to-white dim (opacity/desaturate), which pushes the
 * tighter palette colors below AA once faded.
 */
export function eventSurfaceStyle(fill: string, isPast: boolean): { background: string; color: string } {
  if (isPast) {
    return {
      background: `color-mix(in srgb, ${fill} 22%, var(--additional-50, #fff))`,
      color: "var(--neutrals-800)",
    };
  }
  return { background: fill, color: readableInk(fill) };
}
