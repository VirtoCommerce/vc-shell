# VcScrollableContainer

A container component that wraps overflowing content with auto-hiding scroll arrows at the top and bottom edges. The native scrollbar is hidden via CSS, replaced by subtle chevron indicators that appear only when scrolling in that direction is possible. Users can hover over an arrow to scroll continuously or use keyboard arrow keys when the viewport is focused.

## When to Use

- Constrained-height menus, sidebars, or dropdown panels where a native scrollbar is undesirable
- Lists inside blades or popups that need subtle scroll affordance
- Settings panels or filter lists with many items
- When NOT to use: full-page scroll areas where a native scrollbar is expected; horizontally scrolling content (this component only handles vertical overflow)

## Basic Usage

```vue
<template>
  <VcScrollableContainer style="height: 200px;">
    <div v-for="i in 30" :key="i" class="tw-px-3 tw-py-2">
      Item {{ i }}
    </div>
  </VcScrollableContainer>
</template>

<script setup lang="ts">
import { VcScrollableContainer } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `2` | Scroll speed in px/frame. Captured once at mount (not reactive). |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Content rendered inside the scrollable viewport |
| `arrow-up` | Custom up-arrow indicator (replaces default chevron) |
| `arrow-down` | Custom down-arrow indicator (replaces default chevron) |

## Exposed

| Property | Type | Description |
|----------|------|-------------|
| `viewportRef` | `Ref<HTMLElement \| null>` | Direct reference to the viewport DOM element |
| `updateScrollState` | `() => void` | Manually recalculate arrow visibility |

## Recipe: Sidebar Filter List in a Blade

```vue
<template>
  <div class="tw-w-64 tw-border-r tw-border-gray-200">
    <h3 class="tw-px-3 tw-py-2 tw-font-semibold tw-text-sm">Filters</h3>
    <VcScrollableContainer style="max-height: 320px;" :speed="3">
      <label
        v-for="filter in filters"
        :key="filter.id"
        class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 hover:tw-bg-gray-50 tw-cursor-pointer"
      >
        <input type="checkbox" v-model="filter.active" />
        <span class="tw-text-sm">{{ filter.label }}</span>
      </label>
    </VcScrollableContainer>
  </div>
</template>
```

## Recipe: Programmatic Scroll Reset

Use the exposed `viewportRef` to scroll back to the top when content changes:

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const scrollContainer = ref<InstanceType<typeof VcScrollableContainer>>();
const activeCategory = ref("all");

watch(activeCategory, () => {
  scrollContainer.value?.viewportRef?.scrollTo({ top: 0, behavior: "smooth" });
});
</script>

<template>
  <VcScrollableContainer ref="scrollContainer" style="height: 300px;">
    <ItemList :category="activeCategory" />
  </VcScrollableContainer>
</template>
```

## Recipe: Custom Arrow Icons

Replace the default chevrons with custom indicators:

```vue
<VcScrollableContainer style="height: 200px;">
  <template #arrow-up>
    <span class="tw-text-xs tw-text-gray-400">Scroll up</span>
  </template>
  <template #arrow-down>
    <span class="tw-text-xs tw-text-gray-400">Scroll down</span>
  </template>
  <div v-for="i in 50" :key="i" class="tw-p-2">Row {{ i }}</div>
</VcScrollableContainer>
```

## Tips

- The `speed` prop is captured once at mount time and is not reactive. If you need to change speed dynamically, remount the component with a `:key` binding.
- Call `updateScrollState()` after programmatically adding or removing items so the arrows recalculate visibility.
- The viewport hides its scrollbar with `scrollbar-width: none` and the `-webkit-scrollbar` pseudo-element, but native scroll behavior (mouse wheel, trackpad) still works.
- Arrow indicators auto-hide with an opacity transition when the user cannot scroll further in that direction.

## Accessibility

- `role="region"` with `aria-label="Scrollable content"` on the root element
- Viewport is focusable (`tabindex="0"`) for keyboard navigation
- Up/Down arrow keys scroll content in discrete steps (40px)
- Scroll-arrow indicators are `aria-hidden="true"`

## Related Components

- **VcIcon** -- used internally for the default chevron arrows
