# VcDropdown

A headless, accessible dropdown primitive for building menus and listboxes. Provides floating positioning via `@floating-ui`, full keyboard navigation, slot-based rendering, and configurable close behavior. This is a low-level building block -- for form field selection, use VcSelect instead.

## When to Use

- Contextual action menus ("more actions" button, right-click style menus)
- Compact option pickers and workspace/context switchers
- Any trigger + floating list pattern with custom item rendering
- Notification panels or custom popovers with item lists

When NOT to use:
- For form field selection -- use [VcSelect](../vc-select/)
- For rich panel content with header/footer/scrollable body -- use [VcDropdownPanel](../vc-dropdown-panel/)
- For navigation menus -- use [VcMenu](../vc-menu/)

## Quick Start

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
      <button class="tw-w-full tw-text-left tw-px-3 tw-py-2" @click="click">
        {{ item.title }}
      </button>
    </template>
  </VcDropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcDropdown, VcButton } from "@vc-shell/framework";

const isOpen = ref(false);
const actions = [
  { id: "edit", title: "Edit" },
  { id: "duplicate", title: "Duplicate" },
  { id: "delete", title: "Delete" },
];

function onAction(item: { id: string; title: string }) {
  console.log("Selected:", item.id);
}
</script>
```

## Features

### Floating Positioning

When `floating` is `true`, the dropdown panel is positioned using `@floating-ui` with automatic flip and shift middleware. The panel is teleported to the body to avoid z-index stacking context issues.

```vue
<VcDropdown
  v-model="open"
  :items="items"
  floating
  placement="bottom-start"
  :offset="{ mainAxis: 4 }"
  :z-index="10000"
>
  <template #trigger="{ toggle }">
    <VcButton @click="toggle">Open</VcButton>
  </template>
  <template #item="{ item, click }">
    <button @click="click">{{ item.title }}</button>
  </template>
</VcDropdown>
```

Available `placement` values follow Floating UI conventions: `"top"`, `"top-start"`, `"top-end"`, `"bottom"`, `"bottom-start"`, `"bottom-end"`, `"left"`, `"right"`, and their start/end variants.

### Action Menu with Icons and Shortcuts

Build rich action menus by customizing the `#item` slot with icons, labels, and keyboard shortcut hints.

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
    <button class="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-1.5 tw-w-full" @click="click">
      <VcIcon :icon="item.icon" size="s" />
      <span class="tw-flex-1">{{ item.title }}</span>
      <kbd class="tw-ml-auto tw-text-xs tw-text-[color:var(--neutrals-400)]">{{ item.shortcut }}</kbd>
    </button>
  </template>
</VcDropdown>
```

### Listbox Mode (Selection Switcher)

Use `role="listbox"` for option-selection patterns. Combine with `isItemActive` to highlight the current selection and `aria-selected` is set automatically.

```vue
<VcDropdown
  v-model="open"
  :items="workspaces"
  role="listbox"
  :is-item-active="(item) => item.id === activeId"
  close-on-select
  floating
  @item-click="(item) => (activeId = item.id)"
>
  <template #trigger="{ toggle }">
    <VcButton variant="outline" @click="toggle">{{ currentWorkspace }}</VcButton>
  </template>
  <template #item="{ item, click }">
    <button class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-2 tw-py-1.5" @click="click">
      {{ item.title }}
      <VcIcon v-if="item.id === activeId" icon="lucide-check" size="s" />
    </button>
  </template>
</VcDropdown>
```

### Close Behavior Control

Fine-tune when the dropdown closes:

```vue
<VcDropdown
  v-model="open"
  :items="items"
  floating
  :close-on-click-outside="true"
  :close-on-escape="true"
  :close-on-select="false"
>
  <!-- Multi-select pattern: dropdown stays open after each selection -->
</VcDropdown>
```

The `close` event payload tells you the reason: `"outside"` (clicked away), `"escape"` (pressed Escape), or `"action"` (programmatic close or item selected with `closeOnSelect`).

### Custom Items Container

For full control over the list rendering (e.g., grouped items, sections with dividers), use the `#items-container` slot.

```vue
<VcDropdown v-model="open" :items="allItems" floating>
  <template #trigger="{ toggle }">
    <VcButton @click="toggle">Grouped Menu</VcButton>
  </template>
  <template #items-container="{ items, close }">
    <div class="tw-py-1">
      <div class="tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-text-[color:var(--neutrals-400)]">Actions</div>
      <button
        v-for="item in items.filter(i => i.group === 'actions')"
        :key="item.id"
        class="tw-block tw-w-full tw-text-left tw-px-3 tw-py-1.5"
        @click="() => { handleAction(item); close(); }"
      >
        {{ item.title }}
      </button>
      <div class="tw-border-t tw-border-[color:var(--neutrals-200)] tw-my-1" />
      <div class="tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-text-[color:var(--neutrals-400)]">Danger</div>
      <button
        v-for="item in items.filter(i => i.group === 'danger')"
        :key="item.id"
        class="tw-block tw-w-full tw-text-left tw-px-3 tw-py-1.5 tw-text-[color:var(--danger-500)]"
        @click="() => { handleAction(item); close(); }"
      >
        {{ item.title }}
      </button>
    </div>
  </template>
</VcDropdown>
```

### Non-padded Mode for Rich Content

By default, `padded` is `true`, which adds compact padding and rounded item backgrounds suitable for menus. Set `padded` to `false` for rich content where items should span the full panel width (e.g., notification lists).

```vue
<VcDropdown v-model="open" :items="notifications" floating :padded="false" :max-height="400">
  <template #item="{ item, click }">
    <div class="tw-px-4 tw-py-3 tw-border-b tw-border-[color:var(--neutrals-100)]" @click="click">
      <div class="tw-font-medium">{{ item.title }}</div>
      <div class="tw-text-sm tw-text-[color:var(--neutrals-500)]">{{ item.description }}</div>
    </div>
  </template>
</VcDropdown>
```

## Recipes

### Confirmation Dropdown

```vue
<template>
  <VcDropdown v-model="confirmOpen" floating placement="bottom-end" :close-on-select="false">
    <template #trigger="{ toggle }">
      <VcButton variant="danger" @click="toggle">Delete</VcButton>
    </template>
    <template #items-container="{ close }">
      <div class="tw-p-4 tw-w-64">
        <p class="tw-text-sm tw-mb-3">Are you sure you want to delete this item?</p>
        <div class="tw-flex tw-gap-2 tw-justify-end">
          <VcButton size="s" variant="outline" @click="close">Cancel</VcButton>
          <VcButton size="s" variant="danger" @click="() => { confirmDelete(); close(); }">Delete</VcButton>
        </div>
      </div>
    </template>
  </VcDropdown>
</template>
```

### Programmatic Open/Close

```vue
<template>
  <VcDropdown v-model="isOpen" :items="items" floating>
    <template #trigger="{ open, close, isActive }">
      <VcButton @mouseenter="open" @mouseleave="close">
        {{ isActive ? "Hover to close" : "Hover to open" }}
      </VcButton>
    </template>
    <template #item="{ item, click }">
      <button @click="click">{{ item.title }}</button>
    </template>
  </VcDropdown>
</template>
```

## Common Mistakes

### 1. Forgetting the `floating` prop

```vue
<!-- WRONG: dropdown renders inline, no positioning -->
<VcDropdown v-model="open" :items="items">
  <template #trigger="{ toggle }">
    <VcButton @click="toggle">Menu</VcButton>
  </template>
</VcDropdown>

<!-- CORRECT: enable floating for proper overlay positioning -->
<VcDropdown v-model="open" :items="items" floating>
  <template #trigger="{ toggle }">
    <VcButton @click="toggle">Menu</VcButton>
  </template>
</VcDropdown>
```

### 2. Not calling click in the item slot

```vue
<!-- WRONG: clicking the item does nothing, no events emitted -->
<template #item="{ item }">
  <button>{{ item.title }}</button>
</template>

<!-- CORRECT: call the provided click handler -->
<template #item="{ item, click }">
  <button @click="click">{{ item.title }}</button>
</template>
```

### 3. Using VcDropdown for form field selection

```vue
<!-- WRONG: VcDropdown is a headless primitive, not a form control -->
<VcDropdown v-model="open" :items="options" floating>
  <!-- No label, no validation, no v-model for selected value -->
</VcDropdown>

<!-- CORRECT: use VcSelect for form field selection -->
<VcSelect v-model="selectedValue" :options="options" label="Choose option" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Controls open/closed state via `v-model` |
| `items` | `T[]` | `[]` | Items to render in the dropdown |
| `emptyText` | `string` | `""` | Text shown when items array is empty |
| `itemText` | `(item: T) => string` | -- | Maps an item to display text (default renderer only) |
| `isItemActive` | `(item: T) => boolean` | -- | Marks the currently active item (highlighted state) |
| `itemKey` | `(item: T, index: number) => string \| number` | index | Unique key function for items |
| `floating` | `boolean` | `false` | Enable floating positioning via `@floating-ui` |
| `teleport` | `boolean` | -- | Force teleport to body (defaults to match `floating`) |
| `teleportTo` | `string \| HTMLElement` | -- | Custom teleport target |
| `placement` | `Placement` | `"bottom"` | Floating UI placement |
| `offset` | `{ mainAxis?: number; crossAxis?: number }` | `{ mainAxis: 0, crossAxis: 0 }` | Offset from the trigger element |
| `variant` | `"default" \| "secondary"` | `"default"` | Visual style variant |
| `maxHeight` | `number \| string` | `300` | Maximum panel height (number = px, string = CSS value) |
| `role` | `"menu" \| "listbox"` | `"menu"` | ARIA role for the dropdown panel |
| `closeOnClickOutside` | `boolean` | `true` | Close when clicking outside the dropdown |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key press |
| `closeOnSelect` | `boolean` | `false` | Close after selecting an item |
| `autoFocusPanel` | `boolean` | `true` | Focus the panel element when opened |
| `padded` | `boolean` | `true` | Apply compact padding and rounded item backgrounds |
| `zIndex` | `number` | `10000` | Z-index for the floating panel |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Open/close state changed |
| `item-click` | `T` | An item was selected |
| `open` | -- | Dropdown opened |
| `close` | `"outside" \| "escape" \| "action"` | Dropdown closed with reason |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `{ isActive: boolean, toggle: () => void, open: () => void, close: () => void }` | Custom trigger element |
| `item` | `{ item: T, click: () => void }` | Custom item rendering |
| `empty` | -- | Content when items array is empty |
| `items-container` | `{ items: T[], close: () => void }` | Full control over the items list |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--vc-dropdown-bg` | `var(--additional-50)` | Panel background color |
| `--vc-dropdown-text` | `var(--neutrals-950)` | Default text color |
| `--vc-dropdown-border` | `var(--neutrals-200)` | Floating panel border color |
| `--vc-dropdown-accent` | `var(--neutrals-100)` | Hover/focus background color |
| `--vc-dropdown-accent-foreground` | `var(--neutrals-900)` | Hover/focus text color |
| `--vc-dropdown-divider` | `var(--neutrals-200)` | Mobile item divider color |
| `--vc-dropdown-trigger-focus-ring-width` | `2px` | Trigger focus ring width |
| `--vc-dropdown-trigger-focus-ring-offset` | `1px` | Trigger focus ring offset |
| `--vc-dropdown-trigger-focus-ring-color` | `var(--primary-300)` | Trigger focus ring color |

## Accessibility

- **Trigger element**: has `role="button"`, `tabindex="0"`, `aria-expanded`, and `aria-haspopup` set to the dropdown role
- **Panel**: uses the specified `role` attribute (`"menu"` or `"listbox"`)
- **Items**: use `role="menuitem"` (menu mode) or `role="option"` (listbox mode)
- **Active item tracking**: `aria-activedescendant` on the panel tracks the currently focused item
- **Listbox selection**: `aria-selected` is set on items when `role="listbox"` and `isItemActive` returns `true`
- **Keyboard navigation**:
  - **Arrow Down / Arrow Up** -- move focus between items (wraps around)
  - **Home / End** -- jump to first/last item
  - **Enter / Space** -- select the focused item
  - **Escape** -- close the dropdown (when `closeOnEscape` is `true`)
- **Focus management**: panel auto-focuses on open (`autoFocusPanel`); focus index syncs to active item
- **Transition**: enter/leave animations are placement-aware (top placements slide downward)

## Related Components

- [VcDropdownPanel](../vc-dropdown-panel/) -- floating panel with header, footer, and scrollable content
- [VcSelect](../vc-select/) -- form field dropdown for selecting values with label and validation
- [VcMenu](../vc-menu/) -- sidebar navigation menu
