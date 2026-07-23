import type { ShortcutDefinition } from "@core/types";
import { hotkey, type HotkeyBuilder } from "./hotkey";
import { formatShortcut } from "./format";

export { hotkey } from "./hotkey";
export type { HotkeyBuilder, Modifier, Key } from "./hotkey";
export { matchesEvent, isTextInputFocused, expectedCode, expectedEventKey } from "./match";
export { formatShortcut } from "./format";

/** Detects macOS from the user agent (Mac primary modifier is Cmd). */
export function useIsMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export interface UseKeyboardShortcutsReturn {
  hotkey: HotkeyBuilder;
  formatShortcut(def: ShortcutDefinition): { parts: string[]; aria: string };
  isMac: boolean;
}

/**
 * Public entry point. `hotkey` is the same singleton as the named import; the
 * composable also binds `isMac` into `formatShortcut` for convenience. It is
 * context-free (no inject/lifecycle), usable in or out of setup.
 */
export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  const isMac = useIsMac();
  return {
    hotkey,
    isMac,
    formatShortcut: (def: ShortcutDefinition) => formatShortcut(def, isMac),
  };
}
