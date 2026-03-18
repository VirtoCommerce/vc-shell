# VcTooltip

A floating tooltip that appears on hover or focus to provide contextual information about a trigger element. Powered by Floating UI for automatic positioning, collision detection, and arrow alignment. The tooltip is teleported to the document body for proper stacking above all content.

## Quick Start

```vue
<template>
  <VcTooltip>
    <VcButton size="icon" icon="lucide-trash-2" aria-label="Delete" />
    <template #tooltip>Delete selected items</template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { VcTooltip, VcButton } from "@vc-shell/framework";
</script>
```

The tooltip appears when the user hovers over or focuses the trigger element.

## Placement

VcTooltip supports 12 placement positions relative to the trigger element. The tooltip automatically flips to the opposite side if it would overflow the viewport.

```vue
<VcTooltip placement="top">...</VcTooltip>
<VcTooltip placement="bottom">...</VcTooltip>
<VcTooltip placement="left">...</VcTooltip>
<VcTooltip placement="right">...</VcTooltip>
```

### All placement options

| Primary | Start Variant | End Variant |
|---------|--------------|-------------|
| `top` | `top-start` | `top-end` |
| `bottom` | `bottom-start` | `bottom-end` |
| `left` | `left-start` | `left-end` |
| `right` | `right-start` | `right-end` |

The `start` and `end` variants align the tooltip to the beginning or end of the trigger element along the cross axis:

```vue
<!-- Tooltip appears above, aligned to the left edge of the trigger -->
<VcTooltip placement="top-start">
  <VcButton>Hover me</VcButton>
  <template #tooltip>Aligned to the start</template>
</VcTooltip>
```

## Variants

Three visual themes control the tooltip's appearance.

```vue
<VcTooltip variant="default">
  <span>Default (light)</span>
  <template #tooltip>Light background with dark text</template>
</VcTooltip>

<VcTooltip variant="dark">
  <span>Dark</span>
  <template #tooltip>Dark background with light text</template>
</VcTooltip>

<VcTooltip variant="info">
  <span>Info</span>
  <template #tooltip>Primary-colored background with white text</template>
</VcTooltip>
```

| Variant | Background | Text Color | Use Case |
|---------|------------|------------|----------|
| `default` | `var(--additional-50)` (light) | `var(--neutrals-700)` | General-purpose tooltips |
| `dark` | `var(--neutrals-800)` | `var(--additional-50)` (white) | High-contrast tooltips, dark UI areas |
| `info` | `var(--primary-600)` | `var(--additional-50)` (white) | Branded or informational tooltips |

## Delayed Display

Prevent accidental tooltip activation when the mouse passes over many elements by adding a delay:

```vue
<VcTooltip :delay="300">
  <VcIcon icon="lucide-info" />
  <template #tooltip>This tooltip appears after 300ms</template>
</VcTooltip>
```

The delay only applies to showing the tooltip. Hiding is always immediate when the mouse leaves or focus moves away. If the mouse leaves before the delay elapses, the tooltip never appears.

## Arrow Control

The directional arrow is shown by default. Disable it for a cleaner look:

```vue
<VcTooltip :arrow="false" placement="bottom">
  <VcButton>No arrow</VcButton>
  <template #tooltip>Clean floating tooltip without arrow</template>
</VcTooltip>
```

## Offset and Spacing

Control the distance between the trigger and the tooltip:

```vue
<!-- Default: 8px from the trigger on the main axis -->
<VcTooltip>...</VcTooltip>

<!-- Increase distance -->
<VcTooltip :offset="{ mainAxis: 16 }">...</VcTooltip>

<!-- Shift along the cross axis -->
<VcTooltip :offset="{ mainAxis: 8, crossAxis: 10 }">...</VcTooltip>
```

| Axis | Direction | Default |
|------|-----------|---------|
| `mainAxis` | Away from the trigger (perpendicular to placement edge) | `8` |
| `crossAxis` | Along the trigger edge (parallel to placement edge) | `0` |

## Width Control

Set a maximum width to prevent wide tooltips from stretching across the screen:

```vue
<!-- Default max width: 240px -->
<VcTooltip>...</VcTooltip>

<!-- Wider tooltip for long content -->
<VcTooltip :max-width="400">...</VcTooltip>

<!-- CSS string value -->
<VcTooltip max-width="50vw">...</VcTooltip>
```

## Disabling the Tooltip

Suppress the tooltip dynamically without removing it from the template:

```vue
<VcTooltip :disabled="isEditing">
  <VcButton icon="lucide-pencil" @click="startEdit">Edit</VcButton>
  <template #tooltip>Click to edit this item</template>
</VcTooltip>
```

## Rich Content

The `#tooltip` slot accepts any HTML or Vue components, not just text:

```vue
<VcTooltip placement="top" :max-width="320">
  <span class="tw-underline tw-decoration-dotted tw-cursor-help">
    Fulfillment status
  </span>
  <template #tooltip>
    <div>
      <p class="tw-font-semibold tw-mb-1">About fulfillment</p>
      <ul class="tw-list-disc tw-pl-4 tw-text-xs tw-space-y-0.5">
        <li>Awaiting -- order received, not yet shipped</li>
        <li>Shipped -- tracking number assigned</li>
        <li>Delivered -- confirmed by carrier</li>
      </ul>
    </div>
  </template>
</VcTooltip>
```

> **Caution:** Tooltips should not contain interactive content (buttons, links, inputs). If you need interactive content in a floating panel, use a popover or dropdown component instead.

## Recipes

### Icon Toolbar with Tooltips

```vue
<template>
  <div class="tw-flex tw-gap-1">
    <VcTooltip v-for="action in actions" :key="action.id" placement="top" variant="dark">
      <VcButton
        variant="ghost"
        size="icon"
        :icon="action.icon"
        :aria-label="action.label"
        @click="action.handler"
      />
      <template #tooltip>{{ action.label }}</template>
    </VcTooltip>
  </div>
</template>

<script setup lang="ts">
const actions = [
  { id: "edit", icon: "lucide-pencil", label: "Edit", handler: () => edit() },
  { id: "copy", icon: "lucide-copy", label: "Duplicate", handler: () => copy() },
  { id: "delete", icon: "lucide-trash-2", label: "Delete", handler: () => remove() },
];
</script>
```

### Truncated Text with Full-Value Tooltip

```vue
<template>
  <VcTooltip placement="top" :max-width="400">
    <span class="tw-truncate tw-max-w-[200px] tw-block">
      {{ longProductName }}
    </span>
    <template #tooltip>{{ longProductName }}</template>
  </VcTooltip>
</template>
```

## Common Mistakes

### Putting interactive content inside a tooltip

```vue
<!-- Wrong -- tooltips are not navigable, users cannot click this link -->
<VcTooltip>
  <span>Hover for help</span>
  <template #tooltip>
    <a href="/docs">Read the documentation</a>
  </template>
</VcTooltip>

<!-- Correct -- use a popover or dropdown for interactive content -->
<VcPopover>
  <span>Click for help</span>
  <template #content>
    <a href="/docs">Read the documentation</a>
  </template>
</VcPopover>
```

### Forgetting the #tooltip slot

```vue
<!-- Wrong -- no tooltip content, nothing will display -->
<VcTooltip>
  <VcButton icon="lucide-info" />
</VcTooltip>

<!-- Correct -->
<VcTooltip>
  <VcButton icon="lucide-info" />
  <template #tooltip>More information</template>
</VcTooltip>
```

### Using tooltip as a label replacement

```vue
<!-- Wrong -- tooltips are supplementary, not primary labels -->
<VcTooltip>
  <input type="text" />
  <template #tooltip>Enter your email address</template>
</VcTooltip>

<!-- Correct -- use a visible label, tooltip for additional context -->
<div>
  <VcLabel>Email Address</VcLabel>
  <VcTooltip>
    <VcInput v-model="email" placeholder="you@example.com" />
    <template #tooltip>We will send order confirmations to this address</template>
  </VcTooltip>
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | `TooltipPlacement` | `"bottom"` | Position relative to the trigger (12 options) |
| `variant` | `"default" \| "dark" \| "info"` | `"default"` | Visual theme |
| `arrow` | `boolean` | `true` | Show directional arrow pointing at the trigger |
| `delay` | `number` | `0` | Milliseconds to wait before showing |
| `maxWidth` | `number \| string` | `240` | Maximum width (number = px, string = CSS value) |
| `offset` | `{ mainAxis?: number; crossAxis?: number }` | `{ mainAxis: 8 }` | Distance from the trigger element |
| `disabled` | `boolean` | `false` | Suppress the tooltip entirely |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Trigger element that activates the tooltip on hover/focus |
| `tooltip` | Content rendered inside the floating tooltip panel |

## CSS Custom Properties

| Variable | Default | Description |
|----------|---------|-------------|
| `--tooltip-bg` | `var(--additional-50)` | Default variant background |
| `--tooltip-text` | `var(--neutrals-700)` | Default variant text color |
| `--tooltip-dark-bg` | `var(--neutrals-800)` | Dark variant background |
| `--tooltip-dark-text` | `var(--additional-50)` | Dark variant text color |
| `--tooltip-info-bg` | `var(--primary-600)` | Info variant background |
| `--tooltip-info-text` | `var(--additional-50)` | Info variant text color |
| `--tooltip-border-radius` | `6px` | Corner radius |
| `--tooltip-font-size` | `12px` | Text size |
| `--tooltip-padding-x` | `10px` | Horizontal padding |
| `--tooltip-padding-y` | `6px` | Vertical padding |
| `--tooltip-z-index` | `1002` | Stacking order |

## Accessibility

- `role="tooltip"` is set on the floating element
- `aria-describedby` links the trigger to the tooltip when visible
- Shows on `focusin`, hides on `focusout` for keyboard users
- Escape key dismisses the tooltip
- Tooltip is teleported to the document body for proper stacking context
- Fade transition (150ms in, 100ms out) provides smooth visual feedback
- The tooltip has `pointer-events: none` -- it cannot be interacted with directly

## Related Components

- [VcHint](../vc-hint/) -- inline hint text below form fields (always visible)
- [VcLabel](../vc-label/) -- label component with built-in tooltip support via its own `#tooltip` slot
- [VcIcon](../vc-icon/) -- commonly used as a tooltip trigger for info indicators
