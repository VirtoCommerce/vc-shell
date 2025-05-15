# Widget Service Documentation

The Widget Service is a core part of the VC-Shell framework that provides a centralized way to manage UI components (widgets) that can be dynamically registered to blades in the application.

## Overview

The Widget Service manages the lifecycle of widgets throughout the application, allowing for dynamic registration, updates, and removal of widgets from specific blades. It provides a reactive registry that keeps track of all widgets and their current state.

## File Path
`/framework/core/services/widget-service.ts`

## Core Interfaces

### IWidget

```typescript
export interface IWidget {
  id: string;
  title?: string;
  component: Component;
  props?: Record<string, unknown>;
  events?: Record<string, unknown>;
  isVisible?: boolean | ComputedRef<boolean> | Ref<boolean> | ((blade?: IBladeInstance) => boolean);
  onOpen?: (blade: { id: string }) => void;
  onClose?: (blade: { id: string }) => void;
}
```

### IWidgetService

```typescript
export interface IWidgetService {
  registerWidget: (widget: IWidget, bladeId: string) => void;
  unregisterWidget: (widgetId: string, bladeId: string) => void;
  getWidgets: (bladeId: string) => IWidget[];
  clearBladeWidgets: (bladeId: string) => void;
  registeredWidgets: IWidgetRegistration[];
  isActiveWidget: (id: string) => boolean;
  setActiveWidget: (ref: ComponentInternalInstance["exposed"]) => void;
  updateActiveWidget: () => void;
  isWidgetRegistered: (id: string) => boolean;
  updateWidget: ({ id, bladeId, widget }: { id: string; bladeId: string; widget: Partial<IWidget> }) => void;
}
```

## Primary Features

### Widget Registration

The service allows registering widgets either before the service is initialized (pre-registration) or afterward. Each widget is associated with a specific blade ID for organization and retrieval.

```typescript
// Register a widget for a specific blade
widgetService.registerWidget({
  id: 'my-widget',
  component: MyWidgetComponent,
  title: 'My Widget'
}, 'blade-id');
```

### Widget Visibility Control

Widgets can be conditionally displayed based on a visibility setting, which can be a boolean, a computed reference, a reactive reference, or a function. The function now receives the current blade instance as a parameter, allowing for visibility decisions based on blade context.

```typescript
// Register a widget with conditional visibility using blade context
widgetService.registerWidget({
  id: 'conditional-widget',
  component: ConditionalWidgetComponent,
  isVisible: (blade) => blade?.options?.mode === 'edit' && userHasPermission('view-widget')
}, 'blade-id');
```

### Widget Lifecycle Management

The service provides methods to update widgets, check if they're registered, and remove them when they're no longer needed.

```typescript
// Update an existing widget
widgetService.updateWidget({
  id: 'my-widget',
  bladeId: 'blade-id',
  widget: { title: 'Updated Widget Title' }
});

// Check if a widget is registered
const isRegistered = widgetService.isWidgetRegistered('my-widget');

// Unregister a widget
widgetService.unregisterWidget('my-widget', 'blade-id');
```

### Active Widget Tracking

The service keeps track of which widget is currently active and provides methods to check and set the active widget.

```typescript
// Set a widget as active
widgetService.setActiveWidget(widgetRef);

// Check if a widget is active
const isActive = widgetService.isActiveWidget('my-widget');
```

## Usage in a Component

The Widget Service is typically accessed through the `useWidgets` composable. Here's a real-world example from the `vc-blade-widget-container` component:

```typescript
<script setup lang="ts">
import { computed, toValue, inject } from "vue";
import { useWidgets } from "../../../../../../core/composables/useWidgets";
import { BladeInstance } from "../../../../../../injection-keys";
import { IBladeInstance } from "../../../../../../shared/components/blade-navigation/types";

interface Props {
  bladeId: string;
}

const props = defineProps<Props>();
const widgetService = useWidgets();
const widgets = computed(() => widgetService.getWidgets(props.bladeId));
const bladeInstance = inject<IBladeInstance>(BladeInstance);

// Filter widgets by visibility
const visibleWidgets = computed(() =>
  widgets.value.filter((widget) => {
    if (typeof widget.isVisible === "function") {
      return widget.isVisible(bladeInstance);
    } else if (typeof widget.isVisible === "boolean") {
      return widget.isVisible;
    }
    return toValue(widget.isVisible);
  }),
);
</script>
```

## Best Practices

1. **Widget Identification**: Always use unique, descriptive IDs for widgets to avoid conflicts.
   
2. **Component Optimization**: Use `markRaw` for widget components to prevent unnecessary reactivity.
   
3. **Cleanup**: Always unregister widgets when they are no longer needed to prevent memory leaks.
   
4. **Pre-registration**: Use pre-registration for widgets that need to be available immediately when the application starts.
   
5. **Widget Visibility**: Use the blade context in visibility functions to make decisions based on the current blade state:

```typescript
// Example of using blade context to determine widget visibility
widgetService.registerWidget({
  id: 'edit-widget',
  component: EditWidget,
  isVisible: (blade) => {
    // Only show in edit mode and when user has specific permissions
    return blade?.options?.mode === 'edit' && userHasPermission('can-edit-content');
  }
}, bladeId);
```

## Related Composables

- `useWidgets`: Provides access to the Widget Service within Vue components.
- `provideWidgetService`: Creates and provides the Widget Service to the component tree.
- `registerWidget`: Utility function to pre-register widgets before service initialization. 
