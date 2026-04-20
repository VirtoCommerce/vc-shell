# useToolbar

Manages toolbar buttons for blades. Each blade in the application has its own toolbar area at the top of the blade header. `useToolbar` provides a scoped API to register, update, and remove buttons within that toolbar. It automatically resolves the current blade context and cleans up registered items when the component unmounts.

## When to Use

- Add action buttons (Save, Delete, Refresh, Export) to a blade's toolbar header
- Dynamically update button state (disabled, visible, icon) in response to loading or form changes
- When NOT to use: for global app-bar actions -- use `useAppBarWidget`; for navigation links -- use `useMenuService`

## Quick Start

```typescript
<script setup lang="ts">
import { useToolbar } from "@vc-shell/framework";

const { registerToolbarItem } = useToolbar();

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => saveData(),
});
</script>
```

The button appears in the current blade's toolbar immediately. When the component unmounts, the button is automatically removed.

## Registering Toolbar Buttons

Every toolbar button requires a unique `id`. The remaining properties control appearance, behavior, and ordering.

```typescript
<script setup lang="ts">
import { useToolbar } from "@vc-shell/framework";

const { registerToolbarItem } = useToolbar();

// Primary action — highest priority, appears first
registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  priority: 100,
});

// Secondary action — lower priority, appears after Save
registerToolbarItem({
  id: "refresh",
  title: "Refresh",
  icon: "fas fa-sync",
  clickHandler: () => refresh(),
  priority: 50,
});

// Destructive action with permission gate
registerToolbarItem({
  id: "delete",
  title: "Delete",
  icon: "fas fa-trash",
  clickHandler: () => confirmDelete(),
  priority: 10,
  permissions: "order:delete",
});
</script>
```

> **Note:** The `priority` field controls display order. Higher values appear first (leftmost). The default is `0`.

## Updating Button State Dynamically

Use `updateToolbarItem` to change any property of a registered button without re-registering it. This is the recommended pattern for toggling disabled state during async operations.

```typescript
<script setup lang="ts">
import { watch } from "vue";
import { useToolbar, useAsync } from "@vc-shell/framework";

const { registerToolbarItem, updateToolbarItem } = useToolbar();

const { loading, action: save } = useAsync(async () => {
  const client = await getApiClient();
  await client.saveOrder(order.value);
});

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  priority: 100,
});

// Disable the Save button while the request is in-flight
watch(loading, (isLoading) => {
  updateToolbarItem("save", { disabled: isLoading });
});
</script>
```

You can update any subset of `IToolbarItem` properties:

```typescript
// Change the icon and title after a state transition
updateToolbarItem("toggle-publish", {
  title: isPublished.value ? "Unpublish" : "Publish",
  icon: isPublished.value ? "fas fa-eye-slash" : "fas fa-eye",
});
```

## Visibility and Permissions

Toolbar items support both reactive visibility and permission-based access control.

### Reactive visibility with `isVisible`

The `isVisible` property accepts a boolean, a `Ref<boolean>`, a `ComputedRef<boolean>`, or a function:

```typescript
import { computed } from "vue";

const hasChanges = computed(() => form.isDirty);

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  isVisible: hasChanges, // button only appears when the form is dirty
});
```

### Permission-based registration

Use `usePermissions` alongside `useToolbar` to conditionally register buttons:

```typescript
import { useToolbar, usePermissions } from "@vc-shell/framework";

const { registerToolbarItem } = useToolbar();
const { hasAccess } = usePermissions();

if (hasAccess("order:delete")) {
  registerToolbarItem({
    id: "delete",
    title: "Delete",
    icon: "fas fa-trash",
    clickHandler: () => deleteOrder(),
  });
}
```

Alternatively, set the `permissions` property on the item itself. The toolbar renderer checks this before displaying the button:

```typescript
registerToolbarItem({
  id: "delete",
  title: "Delete",
  icon: "fas fa-trash",
  clickHandler: () => deleteOrder(),
  permissions: ["order:delete"],
});
```

## Cross-Blade Toolbar Management

By default, all methods operate on the current blade. Pass an explicit `targetBladeId` to manage another blade's toolbar:

```typescript
// Register a button on a specific child blade
registerToolbarItem({ id: "child-action", title: "Action", clickHandler: () => {} }, "ChildBlade");

// Clear another blade's toolbar
clearBladeToolbarItems("ChildBlade");
```

## Auto-Cleanup Control

By default, all toolbar items registered by a component are removed when that component unmounts (`autoCleanup: true`). Disable this for shared toolbar items that should persist:

```typescript
const { registerToolbarItem } = useToolbar({ autoCleanup: false });

// These items survive the component's unmount cycle
registerToolbarItem({
  id: "global-help",
  title: "Help",
  icon: "fas fa-question-circle",
  clickHandler: () => openHelp(),
});
```

## Recipes

### Complete Blade with Save / Delete / Refresh

```typescript
<script setup lang="ts">
import { watch } from "vue";
import { useToolbar, useAsync, usePermissions, useApiClient } from "@vc-shell/framework";
import { OrderClient } from "@api/orders";

const { registerToolbarItem, updateToolbarItem } = useToolbar();
const { hasAccess } = usePermissions();
const { getApiClient } = useApiClient(OrderClient);

const { loading: saving, action: save } = useAsync(async () => {
  const client = await getApiClient();
  await client.updateOrder(order.value);
});

const { loading: refreshing, action: refresh } = useAsync(async () => {
  const client = await getApiClient();
  order.value = await client.getOrderById(props.param);
});

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  priority: 100,
});

registerToolbarItem({
  id: "refresh",
  title: "Refresh",
  icon: "fas fa-sync",
  clickHandler: () => refresh(),
  priority: 50,
});

if (hasAccess("order:delete")) {
  registerToolbarItem({
    id: "delete",
    title: "Delete",
    icon: "fas fa-trash",
    clickHandler: () => confirmDelete(),
    priority: 10,
  });
}

// Disable all buttons while any operation is running
watch([saving, refreshing], ([s, r]) => {
  const busy = s || r;
  updateToolbarItem("save", { disabled: busy });
  updateToolbarItem("refresh", { disabled: busy });
});
</script>
```

### Visual Separator Between Button Groups

Use the `separator` property to add a vertical divider:

```typescript
registerToolbarItem({
  id: "export",
  title: "Export",
  icon: "fas fa-download",
  clickHandler: () => exportData(),
  separator: "left", // adds a divider to the left of this button
  priority: 20,
});
```

## Common Mistakes

### Forgetting the `id` property

```typescript
// Wrong -- id is required, registration silently fails without it
registerToolbarItem({
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
});

// Correct
registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
});
```

### Re-registering instead of updating

```typescript
// Wrong -- creates duplicate entries on each loading state change
watch(loading, (isLoading) => {
  registerToolbarItem({
    id: "save",
    title: "Save",
    disabled: isLoading,
    clickHandler: () => save(),
  });
});

// Correct -- update the existing registration
watch(loading, (isLoading) => {
  updateToolbarItem("save", { disabled: isLoading });
});
```

### Using useToolbar outside a component setup

```typescript
// Wrong -- no component instance, autoCleanup will not work
function helperFunction() {
  const { registerToolbarItem } = useToolbar();
  registerToolbarItem({ id: "test", title: "Test" });
}

// Correct -- call in <script setup> or within setup()
```

## API Reference

### Parameters

| Parameter | Type                | Required | Default | Description           |
| --------- | ------------------- | -------- | ------- | --------------------- |
| `options` | `UseToolbarOptions` | No       | `{}`    | Configuration options |

#### UseToolbarOptions

| Option        | Type      | Default | Description                                                        |
| ------------- | --------- | ------- | ------------------------------------------------------------------ |
| `autoCleanup` | `boolean` | `true`  | Clear all toolbar items for the current blade on component unmount |

### Returns: `UseToolbarReturn`

| Property                  | Type                                                                           | Description                                                    |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `registerToolbarItem`     | `(item: IToolbarItem, targetBladeId?: string) => void`                         | Register a toolbar button (scoped to current blade by default) |
| `unregisterToolbarItem`   | `(id: string, targetBladeId?: string) => void`                                 | Remove a toolbar button by ID                                  |
| `updateToolbarItem`       | `(id: string, partial: Partial<IToolbarItem>, targetBladeId?: string) => void` | Update properties of an existing toolbar button                |
| `getToolbarItems`         | `(targetBladeId?: string) => IToolbarItem[]`                                   | Get all toolbar items for a blade                              |
| `clearBladeToolbarItems`  | `(targetBladeId?: string) => void`                                             | Remove all toolbar items for a blade                           |
| `isToolbarItemRegistered` | `(id: string) => boolean`                                                      | Check if a toolbar item with the given ID exists               |
| `registeredToolbarItems`  | `IToolbarRegistration[]`                                                       | All registered toolbar items across all blades                 |

### IToolbarItem

| Property       | Type                                                                       | Required | Description                                                    |
| -------------- | -------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `id`           | `string`                                                                   | Yes      | Unique identifier for the button                               |
| `title`        | `string \| Ref<string> \| ComputedRef<string>`                             | No       | Button label (supports reactive values)                        |
| `icon`         | `string \| (() => string)`                                                 | No       | Icon class (e.g., `"fas fa-save"`) or a function returning one |
| `clickHandler` | `(app?) => void`                                                           | No       | Click callback                                                 |
| `disabled`     | `boolean \| ComputedRef<boolean>`                                          | No       | Whether the button is disabled                                 |
| `isVisible`    | `boolean \| Ref<boolean> \| ComputedRef<boolean> \| ((blade?) => boolean)` | No       | Controls button visibility                                     |
| `priority`     | `number`                                                                   | No       | Sort order (higher = displayed first, default `0`)             |
| `separator`    | `"left" \| "right" \| "both"`                                              | No       | Adds a visual divider next to the button                       |
| `permissions`  | `string \| string[]`                                                       | No       | Required permission(s) to display the button                   |
| `bladeId`      | `string`                                                                   | No       | Target blade ID (auto-resolved from context)                   |

## Related

- [useBlade](../useBlade/) -- blade context that toolbar items are scoped to
- [usePermissions](../usePermissions/) -- conditionally register toolbar items based on permissions
- [useAsync](../useAsync/) -- wraps async operations with loading state for disabling buttons
