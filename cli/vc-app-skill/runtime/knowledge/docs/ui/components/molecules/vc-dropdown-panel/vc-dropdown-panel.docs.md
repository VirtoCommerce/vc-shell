# VcDropdownPanel

Floating dropdown panel positioned relative to an anchor element, with header, scrollable content, and optional footer. Built on `@floating-ui/vue`.

## When to Use

- Rich dropdown content with a title bar and action buttons (e.g., filter panels, settings popovers)
- Panels that need header/footer structure alongside scrollable body content
- Nested panel scenarios where panels can spawn sub-panels
- When NOT to use: for simple item lists, prefer `VcDropdown`; for full-page overlays, use a dialog/modal

## Basic Usage

```vue
<template>
  <button
    ref="anchorEl"
    @click="open = !open"
  >
    Toggle Panel
  </button>
  <VcDropdownPanel
    v-model:show="open"
    :anchor-ref="anchorEl"
    title="Filter Options"
  >
    <div class="tw-p-4">
      <p>Panel content here</p>
    </div>
  </VcDropdownPanel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcDropdownPanel } from "@vc-shell/framework";

const anchorEl = ref<HTMLElement | null>(null);
const open = ref(false);
</script>
```

## Key Props

| Prop                  | Type                  | Default          | Description                                                        |
| --------------------- | --------------------- | ---------------- | ------------------------------------------------------------------ |
| `show`                | `boolean`             | —                | Panel visibility (v-model:show)                                    |
| `anchorRef`           | `HTMLElement \| null` | `null`           | Anchor element for floating positioning                            |
| `title`               | `string`              | `""`             | Header title text (header hidden when empty and no `#header` slot) |
| `placement`           | `Placement`           | `"bottom-start"` | Floating UI placement relative to anchor                           |
| `width`               | `string`              | `"280px"`        | Panel min-width                                                    |
| `maxWidth`            | `string`              | `"400px"`        | Panel max-width                                                    |
| `maxHeight`           | `number`              | `350`            | Max height in pixels (clamped by viewport)                         |
| `contentScrollable`   | `boolean`             | `true`           | Enable scrolling in the content area                               |
| `closeOnClickOutside` | `boolean`             | `true`           | Close when clicking outside                                        |
| `closeOnEscape`       | `boolean`             | `true`           | Close on Escape key                                                |

## Events

| Event         | Payload   | Description              |
| ------------- | --------- | ------------------------ |
| `update:show` | `boolean` | Panel visibility changed |

## Slots

| Slot      | Props       | Description                                           |
| --------- | ----------- | ----------------------------------------------------- |
| `default` | —           | Scrollable content area                               |
| `header`  | `{ close }` | Custom header (replaces default title + close button) |
| `footer`  | —           | Footer area, typically for action buttons             |

## Common Patterns

### Filter Panel with Footer Actions

```vue
<VcDropdownPanel v-model:show="showFilters" :anchor-ref="filterButton" title="Filters">
  <div class="tw-p-4 tw-flex tw-flex-col tw-gap-2">
    <VcCheckbox v-model="filters.active">Active only</VcCheckbox>
    <VcCheckbox v-model="filters.inStock">In stock</VcCheckbox>
    <VcSelect v-model="filters.category" :options="categories" label="Category" />
  </div>
  <template #footer>
    <VcButton variant="secondary" @click="resetFilters">Reset</VcButton>
    <VcButton @click="applyFilters">Apply</VcButton>
  </template>
</VcDropdownPanel>
```

### Custom Header

```vue
<VcDropdownPanel v-model:show="open" :anchor-ref="anchor">
  <template #header="{ close }">
    <div class="tw-flex tw-items-center tw-justify-between tw-w-full tw-px-4 tw-py-3">
      <span class="tw-font-semibold">Custom Header</span>
      <button @click="close">Dismiss</button>
    </div>
  </template>
  <div class="tw-p-4">Content here</div>
</VcDropdownPanel>
```

### Scrollable List

```vue
<VcDropdownPanel v-model:show="open" :anchor-ref="anchor" title="Long Content" :max-height="250">
  <div class="tw-py-1">
    <div
      v-for="item in items"
      :key="item.id"
      class="tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer hover:tw-bg-[var(--neutrals-100)]"
    >
      {{ item.name }}
    </div>
  </div>
</VcDropdownPanel>
```

## CSS Variables

| Variable                             | Default                       | Description              |
| ------------------------------------ | ----------------------------- | ------------------------ |
| `--dropdown-panel-bg`                | `var(--additional-50)`        | Panel background         |
| `--dropdown-panel-border-color`      | `var(--neutrals-200)`         | Border color             |
| `--dropdown-panel-border-radius`     | `6px`                         | Corner radius            |
| `--dropdown-panel-shadow`            | `0 4px 16px rgba(0,0,0,0.08)` | Box shadow               |
| `--dropdown-panel-z-index`           | `10001`                       | Z-index                  |
| `--dropdown-panel-title-color`       | `var(--neutrals-900)`         | Title text color         |
| `--dropdown-panel-close-color`       | `var(--neutrals-400)`         | Close button color       |
| `--dropdown-panel-close-hover-color` | `var(--neutrals-600)`         | Close button hover color |
| `--dropdown-panel-footer-bg`         | `var(--neutrals-50)`          | Footer background        |

## Accessibility

- Close button has `aria-label="Close"`
- Escape key dismisses the panel (configurable via `closeOnEscape`)
- Click-outside detection uses `pointerdown` for reliable z-index handling
- Supports nested panels via an internal anchor registry -- child panel clicks do not close parent panels
- Exposes `close()` method via template ref

## Related Components

- [VcDropdown](../vc-dropdown/) — headless dropdown for simple item lists
- [VcSelect](../vc-select/) — form field selection dropdown
