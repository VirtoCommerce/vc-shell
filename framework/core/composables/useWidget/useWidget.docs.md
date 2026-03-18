# useWidget

Widget-side composable that auto-discovers widget identity from `WidgetProvider` and provides a `setTrigger()` method to register refresh/badge contracts with the widget service. This composable is the counterpart to the blade-side `useWidgets()` / `useBladeWidgets()` -- while those manage widget registration from the blade's perspective, `useWidget()` is called from inside the widget component itself to communicate its state (badge count, icon, refresh callback) back to the widget system.

**Deprecated**: Prefer headless widgets via `useBladeWidgets()` instead. This composable is only needed for legacy SFC widgets that register trigger contracts manually.

## When to Use

- Inside a widget component wrapped by `WidgetProvider` to register badge counts, refresh callbacks, or click handlers
- When building a custom blade widget that needs to communicate its state back to the parent blade's widget panel
- When NOT to use: outside a `WidgetProvider` context (will throw). For managing widgets from the blade side, use `useWidgets()` or `useBladeWidgets()` instead. For new widgets, prefer the headless widget pattern.

## Quick Start

```vue
<script setup lang="ts">
import { useWidget } from '@vc-shell/framework';
import { ref, computed, onMounted } from 'vue';

const { widgetId, setTrigger } = useWidget();

const items = ref<unknown[]>([]);
const unreadCount = computed(() => items.value.filter((i) => !i.isRead).length);

async function fetchData() {
  items.value = await api.getWidgetItems();
}

// Register the trigger contract: badge + refresh callback
setTrigger({
  badge: unreadCount,
  icon: 'fas fa-inbox',
  title: 'Messages',
});

onMounted(fetchData);
</script>

<template>
  <div class="tw-p-4">
    <p class="tw-text-sm tw-text-gray-500">Widget ID: {{ widgetId }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.title }}</li>
    </ul>
  </div>
</template>
```

## API

### Parameters

None. Identity is auto-discovered from the `WidgetProvider` injection context. The composable injects `WidgetIdKey` for the widget ID, `WidgetServiceKey` for the service, and `BladeDescriptorKey` for the parent blade context.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `widgetId` | `string` | The widget's unique ID, injected by `WidgetProvider`. |
| `setTrigger` | `(trigger: IWidgetTrigger) => void` | Registers a trigger contract (badge, icon, title, callbacks) for this widget. Can be called multiple times to update the trigger. |

### IWidgetTrigger

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `string?` | Lucide or FontAwesome icon name for the widget's display in the dropdown/panel. |
| `title` | `string?` | Display title for the widget. Falls back to `IWidget.title` if not set. |
| `badge` | `Ref<number \| string> \| ComputedRef<number \| string>?` | Reactive badge value displayed on the widget button/tab. Pass a computed ref for automatic updates. |

## How It Works

1. **Identity discovery**: On creation, the composable injects `WidgetIdKey` (provided by `WidgetProvider`) and `WidgetServiceKey` (provided by `provideWidgetService()`). It also injects `BladeDescriptorKey` to know which blade this widget belongs to.

2. **Trigger registration**: When you call `setTrigger(trigger)`, the composable calls `widgetService.updateWidget({ id: widgetId, bladeId, widget: { trigger } })`. This stores the trigger contract in the widget service, where the blade's widget panel can read it.

3. **Reactive badges**: Because `badge` accepts a `Ref` or `ComputedRef`, the widget panel automatically updates whenever the badge value changes. There is no need to call `setTrigger` again after the initial registration.

## Recipe: Widget with Live Badge Count

```vue
<script setup lang="ts">
import { useWidget } from '@vc-shell/framework';
import { ref, computed, onMounted } from 'vue';

const { setTrigger } = useWidget();
const pendingOrders = ref<Order[]>([]);

async function loadPendingOrders() {
  pendingOrders.value = await orderApi.getPending();
}

// Badge shows the count of pending orders
setTrigger({
  badge: computed(() => pendingOrders.value.length),
  icon: 'fas fa-clock',
  title: 'Pending Orders',
});

onMounted(loadPendingOrders);

// Optionally refresh periodically
const interval = setInterval(loadPendingOrders, 30_000);
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="tw-space-y-2">
    <div v-for="order in pendingOrders" :key="order.id" class="tw-p-2 tw-border tw-rounded">
      <p class="tw-font-medium">{{ order.number }}</p>
      <p class="tw-text-sm tw-text-gray-500">{{ order.status }}</p>
    </div>
    <p v-if="!pendingOrders.length" class="tw-text-gray-400">No pending orders</p>
  </div>
</template>
```

## Recipe: Widget That Updates on Blade Data Change

```vue
<script setup lang="ts">
import { useWidget } from '@vc-shell/framework';
import { inject, watch, ref, computed } from 'vue';

const { setTrigger } = useWidget();

// Inject blade data from parent
const bladeData = inject('bladeData') as Ref<{ orderId: string }>;
const comments = ref<Comment[]>([]);

async function loadComments(orderId: string) {
  comments.value = await commentApi.getByOrder(orderId);
}

// Reload when blade data changes
watch(() => bladeData.value.orderId, (id) => {
  if (id) loadComments(id);
}, { immediate: true });

setTrigger({
  badge: computed(() => comments.value.length),
  icon: 'fas fa-comments',
  title: 'Comments',
});
</script>
```

## Tips

- **Must be inside `WidgetProvider`.** This composable relies on `WidgetIdKey` being injected by `WidgetProvider`. If called outside that context, it throws an `InjectionError`. The `WidgetProvider` component is automatically rendered by the blade widget system.
- **`setTrigger` can be called multiple times.** Each call replaces the previous trigger contract. However, since `badge` is reactive, you typically only need to call `setTrigger` once during setup.
- **Badge accepts both numbers and strings.** You can use `computed(() => 3)` for a numeric badge or `computed(() => '!')` for a text indicator.
- **Prefer headless widgets for new code.** The `useBladeWidgets()` composable supports a headless pattern where widgets are defined declaratively without a separate SFC. This is simpler and avoids the WidgetProvider ceremony.

## Related

- [useWidgets](../useWidgets/useWidgets.docs.md) -- blade-level widget service access
- [useBladeWidgets](../useBladeWidgets/) -- lifecycle-managed widget registration for blades (preferred API for new code)
- `WidgetProvider` -- the component that provides the `WidgetIdKey` injection
- `framework/injection-keys.ts` -- defines `WidgetIdKey` and `WidgetServiceKey`
