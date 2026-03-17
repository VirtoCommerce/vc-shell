# useAppBarMobileButtons

Manages custom action buttons in the mobile app bar. Uses provide/inject to share a singleton service across the component tree.

## When to Use

- Register custom buttons (icons, components) in the mobile top bar from any blade or module
- When NOT to use: for desktop-only toolbar actions (use `useToolbar` instead)

## Basic Usage

```typescript
import { useAppBarMobileButtons } from '@vc-shell/framework';

// In a blade or module component
const { register, unregister, getButtons } = useAppBarMobileButtons();

register({
  id: 'notifications-btn',
  icon: 'fas fa-bell',
  onClick: () => openNotifications(),
  order: 10,
  badge: hasUnread,
});

onUnmounted(() => unregister('notifications-btn'));
```

## API

### Returns

| Property | Type | Description |
|---|---|---|
| `registeredButtons` | `ComputedRef<AppBarButtonContent[]>` | All registered buttons (unfiltered) |
| `register` | `(button: AppBarButtonContent) => void` | Add or update a button by `id` |
| `unregister` | `(buttonId: string) => void` | Remove a button by `id` |
| `getButton` | `(buttonId: string) => AppBarButtonContent \| undefined` | Look up a single button |
| `getButtons` | `ComputedRef<AppBarButtonContent[]>` | Visible buttons sorted by `order` |

### AppBarButtonContent

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `icon` | `Component \| string` | No | Icon component or CSS class |
| `component` | `Component` | No | Custom Vue component to render |
| `props` | `Record<string, unknown>` | No | Props passed to custom component |
| `onClick` | `() => void` | No | Click handler |
| `onClose` | `() => void` | No | Close/dismiss handler |
| `order` | `number` | No | Sort priority (lower = first) |
| `isVisible` | `MaybeRef<boolean>` | No | Reactive visibility toggle |
| `badge` | `MaybeRef<boolean>` | No | Show badge indicator |

## Setup

`provideAppBarMobileButtonsService()` must be called once in the app root (VcApp). Descendant components then call `useAppBarMobileButtons()`.

## Related

- `useToolbar` -- desktop toolbar actions
- `framework/core/services/app-bar-mobile-buttons-service.ts` -- underlying service
