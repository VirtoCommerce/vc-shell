# Settings Menu Service Documentation

The Settings Menu Service is a core component of the VC-Shell framework that manages the items displayed in the settings menu. It provides functionality for registering, organizing, and retrieving settings menu items with support for priority-based ordering and component rendering.

## Overview

The Settings Menu Service facilitates the organization and display of settings-related components in a consistent manner. It allows modules to register settings components that will be displayed in the application's settings menu, with control over their order and visibility.

## File Path
`/framework/core/services/settings-menu-service.ts`

## Core Interfaces

Based on usage patterns in the code, the core interfaces likely include:

```typescript
export interface SettingsMenuItem {
  id: string;
  component: Component;
  props?: Record<string, unknown>;
  priority?: number;
  permissions?: string | string[];
}

export interface ISettingsMenuService {
  items: Ref<SettingsMenuItem[]>;
  registerItem: (item: SettingsMenuItem) => void;
  unregisterItem: (itemId: string) => void;
}
```

## Primary Features

### Menu Item Registration

The service allows registering settings menu items that will be displayed in the settings panel.

```typescript
// Register a settings menu item
settingsMenuService.registerItem({
  id: 'language-settings',
  component: LanguageSettingsComponent,
  priority: 10
});
```

### Priority-Based Ordering

Settings menu items can be ordered based on priority values, with lower values appearing first.

```typescript
// High priority item (appears first)
settingsMenuService.registerItem({
  id: 'account-settings',
  component: AccountSettingsComponent,
  priority: 1
});

// Lower priority item (appears later)
settingsMenuService.registerItem({
  id: 'appearance-settings',
  component: AppearanceSettingsComponent,
  priority: 20
});
```

### Permission-Based Visibility

Items can specify permission requirements, ensuring they are only visible to users with the appropriate permissions.

```typescript
// Settings item with permission requirements
settingsMenuService.registerItem({
  id: 'admin-settings',
  component: AdminSettingsComponent,
  permissions: ['admin', 'system-management']
});
```

## Usage in Components

The Settings Menu Service is accessed through the `useSettingsMenu` composable. Here's a real-world example from the `settings-menu` component:

```typescript
// From framework/shared/components/settings-menu/settings-menu.vue
<script lang="ts" setup>
import { inject } from "vue";
import { useSettingsMenu } from "../../../core/composables/useSettingsMenu";
import { SettingsMenuServiceKey } from "../../../injection-keys";

const settingsMenu = useSettingsMenu();
const { items } = settingsMenu;
</script>
```

This implementation demonstrates how the Settings Menu Service:

1. Provides access to registered settings items via the `items` reactive reference
2. Is integrated directly into the settings menu component

## Template Rendering

Settings menu items are rendered in the template by dynamically creating instances of their registered components:

```vue
<!-- From framework/shared/components/settings-menu/settings-menu.vue -->
<template>
  <div class="vc-settings-menu">
    <component
      :is="item.component"
      v-for="item in items"
      :key="item.id"
      v-bind="item.props || {}"
    />
  </div>
</template>
```

This template pattern allows for maximum flexibility in the types of settings that can be displayed, as each registered item provides its own component implementation.

## Pre-Registration Support

Like other services in the VC-Shell framework, the Settings Menu Service likely supports pre-registration of items before the service is initialized, allowing modules to register their settings early in the application lifecycle.

```typescript
// Pre-register a settings item
import { registerSettingsMenuItem } from "@vc-shell/framework";

registerSettingsMenuItem({
  id: 'my-module-settings',
  component: MyModuleSettingsComponent,
  priority: 15
});
```

## Common Settings Item Components

The framework likely provides several built-in settings components, and applications can register their own custom settings:

### Language Settings

```typescript
// Register language settings
settingsMenuService.registerItem({
  id: 'language-settings',
  component: LanguageSettingsComponent,
  priority: 10
});
```

### Theme Settings

```typescript
// Register theme settings
settingsMenuService.registerItem({
  id: 'theme-settings',
  component: ThemeSettingsComponent,
  priority: 20
});
```

### User Profile Settings

```typescript
// Register user profile settings
settingsMenuService.registerItem({
  id: 'profile-settings',
  component: ProfileSettingsComponent,
  priority: 5
});
```

## Integration with App Bar Widget

The Settings Menu is often displayed as a widget in the application bar, leveraging the App Bar Widget Service:

```typescript
// Register settings widget in the app bar
appBarWidgetService.registerWidget({
  id: 'settings',
  icon: SettingsIcon,
  component: SettingsMenuPanel,
  onClick: () => {
    // Optional click handler for settings icon
  }
});
```

## Best Practices

1. **Item Identification**: Always use unique, descriptive IDs for settings menu items to avoid conflicts.

2. **Priority Planning**: Plan your settings menu priorities thoughtfully to maintain a logical grouping of related settings.

3. **Component Design**: Design settings components to be self-contained and consistent with the application's UI language.

4. **Permissions**: Use the permissions property to control settings visibility based on user roles.

5. **Props Passing**: Leverage the props property to customize settings components based on application state or configuration.

6. **Cleanup**: Remember to unregister settings items when modules are disabled or removed.

## Related Composables

- `useSettingsMenu`: Provides access to the Settings Menu Service within Vue components.
- `provideSettingsMenuService`: Creates and provides the Settings Menu Service to the component tree.
- `registerSettingsMenuItem`: Utility function to pre-register settings menu items before service initialization. 
