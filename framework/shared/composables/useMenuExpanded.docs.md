# useMenuExpanded

Manages the sidebar menu expanded/collapsed and hover-expanded state with localStorage persistence.

## When to Use

- Low-level control over sidebar pin and hover state
- When NOT to use: prefer `useSidebarState` which wraps this composable and adds mobile menu support

## Basic Usage

```typescript
import { useMenuExpanded } from '@vc-shell/framework';

const { isExpanded, toggleExpanded, isHoverExpanded, toggleHoverExpanded } = useMenuExpanded();

// Toggle pin state (persisted to localStorage)
toggleExpanded();

// Hover expand with 200ms delay
toggleHoverExpanded(true);   // opens after delay
toggleHoverExpanded(false);  // closes immediately
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `isExpanded` | `Ref<boolean>` | Pinned state, persisted via `useLocalStorage` |
| `toggleExpanded` | `() => void` | Toggle the pinned state |
| `isHoverExpanded` | `Ref<boolean>` | Temporary hover expansion (not persisted) |
| `toggleHoverExpanded` | `(shouldExpand?: boolean) => void` | Set hover state; opening has a 200ms delay, closing is immediate |

## Details

- Storage key is scoped per app using the first URL path segment: `VC_APP_MENU_EXPANDED_{appName}`.
- Cleans up pending hover timeouts via `onScopeDispose` to prevent memory leaks.

## Related

- `useSidebarState` -- higher-level composable that adds mobile menu and derived `isExpanded` computed
