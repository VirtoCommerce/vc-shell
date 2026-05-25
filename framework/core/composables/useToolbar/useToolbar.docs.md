---
title: useToolbar
category: composables
group: services
---

!!! tip "Long page"
Use the section headings to jump directly to what you need: [Primary pattern: array + toolbar-items](#primary-pattern-array--toolbar-items), [When to reach for useToolbar](#when-to-reach-for-usetoolbar), [Quick Start](#quick-start), or [API Reference](#api-reference).

# useToolbar

`useToolbar` is the framework's **advanced** API for blade toolbar registration. The everyday way to give a blade a toolbar is the `:toolbar-items` prop on `VcBlade` with a plain `IBladeToolbar[]` array — there is no need to call `useToolbar` in the typical case. Reach for `useToolbar` when toolbar items must appear after mount, when a blade needs to mutate another blade's toolbar, or when toolbar composition is driven from a non-blade owner.

## Primary pattern: array + toolbar-items

In a regular blade, declare the toolbar as `ref<IBladeToolbar[]>([...])` and bind it. Reactive fields (`isVisible`, `disabled`, computed `title`) drive visibility and state without any `watch` plumbing. The framework filters items by `permissions` and `isVisible` before render.

```vue title="orders-details.vue"
<script setup lang="ts">
import { computed, ref } from "vue";
import { useAsync, usePermissions, VcBlade, type IBladeToolbar } from "@vc-shell/framework";

const { hasAccess } = usePermissions();
const { loading: saving, action: save } = useAsync(async () => {
  await saveOrder(order.value);
});

const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: "Save",
    icon: "lucide-save",
    disabled: computed(() => saving.value),
    isVisible: computed(() => isDirty.value && hasAccess("order:update")),
    clickHandler: () => save(),
  },
  {
    id: "delete",
    title: "Delete",
    icon: "lucide-trash",
    isVisible: computed(() => hasAccess(["order:delete", "order:manage"])),
    clickHandler: () => confirmDelete(),
  },
]);
</script>

<template>
  <VcBlade :toolbar-items="bladeToolbar" />
</template>
```

Use this pattern for every blade unless you have a concrete reason to register imperatively. `IBladeToolbar` is exported from `@vc-shell/framework`; see [Core types](../../types/) for the full shape. Permission gating goes through `isVisible: computed(() => hasAccess(...))` so it stays reactive when the user's permission set changes.

## When to reach for useToolbar

`useToolbar` becomes the right tool only in these cases:

- **Dynamic registration after mount.** A toolbar item is decided after the blade is already on screen — for example, a button that appears after a long-running operation completes and never has a representation in the initial array.
- **Cross-blade toolbar mutation.** Code in blade A needs to add or change a button on blade B. Pass `targetBladeId` to the imperative methods.
- **Non-blade owner.** A composable or service that doesn't live inside a blade `<script setup>` but still needs to contribute toolbar items.
- **Wildcard / global items.** Toolbar items that appear on every blade through the `*` wildcard bladeId.

In all other cases, declare the array and bind `:toolbar-items`. The imperative API exists to cover edge cases, not to replace the array.

## Quick Start

Imperative registration from inside a blade, scoped to the current blade context:

```typescript title="<script setup>"
import { useToolbar } from "@vc-shell/framework";

const { registerToolbarItem } = useToolbar();

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => saveData(),
});
```

The button appears in the current blade's toolbar immediately. When the component unmounts, the button is automatically removed (controlled by `autoCleanup`).

## Updating button state dynamically

Use `updateToolbarItem` to change any property of a registered button without re-registering it. This is the imperative analogue of binding a reactive `disabled` value in the array pattern.

```typescript
// pseudo-code: replace OrderClient with your generated API client
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

In the array pattern, the same outcome reads as `disabled: computed(() => loading.value)` on the entry — no `watch` needed. Use `updateToolbarItem` only when the item has been registered imperatively and there is no array reference to mutate.

You can update any subset of `IToolbarItem` properties:

```typescript
// Change the icon and title after a state transition
updateToolbarItem("toggle-publish", {
  title: isPublished.value ? "Unpublish" : "Publish",
  icon: isPublished.value ? "fas fa-eye-slash" : "fas fa-eye",
});
```

## Visibility and permissions

Both reactive visibility and permission gating work the same way whether the item lives in an array or is registered imperatively — the framework filters by `isVisible` and `permissions` before render in either path.

### Reactive visibility with `isVisible`

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

Set `permissions` on the item; the renderer hides it when the user lacks the listed permission(s) (OR logic on arrays):

```typescript
registerToolbarItem({
  id: "delete",
  title: "Delete",
  icon: "fas fa-trash",
  clickHandler: () => deleteOrder(),
  permissions: ["order:delete", "order:manage"],
});
```

Avoid wrapping `registerToolbarItem` in an `if (hasAccess(...))` check unless you specifically want to skip side effects of the registration; the `permissions` field already gates rendering.

## Cross-blade toolbar management

All methods accept an optional `targetBladeId` second argument. Pass it to register, update, or clear toolbar items on a blade other than the current one:

```typescript
// Register a button on a specific child blade
registerToolbarItem({ id: "child-action", title: "Action", clickHandler: () => {} }, "ChildBlade");

// Clear another blade's toolbar
clearBladeToolbarItems("ChildBlade");
```

Pass `"*"` as the bladeId to register a global item that appears on every blade.

## Auto-cleanup control

By default, items registered through `useToolbar()` inside a component setup are cleared when that component unmounts (`autoCleanup: true`). Disable this for items that should persist beyond the registering component:

```typescript
const { registerToolbarItem } = useToolbar({ autoCleanup: false });

registerToolbarItem({
  id: "global-help",
  title: "Help",
  icon: "fas fa-question-circle",
  clickHandler: () => openHelp(),
});
```

Use `autoCleanup: false` for shared toolbar items registered outside a blade lifecycle (for example, from a module's bootstrap).

## Recipes

### Dynamic registration after a non-blade action

`useToolbar` shines when a button is decided by a non-blade flow — for example, after a long-running export completes, expose a "Download result" button on the originating blade:

```ts
// pseudo-code: replace ExportClient with your generated API client
import { useToolbar, useBlade } from "@vc-shell/framework";

const { registerToolbarItem, unregisterToolbarItem } = useToolbar();
const { id: bladeId } = useBlade();

async function startExport() {
  const job = await startServerExport();
  await waitForCompletion(job.id);

  registerToolbarItem(
    {
      id: `download-${job.id}`,
      title: "Download CSV",
      icon: "lucide-download",
      clickHandler: () => downloadResult(job.id),
    },
    bladeId.value,
  );
}
```

### Visual separator between button groups

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

## Common mistakes

### Reaching for `useToolbar` before considering the array pattern

```typescript
// Avoid in everyday blades — preferred pattern is the array + :toolbar-items
const { registerToolbarItem } = useToolbar();
registerToolbarItem({ id: "save", ... });

// Preferred: declarative array bound to VcBlade
const bladeToolbar = ref<IBladeToolbar[]>([{ id: "save", ... }]);
// <VcBlade :toolbar-items="bladeToolbar" />
```

The array form is shorter, reactive without `watch`/`updateToolbarItem` plumbing, and easier to test.

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
// Wrong -- duplicates the entry on each loading state change
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

### Using `useToolbar` outside a component setup

```typescript
// Wrong -- no component instance, autoCleanup will not work
function helperFunction() {
  const { registerToolbarItem } = useToolbar();
  registerToolbarItem({ id: "test", title: "Test" });
}

// Correct -- call in <script setup> or within setup(), or pass autoCleanup: false
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

`IToolbarItem` is the shape consumed by `ToolbarService`. The blade-level array binding uses `IBladeToolbar` (see [Core types](../../types/)), a near-identical shape that the framework normalizes into `IToolbarItem` before render.

## Related

- [useBlade](../useBlade/) -- blade context that toolbar items are scoped to
- [usePermissions](../usePermissions/) -- conditionally register toolbar items based on permissions
- [useAsync](../useAsync/) -- wraps async operations with loading state for disabling buttons
- `IBladeToolbar` in [Core types](../../types/) — the shape used by the `:toolbar-items` array binding
