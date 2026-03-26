# useBladeWidgets / useWidgetTrigger

Two composables for the widget system — one for the **blade side**, one for the **widget side**.

| Composable | Called from | Purpose |
|---|---|---|
| `useBladeWidgets` | Blade component | Register headless widgets + get `refresh()` / `refreshAll()` |
| `useWidgetTrigger` | External widget component | Register trigger callbacks (`onRefresh`, `onClick`) via provide/inject |

Headless widgets are defined as plain configuration objects with reactive refs for dynamic values like badge counts and loading states. External component-based widgets use `useWidgetTrigger` to register their refresh callbacks so the hosting blade can trigger them.

## When to Use

- **`useBladeWidgets`**: Register sidebar widgets (counters, action buttons) for a blade without creating Vue components. Refresh widget data after blade operations (save, delete).
- **`useWidgetTrigger`**: Inside an external widget component (registered via `registerExternalWidget`) to register `onRefresh` / `onClick` callbacks. The blade can then call `refresh(widgetId)` or `refreshAll()` to trigger them.
- When NOT to use `useBladeWidgets`: for widgets that need their own template or complex UI (use `registerExternalWidget` + `useWidgetTrigger` instead).

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

## useWidgetTrigger

Widget-side composable for external component-based widgets. Registers a trigger contract (`onRefresh`, `onClick`, `badge`) via provide/inject — no props, IDs, or service knowledge required.

### Basic Usage

```typescript
import { useWidgetTrigger } from '@vc-shell/framework';

// Inside an external widget component:
useWidgetTrigger({ onRefresh: loadData });
```

### IWidgetTrigger

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | `string` | No | Lucide icon name for dropdown rendering |
| `title` | `string` | No | Display title (fallback: widget's title) |
| `badge` | `Ref<number \| string>` | No | Reactive badge value |
| `onClick` | `() => void` | No | Handler called when widget is clicked in dropdown |
| `onRefresh` | `() => void \| Promise<void>` | No | Handler called to refresh widget data |
| `disabled` | `Ref<boolean> \| boolean` | No | Disabled state |

### How It Works

1. `WidgetContainer` wraps each component-based widget in a `WidgetScope` provider
2. `WidgetScope` provides a `setTrigger` function scoped to the specific widget ID and blade ID
3. `useWidgetTrigger` injects this scope and calls `setTrigger` — no props or IDs needed
4. When the blade calls `refresh(widgetId)` or `refreshAll()`, the registered `onRefresh` is invoked

## Recipe: External Widget with Refresh

A complete example of an external widget that shows an unread message count and supports refresh from the blade:

**1. Register the external widget (module index.ts):**

```typescript
import { createAppModule, registerExternalWidget, BladeDescriptor } from "@vc-shell/framework";
import { markRaw } from "vue";
import { MessageWidget } from "./components/widgets";

registerExternalWidget({
  id: "MessageWidget",
  component: markRaw(MessageWidget),
  targetBlades: ["ProductDetails", "OrderDetails"],
  isVisible: (blade?: BladeDescriptor) => !!blade?.param,
});
```

**2. Widget component (message-widget.vue):**

```vue
<template>
  <VcWidget
    v-loading:500="loading"
    :title="$t('MESSENGER.WIDGET.TITLE')"
    icon="lucide-message-circle"
    :value="messageCount"
    @click="openMessageBlade"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  loading as vLoading,
  useBlade,
  injectBladeContext,
  useWidgetTrigger,
  VcWidget,
} from "@vc-shell/framework";

const ctx = injectBladeContext();
const entityId = computed(() => (ctx.value.item as { id?: string })?.id ?? "");

const messageCount = ref(0);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    messageCount.value = await api.getUnreadCount(entityId.value);
  } finally {
    loading.value = false;
  }
};

// Register refresh callback — blade can call refreshAll() after save
useWidgetTrigger({ onRefresh: loadData });

onMounted(() => {
  if (entityId.value) loadData();
});
</script>
```

**3. Blade refreshes widgets after save:**

```vue
<script setup lang="ts">
import { useBladeWidgets } from "@vc-shell/framework";

// Empty array — blade doesn't register headless widgets,
// but gets refresh/refreshAll for external widgets
const { refresh, refreshAll } = useBladeWidgets([]);

async function save() {
  await api.saveProduct(product.value);
  refreshAll();           // refresh all widgets (including MessageWidget)
  // or: refresh("MessageWidget");  // refresh a specific widget by ID
}
</script>
```

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

**`useBladeWidgets`**:
- Must be called inside a blade component rendered by `VcBladeSlot` (requires `BladeDescriptorKey` injection).
- `WidgetService` must be provided in the component tree (automatically available in vc-shell apps).
- Calling outside a blade context throws an error with a descriptive message.

**`useWidgetTrigger`**:
- Must be called inside a widget component rendered by `WidgetContainer` (requires `WidgetScopeKey` injection).
- If called outside a widget scope, logs a warning and does nothing (does not throw).

## Details

- **Lifecycle management**: Widgets are registered in `onMounted` and unregistered in `onUnmounted`. This ensures the WidgetService always reflects the currently visible blades.
- **Blade ID resolution**: The composable injects `BladeDescriptorKey` to determine which blade the widgets belong to. Each blade has its own isolated widget list.
- **Trigger pattern**: The `onRefresh` callback is stored as a `trigger` on the registered widget. When `refresh(id)` or `refreshAll()` is called, the trigger is invoked. Widgets without `onRefresh` are silently skipped.

## Tips

- Use `refreshAll()` after any blade operation that might change widget badge counts (save, delete, import).
- The `badge` field accepts both numbers and strings. Use a string for non-numeric badges like "New" or "!".
- Keep widget IDs unique within a blade. Duplicate IDs will overwrite previous registrations.
- Combine with `defineBladeContext` to expose blade entity data that widget components (non-headless) can consume via `injectBladeContext`.

## Common Mistakes

### Calling useWidgetTrigger outside WidgetContainer scope

```typescript
// Wrong — called in a standalone component, not rendered inside a blade widget slot
export default defineComponent({
  setup() {
    useWidgetTrigger({ onRefresh: loadData }); // ⚠️ Logs warning, trigger not registered
  },
});
```

```typescript
// Correct — called inside a widget component registered via registerExternalWidget
// and rendered by WidgetContainer within a blade
useWidgetTrigger({ onRefresh: loadData }); // ✓ WidgetScope provides context
```

### Forgetting to pass empty array to useBladeWidgets for refresh-only usage

```typescript
// Wrong — useBladeWidgets requires an array argument
const { refreshAll } = useBladeWidgets(); // TS error

// Correct — pass empty array when you only need refresh/refreshAll
const { refreshAll } = useBladeWidgets([]);
```

## Related

- `defineBladeContext` / `injectBladeContext` -- expose/consume blade data in external widgets
- `registerExternalWidget` -- register a component-based widget globally for target blades
- `WidgetService` in `@core/services/widget-service` -- underlying service
- `WidgetScope` in `vc-blade/_internal/widgets/WidgetScope.vue` -- provides `WidgetScopeKey` to widget components
- `VcBladeSlot` -- the blade wrapper that provides `BladeDescriptorKey`
