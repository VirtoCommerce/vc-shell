# VcRating

Read-only rating display component with star, star-and-text, and text-only variants.

## When to Use

- Displaying product or seller ratings in detail views or list columns
- Showing aggregate review scores
- When NOT to use: for interactive star input (click-to-rate), this component is display-only

## Basic Usage

```vue
<template>
  <VcRating :model-value="4" :max="5" label="Customer Rating" />
</template>

<script setup lang="ts">
import { VcRating } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | — | Current rating value |
| `max` | `number` | `5` | Maximum rating value |
| `variant` | `"stars" \| "star-and-text" \| "text"` | `"stars"` | Display variant |
| `label` | `string` | — | Field label text |
| `tooltip` | `string` | — | Tooltip on the label |
| `placeholder` | `string` | — | Text shown when `modelValue` is falsy |

## Slots

| Slot | Description |
|------|-------------|
| `details` | Additional content below the rating (e.g., review count breakdown) |

## Common Patterns

### Stars Variant

```vue
<VcRating :model-value="4" :max="5" variant="stars" />
<!-- Shows: ★★★★☆ -->
```

### Star and Text Variant

```vue
<VcRating :model-value="3" :max="5" variant="star-and-text" />
<!-- Shows: ★ 3/5 -->
```

### Text Only Variant

```vue
<VcRating :model-value="8" :max="10" variant="text" />
<!-- Shows: 8/10 -->
```

### No Rating Placeholder

```vue
<VcRating :model-value="0" placeholder="Not rated yet" />
```

### With Details Slot

```vue
<VcRating :model-value="4" :max="5" label="Product Rating">
  <template #details>
    <p class="tw-text-sm tw-text-gray-500">Based on 128 reviews</p>
  </template>
</VcRating>
```

### In a Product Detail View

```vue
<div class="tw-flex tw-flex-col tw-gap-4">
  <VcField label="Product Name" :model-value="product.name" />
  <VcRating
    :model-value="product.rating"
    :max="5"
    variant="star-and-text"
    label="Average Rating"
    tooltip="Based on verified purchases"
  />
  <VcField label="Price" :model-value="product.price" />
</div>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--rating-placeholder-color` | `var(--neutrals-400)` | Placeholder text color |
| `--rating-star-size` | `1em` | Star icon size |
| `--rating-gap` | `2px` | Gap between stars |
| `--rating-special-color` | `var(--warning-500)` | Filled star color |

## Accessibility

- Rating content has `role="img"` with a descriptive `aria-label` (e.g., "Rating: 4 out of 5")
- When no value is present, aria-label uses the placeholder text or "No rating"
- Label is rendered via `VcLabel` with optional tooltip

## Related Components

- [VcField](../vc-field/) — read-only field display (used alongside ratings in detail views)
- [VcLabel](../../atoms/vc-label/) — label atom used internally
