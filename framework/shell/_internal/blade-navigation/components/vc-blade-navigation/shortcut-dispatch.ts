import type { IBladeToolbar, ShortcutDefinition } from "@core/types";
import { hotkey, matchesEvent, isTextInputFocused } from "@core/composables/useKeyboardShortcuts";

interface ActiveBladeLike {
  id: string;
  parentId?: string;
}

export interface ShortcutDispatchDeps {
  isMac: boolean;
  getActiveBlade: () => ActiveBladeLike | undefined;
  getToolbarItems: (bladeId: string) => IBladeToolbar[];
  isMobile: () => boolean;
  /** Resolves permissions + isVisible + disabled for a toolbar item. */
  isEnabled: (item: IBladeToolbar) => boolean;
  closeBlade: (id: string) => void | Promise<unknown>;
  toggleMaximized: (id: string) => void;
}

const ESC: ShortcutDefinition = hotkey.escape;
const EXPAND: ShortcutDefinition = hotkey.mod.backslash;

function hasModifier(def: ShortcutDefinition): boolean {
  return !!(def.mod || def.ctrl || def.meta || def.alt || def.shift);
}

export function createShortcutDispatcher(deps: ShortcutDispatchDeps) {
  const inFlight = new Set<string>();

  async function runGuarded(runKey: string, run: () => unknown | Promise<unknown>): Promise<void> {
    if (inFlight.has(runKey)) return;
    inFlight.add(runKey);
    try {
      await run();
    } finally {
      inFlight.delete(runKey);
    }
  }

  return async function dispatch(event: KeyboardEvent): Promise<void> {
    if (event.repeat) return;
    if (event.defaultPrevented) return;

    const active = deps.getActiveBlade();
    if (!active) return;

    const bladeId = active.id;
    const closable = active.parentId !== undefined;

    // 1. Toolbar shortcuts (explicit; win over built-ins).
    const items = deps.getToolbarItems(bladeId);
    for (const item of items) {
      const def = item.shortcut;
      if (!def) continue;
      if (!matchesEvent(def, event, deps.isMac)) continue;
      if (!hasModifier(def) && isTextInputFocused()) return; // bare key blocked in inputs
      if (!deps.isEnabled(item)) return;
      event.preventDefault();
      await runGuarded(`${bladeId}::${item.id ?? "item"}`, () => item.clickHandler?.());
      return;
    }

    // 2. Built-in: Esc → close (if closable).
    if (matchesEvent(ESC, event, deps.isMac)) {
      if (!closable) return;
      event.preventDefault();
      await runGuarded(`${bladeId}::__close__`, () => deps.closeBlade(bladeId));
      return;
    }

    // 3. Built-in: mod+\ → toggle maximize (desktop + closable).
    if (matchesEvent(EXPAND, event, deps.isMac)) {
      if (deps.isMobile() || !closable) return;
      event.preventDefault();
      deps.toggleMaximized(bladeId);
      return;
    }
  };
}
