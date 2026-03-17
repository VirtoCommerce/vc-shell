# useSidebarState

Controls the sidebar (left navigation panel) expansion, pinning, hover, and mobile menu state.

## When to Use

- Toggle or read sidebar expanded/collapsed state from any component inside VcApp
- Control the mobile menu overlay programmatically
- When NOT to use: outside the VcApp component tree (will throw)

## Basic Usage

```typescript
import { useSidebarState } from '@vc-shell/framework';

const { isExpanded, isPinned, togglePin, openMenu, closeMenu } = useSidebarState();

// Check if sidebar is visually expanded (pinned or hovered)
if (isExpanded.value) {
  // sidebar content is visible
}
```

## API

### Returns -- State

| Property | Type | Description |
|---|---|---|
| `isPinned` | `Ref<boolean>` | Sidebar is pinned open (persisted to localStorage) |
| `isHoverExpanded` | `Ref<boolean>` | Sidebar is temporarily expanded on mouse hover |
| `isMenuOpen` | `Ref<boolean>` | Mobile menu overlay is visible |
| `isExpanded` | `ComputedRef<boolean>` | Derived: `isPinned || isHoverExpanded` |

### Returns -- Actions

| Property | Type | Description |
|---|---|---|
| `togglePin` | `() => void` | Toggle pinned state (persists to localStorage) |
| `setHoverExpanded` | `(value: boolean) => void` | Set hover expansion with 200ms open delay |
| `openMenu` | `() => void` | Show mobile menu overlay |
| `closeMenu` | `() => void` | Hide mobile menu overlay |

## Setup

`provideSidebarState()` must be called once in VcApp's setup. All descendants use `useSidebarState()`.

## Related

- `useMenuExpanded` -- lower-level composable that manages pinned/hover state and localStorage persistence
