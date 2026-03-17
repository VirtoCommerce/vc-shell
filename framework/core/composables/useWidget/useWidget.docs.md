# useWidget

Widget-side composable that auto-discovers widget identity from `WidgetProvider` and provides a `setTrigger()` method to register refresh/badge contracts with the widget service.

## When to Use

- Inside a widget component wrapped by `WidgetProvider` to register badge counts, refresh callbacks, or click handlers
- When building a custom blade widget that needs to communicate its state back to the widget system
- When NOT to use: outside a `WidgetProvider` context (will throw). For managing widgets from the blade side, use `useWidgets()` or `useBladeWidgets()` instead

## Basic Usage

```typescript
import { useWidget } from '@vc-shell/framework';
import { computed } from 'vue';

const { widgetId, setTrigger } = useWidget();

// Register a badge and refresh handler
setTrigger({
  badge: computed(() => unreadCount.value),
  onRefresh: () => fetchData(),
});
```

## API

### Parameters

None. Identity is auto-discovered from the `WidgetProvider` injection context.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `widgetId` | `string` | The widget's unique ID, injected by `WidgetProvider` |
| `setTrigger` | `(trigger: IWidgetTrigger) => void` | Registers a trigger contract (badge, icon, title, callbacks) for this widget |

### IWidgetTrigger

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `string?` | Lucide icon name for dropdown rendering |
| `title` | `string?` | Display title (fallback: `IWidget.title`) |
| `badge` | `Ref<number \| string> \| ComputedRef<number \| string>?` | Reactive badge value |

## Common Patterns

### Widget with live badge count

```vue
<script setup lang="ts">
import { useWidget } from '@vc-shell/framework';
import { ref, computed, onMounted } from 'vue';

const { setTrigger } = useWidget();
const items = ref<unknown[]>([]);

async function fetchItems() {
  items.value = await api.getItems();
}

setTrigger({
  badge: computed(() => items.value.length),
  onRefresh: fetchItems,
});

onMounted(fetchItems);
</script>
```

## Related

- [useWidgets](../useWidgets/useWidgets.docs.md) -- blade-level widget service access
- [useBladeWidgets](../useBladeWidgets/) -- lifecycle-managed widget registration for blades
- `WidgetProvider` -- the component that provides the `WidgetIdKey` injection
