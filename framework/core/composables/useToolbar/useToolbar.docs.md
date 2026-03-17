# useToolbar

Manages toolbar buttons for blades. Automatically scopes items to the current blade and cleans up on unmount.

## When to Use

- When adding action buttons (Save, Delete, Refresh) to a blade's toolbar
- When dynamically enabling/disabling or updating toolbar buttons
- When you need to check if a specific toolbar item is already registered
- Do NOT use for global actions unrelated to blades

## Basic Usage

```typescript
import { useToolbar } from "@vc-shell/framework";

const { registerToolbarItem } = useToolbar();

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => saveData(),
});
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options` | `UseToolbarOptions` | No | Configuration options |

#### UseToolbarOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoCleanup` | `boolean` | `true` | Clear all toolbar items for the current blade on component unmount |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `registerToolbarItem` | `(item: IToolbarItem, targetBladeId?) => void` | Register a toolbar button (scoped to current blade by default) |
| `unregisterToolbarItem` | `(id: string, targetBladeId?) => void` | Remove a toolbar button by ID |
| `updateToolbarItem` | `(id: string, partial: Partial<IToolbarItem>, targetBladeId?) => void` | Update properties of an existing toolbar button |
| `getToolbarItems` | `(targetBladeId?) => IToolbarItem[]` | Get all toolbar items for a blade |
| `clearBladeToolbarItems` | `(targetBladeId?) => void` | Remove all toolbar items for a blade |
| `isToolbarItemRegistered` | `(id: string) => boolean` | Check if a toolbar item with the given ID exists |
| `registeredToolbarItems` | `IToolbarRegistration[]` | All registered toolbar items across all blades |

### IToolbarItem

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `title` | `string` | No | Button label |
| `icon` | `string` | No | Icon class (e.g., `"fas fa-save"`) |
| `clickHandler` | `() => void` | No | Click callback |
| `disabled` | `boolean` | No | Whether the button is disabled |
| `priority` | `number` | No | Sort order (higher = displayed first, default 0) |
| `bladeId` | `string` | No | Target blade ID (auto-resolved from context) |

## Common Patterns

### Registering toolbar buttons in a blade

```typescript
<script setup lang="ts">
import { useToolbar, useAsync } from "@vc-shell/framework";

const { registerToolbarItem, updateToolbarItem } = useToolbar();
const { loading, action: save } = useAsync(async () => { /* ... */ });

registerToolbarItem({
  id: "save",
  title: "Save",
  icon: "fas fa-save",
  clickHandler: () => save(),
  disabled: false,
  priority: 100,
});

// Disable while saving
watch(loading, (isLoading) => {
  updateToolbarItem("save", { disabled: isLoading });
});
</script>
```

### Disabling auto-cleanup

```typescript
const { registerToolbarItem } = useToolbar({ autoCleanup: false });
// Items persist after component unmount -- useful for shared toolbar items
```

## Notes

- All methods default to the current blade's ID. Pass `targetBladeId` to manage another blade's toolbar.
- With `autoCleanup: true` (default), all items for the current blade are cleared in `onBeforeUnmount`.
- If no toolbar service is provided via `inject`, a global singleton is created as fallback.

## Related

- [useBlade](../useBlade/) -- blade context that toolbar items are scoped to
- [usePermissions](../usePermissions/) -- conditionally register toolbar items based on permissions
