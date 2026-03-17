# useAppBarWidget

Provides access to the app bar widget service for registering custom widgets (buttons, icons, dropdowns) in the application's top navigation bar. Uses Vue's provide/inject system.

Also exports `provideAppBarWidget()` for framework-level initialization.

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
| `order` | `number` | No | Sort order in the app bar |
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

## Related

- [useToolbar](../useToolbar/) -- blade-level toolbar actions
- [useWidgets](../useWidgets/useWidgets.docs.md) -- blade widget registration system
