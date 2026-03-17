# useBladeWidgets

Declarative headless widget registration for blades. Widgets are automatically registered on mount and cleaned up on unmount.

## When to Use

- Register sidebar widgets (counters, action buttons) for a blade without creating Vue components
- Refresh widget data programmatically after blade operations
- When NOT to use: for widgets that need their own template (use a full widget component instead)

## Basic Usage

```typescript
import { useBladeWidgets } from '@vc-shell/framework';

const { refreshAll } = useBladeWidgets([
  {
    id: 'OffersWidget',
    icon: 'lucide-tag',
    title: 'OFFERS.TITLE',
    badge: offersCount,
    loading: offersLoading,
    onClick: () => openBlade({ name: 'OffersList' }),
    onRefresh: () => reloadOffers(),
  },
  {
    id: 'ReviewsWidget',
    icon: 'lucide-star',
    title: 'REVIEWS.TITLE',
    badge: reviewsCount,
    isVisible: computed(() => !!item.value?.id),
    onClick: () => openBlade({ name: 'ReviewsList' }),
  },
]);

// After a save, refresh all widget data
await saveEntity();
refreshAll();
```

## API

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `widgets` | `HeadlessWidgetDeclaration[]` | Yes | Array of widget declarations |

### HeadlessWidgetDeclaration

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique widget identifier |
| `icon` | `string` | Yes | Icon name (e.g., `"lucide-tag"`) |
| `title` | `string` | Yes | i18n key or display title |
| `badge` | `Ref<number \| string>` | No | Badge counter value |
| `loading` | `Ref<boolean>` | No | Show loading indicator |
| `disabled` | `Ref<boolean> \| boolean` | No | Disable the widget |
| `isVisible` | `ComputedRef<boolean> \| boolean` | No | Toggle visibility |
| `onClick` | `() => void` | No | Action when widget is clicked |
| `onRefresh` | `() => void \| Promise<void>` | No | Called by `refresh(id)` or `refreshAll()` |

### Returns

| Property | Type | Description |
|---|---|---|
| `refresh` | `(widgetId: string) => void` | Trigger `onRefresh` on a specific widget |
| `refreshAll` | `() => void` | Trigger `onRefresh` on all widgets that have one |

## Prerequisites

- Must be called inside a blade component rendered by `VcBladeSlot` (requires `BladeDescriptorKey`).
- `WidgetService` must be provided in the component tree.

## Related

- `defineBladeContext` -- expose blade data to widgets
- `WidgetService` in `@core/services/widget-service`
