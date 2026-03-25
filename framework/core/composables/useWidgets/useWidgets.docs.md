# useWidgets

Provides access to the `IWidgetService` singleton for managing blade widget registrations, activation state, and external widgets. This is the low-level composable for direct widget service interaction. It exposes the full widget lifecycle API: registering widgets to specific blades, querying registered widgets, tracking active widget state, and managing external (cross-module) widget registrations.

Also exports `provideWidgetService()` for framework-level initialization and `registerWidget()` / `registerExternalWidget()` for global pre-registration before the service is created.

## When to Use

- When you need low-level access to the widget service (register, unregister, query widgets)
- When building framework infrastructure that manages widget lifecycles
- When pre-registering widgets from a module's `install()` function before the component tree exists
- When NOT to use: for typical blade widget work, prefer `useBladeWidgets()` which handles lifecycle automatically. For widget-side logic (badge, refresh), use headless widgets.

## Quick Start

```typescript
import { useWidgets } from '@vc-shell/framework';

const widgetService = useWidgets();

// Query all widgets registered for a specific blade
const widgets = widgetService.getWidgets('order-details');

// Check if a widget is currently active (visible and expanded)
if (widgetService.isActiveWidget('order-status-widget')) {
  // widget is currently in focus
}
```

## API

### Parameters

None.

### Returns (`IWidgetService`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `registerWidget` | `(widget: IWidget, bladeId: string) => void` | Registers a widget for a specific blade. The widget will appear in that blade's widget area. |
| `unregisterWidget` | `(widgetId: string, bladeId: string) => void` | Removes a widget from a blade by ID. |
| `getWidgets` | `(bladeId: string) => IWidget[]` | Returns all widgets registered for a specific blade. |
| `clearBladeWidgets` | `(bladeId: string) => void` | Removes all widgets for a blade (used during blade teardown). |
| `registeredWidgets` | `IWidgetRegistration[]` | All widget registrations across all blades. |
| `isActiveWidget` | `(id: string) => boolean` | Checks if a widget is currently active (selected/expanded). |
| `setActiveWidget` | `(args) => void` | Sets a widget as active with its exposed instance. |
| `updateActiveWidget` | `() => void` | Triggers the active widget's update function. Deprecated -- use headless widgets instead. |
| `isWidgetRegistered` | `(id: string) => boolean` | Checks if a widget ID exists in any blade's registry. |
| `updateWidget` | `(args) => void` | Updates properties of a registered widget (trigger, badge, etc.). |
| `resolveWidgetProps` | `(widget, bladeData) => Record<string, unknown>` | Resolves widget props from blade data. Deprecated. |
| `getExternalWidgetsForBlade` | `(bladeId: string) => IExternalWidgetRegistration[]` | Gets external widgets that target a specific blade (registered by other modules). |
| `getAllExternalWidgets` | `() => IExternalWidgetRegistration[]` | Gets all registered external widgets across all modules. |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideWidgetService()` | Creates and provides the widget service via Vue injection. Idempotent -- returns existing service if already provided. Cleans up via `onScopeDispose`. |
| `registerWidget(widget, bladeId)` | Global pre-registration. Widgets registered this way are picked up when `provideWidgetService()` creates the service. Use in module `install()`. |
| `registerExternalWidget(registration)` | Global pre-registration for cross-module widgets. These widgets are rendered in blades owned by other modules. |

## How It Works

The widget system has three layers:

1. **Pre-registration** (`registerWidget`, `registerExternalWidget`): Module `install()` functions call these global functions before the component tree exists. Registrations are stored in a module-level queue.

2. **Service creation** (`provideWidgetService()`): Called once in VcApp. Creates the service, drains the pre-registration queue, and provides the service via Vue injection.

3. **Runtime access** (`useWidgets()`): Components inject the service and use it to query or modify widget state.

The service tracks active widgets (which widget is currently expanded/focused) separately from registrations, enabling the widget panel to highlight the active widget and call its update function.

## Recipe: Pre-Registering a Widget from a Module

```typescript
// my-module/index.ts
import { registerWidget } from '@vc-shell/framework';
import { markRaw } from 'vue';
import OrderStatusWidget from './widgets/OrderStatusWidget.vue';

export default {
  install() {
    registerWidget(
      {
        id: 'order-status',
        title: 'Order Status',
        component: markRaw(OrderStatusWidget),
        icon: 'fas fa-clipboard-check',
      },
      'order-details', // blade ID where this widget appears
    );
  },
};
```

## Recipe: Cross-Module Widget Extension

A shipping module can add a widget to the order module's detail blade:

```typescript
// shipping-module/index.ts
import { registerExternalWidget } from '@vc-shell/framework';
import { markRaw } from 'vue';
import ShippingTracker from './widgets/ShippingTracker.vue';

export default {
  install() {
    registerExternalWidget({
      widgetId: 'shipping-tracker',
      bladeId: 'order-details', // target blade from another module
      component: markRaw(ShippingTracker),
      title: 'Shipping',
      icon: 'fas fa-truck',
    });
  },
};
```

## Recipe: Listing All Widgets for a Blade

```vue
<script setup lang="ts">
import { useWidgets } from '@vc-shell/framework';
import { computed } from 'vue';

const props = defineProps<{ bladeId: string }>();
const widgetService = useWidgets();

const bladeWidgets = computed(() => widgetService.getWidgets(props.bladeId));
const externalWidgets = computed(() =>
  widgetService.getExternalWidgetsForBlade(props.bladeId),
);

const allWidgets = computed(() => [
  ...bladeWidgets.value,
  ...externalWidgets.value,
]);
</script>
```

## Tips

- **Use `markRaw` for widget components.** Widget components stored in the registry should be wrapped with `markRaw()` to prevent Vue from making them reactive, which causes warnings and unnecessary overhead.
- **Prefer `useBladeWidgets()` for typical blade work.** It handles registration/unregistration tied to the blade lifecycle automatically. Only use `useWidgets()` when you need direct access to the global service.
- **`provideWidgetService()` is idempotent.** Calling it multiple times in the same component tree returns the same service instance. This is safe for nested module structures.
- **Widget IDs must be globally unique.** Since widgets can be registered from multiple modules targeting the same blade, use descriptive, namespaced IDs like `'shipping-tracker'` rather than generic names like `'status'`.

## Related

- [useWidget](../useWidget/useWidget.docs.md) -- widget-side composable for registering trigger contracts (badge, refresh)
- [useBladeWidgets](../useBladeWidgets/) -- lifecycle-managed widget registration for blades (preferred API)
- `framework/core/services/widget-service.ts` -- underlying service implementation
