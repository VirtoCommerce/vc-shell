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

- **Material Symbols** (prefix `material-`)
- **Lucide Icons** (prefix `lucide-`)
- **Bootstrap Icons** (prefix `bi-`)

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
@import "custom";
@tailwind utilities;
```

**New Approach:**

```scss
// src/styles/index.scss
@tailwind components;
@use "custom";
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
    @use "custom";

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

    import { CoreBladeAdditionalSettings } from "@vc-shell/framework";
    import type { Ref } from "vue";
    import type { Composer } from "vue-i18n";

    declare module "*.vue" {
      import type { DefineComponent } from "vue";
      const component: DefineComponent<{}, {}, any>;
      export default component;
    }

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
      }

      interface ComponentOptionsBase extends CoreBladeAdditionalSettings {}
    }

    export {};
    ```

    **Key Changes:**
    - Added declaration for `$t: (key: string, ...args: any[]) => string;`.
    - Added declaration for `$mergeLocaleMessage`, with its type imported from `vue-i18n`'s `Composer`.
    - The `ComponentCustomProperties` interface now extends the base `_ComponentCustomProperties` type from Vue for better compatibility.
    - Imports have been updated to use `import type`, which is a modern TypeScript practice.

## 5. Working with Generic Components (e.g., `VcTable`)

With the update to Vue 3.3+, the way to define and use type-safe generic components has been standardized. This is a significant improvement, especially for common components like `VcTable` which now support generics to provide full type safety for items.

### The Problem: Lack of Type Inference in Older Versions

In older versions, components like `VcTable` were not truly generic. This meant that when you passed an array of typed items (e.g., `IProductAssociation[]`) to the `:items` prop, the type information was lost within the component. As a result:

- Slot props (like the `item` in a cell template) defaulted to `any`.
- Event payloads (like the array of selected items) also defaulted to `any`.
- This forced developers to use manual type casting and led to potential runtime errors and a poor developer experience in the IDE.

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

- **Type-Safe Slots:** The `item` in the slot is now correctly inferred as `IProductAssociation`.
- **Type-Safe Events:** The `$event` payload for the `@selection-changed` event is correctly typed as `IProductAssociation[]`, so no casting is needed.
- **Improved IDE Support:** You get full autocompletion and type-checking in your editor.

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
    import { onMounted } from "vue";
    import { useAppBarWidget } from "@vc-shell/framework";
    import LanguageSelector from "./components/LanguageSelector.vue";
    import MyCustomBackButton from "./components/MyCustomBackButton.vue";

    onMounted(() => {
      const { register } = useAppBarWidget();

      // Register a widget to appear at the end (right side)
      register({
        id: "language-selector",
        component: LanguageSelector,
        order: 100, // Higher order means further to the right
      });

      // Register a widget to appear at the beginning (left side)
      register({
        id: "custom-back-button",
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
    import { useSettingsMenu } from "@vc-shell/framework";
    import MyCustomSettings from "./MyCustomSettings.vue";
    import { onUnmounted } from "vue";

    const settingsMenu = useSettingsMenu();

    const itemId = settingsMenu.register({
      id: "my-custom-settings",
      component: MyCustomSettings,
      order: 150,
      props: { settingTitle: "My Custom Setting" },
    });

    onUnmounted(() => {
      settingsMenu.unregister(itemId);
    });
    ```

3.  **Remove an existing menu item**: To remove a default framework item, call `unregister` with the item's ID.

    ```typescript
    import { useSettingsMenu } from "@vc-shell/framework";

    const settingsMenu = useSettingsMenu();

    // Remove the default "Change Password" item by its ID
    settingsMenu.unregister("change-password");
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
    import { createAppModule, registerDashboardWidget } from "@vc-shell/framework";
    import { markRaw } from "vue";

    registerDashboardWidget({
      id: "my-module-widget",
      name: "My Module",
      component: markRaw(components.MyModuleDashboardCard),
      size: { width: 6, height: 6 }, // Initial size in the grid
    });

    export default createAppModule({
      // ... rest of the module configuration
    });
    ```

    You must do this for all modules that provide dashboard widgets. This decouples the dashboard page from specific widget implementations, making the system fully modular.

## 9. Removal of Dynamic Views Module (`shared/modules/dynamic`)

The legacy **Dynamic Views** system — a schema-driven UI that rendered blades from JSON schemas — has been completely removed from the framework. This is a **breaking change** for any module that relied on `createDynamicAppModule()`.

### What Was Removed

The following exports no longer exist in `@vc-shell/framework`:

| Category            | Removed exports                                                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Module factory**  | `createDynamicAppModule`                                                                                                                                                                                                                     |
| **Blade factories** | `useDetailsFactory`, `useListFactory`                                                                                                                                                                                                        |
| **Blade pages**     | `DynamicBladeList`, `DynamicBladeForm`                                                                                                                                                                                                       |
| **Schema types**    | `DynamicSchema`, `DynamicGridSchema`, `DynamicDetailsSchema`, `ControlSchema`, `FormContentSchema`, `ListContentSchema`, `SettingsSchema`, `OverridesSchema`, and all field schema types (`InputSchema`, `SelectSchema`, `CardSchema`, etc.) |
| **Composables**     | `useDynamicViewsUtils`, `useToolbarReducer`, `useTableTemplates`, `useFilterBuilder`                                                                                                                                                         |
| **Components**      | `SchemaRender`, all field renderers (InputField, SelectField, Card, Fieldset, etc.)                                                                                                                                                          |
| **Injection keys**  | `DynamicModuleRegistryStateKey`, `DynamicModuleRegistryState`, `DynamicRegisteredEntry`                                                                                                                                                      |

### Migration Steps

Modules that used `createDynamicAppModule()` must be rewritten to use direct Vue component registration via `createAppModule()`.

**Old Approach (Removed):**

```typescript
// module/index.ts
import { createDynamicAppModule } from "@vc-shell/framework";
import * as schema from "./schema";
import * as composables from "./composables";
import * as locales from "./locales";

export default createDynamicAppModule({
  schema,
  composables,
  locales,
});
```

**New Approach:**

```typescript
// module/index.ts
import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";

export default createAppModule(pages, locales);
```

Instead of JSON schemas describing blade content, you now write standard Vue `<script setup>` components that use framework UI components directly (`VcInput`, `VcSelect`, `VcCard`, `VcTable`, etc.).

**Old JSON schema approach:**

```json
{
  "settings": {
    "id": "product-details",
    "component": "DynamicBladeForm",
    "composable": "useProductDetails"
  },
  "content": [
    {
      "id": "productForm",
      "component": "vc-form",
      "children": [
        { "id": "name", "component": "vc-input", "property": "name", "label": "Name" },
        { "id": "category", "component": "vc-select", "property": "categoryId", "label": "Category" }
      ]
    }
  ]
}
```

**New Vue component approach:**

```vue
<!-- pages/product-details.vue -->
<template>
  <VcBlade
    title="Product Details"
    :toolbar-items="bladeToolbar"
  >
    <VcForm>
      <VcInput
        v-model="item.name"
        label="Name"
      />
      <VcSelect
        v-model="item.categoryId"
        label="Category"
        :options="categories"
      />
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade, VcForm, VcInput, VcSelect } from "@vc-shell/framework";
// ... composable logic directly in the component
</script>
```

This migration eliminates the indirection layer of JSON schemas and gives you full TypeScript type safety, IDE autocompletion, and standard Vue tooling support.

## 10. Replacing `useBladeNavigation()` with `useBlade()`

### Overview

**`useBladeNavigation()` is deprecated.** Replace all usages with `useBlade()`.

The new `useBlade()` is a single composable that replaces **all** previous blade navigation patterns:

| Old (deprecated)                              | New                                          |
| --------------------------------------------- | -------------------------------------------- |
| `useBladeNavigation()`                        | `useBlade()`                                 |
| `useBladeContext()`                           | `useBlade()`                                 |
| `useBlade()` (legacy, returned `ComputedRef`) | `useBlade()` (new, returns destructured API) |

**Key difference:** the old `useBladeNavigation()` required wrapping blade names in `{ blade: resolveBladeByName("X") }` or `{ blade: { name: "X" } }`. The new `useBlade().openBlade()` takes `{ name: "X" }` directly — simpler and cleaner.

`useBlade()` works **everywhere** — inside blades, in dashboard cards, notification templates, and standalone composables. Inside a blade it provides the full API (identity, guards, communication). Outside a blade, `openBlade()` works normally; blade-specific methods (`closeSelf`, `callParent`, etc.) throw a descriptive runtime error.

### Quick Reference: `useBladeNavigation()` → `useBlade()`

| `useBladeNavigation()` (deprecated)                         | `useBlade()` (new)                                |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `const { openBlade } = useBladeNavigation()`                | `const { openBlade } = useBlade()`                |
| `const { openBlade, onBeforeClose } = useBladeNavigation()` | `const { openBlade, onBeforeClose } = useBlade()` |
| `openBlade({ blade: resolveBladeByName("X")!, param })`     | `openBlade({ name: "X", param })`                 |
| `openBlade({ blade: { name: "X" }, options })`              | `openBlade({ name: "X", options })`               |
| `openBlade({ blade: markRaw(Component), param })`           | `openBlade({ name: "ComponentName", param })`     |
| `onParentCall({ method: "reload" })`                        | `callParent("reload")`                            |
| `onParentCall({ method: "fn", args: val })`                 | `callParent("fn", val)`                           |
| `resolveBladeByName("X")`                                   | Not needed — pass `name` directly                 |

Also replaces legacy patterns:

| Legacy pattern                                | `useBlade()` (new)                       |
| --------------------------------------------- | ---------------------------------------- |
| `const blade = useBlade()` + `blade.value.id` | `const { id } = useBlade()` + `id.value` |
| `const { openBlade } = useBladeContext()`     | `const { openBlade } = useBlade()`       |
| `inject(BladeInstance)` for blade ID          | `const { id } = useBlade()`              |

### Behavior by context

| Method              | Inside blade                               | Outside blade                        |
| ------------------- | ------------------------------------------ | ------------------------------------ |
| `openBlade()`       | Opens child (parentId auto-set) + URL sync | Opens blade (no parentId) + URL sync |
| `closeSelf()`       | Closes current blade                       | Throws: "requires blade context"     |
| `closeChildren()`   | Closes all children of current blade       | Throws: "requires blade context"     |
| `id`, `param`, etc. | ComputedRef with value                     | Throws on `.value` access            |
| `callParent()`      | Calls parent method                        | Throws                               |

### Migration Examples

**Inside a blade (detail/list page):**

```ts
// Before — two composables
const blade = useBlade();
const { openBlade, onBeforeClose } = useBladeNavigation();
registerWidget(myWidget, blade?.value.id ?? "");

// After — single composable
const { id: bladeId, openBlade, onBeforeClose } = useBlade();
registerWidget(myWidget, bladeId.value);
```

**Outside a blade (dashboard card):**

```ts
// Before
import { useBladeNavigation } from "@vc-shell/framework";
const { openBlade, resolveBladeByName } = useBladeNavigation();
openBlade({ blade: resolveBladeByName("OrderDetails")!, param: orderId });

// After
import { useBlade } from "@vc-shell/framework";
const { openBlade } = useBlade();
openBlade({ name: "OrderDetails", param: orderId });
```

**Notification template:**

```ts
// Before
const { openBlade, resolveBladeByName } = useBladeNavigation();
openBlade({ blade: resolveBladeByName("ProductDetails")!, param: productId });

// After
const { openBlade } = useBlade();
openBlade({ name: "ProductDetails", param: productId });
```

**Parent-child communication:**

```ts
// Before
const { onParentCall } = useBladeNavigation();
onParentCall({ method: "reload" });
onParentCall({ method: "onItemClick", args: item, callback: (result) => { ... } });

// After
const { callParent } = useBlade();
await callParent("reload");
const result = await callParent("onItemClick", item);
```

**Close children:**

```ts
// New method — closes all child blades of the current blade
const { closeChildren } = useBlade();
await closeChildren(); // respects onBeforeClose guards
```

### `onBeforeClose` boolean inversion

The guard boolean semantics are **inverted** between the legacy and new API:

| Legacy `useBladeNavigation().onBeforeClose` | New `useBlade().onBeforeClose`             |
| ------------------------------------------- | ------------------------------------------ |
| `return false` → **prevent** close          | `return true` → **prevent** close          |
| `return true` / `undefined` → allow close   | `return false` / `undefined` → allow close |

```ts
// Before (legacy)
onBeforeClose(async () => {
  if (isModified.value) {
    return await showConfirmation(msg); // true=allow, false=prevent
  }
});

// After (new API — invert the result)
onBeforeClose(async () => {
  if (isModified.value) {
    return !(await showConfirmation(msg)); // true=prevent, false=allow
  }
});
```

### Backward compatibility

- **`useBladeNavigation()`** continues to work as a deprecated adapter. No immediate migration required.
- **`useBladeContext()`** continues to work as a deprecated alias for `useBlade()`.

## 11. Registering Widgets in Blades

The widget registration system has been redesigned for better developer experience. There are now two composables that replace manual lifecycle management.

### Old Approach (Deprecated)

**Slot-based (removed):**

```vue
<template>
  <VcBlade>
    <template #widgets="{ isExpanded }">
      <MyWidget :is-expanded="isExpanded" />
    </template>
  </VcBlade>
</template>
```

**Manual `registerWidget` / `unregisterWidget` (deprecated):**

```ts
const { registerWidget, unregisterWidget } = useWidgets();
const { id: bladeId } = useBlade();

registerWidget({ id: "MyWidget", component: MyWidget, props: { item }, updateFunctionName: "updateCount" }, bladeId.value);
registerWidget({ id: "OtherWidget", component: OtherWidget, props: { item } }, bladeId.value);

onUnmounted(() => {
  unregisterWidget("MyWidget", bladeId.value);
  unregisterWidget("OtherWidget", bladeId.value);
});
```

**`defineExpose` for widget refresh (deprecated):**

```ts
// Inside widget component
defineExpose({
  updateCount: () => {
    populateCounter();
  },
});
```

### New Approach: `useBladeWidgets()` (Headless)

Replaces manual `registerWidget` + `unregisterWidget` + `useBlade().id` boilerplate. Automatically registers widgets on mount and unregisters on unmount. Gets blade ID from blade context automatically.

Widgets are declared as **plain config objects** — no `.vue` file needed for standard sidebar widgets (icon + title + badge + click action):

```ts
import { useBladeWidgets } from "@vc-shell/framework";

const { refresh, refreshAll } = useBladeWidgets([
  {
    id: "OffersWidget",
    icon: "lucide-tag",
    title: "PRODUCTS.WIDGETS.OFFERS.TITLE",
    badge: offersCount, // Ref<number | string>
    loading: offersLoading, // Ref<boolean>
    isVisible: computed(() => !!props.param),
    onClick: () => openBlade({ name: "OffersList" }),
    onRefresh: loadOffers, // called by refresh("OffersWidget") or refreshAll()
  },
  {
    id: "ReviewsWidget",
    icon: "lucide-star",
    title: "PRODUCTS.WIDGETS.REVIEWS.TITLE",
    badge: reviewsCount,
    isVisible: computed(() => !!props.param),
    onClick: () => openBlade({ name: "ReviewsList" }),
  },
]);

// After save — refresh all widgets that have onRefresh
async function reload() {
  await fetchProduct();
  refreshAll();
}

// Or refresh a specific widget
refresh("OffersWidget");
```

#### `HeadlessWidgetDeclaration` fields

| Field       | Type                              | Required | Description                               |
| ----------- | --------------------------------- | -------- | ----------------------------------------- |
| `id`        | `string`                          | Yes      | Unique widget identifier                  |
| `icon`      | `string`                          | Yes      | Icon name (e.g., `"lucide-tag"`)          |
| `title`     | `string`                          | Yes      | i18n key or display title                 |
| `badge`     | `Ref<number \| string>`           | No       | Badge counter value                       |
| `loading`   | `Ref<boolean>`                    | No       | Show loading indicator                    |
| `disabled`  | `Ref<boolean> \| boolean`         | No       | Disable the widget                        |
| `isVisible` | `ComputedRef<boolean> \| boolean` | No       | Toggle visibility                         |
| `onClick`   | `() => void`                      | No       | Action when widget is clicked             |
| `onRefresh` | `() => void \| Promise<void>`     | No       | Called by `refresh(id)` or `refreshAll()` |

#### Return value

| Property     | Type                         | Description                                      |
| ------------ | ---------------------------- | ------------------------------------------------ |
| `refresh`    | `(widgetId: string) => void` | Trigger `onRefresh` on a specific widget         |
| `refreshAll` | `() => void`                 | Trigger `onRefresh` on all widgets that have one |

#### When to use headless vs component widgets

|                                       | Headless (`useBladeWidgets`) | Component (SFC) |
| ------------------------------------- | ---------------------------- | --------------- |
| Blade-local, standard VcWidget visual | **Preferred**                |                 |
| External module widget                |                              | Required        |
| Custom UI beyond VcWidget             |                              | Required        |

### Migration Steps

1. **Replace `registerWidget` / `unregisterWidget` calls** in your blade with a single `useBladeWidgets([...])` call
2. **Remove `onUnmounted` cleanup** — `useBladeWidgets` handles it automatically
3. **Remove `useBlade().id` / `bladeId.value`** — `useBladeWidgets` gets blade ID from blade context automatically
4. **Remove widget `.vue` files** for standard VcWidget sidebar items — declare them as headless config objects with `icon`, `title`, `badge`, `onClick`
5. **Move refresh logic into `onRefresh`** — replaces `defineExpose({ updateFn })` and `updateFunctionName` patterns
6. **Replace `updateActiveWidget()`** calls with `refresh(widgetId)` or `refreshAll()`

### Backward Compatibility

- Old `registerWidget()` + `unregisterWidget()` continue to work
- `updateFunctionName` + `defineExpose` — deprecated but not broken
- Migration is gradual — old and new patterns coexist in the same blade

### `useWidgets()` is now internal API

`useWidgets()` has been moved to internal framework API. It is still available as a **deprecated re-export** — existing code will continue to work, but IDE will show a deprecation warning.

```ts
// Before — still works but deprecated
import { useWidgets } from "@vc-shell/framework";
const { registerWidget, unregisterWidget } = useWidgets();

// After — use useBladeWidgets instead
import { useBladeWidgets } from "@vc-shell/framework";
const { refresh, refreshAll } = useBladeWidgets([...]);
```

If your code only uses `useWidgets()` to call `updateActiveWidget()`, replace it with `refreshAll()` from `useBladeWidgets`.

### Blade Context for External Widgets

External widgets from other modules now receive blade data via `defineBladeContext` / `injectBladeContext` instead of `config.requiredData` + `provideBladeData`.

**Convention:** All blades expose their main entity as `item`. This is the standard contract — external widgets always access `ctx.value.item`.

**Blade side (one line, replaces `provideBladeData`):**

```ts
// Before
const { provideBladeData } = useBlade();
const bladeData = computed(() => ({ id: item.value?.id, objectType: item.value?.objectType }));
provideBladeData(bladeData);

// After
defineBladeContext({ item });
```

**External widget side (replaces props from `config.requiredData`):**

```ts
// Before — widget received props via config.requiredData resolution
const props = defineProps<{ id: string; objectType: string }>();

// After — widget injects blade context directly
const ctx = injectBladeContext();
const bladeItem = computed(() => ctx.value.item as { id?: string; objectType?: string });
```

**Registration (simplified — no config needed):**

```ts
// Before
registerExternalWidget({
  component: MessageWidget,
  targetBlades: ["ProductDetails"],
  config: { requiredData: ["id", "objectType"] },
  updateFunctionName: "updateActiveWidgetCount",
});

// After
registerExternalWidget({
  component: MessageWidget,
  targetBlades: ["ProductDetails"],
});
```

**What gets removed:**

- `config.requiredData` / `config.optionalData` / `config.fieldMapping` / `config.propsResolver`
- `provideBladeData` from `useBlade()`
- `resolveWidgetProps` logic
- `updateFunctionName` — use `onRefresh` in `HeadlessWidgetDeclaration` instead
- Widget `defineExpose({ updateFn })` — use `onRefresh` callback instead

**Notes:**

- `defineBladeContext` accepts plain objects or computed refs
- `injectBladeContext()` returns `ComputedRef` — access via `.value`
- Throws if no context found (blade forgot to call `defineBladeContext`)
- Not limited to widgets — extensions, nested components can also use `injectBladeContext()`

---

## 12. Migrating to Vue 3.5.30, Vue Router 5, vue-tsc 3

This section covers the migration of applications consuming `@vc-shell/framework` to the latest dependency versions.

### 12.1 Version Summary

| Package      | Old     | New     | Type                        |
| ------------ | ------- | ------- | --------------------------- |
| `vue`        | ^3.5.13 | ^3.5.30 | Minor (no breaking changes) |
| `vue-router` | ^4.x    | ^5.0.3  | **Major**                   |
| `vue-tsc`    | ^2.2.10 | ^3.2.5  | **Major**                   |

### 12.2 Updating `package.json`

Update the following dependencies in your application's `package.json`:

```diff
 "dependencies": {
-  "@vc-shell/framework": "^2.0.0-alpha.6",
+  "@vc-shell/framework": "^2.0.0-alpha.9",
-  "vue": "^3.5.13",
+  "vue": "^3.5.30",
-  "vue-router": "^4.2.5",
+  "vue-router": "^5.0.3",
 },
 "devDependencies": {
-  "vue-tsc": "^2.2.10",
+  "vue-tsc": "^3.2.5",
 }
```

Then run:

```bash
yarn install
```

### 12.3 Vue Router 5

Vue Router 5 is a **transition release** with **no breaking changes** for apps not using `unplugin-vue-router`. Your existing router code (`createRouter`, `createWebHashHistory`, `useRoute`, `useRouter`, `router.addRoute`, navigation guards) will work without modifications.

Official migration guide: https://router.vuejs.org/guide/migration/v4-to-v5

#### Deprecated API: `next()` callback in navigation guards

The `next()` callback pattern in `beforeEach` / `beforeResolve` guards still works in v5, but is **deprecated and will be removed in v6**. Migrate now to avoid future breakage.

```typescript
// DEPRECATED — will break in vue-router 6
router.beforeEach(async (to, from, next) => {
  if (!isAuthenticated()) {
    next({ name: "Login" });
  } else {
    next();
  }
});

// RECOMMENDED — return-based style
router.beforeEach(async (to) => {
  if (!isAuthenticated()) {
    return { name: "Login" };
  }
  // returning undefined (or nothing) means "allow navigation"
});
```

**How to find usages in your app:**

```bash
# Search for next() callback pattern
grep -rn "beforeEach.*next" src/
grep -rn "beforeResolve.*next" src/
```

#### No other changes required

- `createRouter`, `createWebHashHistory`, `createWebHashHistory` — unchanged
- `useRoute()`, `useRouter()` — unchanged
- `RouteLocationNormalized`, `RouteRecordRaw`, `NavigationFailure` — unchanged
- `router.addRoute()`, `router.beforeEach()` — unchanged
- `<router-view>`, `<router-link>` — unchanged

### 12.4 vue-tsc 3

vue-tsc v3 is part of Vue Language Tools v3 (Volar). Key changes:

#### TypeScript requirement

vue-tsc 3 requires **TypeScript >= 5.0**. If your project uses `typescript: ^5.8.3` (as recommended), you are already compatible.

#### Potential new type errors

vue-tsc 3 may surface new TypeScript errors in `.vue` files due to improved type inference. Common cases:

1. **`ComponentCustomProperties` augmentations** — if your `shims-vue.d.ts` augments `@vue/runtime-core`, verify it still works. Known issue: [vuejs/language-tools#5464](https://github.com/vuejs/language-tools/issues/5464).

2. **Template type inference** — stricter checking in templates may flag previously undetected issues. Run `vue-tsc --noEmit` and fix any errors.

3. **`v-for` numeric keys** — vue-tsc 3.2+ automatically treats `number` keys as strings. If you relied on numeric key types in `v-for`, this may cause new errors.

#### Build script compatibility

The `vue-tsc` CLI interface is unchanged. Your existing scripts work as-is:

```json
{
  "build:types": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/types",
  "type-check": "vue-tsc --noEmit"
}
```

#### vite-plugin-checker

If you use `vite-plugin-checker` with `vueTsc: true`, verify it works with vue-tsc 3. If the dev server shows errors, update `vite-plugin-checker` to the latest version or temporarily disable the vue-tsc checker.

### 12.5 Migration Checklist

```
Phase 1 — Update dependencies
  [ ] Update vue, vue-router, vue-tsc, @vc-shell/* versions in package.json
  [ ] Run yarn install

Phase 2 — Type checking (vue-tsc 3)
  [ ] Run: npx vue-tsc --noEmit
  [ ] Fix any new TypeScript errors
  [ ] Run: yarn build:types (if applicable)

Phase 3 — Migrate deprecated API (Vue Router 5)
  [ ] Search for next() callback in navigation guards
  [ ] Rewrite to return-based style

Phase 4 — Verify
  [ ] Run dev server: yarn serve
  [ ] Test login/logout flow
  [ ] Test blade navigation
  [ ] Test route guards and redirects
  [ ] Run production build: yarn build
```

## Migrating to `defineAppModule`

### Overview

`createAppModule()` is now **deprecated**. Use `defineAppModule()` instead. The old function continues to work as an adapter but will be removed in a future major version.

### What changed

| Before                                                   | After                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| `createAppModule(pages, locales, templates)`             | `defineAppModule({ blades, locales, notificationTemplates })` |
| Positional arguments                                     | Named options object                                          |
| Mutates component objects (`isBlade`, `moduleUid`, etc.) | No mutation — metadata stored in BladeRegistry                |
| `moduleComponents` parameter (4th arg)                   | Removed — register components via direct import               |
| `moduleOptions` / `dependsOn` (5th arg)                  | Removed — unused                                              |

### Migration steps

**Step 1: Replace `createAppModule` with `defineAppModule`**

Before:

```ts
import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";

export default createAppModule(pages, locales);
```

After:

```ts
import { defineAppModule } from "@vc-shell/framework";
import * as blades from "./pages";
import * as locales from "./locales";

export default defineAppModule({
  blades,
  locales,
});
```

**Step 2: If you used `notificationTemplates` (3rd argument)**

Before:

```ts
export default createAppModule(pages, locales, notificationTemplates);
```

After:

```ts
export default defineAppModule({
  blades: pages,
  locales,
  notificationTemplates,
});
```

**Step 3: If you used `moduleComponents` (4th argument)**

This parameter has been removed. Register components via direct import instead of global registration. If you absolutely need global registration, use `app.component()` directly in your module's `install()` function.

### No action required

If you are using `createAppModule()` in external modules, **no immediate action is needed**. The function continues to work identically via the legacy adapter. Migration is recommended but not required until the next major version.

## Notifications System Redesign

### Overview

The notification system has been redesigned with a unified `NotificationStore`. All old APIs continue to work via deprecated wrappers but will be removed in a future major version.

### Quick Reference

| Before                                       | After                                                          |
| -------------------------------------------- | -------------------------------------------------------------- |
| `createAppModule(pages, locales, templates)` | `defineAppModule({ blades, locales, notifications: { ... } })` |
| `useNotifications(type)`                     | `useBladeNotifications({ types: [...] })`                      |
| `setNotificationHandler(fn)`                 | `onMessage` option in `useBladeNotifications`                  |
| `moduleNotifications` watch                  | `messages` computed from `useBladeNotifications`               |
| `notifyType` in `defineOptions` on blades    | Remove — use `useBladeNotifications` explicitly                |
| `notifyType` in `defineOptions` on templates | Remove — bind via module config `notifications`                |
| `hasUnreadNotifications` import              | `useNotificationStore().hasUnread`                             |

### Module Directory Structure

Notification templates should live in a dedicated `notifications/` directory at the module root level, alongside `pages/`, `composables/`, and `widgets/`:

```
my-module/
  components/          # Shared UI components (dashboard cards, etc.)
  composables/         # Business logic composables
  locales/             # i18n translations
  notifications/       # Notification template components
    MyDomainEvent.vue
    index.ts
  pages/               # Blade components
  widgets/             # External blade widgets
  index.ts             # Module entry point (defineAppModule)
```

> **Note:** Previously notification templates were placed inside `components/notifications/`. Move them to `notifications/` at the module root to match the established pattern for `widgets/`.

### Step 1: Module Registration

**Before:**

```ts
import * as notificationTemplates from "./components/notifications";
export default createAppModule(pages, locales, notificationTemplates);
```

**After:**

```ts
import MyEventTemplate from "./notifications/MyEventTemplate.vue";

export default defineAppModule({
  blades: pages,
  locales,
  notifications: {
    MyDomainEvent: {
      template: MyEventTemplate,
      toast: { mode: "auto" },
    },
    MyDangerousEvent: {
      template: MyDangerousTemplate,
      toast: { mode: "auto", severity: "warning" }, // 8s timeout instead of default 5s
    },
  },
});
```

**`toast` options:**

| Option          | Type                                           | Default           | Description                                                                              |
| --------------- | ---------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `mode`          | `"auto" \| "progress" \| "silent"`             | —                 | Toast display mode                                                                       |
| `severity`      | `"info" \| "warning" \| "error" \| "critical"` | `"info"`          | Controls toast timeout and type (`info`=5s, `warning`=8s, `error`/`critical`=persistent) |
| `timeout`       | `number`                                       | severity-based    | Override timeout (ms)                                                                    |
| `isComplete`    | `(msg) => boolean`                             | `msg.finished`    | For `progress` mode: when to complete                                                    |
| `completedType` | `(msg) => "success" \| "error"`                | `() => "success"` | For `progress` mode: toast type on completion                                            |

### Step 2: Remove `notifyType` from Blade `defineOptions`

**Before:**

```ts
defineOptions({
  name: "MyBlade",
  notifyType: "MyDomainEvent", // implicit subscription
});
```

**After:**

```ts
defineOptions({
  name: "MyBlade",
  // notifyType removed — use useBladeNotifications() if needed
});
```

### Step 3: Replace `useNotifications` in Blades

**Before:**

```ts
const { markAsRead, setNotificationHandler } = useNotifications("MyDomainEvent");

setNotificationHandler((message) => {
  if (message.title) {
    notification.success(message.title, {
      onClose() {
        markAsRead(message);
      },
    });
  }
});
```

**After:**

```ts
const { messages } = useBladeNotifications({
  types: ["MyDomainEvent"],
  onMessage: () => reloadData(),
});
// Toast and markAsRead are handled automatically by module config
```

### Step 4: Replace `moduleNotifications` Watch (Progress Pattern)

**Before:**

```ts
const { moduleNotifications, markAsRead } = useNotifications("MyProgressEvent");
const notificationId = ref();

watch(
  moduleNotifications,
  (newVal) => {
    newVal.forEach((message) => {
      if (!message.finished) {
        if (!notificationId.value) {
          notificationId.value = notification(message.title, { timeout: false });
        } else {
          notification.update(notificationId.value, { content: message.title });
        }
      } else {
        notification.update(notificationId.value, {
          timeout: 5000,
          type: "success",
          onClose() {
            markAsRead(message);
            notificationId.value = undefined;
          },
        });
      }
    });
  },
  { deep: true },
);
```

**After:**

```ts
// Module config handles the progress toast automatically:
// notifications: { MyProgressEvent: { toast: { mode: "progress" } } }

useBladeNotifications({
  types: ["MyProgressEvent"],
  filter: (msg) => msg.entityId === props.param,
  onMessage: (msg) => refreshData(msg),
});
```

### Step 5: Remove `notifyType` from Template Components

**Before:**

```vue
<script setup>
defineOptions({
  inheritAttrs: false,
  notifyType: "MyDomainEvent", // static property on constructor
});
</script>
```

**After:**

```vue
<script setup>
// notifyType removed — binding is in module config
defineProps<{ notification: PushNotification }>();
</script>
```

### Migration Order

Each step can be done independently per module. The module works at every stage:

1. **No changes needed** — deprecated wrappers handle everything
2. Replace `createAppModule` → `defineAppModule({ notifications })`
3. Remove `notifyType` from blade `defineOptions`
4. Replace `useNotifications` → `useBladeNotifications` in blades
5. Remove `notifyType` from template `defineOptions`
6. Move `components/notifications/` → `notifications/` at module root (matches `widgets/` pattern)

### Notification Template Props → Composable

Custom notification templates no longer receive `notification` as a prop via the renderer. Use the `useNotificationContext()` composable instead:

```diff
-const props = defineProps<{ notification: PushNotification }>();
-defineOptions({ inheritAttrs: false });
+const notificationRef = useNotificationContext();
+const notification = computed(() => notificationRef.value);
```

The composable returns a `ComputedRef<PushNotification>`. For extended types, use the generic: `useNotificationContext<IMyNotification>()`.

---

## Blade Navigation: `replaceWith` vs `coverWith`

The blade replacement API has been split into two distinct methods with clear semantics.

### What Changed

| Before                                     | After                | Behavior                                                                                                       |
| ------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `replaceWith(event)`                       | `replaceWith(event)` | **Changed:** Now truly replaces the blade — destroys old, creates new at same index with same `parentId`.      |
| _(no equivalent)_                          | `coverWith(event)`   | **New:** Old `replaceWith` behavior — hides current blade, opens new one on top. Closing reveals hidden blade. |
| `openBlade({ replaceCurrentBlade: true })` | _(unchanged)_        | Legacy adapter maps to `coverCurrentBlade` for backward compatibility.                                         |

### When to Use Which

**`replaceWith`** — Use when the blade should be truly replaced (e.g., create→edit transition after saving a new entity):

```typescript
const { replaceWith } = useBlade();

// After creating a new order, reopen the blade in edit mode
if (!props.param && order.value.id) {
  await replaceWith({
    name: "OrderDetails",
    param: order.value.id,
  });
}
```

**`coverWith`** — Use when you want to keep the old blade alive underneath (e.g., preview mode, sub-editing flow where closing returns to the previous state):

```typescript
const { coverWith } = useBlade();

// Open a preview blade on top — closing it returns to the edit blade
await coverWith({
  name: "OrderPreview",
  param: order.value.id,
});
```

### Migration Steps

1. **Audit existing `replaceWith` calls** — If the intent is a true replacement (create→edit, reload with new params), no changes needed — the new behavior is what you want.
2. **If you relied on the hidden blade staying alive** (e.g., `callParent` reaching the hidden blade's methods), change `replaceWith` → `coverWith`.
3. **Legacy `openBlade({ replaceCurrentBlade: true })`** — No changes needed, it continues to use the cover (hide+stack) behavior via the adapter.

## 13. Blade Props Simplification

VcBlade is now **context-aware** — it reads `expanded` and `closable` from the `BladeDescriptor` automatically when used inside blade navigation. Blade pages no longer need to declare boilerplate props/emits just to forward them to `<VcBlade>`.

### What Changed

| Before (deprecated)                                                             | After (new)                                                                 |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Declare `expanded`, `closable`, `param`, `options` in Props                     | Use `useBlade()` to access all of these                                     |
| Declare `close:blade`, `expand:blade`, `collapse:blade`, `parent:call` in Emits | Not needed — VcBlade handles close internally, `callParent()` replaces emit |
| Forward props: `:expanded="expanded"` `:closable="closable"`                    | Not needed — VcBlade reads from BladeDescriptor                             |
| Forward events: `@close="$emit('close:blade')"`                                 | Not needed — VcBlade calls `closeSelf()` internally                         |
| `emit("parent:call", { method: "reload" })`                                     | `callParent("reload")`                                                      |
| `emit("close:blade")`                                                           | `closeSelf()`                                                               |
| `props.param`                                                                   | `param.value` from `useBlade()`                                             |
| `props.options?.myField` (untyped)                                              | `options.value?.myField` from `useBlade<{ myField: string }>()` (typed)     |

### New Features

#### Typed Options

`useBlade()` now accepts a generic for typed access to blade options:

```typescript
interface MyOptions {
  productId: string;
  mode: "edit" | "create";
}
const { options } = useBlade<MyOptions>();
// options.value is MyOptions | undefined — no manual cast needed
```

#### Lifecycle Hooks

New `onActivated` / `onDeactivated` hooks fire when a blade gains or loses active (rightmost) status:

```typescript
const { onActivated, onDeactivated } = useBlade();

onActivated(() => {
  // Blade became active — refresh data, start polling
});

onDeactivated(() => {
  // Another blade opened on top — pause polling
});
```

> **Note:** These hooks fire on **transitions only**, not on initial mount. Use `onMounted` for initial-mount logic.

### Before / After Example

**Before (~55 lines of boilerplate):**

```vue
<template>
  <VcBlade
    :title="bladeTitle"
    width="50%"
    :expanded="expanded"
    :closable="closable"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcDataTable ... />
  </VcBlade>
</template>

<script lang="ts" setup>
import { IParentCallArgs, useBlade } from "@vc-shell/framework";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: { sellerProduct?: SellerProduct };
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "collapse:blade"): void;
  (event: "expand:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});
const emit = defineEmits<Emits>();
const { openBlade, closeSelf, callParent } = useBlade();

const reload = async () => {
  await loadOffers({ ... });
  emit("parent:call", { method: "reload" });
};
</script>
```

**After (~35 lines, no boilerplate):**

```vue
<template>
  <VcBlade
    :title="bladeTitle"
    width="50%"
    :toolbar-items="bladeToolbar"
  >
    <VcDataTable ... />
  </VcBlade>
</template>

<script lang="ts" setup>
import { useBlade } from "@vc-shell/framework";

const { param, options, openBlade, closeSelf, callParent } =
  useBlade<{ sellerProduct?: SellerProduct }>();

const reload = async () => {
  await loadOffers({ ... });
  callParent("reload");
};
</script>
```

### Migration Steps

1. **Replace imports**: Remove `IParentCallArgs` from imports (no longer needed).
2. **Remove Props boilerplate**: Remove `expanded`, `closable` from your Props interface. Remove `param` and `options` too — get them from `useBlade()`.
3. **Remove Emits boilerplate**: Remove the entire `Emits` interface and `defineEmits()`.
4. **Remove `withDefaults`**: Remove `withDefaults(defineProps<Props>(), { expanded: true, closable: true })` — these defaults are handled by VcBlade internally.
5. **Use `useBlade()`**: Destructure what you need: `const { param, options, openBlade, closeSelf, callParent } = useBlade<YourOptionsType>()`.
6. **Update template**: Remove `:expanded`, `:closable`, `@close`, `@expand`, `@collapse` from `<VcBlade>`.
7. **Replace emits in script**: `emit("parent:call", { method: "X" })` → `callParent("X")`, `emit("close:blade")` → `closeSelf()`.
8. **Replace `props.param`** → `param.value` (it's a `ComputedRef`).

### Backward Compatibility

- **Old code continues to work** — VcBladeSlot still passes all props and listens to all events. Migration is optional until the next major version.
- **Partial migration is safe** — You can migrate individual blade pages one at a time. Old-style and new-style pages coexist in the same app.
- A dev-mode `console.warn` appears when VcBlade detects `@close` listener inside blade navigation context, guiding developers to remove it.

### Automated Migration

```bash
npx @vc-shell/codemod --transform blade-props-simplification
```

Or run all transforms: `npx @vc-shell/codemod`

---

## 14. Import Restructuring

The framework package now exposes multiple entry points. This allows consuming applications to import only what they need, reducing bundle size and clarifying which parts of the framework are optional.

### 14.1 Entry Points

| Entry point                      | Contents                                                              | Usage                                             |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `@vc-shell/framework`            | Full framework: core + ui + shell + modules                           | Default — use in apps                             |
| `@vc-shell/framework/ui`         | Standalone UI kit: atoms, molecules, organisms — no core dependencies | Use in packages that only need UI components      |
| `@vc-shell/framework/ai-agent`   | AI agent plugin (opt-in)                                              | Import only when enabling AI agent features       |
| `@vc-shell/framework/extensions` | Extension points system (opt-in)                                      | Import only when building extension-aware modules |

```typescript
// Full framework (default)
import { useBlade, VcTable, VcBlade } from "@vc-shell/framework";

// UI-only (no core services, no blade navigation)
import { VcButton, VcInput, VcTable } from "@vc-shell/framework/ui";

// AI agent plugin (opt-in)
import { useAiAgent } from "@vc-shell/framework/ai-agent";

// Extension points (opt-in)
import { extensionsHelper } from "@vc-shell/framework/extensions";
```

### 14.2 Removed Symbols

The following symbols have been removed. Use the listed alternatives instead:

| Removed symbol                         | Alternative                                   |
| -------------------------------------- | --------------------------------------------- |
| `GenericDropdown`                      | `VcDropdown`                                  |
| `navigationViewLocation`               | `NavigationViewLocationKey`                   |
| `BladeInstance`                        | `BladeInstanceKey`                            |
| `NotificationTemplatesSymbol`          | `NotificationTemplatesKey`                    |
| `BLADE_BACK_BUTTON`                    | `BladeBackButtonKey`                          |
| `TOOLBAR_SERVICE`                      | `ToolbarServiceKey`                           |
| `EMBEDDED_MODE`                        | `EmbeddedModeKey`                             |
| `_warnStringKey` / `_warnedStringKeys` | Removed — test-only internals, no replacement |

**Before:**

```typescript
import { BladeInstance, TOOLBAR_SERVICE, EMBEDDED_MODE } from "@vc-shell/framework";
```

**After:**

```typescript
import { BladeInstanceKey, ToolbarServiceKey, EmbeddedModeKey } from "@vc-shell/framework";
```

### 14.3 String-Key Inject Removal

String-based injection keys (`inject("isMobile")`, `inject("isDesktop")`, etc.) are no longer provided by the framework. Use typed injection keys instead.

**Before:**

```typescript
const isMobile = inject("isMobile");
const isDesktop = inject("isDesktop");
```

**After:**

```typescript
import { inject } from "vue";
import { IsMobileKey, IsDesktopKey } from "@vc-shell/framework";

const isMobile = inject(IsMobileKey);
const isDesktop = inject(IsDesktopKey);
```

All injection keys follow the `*Key` naming convention and are exported from `@vc-shell/framework`. The full list of available keys is in `framework/injection-keys.ts`.

### 14.4 Directory Structure Changes

The `shared/` directory has been dissolved. Its contents have been reorganized into purpose-specific directories:

| Old location (`shared/`)                       | New location                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `shared/components/blade-navigation/`          | `shell/_internal/blade-nav/` (rendering) + `core/blade-navigation/` (logic) |
| `shared/components/notifications/`             | `shell/_internal/notifications/` (renderer) + `core/notifications/` (logic) |
| `shared/components/popup/`                     | `shell/_internal/popup/`                                                    |
| `shared/components/` (auth, settings, sidebar) | `shell/auth/`, `shell/components/`, `shell/dashboard/`                      |
| `shared/composables/` (UI composables)         | `ui/composables/`                                                           |
| `shared/composables/` (logic composables)      | `core/composables/`                                                         |
| `shared/modules/`                              | `modules/` (built-in modules: assets, assets-manager)                       |

**New directory layout:**

```
framework/
  core/         # API clients, composables, plugins, services, types, blade-navigation logic
  ui/           # Atomic Design components (atoms → molecules → organisms) + UI composables
  shell/        # App chrome: sidebar, auth pages, dashboard, settings
  shell/_internal/  # Internal rendering: blade-nav, notifications, popup
  modules/      # Built-in modules (assets, assets-manager)
  assets/       # SCSS styles and static assets
```

> **Note:** These directory changes are internal to the framework package. If you import exclusively from `@vc-shell/framework` (the package entry point) rather than from deep paths inside the package, no changes are required.

---

## Additional Migration Guides

The following guides cover deprecated API cleanup. See `migration/README.md` for the full index:

- [Guide 23: Composable Return Types](./migration/23-composable-return-types.md)
- [Guide 24: VcBanner Variants](./migration/24-vc-banner-variants.md)
- [Guide 25: VcSwitch Tooltip Prop](./migration/25-vc-switch-tooltip.md)
- [Guide 26: VcIcon Container Prop](./migration/26-vc-icon-container.md)
- [Guide 27: Menu Group Config](./migration/27-menu-group-config.md)
- [Guide 28: Shared Components](./migration/28-shared-components.md)
- [Guide 29: VcTable → VcDataTable](./migration/29-vc-table-to-data-table.md)
- [Guide 30: Type Shims → Globals](./migration/30-shims-to-globals.md)
- [Guide 31: useDataTableSort](./migration/31-use-data-table-sort.md)
- [Guide 32: useAssetsManager](./migration/32-use-assets-manager.md)
- [Guide 34: App Hub Rename](./migration/34-app-hub-rename.md)
- [Guide 37: useBladeForm](./migration/37-use-blade-form.md)
- [Guide 38: Dynamic Properties Refactor](./migration/38-dynamic-properties-refactor.md)

---

## Form & Dynamic Properties

### `useBladeForm` — Unified Form State Management

The new `useBladeForm` composable replaces the manual combination of `useForm` (vee-validate), `useModificationTracker`, `useBeforeUnload`, and `onBeforeClose` that every detail blade previously wired up by hand. A single call provides `canSave`, `isModified`, `setBaseline()`, and `revert()`, while VcBlade auto-detects modification state via provide/inject — no `:modified` prop needed.

See [Guide 37: useBladeForm](./migration/37-use-blade-form.md) for before/after examples at three complexity levels and a step-by-step checklist.

### `useDynamicProperties` — Strategy-Based Refactor

The `useDynamicProperties` composable has been refactored from a monolithic function with five generic type parameters and class constructors to a clean options-based API. Factory classes (`PropertyValueFactory`, `PropertyDictionaryItemFactory`) are no longer needed — delete them. A new `cleanEmptyValues()` helper is returned for stripping empty property values before save.

**This is a breaking change.** The old positional-argument signature is removed.

See [Guide 38: Dynamic Properties Refactor](./migration/38-dynamic-properties-refactor.md) for migration instructions and the automated codemod.

## 40. Remove Global Component Registration

The framework no longer registers `Vc*` components and directives globally. All components must be explicitly imported from `@vc-shell/framework/ui`.

**Automated:** `npx @vc-shell/migrate --transform remove-global-components`

See [migration/40-remove-global-components.md](./migration/40-remove-global-components.md) for details.

## SignalR Broadcast Filter

The `signalR: { creator }` option and `updateSignalRCreatorSymbol` injection key have been removed. The SignalR plugin now always listens to both `Send` and `SendSystemEvents` channels.

If your app filtered broadcast notifications by creator (e.g., vendor-portal filtering by seller ID), replace:

```diff
-import { updateSignalRCreatorSymbol } from "@vc-shell/framework";
-const updateSignalRCreator = inject(updateSignalRCreatorSymbol);
-updateSignalRCreator?.(sellerId);
+import { useBroadcastFilter } from "@vc-shell/framework";
+const { setBroadcastFilter } = useBroadcastFilter();
+setBroadcastFilter((msg) => msg.creator === sellerId);
```

See [migration/42-broadcast-filter.md](./migration/42-broadcast-filter.md) for details.
