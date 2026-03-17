# useKeyboardNavigation

Implements keyboard navigation (Arrow keys, Tab, Enter, Escape) within a container of focusable elements.

## When to Use

- Add accessible keyboard navigation to menus, dropdowns, or custom list components
- When NOT to use: for standard form tab order (native browser behavior is sufficient)

## Basic Usage

```typescript
import { useKeyboardNavigation } from '@vc-shell/framework';

const { initKeyboardNavigation, focusFirstElement } = useKeyboardNavigation({
  itemSelector: '[role="menuitem"]',
  onEnter: (el) => el.click(),
  onEscape: () => closeMenu(),
  loop: true,
});

// Auto-attaches on mount if containerSelector matches a DOM element.
// Or attach manually:
onMounted(() => {
  initKeyboardNavigation(menuRef.value!);
  focusFirstElement();
});
```

## API

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `containerSelector` | `string` | `'[role="menu"]'` | CSS selector to auto-find the container on mount |
| `itemSelector` | `string` | `'[tabindex="0"]'` | CSS selector for focusable items inside the container |
| `onEnter` | `(el: HTMLElement) => void` | `undefined` | Called on Enter/Space; falls back to `el.click()` |
| `onEscape` | `() => void` | `undefined` | Called on Escape key |
| `loop` | `boolean` | `true` | Wrap around when reaching first/last item |

### Returns

| Property | Type | Description |
|---|---|---|
| `initKeyboardNavigation` | `(el: HTMLElement) => void` | Manually attach keyboard listener to an element |
| `cleanupKeyboardNavigation` | `() => void` | Remove listener and reset state |
| `focusNextElement` | `() => void` | Move focus forward |
| `focusPreviousElement` | `() => void` | Move focus backward |
| `focusFirstElement` | `() => void` | Focus the first item |
| `focusLastElement` | `() => void` | Focus the last item |
| `setFocusedIndex` | `(index: number) => void` | Set focus to a specific index |
| `getFocusedIndex` | `() => number` | Get the currently focused index (-1 if none) |

## Details

- Handles ArrowUp/ArrowDown, Tab/Shift+Tab, Enter/Space, and Escape.
- Automatically cleans up the event listener on `onBeforeUnmount`.

## Related

- WAI-ARIA Menu Pattern for accessibility guidelines
