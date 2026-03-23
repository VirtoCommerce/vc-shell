# VcRow

A simple layout primitive that arranges child elements in a horizontal flexbox row, automatically switching to a CSS grid on mobile viewports. VcRow has no props of its own — it is a purely presentational wrapper that applies consistent flex behavior and responsive breakpoints so you do not have to repeat the same Tailwind utilities across every horizontal layout.

## When to Use

- Lay out sibling elements (images, cards, form fields) side by side
- Build responsive rows that stack on mobile automatically
- Pair with [VcCol](../vc-col/) for proportional multi-column layouts
- When NOT to use: complex grid layouts with explicit column sizing (use CSS grid or Tailwind utilities directly); single-column stacking (use VcCol alone)

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

### Proportional Columns with VcCol

```vue
<template>
  <VcRow class="tw-gap-6">
    <VcCol :size="1">
      <VcImage :src="product.imageUrl" size="xl" />
    </VcCol>
    <VcCol :size="2">
      <VcInput label="Product Name" v-model="product.name" />
      <VcInput label="SKU" v-model="product.sku" />
    </VcCol>
  </VcRow>
</template>
```

## Recipe: Form Section with Label and Fields

Use VcRow to place a section label next to a group of fields in a blade detail view:

```vue
<template>
  <VcRow class="tw-gap-4 tw-py-4 tw-border-b">
    <VcCol :size="1">
      <span class="tw-font-medium tw-text-sm tw-text-gray-700">Pricing</span>
    </VcCol>
    <VcCol :size="3" class="tw-gap-3">
      <VcInput label="List Price" v-model="form.listPrice" type="number" />
      <VcInput label="Sale Price" v-model="form.salePrice" type="number" />
      <VcSelect label="Currency" v-model="form.currency" :options="currencies" />
    </VcCol>
  </VcRow>
</template>
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--row-gap` | `0` | Gap between child elements |

## Tips

- On mobile (when a `.vc-app--mobile` ancestor is present), VcRow switches from `display: flex` to `display: grid`, causing children to stack vertically. This happens automatically via the framework's responsive class.
- VcRow uses `flex-wrap: nowrap` and `align-items: stretch` by default. If you need wrapping, add `class="tw-flex-wrap"`.
- For spacing, prefer the Tailwind `tw-gap-*` utility over `--row-gap` since it is more intuitive and co-locates with other layout classes.
- VcRow is purely presentational — it renders a plain `<div>` with no ARIA attributes. Add roles or labels on the content elements as needed.

## Accessibility

- No special ARIA attributes; VcRow is a purely presentational layout container
- On mobile (`.vc-app--mobile` ancestor), switches from `flex` to `grid` for stacked layout

## Related Components

- [VcCol](../vc-col/) -- vertical flex column, the natural child for proportional layouts
- [VcContainer](../vc-container/) -- higher-level layout container for blade content sections
