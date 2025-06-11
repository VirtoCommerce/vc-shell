# Migration Guide to the new version of @vc-shell/framework

This guide will help you migrate your application to the latest version of the `@vc-shell/framework`.

## 1. Updating `package.json`

The first step is to update your application's `package.json` file.

### 1.1. Update Dependency Versions

Many key dependencies have been updated in the new framework version. Ensure you are using versions compatible with the new `@vc-shell/framework`.

Key version changes include:
- `vite`: `5.3.6` -> `^6.3.3`
- `@vitejs/plugin-vue`: `5.0.3` -> `^5.2.3`
- `vue`: `^3.4.19` -> `^3.5.13`
- `vue-tsc`: `^1.8.27` -> `^2.2.10`
- `sass`: `^1.69.6` -> `^1.87.0`
- `typescript`: `~5.3.3` -> `^5.8.3`

Also, update all packages from the `@vc-shell` scope to the latest version (e.g., `^1.1.28` or higher).

### 1.2. Remove Unnecessary Packages

The approach to managing fonts and icons has changed. The following packages are no longer needed and should be removed:

- `@fortawesome/fontawesome-free`
- `roboto-fontface`

You can remove them by running:

```bash
yarn remove @fortawesome/fontawesome-free roboto-fontface
```

## 2. Icon Migration

As part of unifying the visual style, the framework has moved away from **Font Awesome** icons. They no longer fit the new design, and the `@fortawesome/fontawesome-free` package has been removed from dependencies (as mentioned in the previous section).

Instead, it is recommended to use the following icon sets, which are fully supported by the `VcIcon` component:

-   **Material Symbols** (prefix `material-`)
-   **Lucide Icons** (prefix `lucide-`)
-   **Bootstrap Icons** (prefix `bi-`)

### Old Approach (Deprecated)

Previously, Font Awesome was used for icons.

**Example:**
```vue
<VcIcon icon="fas fa-save" />
<VcIcon icon="far fa-user-circle" />
```

### New Approach

You need to find equivalents for the old icons in the new sets and replace them in your code. The `VcIcon` component will automatically detect the correct set by its prefix.

**Migration Steps:**

1.  **Find all uses of Font Awesome icons** in your project (usually with prefixes `fas`, `far`, `fa-`).
2.  **Find a suitable replacement** from Material Symbols, Lucide, or Bootstrap Icons.
3.  **Replace the icons** in your code.

**Replacement Example:**
```vue
<!-- Old way -->
<VcIcon icon="fas fa-save" />
<VcIcon icon="fas fa-home" />
<VcIcon icon="fas fa-trash" />

<!-- New way with Material Symbols -->
<VcIcon icon="material-save" />
<VcIcon icon="material-home" />
<VcIcon icon="material-delete" />
```
This transition will help ensure a consistent and modern look for your application.

## 3. Updating Styles and Assets

The way styles are structured and imported has been simplified.

### 3.1. Update Style Imports in `main.ts`

You no longer need to import CSS for fonts and icons manually. Open your application's entry point (usually `src/main.ts`) and remove the following lines:

```typescript
import "@fortawesome/fontawesome-free/css/all.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
```

The framework now automatically loads all necessary base styles.

### 3.2. Switch from `@import` to `@use` in SCSS

In line with modern Sass standards, the `@import` rule is being phased out. The new framework version recommends using `@use`, which offers better performance and resolves name conflicts by introducing namespaces.

**Old Approach (Deprecated):**
```scss
// src/styles/index.scss
@tailwind components;
@import 'custom';
@tailwind utilities;
```

**New Approach:**
```scss
// src/styles/index.scss
@tailwind components;
@use 'custom';
@tailwind utilities;
```
You should review all `.scss` files in your project and make this change.

### 3.3. Restructure Style Files

The SCSS file structure has been simplified. The files `base.scss` and `colors.scss` have been removed, and their contents are now integrated into the framework.

**Old Structure:**
Your `src/styles/` directory contained:
- `base.scss`
- `colors.scss`
- `custom.scss`
- `index.scss`

**New Structure:**
This directory should now only contain:
- `custom.scss`
- `index.scss`

**Migration Steps:**

1.  **Delete unnecessary files**: Remove `src/styles/base.scss` and `src/styles/colors.scss`.
2.  **Update `src/styles/index.scss`**:
    ```scss
    @use 'custom';

    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
    Note the addition of `@tailwind base;`, which was previously in `base.scss`.
3.  **Move custom styles**: If you had any custom styles in `colors.scss` or `base.scss`, move them to `custom.scss`.

## 4. Updating TypeScript Declaration File (`shims-vue.d.ts`)

After updating Vue, `vue-i18n`, and TypeScript versions, you must update the `shims-vue.d.ts` declaration file to ensure correct typing for global properties like `$t` and `$mergeLocaleMessage`.

### New Approach

You need to extend the `ComponentCustomProperties` interface with types for `vue-i18n` globals and update the import style.

**Migration Steps:**

1.  **Replace the content of `shims-vue.d.ts`**: Update the file to match the new structure.

    **Updated `shims-vue.d.ts`:**
    ```typescript
    /* eslint-disable */
    import { CoreBladeAdditionalSettings, DynamicGridSchema, DynamicDetailsSchema } from "@vc-shell/framework";

    import type { Component, Ref } from "vue";
    import type {
      ComponentCustomProperties as _ComponentCustomProperties,
    } from 'vue';
    import type { Composer } from "vue-i18n";
    // ... other imports

    declare module "@vue/runtime-core" {
      interface ComponentCustomProperties extends _ComponentCustomProperties {
        $mergeLocaleMessage: Composer<{}, {}, {}, string, never, string>["mergeLocaleMessage"];
        $hasAccess: (permissions: string | string[] | undefined) => boolean;
        $isPhone: Ref<boolean>;
        $isTablet: Ref<boolean>;
        $isMobile: Ref<boolean>;
        $isDesktop: Ref<boolean>;
        $isTouch: boolean;
        $t: (key: string, ...args: any[]) => string;
        $dynamicModules: {
            // ...
        };
      }

      interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
    }
    // ... rest of the file
    export {};
    ```
    **Key Changes:**
    -   Added declaration for `$t: (key: string, ...args: any[]) => string;`.
    -   Added declaration for `$mergeLocaleMessage`, with its type imported from `vue-i18n`'s `Composer`.
    -   The `ComponentCustomProperties` interface now extends the base `_ComponentCustomProperties` type from Vue for better compatibility.
    -   Imports have been updated to use `import type`, which is a modern TypeScript practice.

## 5. Working with Generic Components (e.g., `VcTable`)

With the update to Vue 3.3+, the way to define and use type-safe generic components has been standardized. This is a significant improvement, especially for common components like `VcTable` which now support generics to provide full type safety for items.

### The Problem: Lack of Type Inference in Older Versions

In older versions, components like `VcTable` were not truly generic. This meant that when you passed an array of typed items (e.g., `IProductAssociation[]`) to the `:items` prop, the type information was lost within the component. As a result:
-   Slot props (like the `item` in a cell template) defaulted to `any`.
-   Event payloads (like the array of selected items) also defaulted to `any`.
-   This forced developers to use manual type casting and led to potential runtime errors and a poor developer experience in the IDE.

**Example of the old, non-generic `VcTable` usage:**
```vue
<template>
  <!-- ... -->
  <VcTable
    :items="associations"
    @selection-changed="(selectedItems) => onSelectionChanged(selectedItems as IProductAssociation[], ...)"
  >
    <template #item.quantity="{ item }">
      <!-- Error: 'item' is of type 'any'. Property 'quantity' does not exist on type 'any'. -->
      <VcInput :model-value="(item as IProductAssociation).quantity" />
    </template>
  </VcTable>
</template>
```

### The Solution: Using `generic` Attribute and `@vue-generic` Directive

The `VcTable` component is defined using the `<script setup lang="ts" generic="T">` syntax, making it a generic component. To leverage this, you must now provide the type information when you use the component.

**New Approach (with `@vue-generic` directive):**

The recommended way to provide an explicit type to a generic component is by using the special `@vue-generic` comment directive. This enables full type-checking for props, slots, and events.

**Migration Steps:**

1.  Identify where you use generic components like `VcTable`.
2.  Add a comment `<!-- @vue-generic {YourItemType} -->` directly above the component instance.

**Example of migrating `VcTable` in an `Associations` component:**
```vue
<script setup lang="ts">
import { IProductAssociation } from "@vc-shell/api-client";

function onSelectionChanged(selectedItems: IProductAssociation[], type: string) {
  // ...
}
</script>

<template>
  <!-- ... -->
  <!-- @vue-generic {IProductAssociation} -->
  <VcTable
    :items="item.associations"
    @selection-changed="onSelectionChanged($event, item.type)"
  >
    <template #item.quantity="{ item }">
      <!-- OK: 'item' is now correctly typed as IProductAssociation -->
      <VcInput :model-value="item.quantity" />
    </template>
  </VcTable>
</template>
```
**Key Benefits:**
-   **Type-Safe Slots:** The `item` in the slot is now correctly inferred as `IProductAssociation`.
-   **Type-Safe Events:** The `$event` payload for the `@selection-changed` event is correctly typed as `IProductAssociation[]`, so no casting is needed.
-   **Improved IDE Support:** You get full autocompletion and type-checking in your editor.

This change is crucial for building robust and maintainable applications and should be applied to all instances of `VcTable` and other generic components in your project.

## 6. Migrating App Bar Widgets

Adding custom buttons and widgets to the top application bar (App Bar) has been moved from slots in the `VcApp` component to a dedicated `useAppBarWidget` composable.

### Old Approach (Deprecated)

Previously, `toolbar` and `toolbar:prepend` slots were used in `VcApp`.

**Example in `App.vue`:**
```vue
<!-- App.vue -->
<template>
  <VcApp ...>
    <template #toolbar>
      <!-- To the right of the main toolbar content -->
      <LanguageSelector />
    </template>

    <template #toolbar:prepend>
      <!-- To the left of the main toolbar content -->
      <MyCustomBackButton />
    </template>
  </VcApp>
</template>
```

### New Approach (with `useAppBarWidget`)

Widgets are now registered programmatically. This allows any module to add elements to the App Bar without modifying the root `App.vue` component.

**Migration Steps:**

1.  **Remove slots from `App.vue`**: Delete all `<template #toolbar>` and `<template #toolbar:prepend>` blocks.
2.  **Register widgets using `useAppBarWidget`**: In a suitable location (e.g., the `setup` script of `App.vue` for global widgets, or within a specific module), call `register` from `useAppBarWidget`.

    **Example:**
    ```typescript
    // Inside the setup block of a component like App.vue
    import { onMounted } from 'vue';
    import { useAppBarWidget } from '@vc-shell/framework';
    import LanguageSelector from './components/LanguageSelector.vue';
    import MyCustomBackButton from './components/MyCustomBackButton.vue';

    onMounted(() => {
      const { register } = useAppBarWidget();

      // Register a widget to appear at the end (right side)
      register({
        id: 'language-selector',
        component: LanguageSelector,
        order: 100, // Higher order means further to the right
      });

      // Register a widget to appear at the beginning (left side)
      register({
        id: 'custom-back-button',
        component: MyCustomBackButton,
        order: 10, // Lower order means further to the left
      });
    });
    ```

## 7. Customizing the Settings Menu

Previously, adding or removing items from the user dropdown menu was done via a scoped slot in `VcApp`. This has been replaced by the `useSettingsMenu` composable for a more modular approach.

### Old Approach (Deprecated)

In `App.vue`, you could override the default menu items.

**Example of removing the "Change Password" item:**
```vue
<!-- App.vue -->
<template>
  <VcApp ...>
    <template #toolbar:user-dropdown="{ userDropdown }">
      <component
        :is="userDropdown"
        :base-menu-items-handler="removeChangePassword"
      />
    </template>
  </VcApp>
</template>

<script setup lang="ts">
import { BladeMenu } from "@vc-shell/framework";

// This function only keeps the last item (Logout)
function removeChangePassword(defaultMenuItems: BladeMenu[]) {
  return [defaultMenuItems.pop()];
}
</script>
```

### New Approach (with `useSettingsMenu`)

The new approach allows for centralized and dynamic management of settings menu items from anywhere in the application.

**Migration Steps:**

1.  **Remove the old code from `App.vue`**: Delete the `<template #toolbar:user-dropdown>` block and its corresponding script.
2.  **Add a new menu item**: To add an item, create a component for it (preferably using `SettingsMenuItem` as a base) and register it with `useSettingsMenu`.

    **Example:**
    ```typescript
    // In a suitable place, like a component's setup or a plugin
    import { useSettingsMenu } from '@vc-shell/framework';
    import MyCustomSettings from './MyCustomSettings.vue';
    import { onUnmounted } from 'vue';

    const settingsMenu = useSettingsMenu();

    const itemId = settingsMenu.register({
      id: 'my-custom-settings',
      component: MyCustomSettings,
      order: 150,
      props: { settingTitle: 'My Custom Setting' },
    });

    onUnmounted(() => {
      settingsMenu.unregister(itemId);
    });
    ```
3.  **Remove an existing menu item**: To remove a default framework item, call `unregister` with the item's ID.

    ```typescript
    import { useSettingsMenu } from '@vc-shell/framework';

    const settingsMenu = useSettingsMenu();

    // Remove the default "Change Password" item by its ID
    settingsMenu.unregister('change-password');
    ```
    This can be done in your `main.ts` or root `App.vue` to ensure it's removed on application startup.

## 8. Dashboard Migration

The dashboard architecture has been completely overhauled. The old static-grid dashboard is replaced by a dynamic, customizable dashboard powered by the `<DraggableDashboard />` component.

### Old Approach (Deprecated)

The dashboard page (`src/pages/Dashboard.vue`) contained a static layout using `VcRow` and `VcCol`. Widgets were imported from modules and placed directly into the template.

**Old `Dashboard.vue` Example:**
```vue
<template>
  <VcContainer class="dashboard ...">
    <VcRow>
      <VcCol :size="10">
        <component :is="modules.SomeModule.components.SomeDashboardCard"></component>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { default as modules } from "some-path/modules";
// ...
</script>
```

### New Approach

The new approach uses a single `<DraggableDashboard />` component that automatically renders all registered widgets. Widgets are now registered programmatically within their respective modules instead of in the template.

**Migration Steps:**

1.  **Replace the content of `src/pages/Dashboard.vue`**:
    Completely replace the file's content with the following:
    ```vue
    <template>
      <DraggableDashboard />
    </template>

    <script lang="ts" setup>
    import { DraggableDashboard } from "@vc-shell/framework";
    </script>
    ```

2.  **Register Widgets in Modules**:
    In the `index.ts` of each module that provides a dashboard widget, call the `registerDashboardWidget` function from `@vc-shell/framework`.

    **Example of registering a widget in a module's `index.ts`:**
    ```typescript
    import * as components from "./components";
    import { createDynamicAppModule, registerDashboardWidget } from "@vc-shell/framework";
    import { markRaw } from "vue";

    registerDashboardWidget({
      id: "my-module-widget",
      name: "My Module",
      component: markRaw(components.MyModuleDashboardCard),
      size: { width: 6, height: 6 }, // Initial size in the grid
    });

    export default createDynamicAppModule({
      // ... rest of the module configuration
    });
    ```
    You must do this for all modules that provide dashboard widgets. This decouples the dashboard page from specific widget implementations, making the system fully modular.

## 9. Registering Widgets in Blades

The method for registering widgets for blades has been completely redesigned. Instead of using the `#widgets` slot in `vc-blade`, you must now use the `useWidgets` composable for programmatic registration.

### Old Approach (Deprecated)

Widgets were passed directly into the `#widgets` slot of the `vc-blade` component.

**Example:**
```vue
<template>
  <VcBlade ... >
    <template #widgets="{ isExpanded }">
      <MyWidget :is-expanded="isExpanded" />
    </template>
  </VcBlade>
</template>
```
This method is no longer supported, as the `widgets` slot has been removed from `vc-blade`.

### New Approach (with `useWidgets`)

Widgets must now be registered programmatically inside the `<script setup>` of your blade component using `useWidgets`. `vc-blade` now contains an internal container that automatically displays all widgets registered for it.

**Migration Example:**
```vue
<!-- MyBlade.vue -->
<template>
  <vc-blade>
    <!-- Main blade content -->
  </vc-blade>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, inject } from "vue";
import { useWidgets, type IWidget, BladeInstance } from "@vc-shell/framework";
import MyWidget from "../components/MyWidget.vue";

// 1. Inject the instance of the current blade to get its ID
const blade = inject(BladeInstance);

// 2. Get the functions for widget registration
const { registerWidget, unregisterWidget } = useWidgets();

// 3. Define the widget as an IWidget object
const myWidget: IWidget = {
  id: "MyWidget",
  component: MyWidget,
  // Pass props to the widget
  props: {
    item: item.value, // assuming 'item' is a ref or computed
  }
};

// 4. Register the widget for the current blade on mount
onMounted(() => {
  if (blade?.value.id) {
    registerWidget(myWidget, blade.value.id);
  }
});

// 5. Unregister on unmount to prevent memory leaks
onBeforeUnmount(() => {
  if (blade?.value.id) {
    unregisterWidget(myWidget.id, blade.value.id);
  }
});
</script>
```
This new approach replaces the old declarative system and should be applied to all blades that use custom widgets.
