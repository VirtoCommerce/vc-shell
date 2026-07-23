---
title: useKeyboardShortcuts
category: composables
group: utilities
---

!!! tip "Long page"
Use the section headings to jump directly to what you need: [Primary pattern: declare a shortcut on a toolbar item](#primary-pattern-declare-a-shortcut-on-a-toolbar-item), [Quick Start](#quick-start), [Built-in blade shortcuts](#built-in-blade-shortcuts), or [API Reference](#api-reference).

# useKeyboardShortcuts

`useKeyboardShortcuts` is the framework's keyboard-shortcut toolkit: the `hotkey` fluent builder for describing a combination, and OS-aware formatting for the tooltip and `aria-keyshortcuts` that a toolbar button shows automatically once it declares one. There is no manual `keydown` wiring in module code -- a shortcut is a plain field on a toolbar item, and the blade navigation layer dispatches it globally.

## Primary pattern: declare a shortcut on a toolbar item

Add `shortcut: hotkey.mod.s` to any `IBladeToolbar` entry. `hotkey.mod.s` resolves to `{ key: "s", mod: true }` -- `mod` is the platform's primary modifier (Cmd on macOS, Ctrl elsewhere), so one definition covers both operating systems.

```vue title="orders-details.vue"
<script setup lang="ts">
import { ref } from "vue";
import { hotkey, VcBlade, type IBladeToolbar } from "@vc-shell/framework";

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    shortcut: hotkey.mod.s,
    clickHandler: () => save(),
  },
]);
</script>

<template>
  <VcBlade :toolbar-items="bladeToolbar" />
</template>
```

That single field is the whole integration. The rendered "Save" button now shows a `⌘S` / `Ctrl+S` tooltip, sets `aria-keyshortcuts="Meta+S"`, and the blade navigation layer fires `clickHandler` when the user presses the combination while the blade is active -- no listener, no cleanup.

## When to reach for it

- **Declaring a shortcut on a toolbar item.** The common case: add `shortcut: hotkey.mod.s` next to `clickHandler` on an `IBladeToolbar` entry (array pattern or `useToolbar().registerToolbarItem`, see [useToolbar](../useToolbar/)).
- **Formatting a shortcut for custom UI.** Call `useKeyboardShortcuts()` and use `formatShortcut(def)` when you need the OS-aware label somewhere other than the built-in toolbar tooltip (a help panel, a command palette row).
- **Detecting the platform.** `isMac` is exposed for any OS-conditional copy or icon choice tied to a shortcut.
- **Not for building your own key listener.** There is no public "register a global shortcut" API outside toolbar items -- see [Common mistakes](#common-mistakes).

## Quick Start

### Import vs `useKeyboardShortcuts()` destructure

`hotkey` is a context-free singleton -- import it directly wherever you only need to build a definition:

```typescript
import { hotkey } from "@vc-shell/framework";

const saveShortcut = hotkey.mod.s; // { key: "s", mod: true }
```

Reach for the composable form only when you also need `formatShortcut` or `isMac` (both are bound together so `formatShortcut` doesn't need an `isMac` argument at the call site):

```typescript
import { useKeyboardShortcuts } from "@vc-shell/framework";

const { hotkey, formatShortcut, isMac } = useKeyboardShortcuts();

const saveShortcut = hotkey.mod.s;
const { parts, aria } = formatShortcut(saveShortcut);
// isMac ? parts = ["⌘", "S"] : parts = ["Ctrl", "S"]
// aria = "Meta+S" on macOS, "Control+S" elsewhere
```

Both forms return the same `hotkey` singleton -- the composable exists for convenience when a component already needs `isMac`/`formatShortcut`, not because `hotkey` itself carries state.

## Built-in blade shortcuts

Two shortcuts are wired up by the framework at the blade navigation root -- no client code required, and no toolbar item needed to get them:

| Shortcut     | Effect                  | Gate                                                                        |
| ------------ | ----------------------- | --------------------------------------------------------------------------- |
| `Esc`        | Closes the active blade | Only if the blade is closable (has a `parentId`; workspace roots ignore it) |
| `Cmd/Ctrl+\` | Toggles expand/maximize | Only on desktop and only if the blade is closable                           |

Both are evaluated against the currently active blade, and both are skipped while the corresponding condition doesn't hold -- `Esc` on a non-closable workspace root does nothing, and `Cmd/Ctrl+\` does nothing on mobile viewports even on a closable blade.

**An explicit toolbar shortcut always wins.** The dispatcher checks the active blade's toolbar items before either built-in, so a toolbar item declared with `shortcut: hotkey.escape` (for example, a "Cancel" button) intercepts `Esc` and the built-in close never runs.

## OS adaptation

`formatShortcut(def)` returns two independent representations from one `ShortcutDefinition`, so you never branch on OS yourself:

- `parts` -- an array of OS-native keycap labels for display. macOS renders modifier glyphs in Apple's canonical order (`⌃ ⌥ ⇧ ⌘`) with no separator; Windows/Linux render words (`Ctrl`, `Alt`, `Shift`) with a `+` between chips.
- `aria` -- a single canonical string in W3C `aria-keyshortcuts` format (`"Control+Shift+S"`), OS-independent by design -- this is what assistive tech reads, not what's painted on screen.

```typescript
import { useKeyboardShortcuts } from "@vc-shell/framework";

const { hotkey, formatShortcut, isMac } = useKeyboardShortcuts();
const { parts } = formatShortcut(hotkey.mod.s);

// isMac === true  → parts = ["⌘", "S"]      → tooltip renders "⌘S" (no separator)
// isMac === false → parts = ["Ctrl", "S"]   → tooltip renders "Ctrl+S" (with separator)
```

The toolbar button itself (`ToolbarBaseButton`) already does this for you: it calls `formatShortcut` internally and renders the result through the `ShortcutKbd` chip component inside a tooltip. `isMac` also determines `matchesEvent`'s runtime resolution of `mod` -- the same flag drives both what the user sees and what actually fires.

## Accessibility

- **`aria-keyshortcuts`.** Set automatically on the button element whenever `shortcut` is present, using the canonical `aria` string from `formatShortcut` (for example `aria-keyshortcuts="Meta+S"`). No shortcut, no attribute -- it's never rendered empty.
- **Tooltip discovery.** A sighted user discovers the shortcut through the `<kbd>` chips shown on hover/focus of the toolbar button (`ShortcutKbd`, wrapped in `VcTooltip`). This is the only visual affordance; there is no separate "shortcuts list" surface in v1.
- **No button, no discovery.** Both `aria-keyshortcuts` and the tooltip are properties of the rendered toolbar button -- they exist only because `shortcut` lives on an `IBladeToolbar` item that renders as a button. There is currently no way to advertise a shortcut that isn't attached to a visible button (see [Common mistakes](#common-mistakes)).
- **Accessible name still comes from the title.** `shortcut` does not change how the button's accessible name is computed -- it still comes from the visible `title` text. Keep `title` non-empty; `shortcut` is additive, not a substitute for a labeled button.

## Common mistakes

### Expecting a bare key to fire while an input is focused

```typescript
// Wrong -- assumes "e" fires globally
registerToolbarItem({ id: "edit", title: "Edit", shortcut: { key: "e" }, clickHandler: () => edit() });
```

A shortcut with no modifier is suppressed while focus is inside a text input, textarea, select, or a `contenteditable` element -- otherwise typing the letter "e" into a form field would trigger the button. This guard only applies to bare keys; add a modifier (`hotkey.mod.e`) if the shortcut must also fire while a field is focused.

```typescript
// Correct -- a modified combination is not suppressed by input focus
registerToolbarItem({ id: "edit", title: "Edit", shortcut: hotkey.mod.e, clickHandler: () => edit() });
```

### Two toolbar items sharing the same combination

```typescript
// Wrong -- both items declare mod+s on the same blade
const bladeToolbar = ref<IBladeToolbar[]>([
  { id: "save", title: "Save", shortcut: hotkey.mod.s, clickHandler: () => save() },
  { id: "save-as", title: "Save As", shortcut: hotkey.mod.s, clickHandler: () => saveAs() },
]);
```

The dispatcher walks a blade's toolbar items in declaration order and fires the _first_ item whose shortcut matches, then stops -- `save-as` never receives `Cmd/Ctrl+S` as long as `save` is registered ahead of it. There is no runtime warning when this happens today, so treat shortcut collisions within a blade's toolbar as a review-time concern: keep combinations unique per blade.

```typescript
// Correct -- distinct combinations
const bladeToolbar = ref<IBladeToolbar[]>([
  { id: "save", title: "Save", shortcut: hotkey.mod.s, clickHandler: () => save() },
  { id: "save-as", title: "Save As", shortcut: hotkey.mod.shift.s, clickHandler: () => saveAs() },
]);
```

### Expecting a button-less shortcut

```typescript
// Wrong -- there is no API to register a shortcut without a toolbar item
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.metaKey && e.key === "s") save();
  });
});
```

Rolling your own `keydown` listener bypasses `isTextInputFocused` suppression, the active-blade scoping, and the tooltip/`aria-keyshortcuts` discovery that toolbar shortcuts get for free -- and it risks double-firing alongside the framework dispatcher. In v1, every shortcut must be attached to a visible `IBladeToolbar` item; there is no headless/button-less registration path. If the action genuinely has no natural button, add one (it can be low-priority/overflowed) rather than reaching for a manual listener.

## API Reference

### `hotkey`

A fluent builder, importable directly or via the composable. Modifier and key names are finite string unions, so a typo (`hotkey.mdo.s`) is a compile error, not a silent no-op.

```typescript
hotkey.mod.s; // { key: "s", mod: true }
hotkey.mod.shift.s; // { key: "s", mod: true, shift: true }
hotkey.ctrl.alt.delete; // { key: "delete", ctrl: true, alt: true }
hotkey.escape; // { key: "escape" }
```

Chainable modifiers: `mod`, `ctrl`, `meta`, `alt`, `shift` (any order, any combination). Terminal keys: letters `a`-`z`, digits `0`-`9`, `enter`, `escape`, `tab`, `space`, `delete`, `backspace`, `arrowup`/`arrowdown`/`arrowleft`/`arrowright`, `f1`-`f12`, `backslash`, `period`, `comma`, `slash`.

### `useKeyboardShortcuts()`

Context-free -- no inject/lifecycle, usable in or out of a component `setup()`.

#### Returns: `UseKeyboardShortcutsReturn`

| Property         | Type                                                             | Description                                                               |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `hotkey`         | `HotkeyBuilder`                                                  | The same singleton as the named `hotkey` import                           |
| `formatShortcut` | `(def: ShortcutDefinition) => { parts: string[]; aria: string }` | `isMac`-bound: formats a definition into display chips and an aria string |
| `isMac`          | `boolean`                                                        | `true` when the user agent reports macOS/iOS                              |

### `formatShortcut(def, isMac)`

The standalone function (also exported directly) if you need to format for an explicit `isMac` value instead of the detected one:

```typescript
import { formatShortcut } from "@vc-shell/framework";

formatShortcut({ key: "s", mod: true }, true); // { parts: ["⌘", "S"], aria: "Meta+S" }
formatShortcut({ key: "s", mod: true }, false); // { parts: ["Ctrl", "S"], aria: "Control+S" }
```

### `ShortcutDefinition`

| Property | Type      | Required | Description                                                                         |
| -------- | --------- | -------- | ----------------------------------------------------------------------------------- |
| `key`    | `string`  | Yes      | Single key: `"s"`, `"1"`, `"enter"`, `"escape"`, `"f2"`, `"arrowup"`, `"backslash"` |
| `mod`    | `boolean` | No       | Platform primary modifier -- Cmd on macOS, Ctrl elsewhere                           |
| `ctrl`   | `boolean` | No       | Literal Ctrl, regardless of platform                                                |
| `meta`   | `boolean` | No       | Literal Cmd/Win key, regardless of platform                                         |
| `alt`    | `boolean` | No       | Alt/Option                                                                          |
| `shift`  | `boolean` | No       | Shift                                                                               |

Building definitions by hand (`{ key: "s", mod: true }`) works identically to `hotkey.mod.s` -- the builder is sugar over this shape, useful when a definition needs to be constructed dynamically.

## Related

- [useToolbar](../useToolbar/) -- registers the toolbar items that carry `shortcut`; see its `IBladeToolbar`/`IToolbarItem` reference for the full item shape
- [Blade Navigation Composables](../../blade-navigation/) -- the blade stack that scopes shortcut dispatch to the active blade and hosts the two built-in shortcuts
- `IBladeToolbar` in [Core types](../../types/) -- the `shortcut?: ShortcutDefinition` field lives here
