# VcSkeleton

A loading placeholder component that renders animated shimmer shapes (text lines, circles, or rectangular blocks) to indicate content is being fetched.

## When to Use

- Show placeholder UI while async data loads for blades, lists, or cards
- Preserve layout structure during loading to prevent content shift
- When NOT to use: progress with a known percentage (use [VcProgress](../vc-progress/)); indeterminate overlay (use [VcLoading](../vc-loading/))

## Basic Usage

```vue
<template>
  <VcSkeleton :rows="3" />
</template>

<script setup lang="ts">
import { VcSkeleton } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop        | Type                            | Default        | Description                                        |
| ----------- | ------------------------------- | -------------- | -------------------------------------------------- |
| `variant`   | `"text" \| "circle" \| "block"` | `"text"`       | Shape variant: text rows, circular, or rectangular |
| `rows`      | `number`                        | `1`            | Number of text rows (only for `variant="text"`)    |
| `width`     | `string \| number`              | --             | Custom width for circle/block (number = px)        |
| `height`    | `string \| number`              | --             | Custom height for circle/block (number = px)       |
| `animated`  | `boolean`                       | `true`         | Enables pulse animation                            |
| `ariaLabel` | `string`                        | `"Loading..."` | Screen reader announcement                         |

## Common Patterns

### Text Paragraph Placeholder

The last row automatically renders at 60% width for a natural paragraph feel.

```vue
<VcSkeleton :rows="4" />
```

### Avatar Placeholder

```vue
<VcSkeleton variant="circle" :width="48" :height="48" />
```

### Card Skeleton

```vue
<template>
  <div class="tw-border tw-rounded-lg tw-overflow-hidden tw-shadow-sm">
    <VcSkeleton
      variant="block"
      width="100%"
      height="200px"
    />
    <div class="tw-p-4">
      <VcSkeleton
        variant="block"
        width="60%"
        height="20px"
      />
      <div class="tw-mt-3">
        <VcSkeleton :rows="3" />
      </div>
    </div>
  </div>
</template>
```

### List with Avatar and Text

```vue
<template>
  <div class="tw-space-y-4">
    <div
      v-for="i in 3"
      :key="i"
      class="tw-flex tw-gap-4 tw-items-center"
    >
      <VcSkeleton
        variant="circle"
        :width="40"
        :height="40"
      />
      <div class="tw-flex-1">
        <VcSkeleton
          variant="block"
          width="40%"
          height="14px"
        />
        <div class="tw-mt-2">
          <VcSkeleton :rows="1" />
        </div>
      </div>
    </div>
  </div>
</template>
```

## CSS Custom Properties

| Variable                      | Default               | Description                            |
| ----------------------------- | --------------------- | -------------------------------------- |
| `--vc-skeleton-bg`            | `var(--neutrals-200)` | Shape background color                 |
| `--vc-skeleton-highlight`     | `var(--neutrals-300)` | Highlight color (for future shimmer)   |
| `--vc-skeleton-border-radius` | `6px`                 | Corner radius for text rows and blocks |
| `--vc-skeleton-row-height`    | `16px`                | Height of each text row                |
| `--vc-skeleton-row-gap`       | `12px`                | Vertical gap between text rows         |

## Accessibility

- `role="status"` with `aria-busy="true"` on all variants
- Screen-reader-only text announces the `ariaLabel` value
- Decorative shape elements are marked `aria-hidden="true"`

## Related Components

- [VcLoading](../vc-loading/) -- animated overlay for sections already rendered
- [VcProgress](../vc-progress/) -- determinate progress bar
