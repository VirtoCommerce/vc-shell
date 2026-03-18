# VcSidebar

A slide-over panel for contextual workflows, settings, and detail views. Supports left, right, and bottom positions with animated transitions, focus trapping, scroll locking, and swipe-to-dismiss gestures. VcSidebar is built for use cases where a full blade is too heavy but a popup is too small — settings panels, filter drawers, item detail previews, and mobile bottom sheets.

## When to Use

- Settings panels, filter drawers, or contextual detail views.
- Bottom sheet on mobile (with `position="bottom"` and `draggable`).
- Full-screen takeover for complex sub-workflows (`size="full"`).
- When NOT to use: for confirmation dialogs use `VcPopup`; for primary content use `VcBlade`.

## Basic Usage

```vue
<template>
  <VcButton @click="open = true">Open Sidebar</VcButton>

  <VcSidebar v-model="open" title="Settings" position="right" size="md">
    <div class="tw-p-4">Sidebar content</div>

    <template #footer>
      <VcButton @click="open = false">Close</VcButton>
    </template>
  </VcSidebar>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSidebar, VcButton } from "@vc-shell/framework";

const open = ref(false);
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | *required* | Open/close state (v-model). |
| `position` | `"left" \| "right" \| "bottom"` | `"right"` | Slide-in direction. |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | `"sm"` | Panel size preset (300/380/520px or full viewport). |
| `variant` | `"default" \| "elevated" \| "minimal"` | `"default"` | Visual style. |
| `width` | `number \| string` | -- | Custom width override (left/right positions). |
| `height` | `number \| string` | -- | Custom height override (bottom position). |
| `title` | `string` | `""` | Header title text. |
| `subtitle` | `string` | `""` | Header subtitle text. |
| `showOverlay` | `boolean` | `true` | Show backdrop overlay. |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking overlay. |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key. |
| `closeButton` | `boolean` | `true` | Show close button in header. |
| `trapFocus` | `boolean` | `true` | Trap keyboard focus inside panel. |
| `lockScroll` | `boolean` | `true` | Prevent body scroll while open. |
| `inset` | `boolean` | `true` | Add rounded inset gap from viewport edges. |
| `draggable` | `boolean` | `false` | Enable swipe-to-dismiss (bottom only). |
| `dragHandle` | `boolean` | `false` | Show iOS-style drag handle bar. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | v-model update. |
| `close` | `SidebarCloseReason` | Reason: `"overlay"`, `"escape"`, or `"action"`. |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Main content area. |
| `header` | `{ close }` | Custom header replacing title + close button. |
| `actions` | `{ close }` | Extra buttons in the header actions area. |
| `footer` | -- | Sticky footer area. |

## Features

### Animated Transitions

The panel slides in from its configured `position` with a smooth CSS transition. The overlay fades in simultaneously. When `prefers-reduced-motion` is active, transitions are disabled for accessibility.

### Focus Trapping and Scroll Locking

When `trapFocus` is true (default), Tab key cycles through focusable elements inside the panel. When `lockScroll` is true (default), the page body scroll is locked, preventing background content from scrolling under the overlay.

### Swipe-to-Dismiss (Bottom Sheet)

When `position="bottom"` and `draggable` is true, users can swipe the panel down to dismiss it. The `dragHandle` prop adds a visible handle bar at the top of the panel for better affordance.

### Size Presets

| Size | Width/Height |
|------|-------------|
| `sm` | 300px |
| `md` | 380px |
| `lg` | 520px |
| `full` | Full viewport |

Override with the `width` or `height` prop for custom dimensions.

## Common Patterns

### Bottom Sheet with Swipe-to-Dismiss

```vue
<VcSidebar v-model="open" position="bottom" size="md" draggable drag-handle>
  <div class="tw-p-4">Swipe down to close</div>
</VcSidebar>
```

### Elevated Variant with Custom Width

```vue
<VcSidebar v-model="open" variant="elevated" :width="480" title="Details">
  <div class="tw-p-5">Content</div>
</VcSidebar>
```

## Recipe: Filter Drawer in a List Blade

```vue
<script setup lang="ts">
import { ref, reactive } from "vue";

const showFilters = ref(false);
const filters = reactive({
  status: "",
  dateFrom: "",
  dateTo: "",
  category: "",
});

function applyFilters() {
  showFilters.value = false;
  loadItems(filters);
}

function resetFilters() {
  Object.assign(filters, { status: "", dateFrom: "", dateTo: "", category: "" });
}
</script>

<template>
  <VcButton icon="lucide-filter" @click="showFilters = true">Filters</VcButton>

  <VcSidebar v-model="showFilters" title="Filters" position="right" size="sm">
    <div class="tw-p-4 tw-space-y-4">
      <VcSelect label="Status" v-model="filters.status" :options="statusOptions" />
      <VcInput label="Date From" v-model="filters.dateFrom" type="date" />
      <VcInput label="Date To" v-model="filters.dateTo" type="date" />
      <VcSelect label="Category" v-model="filters.category" :options="categoryOptions" />
    </div>

    <template #footer>
      <div class="tw-flex tw-gap-2 tw-p-4">
        <VcButton variant="primary" @click="applyFilters">Apply</VcButton>
        <VcButton variant="outline" @click="resetFilters">Reset</VcButton>
      </div>
    </template>
  </VcSidebar>
</template>
```

## Common Mistakes

- **Using `draggable` with left/right position** -- Swipe-to-dismiss only works with `position="bottom"`. Setting `draggable` on a left or right sidebar has no effect.
- **Forgetting `v-model`** -- VcSidebar requires a `v-model` binding to control open/close state. Without it, the panel cannot be dismissed.
- **Nested scrolling conflicts** -- If the sidebar content is scrollable and `lockScroll` is true, the body scroll is locked but the sidebar content scrolls normally. If you have nested scroll containers, test carefully on mobile.

## Tips

- Listen to the `close` event to distinguish how the sidebar was closed (`"overlay"` click, `"escape"` key, or `"action"` button). This is useful when you need to prompt for unsaved changes only on certain close methods.
- The `inset` prop (default `true`) adds a small gap between the sidebar and the viewport edges with rounded corners. Set `inset` to `false` for an edge-to-edge panel that looks more like a traditional drawer.
- The `minimal` variant removes the header background and border, useful for lightweight panels that blend into the content.
- Use the `header` slot to completely replace the default header when you need a custom layout (e.g., tabs in the header, search input, breadcrumbs).

## Accessibility

- Uses `role="dialog"` with `aria-modal` when overlay is shown.
- Focus is trapped inside the panel and restored to the trigger element on close.
- Keyboard: Escape closes, Tab cycles through focusable elements.
- Reduced motion: transitions are disabled when `prefers-reduced-motion` is active.

## Related Components

- **VcPopup** -- centered modal dialog for confirmations and alerts.
- **VcBlade** -- primary content panel in the blade navigation stack.
