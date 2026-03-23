# useKeyboardNavigation

Implements keyboard navigation (Arrow keys, Tab, Enter, Escape) within a container of focusable elements. This composable provides full WAI-ARIA-style keyboard interaction for custom menus, dropdowns, autocomplete lists, and other composite widgets that are not natively keyboard-accessible. It manages a focused-item index, handles wrap-around (looping), and automatically attaches/detaches event listeners tied to the component lifecycle.

The composable supports two attachment modes: **auto-attach** on mount via a CSS selector (for static containers), and **manual attach** via `initKeyboardNavigation(el)` (for dynamic or ref-based containers).

## When to Use

- Add accessible keyboard navigation to custom menus, dropdowns, or list components
- Implement roving tabindex patterns for composite widgets
- When NOT to use: for standard form tab order (native browser behavior is sufficient), or for simple lists where `tabindex` on each item already works

## Quick Start

```vue
<script setup lang="ts">
import { useKeyboardNavigation } from '@vc-shell/framework';
import { ref } from 'vue';

const menuRef = ref<HTMLElement | null>(null);
const items = ref(['Dashboard', 'Products', 'Orders', 'Settings']);

const { initKeyboardNavigation, focusFirstElement } = useKeyboardNavigation({
  itemSelector: '[role="menuitem"]',
  onEnter: (el) => {
    el.click();
  },
  onEscape: () => {
    // Close menu or return focus to trigger
  },
  loop: true,
});

function openMenu() {
  // After the menu is shown, attach keyboard navigation and focus first item
  nextTick(() => {
    if (menuRef.value) {
      initKeyboardNavigation(menuRef.value);
      focusFirstElement();
    }
  });
}
</script>

<template>
  <div ref="menuRef" role="menu">
    <div
      v-for="item in items"
      :key="item"
      role="menuitem"
      tabindex="0"
      @click="selectItem(item)"
    >
      {{ item }}
    </div>
  </div>
</template>
```

## API

### Parameters (Options Object)

| Parameter | Type | Default | Description |
|---|---|---|---|
| `containerSelector` | `string` | `'[role="menu"]'` | CSS selector to auto-find the container on mount. Set to empty string to disable auto-attach. |
| `itemSelector` | `string` | `'[tabindex="0"]'` | CSS selector for focusable items inside the container. |
| `onEnter` | `(el: HTMLElement) => void` | `undefined` | Called when Enter or Space is pressed on a focused item. Falls back to `el.click()` if not provided. |
| `onEscape` | `() => void` | `undefined` | Called when Escape is pressed. Typically used to close the menu or popover. |
| `loop` | `boolean` | `true` | When `true`, pressing ArrowDown on the last item wraps to the first, and ArrowUp on the first wraps to the last. |

### Returns

| Property | Type | Description |
|---|---|---|
| `initKeyboardNavigation` | `(el: HTMLElement) => void` | Manually attach keyboard listener to an element. Cleans up any previous attachment first. |
| `cleanupKeyboardNavigation` | `() => void` | Remove listener and reset state. Called automatically on `onBeforeUnmount`. |
| `focusNextElement` | `() => void` | Move focus to the next item. Wraps if `loop` is `true`. |
| `focusPreviousElement` | `() => void` | Move focus to the previous item. Wraps if `loop` is `true`. |
| `focusFirstElement` | `() => void` | Focus the first matching item in the container. |
| `focusLastElement` | `() => void` | Focus the last matching item in the container. |
| `setFocusedIndex` | `(index: number) => void` | Set focus to a specific index. No-op if index is out of bounds. |
| `getFocusedIndex` | `() => number` | Get the currently focused index (`-1` if no item is focused). |

## How It Works

The composable listens for `keydown` events on the container element and handles:

- **ArrowDown / Tab**: Move focus to the next item (`focusNextElement`)
- **ArrowUp / Shift+Tab**: Move focus to the previous item (`focusPreviousElement`)
- **Enter / Space**: Activate the focused item (calls `onEnter` callback, or `el.click()`)
- **Escape**: Call `onEscape` callback

On each key event, the composable re-queries the container for matching items (`itemSelector`), so it naturally handles dynamic lists where items are added or removed. The focused index is validated against the current item count before every operation to prevent stale-index bugs.

Auto-attach happens in `onMounted`: if `containerSelector` is set and a matching element exists in the DOM, keyboard navigation is initialized automatically. Cleanup happens in `onBeforeUnmount`.

## Recipe: Keyboard-Navigable Autocomplete Dropdown

```vue
<script setup lang="ts">
import { useKeyboardNavigation } from '@vc-shell/framework';
import { ref, watch, nextTick } from 'vue';

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const suggestions = ref<string[]>([]);

const { initKeyboardNavigation, cleanupKeyboardNavigation, focusFirstElement } =
  useKeyboardNavigation({
    containerSelector: '', // disable auto-attach
    itemSelector: '.suggestion-item',
    onEnter: (el) => {
      selectSuggestion(el.dataset.value!);
      isOpen.value = false;
    },
    onEscape: () => {
      isOpen.value = false;
    },
    loop: true,
  });

watch(isOpen, async (open) => {
  if (open) {
    await nextTick();
    if (dropdownRef.value) {
      initKeyboardNavigation(dropdownRef.value);
      focusFirstElement();
    }
  } else {
    cleanupKeyboardNavigation();
  }
});

function selectSuggestion(value: string) {
  // handle selection
}
</script>

<template>
  <div>
    <VcInput @focus="isOpen = true" @input="fetchSuggestions" />
    <div v-if="isOpen" ref="dropdownRef" class="suggestion-dropdown">
      <div
        v-for="item in suggestions"
        :key="item"
        :data-value="item"
        class="suggestion-item"
        tabindex="0"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
```

## Tips

- **Use `nextTick` before attaching.** If the container is conditionally rendered (e.g., a `v-if` dropdown), the DOM element does not exist yet during the same tick. Always await `nextTick()` before calling `initKeyboardNavigation`.
- **Items are re-queried on every key press.** This means dynamically added or removed items are picked up automatically. You do not need to re-initialize after the list changes.
- **`loop: false` stops at boundaries.** When looping is disabled, pressing ArrowDown on the last item or ArrowUp on the first item does nothing. This is appropriate for linear navigation patterns.
- **Clean up if you manually init.** While auto-attached listeners are cleaned up on `onBeforeUnmount`, if you call `initKeyboardNavigation` on a dynamic element, call `cleanupKeyboardNavigation` when that element is removed.
- **Tab key is intercepted.** The composable handles Tab/Shift+Tab within the container, moving focus between items rather than leaving the container. This follows the WAI-ARIA composite widget pattern.

## Related

- WAI-ARIA Menu Pattern -- accessibility guidelines for keyboard-navigable menus
- WAI-ARIA Composite Widgets -- general pattern for roving tabindex
