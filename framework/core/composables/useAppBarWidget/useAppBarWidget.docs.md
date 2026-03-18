# useAppBarWidget

Provides access to the app bar widget service for registering custom widgets (buttons, icons, dropdowns) in the application's top navigation bar. Uses Vue's provide/inject system.

Also exports `provideAppBarWidget()` for framework-level initialization.

## Overview

The vc-shell application header (app bar) contains a row of widget slots for global actions: notification bell, language picker, user menu, and more. Modules can add their own widgets to this bar -- for example, a "quick create" button, a sync status indicator, or a custom dropdown.

The `useAppBarWidget()` composable provides the `IAppBarWidgetService` interface, which allows registering, unregistering, and listing app bar widgets. Widgets can be simple icon buttons with click handlers or fully custom Vue components.

The service follows the same provide/inject singleton pattern as other framework services. The framework calls `provideAppBarWidget()` during bootstrap; modules consume it via `useAppBarWidget()`.

## When to Use

- To register a custom widget (notification bell, language picker, user avatar) in the app bar
- To list or manage currently registered app bar widgets
- When NOT to use: for blade-level toolbar actions, use `useToolbar()` instead

## Basic Usage

```typescript
import { useAppBarWidget } from '@vc-shell/framework';

const appBarService = useAppBarWidget();

const widgetId = appBarService.register({
  icon: 'bell',
  title: 'Notifications',
  order: 10,
  onClick: () => openNotifications(),
});
```

## API

### Parameters

None.

### Returns (`IAppBarWidgetService`)

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `register` | `(options: registerAppBarWidgetOptions) => string` | Registers a widget in the app bar, returns the assigned ID |
| `unregister` | `(id: string) => void` | Removes a widget from the app bar by ID |
| `items` | `ComputedRef<AppBarWidget[]>` | Reactive list of all registered app bar widgets |

### registerAppBarWidgetOptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Custom ID; auto-generated if omitted |
| `order` | `number` | No | Sort order in the app bar (lower = further left) |
| `title` | `string` | No | Tooltip or label text |
| `icon` | `Component \| string` | No | Lucide icon name or a Vue component |
| `component` | `Component` | No | Custom Vue component to render instead of default icon button |
| `props` | `Record<string, unknown>` | No | Props to pass to the custom component |
| `onClick` | `() => void` | No | Click handler for the default icon button |
| `slot` | `string` | No | Named slot target for placement control |

### Additional Exports

| Export | Description |
|--------|-------------|
| `provideAppBarWidget()` | Creates and provides the service. Flushes pre-registered items on init. |

## Common Patterns

### Simple icon button widget

```typescript
import { useAppBarWidget } from '@vc-shell/framework';

const { register, unregister } = useAppBarWidget();

// Register a simple icon button
const id = register({
  icon: 'lucide-refresh-cw',
  title: 'Sync Data',
  order: 5,
  onClick: () => syncAllData(),
});
```

### Registering a custom component widget

```typescript
import { useAppBarWidget } from '@vc-shell/framework';
import { markRaw, onUnmounted } from 'vue';
import LanguagePicker from './LanguagePicker.vue';

const { register, unregister } = useAppBarWidget();

const id = register({
  component: markRaw(LanguagePicker),
  order: 20,
  title: 'Language',
});

onUnmounted(() => unregister(id));
```

### Widget with dynamic props

```typescript
import { useAppBarWidget } from '@vc-shell/framework';
import { markRaw } from 'vue';
import SyncStatusIndicator from './SyncStatusIndicator.vue';

const { register } = useAppBarWidget();

register({
  component: markRaw(SyncStatusIndicator),
  props: {
    status: syncStatus,         // Can be reactive
    lastSyncTime: lastSyncAt,   // Will be passed as props to the component
  },
  order: 1,
});
```

### Listing all registered widgets

```typescript
import { useAppBarWidget } from '@vc-shell/framework';

const { items } = useAppBarWidget();

// Iterate over all widgets (sorted by order)
watchEffect(() => {
  console.log(`${items.value.length} widgets in app bar`);
  items.value.forEach(w => console.log(`  - ${w.title ?? w.id}`));
});
```

### Pre-registration before service exists

If your module code runs before the app bar service is provided (e.g., during module `install()`), use the `addAppBarWidget()` bus function. Items are automatically flushed when `provideAppBarWidget()` runs:

```typescript
import { addAppBarWidget } from "@vc-shell/framework";

// Safe to call before provideAppBarWidget()
addAppBarWidget({
  id: "my-widget",
  icon: "lucide-star",
  order: 15,
  onClick: () => doSomething(),
});
```

## Tip: Always Clean Up in onUnmounted

Widgets are not automatically removed when a component unmounts. If your module dynamically registers widgets during component setup, always unregister them in `onUnmounted` to avoid orphaned widgets:

```typescript
const { register, unregister } = useAppBarWidget();

const id = register({ icon: 'lucide-bell', onClick: handleClick });

onUnmounted(() => {
  unregister(id);
});
```

## Common Mistake

Forgetting to use `markRaw()` when passing component references causes Vue to make the component object deeply reactive, which triggers warnings and degrades performance:

```typescript
// Bad: triggers Vue reactivity warning
register({ component: MyWidget });

// Good: prevents unnecessary deep reactivity
register({ component: markRaw(MyWidget) });
```

## Related

- [useToolbar](../useToolbar/) -- blade-level toolbar actions (different scope than app bar)
- [useWidgets](../useWidgets/useWidgets.docs.md) -- blade widget registration system
- `framework/injection-keys.ts` -- `AppBarWidgetServiceKey`
- `framework/core/services/app-bar-menu-service.ts` -- the underlying service implementation
