# VcTooltip

A floating tooltip that appears on hover or focus to provide contextual information about a trigger element. Powered by Floating UI for accurate positioning.

## When to Use

- Explain icon-only buttons or truncated text
- Provide additional context for form fields or table headers
- Show keyboard shortcuts or help hints
- When NOT to use: interactive content requiring clicks (use a popover or dropdown instead)

## Basic Usage

```vue
<template>
  <VcTooltip>
    <VcButton icon="lucide-trash-2" />
    <template #tooltip>Delete selected items</template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { VcTooltip, VcButton } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | `TooltipPlacement` | `"bottom"` | Position relative to trigger (12 options) |
| `variant` | `"default" \| "dark" \| "info"` | `"default"` | Visual theme -- light, dark, or branded |
| `arrow` | `boolean` | `true` | Show directional arrow pointing at trigger |
| `delay` | `number` | `0` | Milliseconds to wait before showing |
| `maxWidth` | `number \| string` | `240` | Maximum width (number = px, string = CSS value) |
| `offset` | `{ mainAxis?: number; crossAxis?: number }` | `{ mainAxis: 8 }` | Distance from trigger element |
| `disabled` | `boolean` | `false` | Suppress tooltip entirely |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Trigger element that activates the tooltip on hover/focus |
| `tooltip` | Content rendered inside the floating tooltip |

## Common Patterns

### Icon Toolbar with Tooltips

```vue
<template>
  <div class="tw-flex tw-gap-1">
    <VcTooltip v-for="action in actions" :key="action.label" placement="top" variant="dark">
      <VcButton :icon="action.icon" small />
      <template #tooltip>{{ action.label }}</template>
    </VcTooltip>
  </div>
</template>
```

### Rich Content Tooltip

```vue
<template>
  <VcTooltip placement="top" :max-width="300">
    <span class="tw-underline tw-decoration-dotted tw-cursor-help">Fulfillment status</span>
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
</template>
```

### Delayed Tooltip

Prevents accidental triggering when the mouse passes over many elements.

```vue
<VcTooltip :delay="400" placement="right">
  <VcIcon icon="lucide-info" />
  <template #tooltip>Additional details appear after a short delay</template>
</VcTooltip>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--tooltip-bg` | `var(--additional-50)` | Default variant background |
| `--tooltip-text` | `var(--neutrals-700)` | Default variant text color |
| `--tooltip-dark-bg` | `var(--neutrals-800)` | Dark variant background |
| `--tooltip-dark-text` | `var(--additional-50)` | Dark variant text color |
| `--tooltip-info-bg` | `var(--primary-600)` | Info variant background |
| `--tooltip-info-text` | `var(--additional-50)` | Info variant text color |
| `--tooltip-border-radius` | `6px` | Corner radius |
| `--tooltip-font-size` | `12px` | Text size |
| `--tooltip-z-index` | `1002` | Stacking order |

## Accessibility

- `role="tooltip"` on the floating element
- `aria-describedby` links the trigger to the tooltip when visible
- Shows on `focusin`, hides on `focusout` for keyboard users
- Escape key dismisses the tooltip
- Tooltip is teleported to document body for proper stacking
- Fade transition (150ms in, 100ms out) for smooth appearance

## Related Components

- [VcHint](../vc-hint/) -- inline hint text below form fields
- [VcLabel](../vc-label/) -- label with built-in tooltip support via its own `#tooltip` slot
