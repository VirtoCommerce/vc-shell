import type { ShortcutDefinition } from "@core/types";

// Apple modifier order: Control, Option, Shift, Command.
const MAC_GLYPH = { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" } as const;
const WIN_WORD = { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Meta" } as const;

// Display label for the key part (visual).
const KEY_LABEL: Record<string, string> = {
  escape: "Esc",
  enter: "Enter",
  tab: "Tab",
  space: "Space",
  delete: "Del",
  backspace: "Backspace",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  backslash: "\\",
  period: ".",
  comma: ",",
  slash: "/",
};

// Canonical aria key name (W3C aria-keyshortcuts).
const KEY_ARIA: Record<string, string> = {
  escape: "Escape",
  enter: "Enter",
  tab: "Tab",
  space: "Space",
  delete: "Delete",
  backspace: "Backspace",
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight",
  backslash: "\\",
  period: ".",
  comma: ",",
  slash: "/",
};

function keyLabel(key: string): string {
  if (key in KEY_LABEL) return KEY_LABEL[key];
  if (key.length === 1) return key.toUpperCase(); // letters, digits
  return key.toUpperCase(); // f2 -> F2
}

function keyAria(key: string): string {
  if (key in KEY_ARIA) return KEY_ARIA[key];
  if (key.length === 1) return key.toUpperCase();
  return key.charAt(0).toUpperCase() + key.slice(1); // f2 -> F2 already single-cased above; enter handled by map
}

/**
 * Two representations of a shortcut from one definition:
 * - `parts`: OS-aware keycap labels, one per chip (macOS uses glyphs, others words).
 * - `aria`: canonical W3C `aria-keyshortcuts` string, OS-independent.
 */
export function formatShortcut(def: ShortcutDefinition, isMac: boolean): { parts: string[]; aria: string } {
  const useCtrl = !!def.ctrl || (!!def.mod && !isMac);
  const useMeta = !!def.meta || (!!def.mod && isMac);

  const parts: string[] = [];
  const ariaMods: string[] = [];

  if (isMac) {
    // Apple order: ⌃ ⌥ ⇧ ⌘
    if (useCtrl) parts.push(MAC_GLYPH.ctrl);
    if (def.alt) parts.push(MAC_GLYPH.alt);
    if (def.shift) parts.push(MAC_GLYPH.shift);
    if (useMeta) parts.push(MAC_GLYPH.meta);
  } else {
    if (useCtrl) parts.push(WIN_WORD.ctrl);
    if (useMeta) parts.push(WIN_WORD.meta);
    if (def.alt) parts.push(WIN_WORD.alt);
    if (def.shift) parts.push(WIN_WORD.shift);
  }

  // Canonical aria mod order: Control, Meta, Alt, Shift (primary before Shift, so
  // both Control+Shift+X and Meta+Shift+X hold across platforms).
  if (useCtrl) ariaMods.push("Control");
  if (useMeta) ariaMods.push("Meta");
  if (def.alt) ariaMods.push("Alt");
  if (def.shift) ariaMods.push("Shift");

  parts.push(keyLabel(def.key));
  const aria = [...ariaMods, keyAria(def.key)].join("+");

  return { parts, aria };
}
