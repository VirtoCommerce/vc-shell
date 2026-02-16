# App Bar Menu Service Documentation

The App Bar Menu Service is a core component of the VC-Shell framework that manages the menu items displayed in the application bar. It provides functionality for registering, organizing, and retrieving app bar widgets and menu items.

## Overview

The App Bar Menu Service facilitates the consistent organization and display of interactive elements in the application's top bar. It allows components to register widgets that appear in the app bar, providing a centralized management system for these UI elements.

## File Path
`/framework/core/services/app-bar-menu-service.ts`

## Core Interfaces

Based on usage patterns in the examples, the core interfaces likely include:

```typescript
export interface AppBarWidget {
  id: string;
  icon?: Component | string;
  component?: Component;
  props?: Record<string, unknown>;
  badge?: boolean | (() => boolean);
  onClick?: () => void;
  permissions?: string[];
}

export interface IAppBarWidgetService {
  items: Ref<AppBarWidget[]>;
  registerWidget: (widget: AppBarWidget) => void;
  unregisterWidget: (widgetId: string) => void;
}
```

## Primary Features

### Widget Registration

The service allows registering widgets that will appear in the application bar, with support for icons, components, and badge indicators.

```typescript
// Register an app bar widget
appBarWidgetService.registerWidget({
  id: 'notifications',
  icon: BellIcon,
  component: NotificationsPanel,
  badge: () => hasUnreadNotifications.value
});
```

### Widget Badge Support

Widgets can display badge indicators, which are useful for showing notifications or alerts.

```typescript
// Widget with badge indicator
appBarWidgetService.registerWidget({
  id: 'messages',
  icon: MessageIcon,
  component: MessagesPanel,
  badge: computed(() => unreadMessages.value > 0)
});
```

### Widget Click Handlers

Widgets can specify click handlers for simpler interactions that don't require a full component.

```typescript
// Widget with click handler
appBarWidgetService.registerWidget({
  id: 'help',
  icon: QuestionIcon,
  onClick: () => openHelpDialog()
});
```

## Usage in Components

The App Bar Widget Service is accessed through the `useAppBarWidget` composable. Here's a real-world example from the `AppBarWidgetsMenu` component:

```typescript
// From framework/ui/components/organisms/vc-app/_internal/app-bar/components/AppBarWidgetsMenu.vue
<script lang="ts" setup>
import AppBarWidgetItem from "./AppBarWidgetItem.vue";
import { VcIcon } from "../../../../..";
import { useAppBarWidget } from "../../../../../../../core/composables";
import type { AppBarWidget } from "../../../../../../../core/services/app-bar-menu-service";

const { items } = useAppBarWidget();

function isBadgeActive(item: AppBarWidget): boolean {
  if (item.badge === undefined) {
    return false;
  }

  if (typeof item.badge === "function") {
    return item.badge();
  }

  return !!item.badge;
}
</script>
```

This implementation demonstrates how the App Bar Widget Service:

1. Provides access to registered widgets via the `items` reactive reference
2. Supports both function-based and boolean badge indicators
3. Integrates with specialized components for widget rendering

## Template Rendering

Widgets are rendered in the template with different behaviors based on their configuration:

```vue
<!-- From framework/ui/components/organisms/vc-app/_internal/app-bar/components/AppBarWidgetsMenu.vue -->
<template>
  <div class="vc-app-toolbar-menu">
    <div
      v-for="item in items"
      :key="item.id"
      class="vc-app-toolbar-menu__item"
    >
      <AppBarWidgetItem
        v-if="item.component"
        :is-opened="isBadgeActive(item)"
        :widget-id="item.id"
        @toggle="item.onClick && item.onClick()"
      >
        <template #trigger="{ isActive }">
          <div class="vc-app-toolbar-menu__button">
            <div
              class="vc-app-toolbar-menu__button-icon"
              :class="{
                'vc-app-toolbar-menu__button-icon--active': isActive,
              }"
            >
              <VcIcon
                v-if="item.icon"
                :icon="item.icon"
                size="l"
              />
              <div
                v-if="isBadgeActive(item)"
                class="vc-app-toolbar-menu__accent"
              ></div>
            </div>
          </div>
        </template>
      </AppBarWidgetItem>

      <AppBarWidgetItem
        v-else-if="item.onClick"
        @toggle="item.onClick"
      >
        <template #trigger="{ isActive }">
          <div
            class="vc-app-toolbar-menu__button-icon"
            :class="{
              'vc-app-toolbar-menu__button-icon--active': isActive,
            }"
          >
            <VcIcon
              v-if="item.icon"
              :icon="item.icon"
              size="l"
            />
            <div
              v-if="isBadgeActive(item)"
              class="vc-app-toolbar-menu__accent"
            ></div>
          </div>
        </template>
      </AppBarWidgetItem>
    </div>
  </div>
</template>
```

The template handles two types of widgets:
1. Widgets with components that can be opened
2. Widgets with only click handlers

## Integration with AppBarWidgetItem

The App Bar Widget Service works closely with the `AppBarWidgetItem` component which provides the interaction logic for each widget:

```vue
<!-- AppBarWidgetItem.vue (simplified) -->
<template>
  <div class="app-bar-widget-item">
    <!-- Trigger element that shows the icon -->
    <div
      class="app-bar-widget-item__trigger"
      @click="togglePanel"
    >
      <slot
        name="trigger"
        :is-active="isActive"
      ></slot>
    </div>
    
    <!-- Panel content that appears when widget is active -->
    <div
      v-if="isActive"
      class="app-bar-widget-item__panel"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpened: Boolean,
  widgetId: String
});

const isActive = ref(false);

function togglePanel() {
  isActive.value = !isActive.value;
  emit('toggle');
}
</script>
```

## Additional Usage with Composables

The App Bar Widget Service is often used alongside other composables for specialized behavior:

```typescript
// From framework/ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarWidgets.ts
export function useAppBarWidgets() {
  const { items } = useAppBarWidget();
  
  // Additional logic for widget visualization
  const visibleItems = computed(() => 
    items.value.filter(item => {
      // Filter by permissions or other conditions
      return hasPermission(item.permissions);
    })
  );
  
  return {
    items: visibleItems
  };
}
```

## Best Practices

1. **Widget Identification**: Always use unique, descriptive IDs for app bar widgets to avoid conflicts.

2. **Icon Consistency**: Use a consistent icon library or component approach throughout your app bar widgets.

3. **Badge Reactivity**: When using function-based badges, ensure they are reactive to data changes.

4. **Component Reusability**: Design widget components to be reusable and independent of their container.

5. **Permission Control**: Utilize the permissions property to control widget visibility based on user roles.

6. **Widget Management**: Always unregister widgets when they are no longer needed.

## Related Composables

- `useAppBarWidget`: Provides access to the App Bar Widget Service within Vue components.
- `provideAppBarWidgetService`: Creates and provides the App Bar Widget Service to the component tree. 
