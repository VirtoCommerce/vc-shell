# Menu Service Documentation

The Menu Service is a core component of the VC-Shell framework responsible for managing the application's navigation menu structure. It provides a centralized system for registering, organizing, and retrieving menu items with support for grouping, localization, and priority-based ordering.

## Overview

The Menu Service handles the organization of menu items throughout the application, supporting hierarchical structures, grouping, and priority-based ordering. It works with the i18n plugin for localization of menu titles.

## File Path
`/framework/core/services/menu-service.ts`

## Core Interfaces

### MenuItem

```typescript
interface MenuItem {
  id?: string;
  title: string | ComputedRef<string>;
  path?: string;
  url?: string;
  icon?: string | Component;
  priority?: number;
  inGroupPriority?: number;
  group?: string;
  groupIcon?: string | Component;
  groupConfig?: {
    id: string;
    title?: string;
    icon?: string | Component;
    priority?: number;
    permissions?: string | string[];
  };
  groupId?: string;
  children?: MenuItem[];
  permissions?: string | string[];
  // Additional properties can be included
}
```

### MenuService

```typescript
interface MenuService {
  addMenuItem: (item: MenuItem) => void;
  menuItems: Ref<MenuItem[]>;
  removeMenuItem: (item: MenuItem) => void;
}
```

## Primary Features

### Menu Item Registration

The service allows registering menu items either before the service is initialized (pre-registration) or afterward.

```typescript
// Register a menu item
menuService.addMenuItem({
  title: 'New Item',
  path: '/new-item',
  priority: 100
});
```

### Grouping Menu Items

Menu items can be organized into groups, either using the legacy `group` property or the more flexible `groupConfig`.

```typescript
// Legacy grouping
menuService.addMenuItem({
  title: 'Grouped Item',
  path: '/grouped-item',
  priority: 100,
  group: 'Management',
  groupIcon: 'material-manufacturing'
});

// Enhanced grouping with groupConfig
menuService.addMenuItem({
  title: 'Advanced Grouped Item',
  path: '/advanced-grouped-item',
  priority: 50,
  groupConfig: {
    id: 'advanced-management',
    title: 'Advanced Management',
    icon: 'material-construction',
    priority: 200,
    permissions: ['manage-advanced']
  }
});
```

### Priority-Based Ordering

Menu items and groups can be ordered based on priority values, with lower values appearing first.

```typescript
// High priority item (appears first)
menuService.addMenuItem({
  title: 'High Priority',
  path: '/high-priority',
  priority: 10
});

// Low priority item (appears later)
menuService.addMenuItem({
  title: 'Low Priority',
  path: '/low-priority',
  priority: 100
});
```

### Localization Support

Menu item titles are automatically localized using the i18n plugin.

```typescript
// Localized menu item
menuService.addMenuItem({
  title: 'SHELL.MENU.DASHBOARD', // Translation key
  path: '/',
  priority: 0
});
```

## Internal Processing

The Menu Service performs several internal operations to organize menu items:

1. **ID Generation**: Creates IDs from localized titles if not provided
2. **Grouping**: Organizes menu items into groups based on group properties
3. **Priority Sorting**: Sorts menu items and groups based on priority values
4. **Title Localization**: Creates computed references for localized titles

## Usage in a Component

The Menu Service is typically accessed through the `useMenuService` composable. Here's a real-world example from the application's bootstrap process:

```typescript
// From sample/vc-app-extend/src/bootstrap.ts
import { useMenuService } from "@vc-shell/framework";
import { App } from "vue";

export function bootstrap(app: App) {
  const { addMenuItem } = useMenuService();

  // Add Dashboard to main menu item
  addMenuItem({
    title: "SHELL.MENU.DASHBOARD",
    icon: "material-home",
    priority: 0,
    url: "/",
  });
}
```

And here's how it's used in a menu component:

```typescript
// From framework/ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue
<script setup lang="ts">
import { useMenuService } from "../../../../../../core/composables/useMenuService";

// Get menu items directly from the service
const { menuItems } = useMenuService();
</script>

<template>
  <!-- Rendering the menu items -->
  <div class="app-menu">
    <div
      v-for="item in menuItems"
      :key="item.id"
      class="app-menu__item"
    >
      <!-- Menu item rendering -->
    </div>
  </div>
</template>
```

## Best Practices

1. **Translation Keys**: Use consistent translation key patterns for menu item titles (e.g., "SECTION.MENU.ITEM_NAME").

2. **Priority Planning**: Plan your menu priority structure in advance, leaving gaps for future items (e.g., use multiples of 10 or 100).

3. **Consistent Grouping**: Choose either the legacy `group` property or the newer `groupConfig` approach and stick with it for consistency.

4. **Permissions**: Use permissions to control menu item visibility based on user roles.

5. **Icons**: Use consistent icon libraries or components throughout your menu.

## Related Composables

- `useMenuService`: Provides access to the Menu Service within Vue components.
- `provideMenuService`: Creates and provides the Menu Service to the component tree.
- `addMenuItem`: Utility function to pre-register menu items before service initialization. 
