# Sidebar Component

A responsive sidebar wrapper that conditionally renders content inside a `VcSidebar` panel or inline, based on viewport and expansion state.

## Overview

The `Sidebar` component acts as a smart container. When the sidebar should be visible (based on the `isExpanded` prop and the `render` mode matching the current viewport), it wraps the content slot inside a `VcSidebar` organism with slide-in behavior. Otherwise, it renders the content directly without any sidebar chrome.

On mobile, the sidebar teleports itself out of the normal DOM flow to overlay the full screen.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isExpanded` | `boolean` | (required) | Whether the sidebar is currently open |
| `position` | `"left" \| "right"` | `"right"` | Slide-in direction |
| `render` | `"always" \| "mobile" \| "desktop"` | `"always"` | When to render as a sidebar vs. inline |
| `title` | `string` | -- | Optional title shown in the sidebar header |
| `closeCross` | `boolean` | `true` | Whether to show the close button |

## Events

| Event | Payload | Description |
|---|---|---|
| `close` | -- | Emitted when the user closes the sidebar |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `header` | `{ close: () => void }` | Custom header content; receives a `close` function |
| `content` | -- | The main sidebar body content |

## Usage

```vue
<Sidebar
  :is-expanded="showFilters"
  position="right"
  render="always"
  title="Filters"
  @close="showFilters = false"
>
  <template #content>
    <FilterPanel />
  </template>
</Sidebar>
```

### Mobile-only sidebar

```vue
<Sidebar
  :is-expanded="showDetails"
  render="mobile"
  @close="showDetails = false"
>
  <template #content>
    <DetailView />
  </template>
</Sidebar>
```

When `render="mobile"` and the viewport is desktop, the content slot renders inline without any sidebar wrapper.

## Behavior

- **Visibility**: The sidebar is visible when `isExpanded === true` AND the `render` mode matches the current viewport (injected via `IsMobileKey` / `IsDesktopKey`).
- **Teleport**: On mobile, the inner `VcSidebar` teleports to the document body for proper overlay stacking.
- **Close**: Closing the sidebar emits `close` -- the parent must update `isExpanded`.

## Tips

- Use `render="mobile"` for panels that should be drawers on phones but inline panels on desktop.
- The `header` slot receives a `close` function so custom headers can include their own close button.
- The component injects `IsMobileKey` and `IsDesktopKey` from the framework's injection keys.

## Related

- `framework/ui/components/organisms/vc-sidebar/` -- the underlying `VcSidebar` organism
- `framework/injection-keys.ts` -- `IsMobileKey`, `IsDesktopKey`
