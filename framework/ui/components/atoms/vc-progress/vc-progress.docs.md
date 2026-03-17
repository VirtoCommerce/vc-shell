# VcProgress

A horizontal progress bar that visualizes the completion percentage of a task or process.

## When to Use

- Display upload, import, or export progress
- Show step completion in multi-stage workflows
- When NOT to use: indeterminate loading with no known percentage (use [VcLoading](../vc-loading/) instead)

## Basic Usage

```vue
<template>
  <VcProgress :value="uploadPercent" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcProgress } from "@vc-shell/framework";

const uploadPercent = ref(45);
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress (0--100). Clamped automatically. |
| `variant` | `"default" \| "striped"` | `"default"` | Visual style; `striped` adds an animated diagonal pattern |
| `ariaLabel` | `string` | `"Progress"` | Accessible label describing what the bar represents |

## Common Patterns

### Labeled Progress with Percentage

```vue
<template>
  <div>
    <div class="tw-flex tw-justify-between tw-text-sm tw-mb-1">
      <span>Importing catalog...</span>
      <span>{{ progress }}%</span>
    </div>
    <VcProgress :value="progress" :variant="progress === 100 ? 'striped' : 'default'" />
  </div>
</template>
```

### Multiple Progress Stages

```vue
<template>
  <div class="tw-space-y-4">
    <div v-for="stage in stages" :key="stage.label">
      <span class="tw-text-sm">{{ stage.label }}</span>
      <VcProgress :value="stage.value" />
    </div>
  </div>
</template>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--progressbar-height` | `8px` | Bar height |
| `--progressbar-border-radius` | `9999px` | Border radius (pill shape) |
| `--progressbar-background-color` | `var(--neutrals-200)` | Track background |
| `--progressbar-foreground-color` | `var(--primary-500)` | Fill color |
| `--progressbar-striped-bg` | gradient | Striped variant background |

## Accessibility

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`
- Custom `aria-label` prop for describing the progress context
- Fill transitions smoothly (300ms ease-out) so screen magnifier users can follow changes

## Related Components

- [VcLoading](../vc-loading/) -- indeterminate loading overlay when percentage is unknown
