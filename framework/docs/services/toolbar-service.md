# Toolbar Service Documentation

The Toolbar Service is a core part of the VC-Shell framework that provides a centralized way to manage toolbar buttons in blade components. It allows for dynamic registration, positioning, and management of toolbar items.

## Overview

The Toolbar Service manages the lifecycle of toolbar items throughout the application, enabling dynamic registration, updates, and removal of buttons from specific blades. It provides a reactive registry that keeps track of all toolbar items and their current state, with support for priority-based positioning.

## File Path
`/framework/core/services/toolbar-service.ts`

## Core Interfaces

### IToolbarItem

```typescript
export interface IToolbarItem extends IBladeToolbar {
  id: string;
  bladeId?: string;
  priority?: number;
}
```

### IToolbarRegistration

```typescript
export interface IToolbarRegistration {
  bladeId: string;
  toolbarItem: IToolbarItem;
}
```

### IToolbarService

```typescript
export interface IToolbarService {
  registerToolbarItem: (toolbarItem: IToolbarItem, bladeId: string) => void;
  unregisterToolbarItem: (toolbarItemId: string, bladeId: string) => void;
  getToolbarItems: (bladeId: string) => IToolbarItem[];
  clearBladeToolbarItems: (bladeId: string) => void;
  registeredToolbarItems: IToolbarRegistration[];
  isToolbarItemRegistered: (id: string) => boolean;
  updateToolbarItem: ({
    id,
    bladeId,
    toolbarItem,
  }: {
    id: string;
    bladeId: string;
    toolbarItem: Partial<IToolbarItem>;
  }) => void;
}
```

## Primary Features

### Toolbar Item Registration

The service allows registering toolbar items either before the service is initialized (pre-registration) or afterward. Each toolbar item is associated with a specific blade ID for organization and retrieval.

```typescript
// Register a toolbar item for a specific blade
toolbarService.registerToolbarItem({
  id: 'my-button',
  title: 'My Button',
  icon: 'material-save',
  clickHandler: () => {
    // Action to perform when clicked
    console.log('Button clicked');
  }
}, 'blade-id');
```

### Priority-Based Positioning

Toolbar items can be positioned relative to each other using the priority property. Items with higher priority values are displayed first.

```typescript
// Register a high-priority toolbar item
toolbarService.registerToolbarItem({
  id: 'high-priority-button',
  title: 'Important Action',
  icon: 'material-warning',
  priority: 100,
  clickHandler: () => {
    // Important action
  }
}, 'blade-id');

// Register a low-priority toolbar item
toolbarService.registerToolbarItem({
  id: 'low-priority-button',
  title: 'Less Important Action',
  icon: 'material-info',
  priority: -10,
  clickHandler: () => {
    // Less important action
  }
}, 'blade-id');
```

### Toolbar Item Lifecycle Management

The service provides methods to update toolbar items, check if they're registered, and remove them when they're no longer needed.

```typescript
// Update an existing toolbar item
toolbarService.updateToolbarItem({
  id: 'my-button',
  bladeId: 'blade-id',
  toolbarItem: { 
    title: 'Updated Button Text',
    disabled: true
  }
});

// Check if a toolbar item is registered
const isRegistered = toolbarService.isToolbarItemRegistered('my-button');

// Unregister a toolbar item
toolbarService.unregisterToolbarItem('my-button', 'blade-id');
```

### Conditional Visibility and State

Toolbar items can be conditionally displayed or enabled based on permissions or other application state. The `isVisible` property now supports a function that receives the current blade instance as a parameter, allowing for visibility decisions based on blade context.

```typescript
// Register a toolbar item with conditional visibility based on blade state
toolbarService.registerToolbarItem({
  id: 'edit-button',
  title: 'Edit',
  icon: 'material-edit',
  isVisible: (blade) => blade?.options?.mode === 'view' && userHasPermission('can-edit'),
  disabled: computed(() => !isFormValid.value),
  clickHandler: () => {
    // Action to perform when clicked
  }
}, 'blade-id');
```

## Usage in a Component

The Toolbar Service is typically accessed through the `useToolbar` composable. Here's how to use it in your components:

```typescript
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useToolbar } from '../../../core/composables';

// Get the toolbar service
const toolbar = useToolbar();

// Register toolbar items
toolbar.registerToolbarItem({
  id: 'save-button',
  title: 'Save',
  icon: 'material-save',
  priority: 100,
  isVisible: (blade) => blade?.options?.mode === 'edit',
  clickHandler: () => {
    saveData();
  }
});

toolbar.registerToolbarItem({
  id: 'cancel-button',
  title: 'Cancel',
  icon: 'material-cancel',
  priority: 90,
  isVisible: (blade) => blade?.options?.mode === 'edit',
  clickHandler: () => {
    cancelEditing();
  }
});

// The useToolbar composable automatically handles cleanup on component unmount,
// but you can also manually clear items if needed
onBeforeUnmount(() => {
  // Optional: manual cleanup can be performed here if needed
});

function saveData() {
  // Save logic
  
  // You can update toolbar items dynamically
  toolbar.updateToolbarItem('save-button', {
    disabled: true
  });
}

function cancelEditing() {
  // Cancel logic
}
</script>
```

## Integration with Blade Components

In the VC-Shell framework, the VcBladeToolbar component automatically checks if the `isVisible` property is a function and passes the blade instance to it:

```typescript
// From framework/ui/components/organisms/vc-blade/_internal/vc-blade-toolbar/vc-blade-toolbar.vue
const visibleItems = computed(() => {
  return getToolbarItems()
    .filter(
      (item) =>
        hasAccess(item.permissions) &&
        (typeof item.isVisible === "function"
          ? item.isVisible(blade.value)
          : item.isVisible === undefined || item.isVisible) &&
        (isMobile.value ? !item.disabled : true),
    )
    .sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityB - priorityA;
    });
});
```

## Best Practices

1. **Item Identification**: Always use unique, descriptive IDs for toolbar items to avoid conflicts.
   
2. **Priority Management**: Use priority strategically - positive values for primary actions, zero for standard actions, negative for less important actions.
   
3. **Cleanup**: The useToolbar composable automatically cleans up items when a component unmounts, but you can also manage this manually if needed.
   
4. **Dynamic State**: Leverage the ability to update toolbar items to reflect the current application state.
   
5. **Permissions**: Use the permissions property to control access to actions.

6. **Grouping**: Consider creating logical groups of buttons with similar priorities for better organization.

7. **Blade Context**: Utilize the blade context in `isVisible` functions to control visibility based on the blade's mode, options, or other properties:

```typescript
// Example of using blade context to control button visibility
toolbar.registerToolbarItem({
  id: 'delete-button',
  title: 'Delete',
  icon: 'material-delete',
  isVisible: (blade) => {
    // Only show delete button if item is not new and user has delete permission
    return !blade?.options?.isNew && userHasPermission('can-delete');
  },
  clickHandler: deleteItem
}, 'blade-id');
```

## Related Composables

- `useToolbar`: Provides access to the Toolbar Service within Vue components.
- `provideToolbarService`: Creates and provides the Toolbar Service to the component tree.
- `registerToolbarItem`: Utility function to pre-register toolbar items before service initialization. 
