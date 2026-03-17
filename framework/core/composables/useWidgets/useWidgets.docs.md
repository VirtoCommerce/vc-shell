# useWidgets

Provides access to the `IWidgetService` singleton for managing blade widget registrations, activation state, and external widgets. Also exports `provideWidgetService()` for framework-level initialization and `registerWidget()` / `registerExternalWidget()` for global pre-registration.

## When to Use

- When you need low-level access to the widget service (register, unregister, query widgets)
- When building framework infrastructure that manages widget lifecycles
- When NOT to use: for typical blade widget work, prefer `useBladeWidgets()` which handles lifecycle automatically. For widget-side logic, use `useWidget()`.

## Basic Usage

```typescript
import { useWidgets } from '@vc-shell/framework';

const widgetService = useWidgets();
const widgets = widgetService.getWidgets('my-blade-id');
```

## API

### Parameters

None.

### Returns (`IWidgetService`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `registerWidget` | `(widget: IWidget, bladeId: string) => void` | Registers a widget for a specific blade |
| `unregisterWidget` | `(widgetId: string, bladeId: string) => void` | Removes a widget from a blade |
| `getWidgets` | `(bladeId: string) => IWidget[]` | Returns all widgets for a blade |
| `clearBladeWidgets` | `(bladeId: string) => void` | Removes all widgets for a blade |
| `registeredWidgets` | `IWidgetRegistration[]` | All widget registrations across blades |
| `isActiveWidget` | `(id: string) => boolean` | Checks if a widget is currently active |
| `setActiveWidget` | `(args) => void` | Sets a widget as active with its exposed instance |
| `updateActiveWidget` | `() => void` | Triggers the active widget's update function (deprecated) |
| `isWidgetRegistered` | `(id: string) => boolean` | Checks if a widget ID exists globally |
| `updateWidget` | `(args) => void` | Updates properties of a registered widget |
| `resolveWidgetProps` | `(widget, bladeData) => Record<string, unknown>` | Resolves widget props from blade data (deprecated) |
| `getExternalWidgetsForBlade` | `(bladeId: string) => IExternalWidgetRegistration[]` | Gets external widgets targeting a blade |
| `getAllExternalWidgets` | `() => IExternalWidgetRegistration[]` | Gets all registered external widgets |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideWidgetService()` | Creates and provides the widget service via Vue injection (framework use) |
| `registerWidget(widget, bladeId)` | Global pre-registration before service initialization |
| `registerExternalWidget(registration)` | Global pre-registration for external/cross-module widgets |

## Common Patterns

### Pre-registering a widget from a module

```typescript
import { registerWidget } from '@vc-shell/framework';
import { markRaw } from 'vue';
import StatusWidget from './StatusWidget.vue';

registerWidget(
  { id: 'order-status', title: 'Status', component: markRaw(StatusWidget) },
  'order-details',
);
```

## Related

- [useWidget](../useWidget/useWidget.docs.md) -- widget-side composable for trigger contracts
- [useBladeWidgets](../useBladeWidgets/) -- lifecycle-managed widget registration for blades
