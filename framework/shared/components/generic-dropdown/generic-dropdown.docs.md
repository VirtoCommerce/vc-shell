# Generic Dropdown

A reusable dropdown wrapper component with generic typing, built on top of `VcDropdown`. Provides a simplified API for common dropdown patterns with typed items.

## Overview

`GenericDropdown` wraps the `VcDropdown` molecule and exposes the same slot-based customization while adding a `disabled` guard and a typed generic item interface. It is designed for use in the shared layer where dropdowns need consistent behavior without importing `VcDropdown` directly.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `opened` | `boolean` | `false` | Controls the open state (v-model pattern via `update:opened`) |
| `disabled` | `boolean` | `false` | When true, prevents opening and ignores item clicks |
| `items` | `T[]` | `[]` | Array of dropdown items (generic type) |
| `emptyText` | `string` | -- | Text shown when items array is empty |
| `itemText` | `(item: T) => string` | -- | Function to extract display text from an item |
| `isItemActive` | `(item: T) => boolean` | -- | Function to determine if an item is highlighted as active |
| `floating` | `boolean` | `false` | Use floating-ui positioning (for dropdowns in scrollable containers) |
| `placement` | `string` | `"bottom"` | Floating placement: `bottom`, `bottom-end`, `bottom-start`, `top`, etc. |
| `variant` | `"default" \| "secondary"` | `"default"` | Visual style variant |
| `offset` | `{ mainAxis?: number; crossAxis?: number }` | `{ 0, 0 }` | Floating offset from the trigger |
| `maxHeight` | `number \| string` | `300` | Maximum height of the dropdown list |

## Events

| Event | Payload | Description |
|---|---|---|
| `item-click` | `T` | Emitted when an item is clicked (blocked when disabled) |
| `update:opened` | `boolean` | Emitted to sync the open state |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `trigger` | `{ isActive, toggle, open, close }` | Custom trigger element |
| `items-container` | `{ items: T[], close }` | Full control over the items list rendering |
| `item` | `{ item: T, click: () => void }` | Custom rendering for each item |
| `empty` | -- | Custom empty state |

## Usage

```vue
<GenericDropdown
  v-model:opened="isOpen"
  :items="options"
  :item-text="(opt) => opt.label"
  :is-item-active="(opt) => opt.id === selected"
  @item-click="onSelect"
>
  <template #trigger="{ toggle }">
    <VcButton @click="toggle">Select Option</VcButton>
  </template>

  <template #item="{ item, click }">
    <div class="tw-p-2" @click="click">
      <VcIcon :icon="item.icon" />
      {{ item.label }}
    </div>
  </template>
</GenericDropdown>
```

## Tips

- The `disabled` prop blocks both opening the dropdown and clicking items -- no need for additional guards.
- Use the `floating` prop when the dropdown is inside a scrollable container to prevent clipping.
- The generic type `T` is inferred from the `items` prop -- TypeScript will enforce consistent types across `items`, `itemText`, `isItemActive`, and the `item-click` event.
- For simple use cases, omit custom slots -- the component will use `VcDropdown`'s default rendering with `itemText`.

## Related

- `framework/ui/components/molecules/vc-dropdown/` -- the underlying `VcDropdown` molecule
- `framework/shared/components/app-switcher/` -- uses dropdown patterns for app selection
