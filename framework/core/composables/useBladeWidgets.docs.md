# useBladeWidgets

Declarative headless widget registration for blades. Widgets are automatically registered with the WidgetService on mount and cleaned up on unmount, following the Vue component lifecycle. This composable is the recommended way to add sidebar counter widgets, action buttons, and status indicators to a blade without creating separate Vue component files for each widget.

Headless widgets are defined as plain configuration objects with reactive refs for dynamic values like badge counts and loading states. The WidgetService renders them in the blade sidebar.

## When to Use

- Register sidebar widgets (counters, action buttons) for a blade without creating Vue components
- Refresh widget data programmatically after blade operations (save, delete, status change)
- Show/hide widgets conditionally based on blade state (e.g., only show after entity is saved)
- When NOT to use: for widgets that need their own template or complex UI (use a full widget component instead)

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

## Recipe: Product Detail Blade with Multiple Widgets

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useBladeWidgets, defineBladeContext } from "@vc-shell/framework";

const product = ref({ id: "prod-1", name: "Widget A" });
const offersCount = ref(0);
const reviewsCount = ref(0);
const offersLoading = ref(false);

// Expose product data to widgets
defineBladeContext(computed(() => ({ id: product.value?.id })));

async function reloadOffers() {
  offersLoading.value = true;
  try {
    const result = await api.searchOffers({ productId: product.value.id });
    offersCount.value = result.totalCount;
  } finally {
    offersLoading.value = false;
  }
}

const { refreshAll } = useBladeWidgets([
  {
    id: "OffersWidget",
    icon: "lucide-tag",
    title: "PRODUCT.WIDGETS.OFFERS",
    badge: offersCount,
    loading: offersLoading,
    isVisible: computed(() => !!product.value?.id),
    onClick: () => openBlade({ name: "OffersList" }),
    onRefresh: reloadOffers,
  },
  {
    id: "ReviewsWidget",
    icon: "lucide-star",
    title: "PRODUCT.WIDGETS.REVIEWS",
    badge: reviewsCount,
    isVisible: computed(() => !!product.value?.id),
    onClick: () => openBlade({ name: "ReviewsList" }),
  },
]);

async function save() {
  await api.saveProduct(product.value);
  // Refresh all widget counts after saving
  refreshAll();
}
</script>
```

## Prerequisites

- Must be called inside a blade component rendered by `VcBladeSlot` (requires `BladeDescriptorKey` injection).
- `WidgetService` must be provided in the component tree (automatically available in vc-shell apps).
- Calling outside a blade context throws an error with a descriptive message.

## Details

- **Lifecycle management**: Widgets are registered in `onMounted` and unregistered in `onUnmounted`. This ensures the WidgetService always reflects the currently visible blades.
- **Blade ID resolution**: The composable injects `BladeDescriptorKey` to determine which blade the widgets belong to. Each blade has its own isolated widget list.
- **Trigger pattern**: The `onRefresh` callback is stored as a `trigger` on the registered widget. When `refresh(id)` or `refreshAll()` is called, the trigger is invoked. Widgets without `onRefresh` are silently skipped.

## Tips

- Use `refreshAll()` after any blade operation that might change widget badge counts (save, delete, import).
- The `badge` field accepts both numbers and strings. Use a string for non-numeric badges like "New" or "!".
- Keep widget IDs unique within a blade. Duplicate IDs will overwrite previous registrations.
- Combine with `defineBladeContext` to expose blade entity data that widget components (non-headless) can consume via `injectBladeContext`.

## Related

- `defineBladeContext` -- expose blade data to widgets
- `WidgetService` in `@core/services/widget-service`
- `VcBladeSlot` -- the blade wrapper that provides `BladeDescriptorKey`
