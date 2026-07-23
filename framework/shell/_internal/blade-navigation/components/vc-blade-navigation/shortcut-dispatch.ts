import type { IBladeToolbar, ShortcutDefinition } from "@core/types";
import {
  hotkey,
  matchesEvent,
  isTextInputFocused,
  formatShortcut,
  expectedCode,
  expectedEventKey,
} from "@core/composables/useKeyboardShortcuts";

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
  /** True while a modal (`aria-modal="true"`) is open; blade shortcuts are suppressed while it is. */
  isModalOpen: () => boolean;
}

const ESC: ShortcutDefinition = hotkey.escape;
const EXPAND: ShortcutDefinition = hotkey.mod.backslash;

function hasModifier(def: ShortcutDefinition): boolean {
  return !!(def.mod || def.ctrl || def.meta || def.alt || def.shift);
}

const _warned = new Set<string>();

function isKnownKey(key: string): boolean {
  return expectedCode(key) !== undefined || expectedEventKey(key) !== undefined;
}

function warnOnce(key: string, message: string): void {
  if (_warned.has(key)) return;
  _warned.add(key);
  console.warn(message);
}

/** Dev-only diagnostics. Pure (warns directly); guard the call with import.meta.env.DEV. */
export function warnShortcutIssues(bladeId: string, items: IBladeToolbar[], isMac: boolean): void {
  const builtinAria = new Set([formatShortcut(ESC, isMac).aria, formatShortcut(EXPAND, isMac).aria]);
  const seen = new Map<string, string>(); // aria -> first item id

  for (const item of items) {
    const def = item.shortcut;
    if (!def) continue;
    const id = item.id ?? "item";

    if (!isKnownKey(def.key)) {
      warnOnce(`${bladeId}:${id}:unknownkey`, `[shortcut] unknown key "${def.key}" on toolbar item "${id}".`);
      continue;
    }

    const aria = formatShortcut(def, isMac).aria;

    if (seen.has(aria)) {
      warnOnce(
        `${bladeId}:${aria}:conflict`,
        `[shortcut] conflict on blade "${bladeId}": items "${seen.get(aria)}" and "${id}" both bind "${aria}". First wins.`,
      );
    } else {
      seen.set(aria, id);
    }

    if (builtinAria.has(aria)) {
      warnOnce(
        `${bladeId}:${aria}:builtin`,
        `[shortcut] toolbar item "${id}" overrides the built-in "${aria}" on blade "${bladeId}".`,
      );
    }
  }
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
    if (deps.isModalOpen()) return; // a modal traps all blade shortcuts

    const active = deps.getActiveBlade();
    if (!active) return;

    const bladeId = active.id;
    const closable = active.parentId !== undefined;

    // 1. Toolbar shortcuts (explicit; win over built-ins).
    const items = deps.getToolbarItems(bladeId);
    if (import.meta.env.DEV) warnShortcutIssues(bladeId, items, deps.isMac);
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
