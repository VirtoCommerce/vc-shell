---
title: useSidebarState
category: composables
group: ui-state
---

# useSidebarState

Controls the sidebar (left navigation panel) expansion, pinning, hover, and mobile menu state. This composable exposes a unified API for reading and toggling all sidebar states from any component within the VcApp tree. The sidebar has three independent dimensions: **pinned** (user explicitly locked it open, persisted to localStorage), **hover-expanded** (mouse is hovering over the collapsed sidebar on desktop), and **mobile menu** (overlay drawer on small screens). The derived `isExpanded` computed combines pinned and hover states for convenience.

## When to Use

- Toggle or read sidebar expanded/collapsed state from any component inside VcApp
- Control the mobile menu overlay programmatically (e.g., close it after a navigation action)
- Conditionally render content based on sidebar expansion (e.g., show labels only when expanded)
- When NOT to use: outside the VcApp component tree (will throw an error because the injection is missing)

## Quick Start

```vue
<script setup lang="ts">
import { useSidebarState } from "@vc-shell/framework";

const { isExpanded, isPinned, togglePin, openMenu, closeMenu } = useSidebarState();
</script>

<template>
  <div class="tw-flex tw-items-center">
    <!-- Show full label when expanded, icon-only when collapsed -->
    <VcIcon icon="fas fa-box" />
    <span
      v-if="isExpanded"
      class="tw-ml-2"
      >Products</span
    >

    <!-- Pin/unpin toggle button -->
    <button
      @click="togglePin"
      class="tw-ml-auto"
    >
      <VcIcon :icon="isPinned ? 'fas fa-thumbtack' : 'fas fa-thumbtack tw-rotate-45'" />
    </button>
  </div>
</template>
```

## API

### Returns -- State

| Property          | Type                   | Description                                                                                |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------ | --- | ------------------------------------------------------------------------------------ |
| `isPinned`        | `Ref<boolean>`         | Sidebar is pinned open by the user. Persisted to localStorage so it survives page reloads. |
| `isHoverExpanded` | `Ref<boolean>`         | Sidebar is temporarily expanded because the mouse is hovering over it (desktop only).      |
| `isMenuOpen`      | `Ref<boolean>`         | Mobile menu overlay is visible.                                                            |
| `isExpanded`      | `ComputedRef<boolean>` | Derived: `isPinned                                                                         |     | isHoverExpanded`. Use this when you just need to know if sidebar content is visible. |

### Returns -- Actions

| Property           | Type                       | Description                                                                                                      |
| ------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `togglePin`        | `() => void`               | Toggle pinned state. Persists the new value to localStorage immediately.                                         |
| `setHoverExpanded` | `(value: boolean) => void` | Set hover expansion. Opening has a 200ms delay to prevent flicker from brief mouse passes; closing is immediate. |
| `openMenu`         | `() => void`               | Show the mobile menu overlay.                                                                                    |
| `closeMenu`        | `() => void`               | Hide the mobile menu overlay.                                                                                    |

<!-- internal:start -->

## Setup

`provideSidebarState()` must be called once in VcApp's setup. It is idempotent -- if called multiple times in the same injection tree, it returns the existing instance. All descendant components then call `useSidebarState()` to access the shared state.

```typescript
// Inside VcApp.vue setup
import { provideSidebarState } from "@vc-shell/framework";

provideSidebarState();
```

<!-- internal:end -->

## Storage key

The pinned state lives in `localStorage` under an app-scoped key -- the first segment of the URL path, so several vc-shell apps on one domain keep independent sidebars. `sidebarStorageKey()` returns that key, so tests and stories can seed the state before `VcApp` mounts instead of hard-coding the string:

```typescript
import { sidebarStorageKey } from "@vc-shell/framework";

// Served from "/operations/catalog" -> "VC_APP_MENU_EXPANDED_operations"
localStorage.setItem(sidebarStorageKey(), "true");

// Or name the app explicitly
localStorage.setItem(sidebarStorageKey("operations"), "false");
```

## Recipe: Auto-Close Mobile Menu After Navigation

```vue
<script setup lang="ts">
import { useSidebarState } from "@vc-shell/framework";
import { useBlade } from "@vc-shell/framework";

const { closeMenu, isMenuOpen } = useSidebarState();
const { openBlade } = useBlade();

async function navigateToProducts() {
  // Close the mobile menu first so it does not overlay the new blade
  if (isMenuOpen.value) {
    closeMenu();
  }

  await openBlade({
    name: "ProductList",
    param: { catalogId: "default" },
  });
}
</script>

<template>
  <button @click="navigateToProducts">
    <VcIcon icon="fas fa-box" />
    <span>Products</span>
  </button>
</template>
```

## Recipe: Adjusting Content Width Based on Sidebar State

```vue
<script setup lang="ts">
import { useSidebarState } from "@vc-shell/framework";
import { computed } from "vue";

const { isExpanded } = useSidebarState();

const contentClass = computed(() => (isExpanded.value ? "tw-ml-64" : "tw-ml-16"));
</script>

<template>
  <div
    :class="contentClass"
    class="tw-transition-all tw-duration-200"
  >
    <slot />
  </div>
</template>
```

## Tips

- **Hover delay prevents flicker.** The 200ms delay on `setHoverExpanded(true)` means that quickly passing the mouse over the sidebar does not cause it to flash open. Closing is instant so the sidebar feels responsive.
- **`isPinned` is persisted to localStorage.** If a user pins the sidebar, it stays pinned across page reloads and browser sessions. The key is app-scoped -- `sidebarStorageKey()` returns it.
- **Do not call outside VcApp.** If you call `useSidebarState()` in a component that is not a descendant of VcApp (e.g., in a standalone dialog or a separate Vue app instance), it will throw an error.

## Related

- `VcApp` -- the root component that calls `provideSidebarState()`
