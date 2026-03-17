# VcDropdown

Headless, accessible dropdown primitive for building menus and listboxes with floating positioning, keyboard navigation, and flexible slot-based rendering.

## When to Use

- Contextual action menus (right-click style, "more actions" button)
- Compact option pickers and workspace/context switchers
- Any trigger + floating list pattern with custom item rendering
- When NOT to use: for form field selection, prefer `VcSelect`; for rich panel content with header/footer, prefer `VcDropdownPanel`

## Basic Usage

```vue
<template>
  <VcDropdown
    v-model="isOpen"
    :items="actions"
    floating
    close-on-select
    @item-click="onAction"
  >
    <template #trigger="{ toggle }">
      <VcButton @click="toggle">Actions</VcButton>
    </template>
    <template #item="{ item, click }">
      <button @click="click">{{ item.title }}</button>
    </template>
  </VcDropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcDropdown, VcButton } from "@vc-shell/framework";

const isOpen = ref(false);
const actions = [
  { id: "edit", title: "Edit" },
  { id: "delete", title: "Delete" },
];

function onAction(item: { id: string; title: string }) {
  console.log("Selected:", item.id);
}
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls open/closed state (v-model) |
| `items` | `T[]` | `[]` | Items to render |
| `itemText` | `(item: T) => string` | — | Maps item to display text in default renderer |
| `isItemActive` | `(item: T) => boolean` | — | Marks selected item (useful in listbox mode) |
| `itemKey` | `(item: T, index: number) => string \| number` | index | Unique key per item |
| `floating` | `boolean` | `false` | Enable floating positioning via `@floating-ui` |
| `teleport` | `boolean` | — | Force teleport (defaults to match `floating`) |
| `placement` | `Placement` | `"bottom"` | Floating UI placement |
| `offset` | `{ mainAxis?: number; crossAxis?: number }` | `{ mainAxis: 0, crossAxis: 0 }` | Offset from anchor |
| `variant` | `"default" \| "secondary"` | `"default"` | Visual style |
| `maxHeight` | `number \| string` | `300` | Maximum panel height |
| `role` | `"menu" \| "listbox"` | `"menu"` | ARIA role for the dropdown panel |
| `closeOnClickOutside` | `boolean` | `true` | Close when clicking outside |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnSelect` | `boolean` | `false` | Close after selecting an item |
| `autoFocusPanel` | `boolean` | `true` | Focus panel when opened |
| `padded` | `boolean` | `true` | Apply compact padding and rounded items |
| `zIndex` | `number` | `10000` | Z-index for floating panel |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Open/close state change |
| `item-click` | `T` | An item was selected |
| `open` | — | Dropdown opened |
| `close` | `"outside" \| "escape" \| "action"` | Dropdown closed with reason |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `{ isActive, toggle, open, close }` | Custom trigger element |
| `item` | `{ item, click }` | Custom item rendering |
| `empty` | — | Content when items array is empty |
| `items-container` | `{ items, close }` | Full control over the items list |

## Common Patterns

### Action Menu with Icons and Shortcuts

```vue
<VcDropdown
  v-model="open"
  :items="actions"
  floating
  placement="bottom-start"
  close-on-select
  @item-click="handleAction"
>
  <template #trigger="{ toggle }">
    <VcButton icon="lucide-ellipsis" @click="toggle" />
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1.5" @click="click">
      <VcIcon :icon="item.icon" size="s" />
      <span>{{ item.title }}</span>
      <kbd class="tw-ml-auto tw-text-xs">{{ item.shortcut }}</kbd>
    </button>
  </template>
</VcDropdown>
```

### Listbox Switcher

```vue
<VcDropdown
  v-model="open"
  :items="workspaces"
  role="listbox"
  :is-item-active="(item) => item.id === activeId"
  close-on-select
  floating
  @item-click="(item) => activeId = item.id"
>
  <template #trigger="{ toggle }">
    <VcButton variant="outline" @click="toggle">{{ currentWorkspace }}</VcButton>
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-items-center tw-justify-between tw-w-full" @click="click">
      {{ item.title }}
      <VcIcon v-if="item.id === activeId" icon="lucide-check" size="s" />
    </button>
  </template>
</VcDropdown>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--vc-dropdown-bg` | `var(--additional-50)` | Panel background |
| `--vc-dropdown-text` | `var(--neutrals-950)` | Text color |
| `--vc-dropdown-border` | `var(--neutrals-200)` | Floating panel border |
| `--vc-dropdown-accent` | `var(--neutrals-100)` | Hover/focus background |
| `--vc-dropdown-accent-foreground` | `var(--neutrals-900)` | Hover/focus text color |
| `--vc-dropdown-divider` | `var(--neutrals-200)` | Mobile item divider |

## Accessibility

- Trigger has `role="button"`, `tabindex="0"`, `aria-expanded`, `aria-haspopup`
- Panel uses the specified `role` (`menu` or `listbox`)
- Arrow Up/Down, Home/End navigate items; Enter/Space selects; Escape closes
- `aria-activedescendant` tracks the focused item
- Items use `role="menuitem"` or `role="option"` depending on the dropdown role

## Related Components

- [VcDropdownPanel](../vc-dropdown-panel/) — floating panel with header, footer, and scrollable content
- [VcSelect](../vc-select/) — form field dropdown for selecting values
- [VcMenu](../vc-menu/) — sidebar navigation menu
