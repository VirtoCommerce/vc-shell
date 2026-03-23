# VcProgress

A horizontal progress bar that visualizes the completion percentage of a task or process. The bar fills smoothly from left to right using a CSS `transform` transition, and an optional striped variant adds an animated diagonal pattern to indicate active processing.

## When to Use

- Display upload, import, or export progress
- Show step completion in multi-stage workflows
- Visualize quota usage (e.g., storage consumed out of total)
- When NOT to use: indeterminate loading with no known percentage (use [VcLoading](../vc-loading/) instead); very short operations where the bar would flash and disappear (skip the indicator)

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

### Quota / Usage Indicator

```vue
<template>
  <div>
    <div class="tw-flex tw-justify-between tw-text-sm tw-mb-1">
      <span>Storage</span>
      <span>{{ usedGB }} / {{ totalGB }} GB</span>
    </div>
    <VcProgress
      :value="(usedGB / totalGB) * 100"
      aria-label="Storage usage"
    />
    <VcHint v-if="usedGB / totalGB > 0.9" error>
      You are running low on storage.
    </VcHint>
  </div>
</template>
```

## Recipe: File Upload Progress in a Blade

```vue
<script setup lang="ts">
import { ref } from "vue";

const uploadProgress = ref(0);
const isUploading = ref(false);

async function handleUpload(files: FileList) {
  isUploading.value = true;
  uploadProgress.value = 0;

  for (let i = 0; i <= 100; i += 10) {
    await simulateChunk();
    uploadProgress.value = i;
  }

  isUploading.value = false;
}
</script>

<template>
  <VcBlade title="Import Products">
    <VcButton :disabled="isUploading" @click="triggerUpload">
      {{ isUploading ? 'Uploading...' : 'Select File' }}
    </VcButton>

    <div v-if="isUploading" class="tw-mt-4">
      <VcProgress
        :value="uploadProgress"
        variant="striped"
        aria-label="File upload progress"
      />
      <VcHint class="tw-mt-1">{{ uploadProgress }}% complete</VcHint>
    </div>
  </VcBlade>
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

## Tips

- The `value` prop is clamped between 0 and 100 internally, so passing values outside that range is safe — negative values become 0 and values above 100 become 100.
- The fill transitions smoothly over 300ms with `ease-out` timing. Rapid value updates (e.g., every 50ms) will look fluid.
- The striped variant uses a CSS `@keyframes` animation that runs continuously. It is a good visual cue for "processing" states where progress is advancing but the user should wait.
- To change the bar color dynamically (e.g., red when near quota), override `--progressbar-foreground-color` with an inline style: `style="--progressbar-foreground-color: var(--danger-500)"`.
- For a thinner or thicker bar, set `--progressbar-height` on the parent or component element.

## Accessibility

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`
- Custom `aria-label` prop for describing the progress context
- Fill transitions smoothly (300ms ease-out) so screen magnifier users can follow changes

## Related Components

- [VcLoading](../vc-loading/) -- indeterminate loading overlay when percentage is unknown
- [VcHint](../vc-hint/) -- helper text to display percentage or status message below the bar
