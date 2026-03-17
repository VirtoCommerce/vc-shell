# VcRow

A simple layout primitive that arranges child elements in a horizontal flexbox row, automatically switching to a grid on mobile viewports.

## When to Use

- Lay out sibling elements (images, cards, form fields) side by side
- Build responsive rows that stack on mobile automatically
- When NOT to use: complex grid layouts with explicit column sizing (use CSS grid or Tailwind utilities directly)

## Basic Usage

```vue
<template>
  <VcRow>
    <VcImage src="/img/a.jpg" size="xl" />
    <VcImage src="/img/b.jpg" size="xl" />
    <VcImage src="/img/c.jpg" size="xl" />
  </VcRow>
</template>

<script setup lang="ts">
import { VcRow, VcImage } from "@vc-shell/framework";
</script>
```

## Key Props

VcRow has no props. It accepts any children via its default slot.

## Common Patterns

### Row with Custom Gap

The `--row-gap` CSS variable (default `0`) controls spacing. You can also override with Tailwind utility classes.

```vue
<template>
  <VcRow class="tw-gap-4">
    <div v-for="i in 4" :key="i" class="tw-p-4 tw-bg-gray-100 tw-rounded">
      Item {{ i }}
    </div>
  </VcRow>
</template>
```

### Cards in a Row

```vue
<template>
  <VcRow class="tw-gap-4">
    <div v-for="card in cards" :key="card.id" class="tw-w-64 tw-p-4 tw-border tw-rounded tw-shadow-sm">
      <h3 class="tw-font-medium">{{ card.title }}</h3>
      <p class="tw-text-sm tw-text-gray-600">{{ card.description }}</p>
    </div>
  </VcRow>
</template>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--row-gap` | `0` | Gap between child elements |

## Accessibility

- No special ARIA attributes; VcRow is a purely presentational layout container
- On mobile (`.vc-app--mobile` ancestor), switches from `flex` to `grid` for stacked layout

## Related Components

- [VcContainer](../vc-container/) -- higher-level layout container for blade content sections
