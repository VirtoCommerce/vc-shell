# VcRating

Read-only rating display component that visualizes a numeric value as stars, a star-and-text combination, or plain text. Designed for displaying aggregate ratings in detail views, list columns, and dashboards.

## When to Use

- Displaying product or seller ratings in detail views
- Showing aggregate review scores in list columns or cards
- Presenting any numeric value on a bounded scale (e.g., 1-5, 1-10)

**Alternatives:**

- For interactive click-to-rate input, this component is display-only and does not support user interaction. Build a custom interactive rating component if needed.
- For a simple numeric field without star visualization, use [VcField](../vc-field/)

## Quick Start

```vue
<template>
  <VcRating :model-value="4" :max="5" label="Customer Rating" />
</template>

<script setup lang="ts">
import { VcRating } from "@vc-shell/framework";
</script>
```

## Display Variants

VcRating offers three visual modes controlled by the `variant` prop:

### Stars (Default)

Renders filled and empty star icons. Best for visual scanning at a glance.

```vue
<VcRating :model-value="4" :max="5" variant="stars" />
<!-- Renders: ★★★★☆ -->
```

### Star and Text

Shows a single filled star icon alongside a numeric fraction. Compact and precise.

```vue
<VcRating :model-value="3" :max="5" variant="star-and-text" />
<!-- Renders: ★ 3/5 -->
```

### Text Only

Displays just the numeric fraction. Minimal footprint for dense layouts like table cells.

```vue
<VcRating :model-value="8" :max="10" variant="text" />
<!-- Renders: 8/10 -->
```

## Custom Max Value

The default scale is 1-5 stars. Override with the `max` prop for different scales:

```vue
<!-- 10-star scale -->
<VcRating :model-value="8" :max="10" variant="star-and-text" />

<!-- 3-point scale -->
<VcRating :model-value="2" :max="3" variant="stars" />
```

> **Tip:** For scales larger than 5, prefer the `"star-and-text"` or `"text"` variant. Rendering 10 individual star icons can be visually crowded.

## Placeholder for No Rating

When `modelValue` is `0`, `null`, or `undefined`, display a placeholder message:

```vue
<VcRating :model-value="0" placeholder="Not rated yet" />
<!-- Renders: "Not rated yet" in muted text -->

<VcRating :model-value="null" placeholder="Awaiting reviews" />
```

If no `placeholder` is provided and the value is falsy, the component renders an empty area.

## Label and Tooltip

Add a label above the rating and an optional tooltip for context:

```vue
<VcRating
  :model-value="4"
  :max="5"
  label="Average Rating"
  tooltip="Based on verified purchases only"
/>
```

The label is rendered using the internal `VcLabel` component with consistent styling across all form fields.

## Details Slot

Add supplementary content below the rating using the `details` slot. This is ideal for review count breakdowns or additional context:

```vue
<VcRating :model-value="4" :max="5" label="Product Rating">
  <template #details>
    <div class="tw-text-sm tw-text-gray-500 tw-mt-1">
      <p>Based on 128 reviews</p>
      <div class="tw-flex tw-justify-between">
        <span>5 stars</span><span>75%</span>
      </div>
      <div class="tw-flex tw-justify-between">
        <span>4 stars</span><span>15%</span>
      </div>
      <div class="tw-flex tw-justify-between">
        <span>3 stars</span><span>5%</span>
      </div>
    </div>
  </template>
</VcRating>
```

> **Note:** The `details` slot is only rendered when `variant` is `"star-and-text"` or `"text"` (i.e., inside the `text-container`). It does not appear in the pure `"stars"` variant.

## Recipe: Product Detail View

Display the rating alongside other product information in a typical detail blade:

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <VcField label="Product Name" :model-value="product.name" />
    <VcField label="SKU" :model-value="product.sku" />
    <VcRating
      :model-value="product.averageRating"
      :max="5"
      variant="star-and-text"
      label="Average Rating"
      tooltip="Based on verified purchases"
    >
      <template #details>
        <span class="tw-text-sm tw-text-gray-500 tw-ml-2">
          ({{ product.reviewCount }} reviews)
        </span>
      </template>
    </VcRating>
    <VcField label="Price" :model-value="formatCurrency(product.price)" />
  </div>
</template>
```

## Recipe: Rating in a Data Table Column

Use the `"star-and-text"` or `"text"` variant in table cell slots for a compact display:

```vue
<VcDataTable :items="products" :columns="columns">
  <VcColumn id="rating" header="Rating" width="120px">
    <template #default="{ item }">
      <VcRating
        :model-value="item.rating"
        :max="5"
        variant="star-and-text"
        placeholder="N/A"
      />
    </template>
  </VcColumn>
</VcDataTable>
```

## Common Mistakes

**Passing a value greater than max**

```
// Wrong -- 7 filled stars out of 5 looks broken
<VcRating :model-value="7" :max="5" />
```

```
// Correct -- clamp the value before passing
<VcRating :model-value="Math.min(product.rating, 5)" :max="5" />
```

**Using the stars variant with a large max value**

```
// Wrong -- 10 tiny star icons are hard to read
<VcRating :model-value="8" :max="10" variant="stars" />
```

```
// Correct -- use star-and-text or text for large scales
<VcRating :model-value="8" :max="10" variant="star-and-text" />
```

**Expecting the details slot to render in stars variant**

```
// Wrong -- the details slot is only available in star-and-text/text variants
<VcRating :model-value="4" variant="stars">
  <template #details>This will not appear</template>
</VcRating>
```

```
// Correct -- switch to star-and-text to use the details slot
<VcRating :model-value="4" variant="star-and-text">
  <template #details>128 reviews</template>
</VcRating>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | -- | Current rating value to display |
| `max` | `number` | `5` | Maximum rating value (defines the scale) |
| `variant` | `"stars" \| "star-and-text" \| "text"` | `"stars"` | Display variant |
| `label` | `string` | -- | Field label text above the rating |
| `tooltip` | `string` | -- | Tooltip shown on the label |
| `placeholder` | `string` | -- | Text shown when `modelValue` is falsy |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `details` | -- | Additional content below the rating (available in `star-and-text` and `text` variants) |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--rating-placeholder-color` | `var(--neutrals-400)` | Color of the placeholder text |
| `--rating-star-size` | `1em` | Size of star icons |
| `--rating-gap` | `2px` | Gap between star icons |
| `--rating-special-color` | `var(--warning-500)` | Color of filled stars |
| `--rating-special-color-hover` | `var(--warning-600)` | Hover color for star icons (reserved for future interactive mode) |
| `--rating-special-color-disabled` | `var(--warning-200)` | Disabled color for star icons (reserved for future use) |

## Accessibility

- The rating display has `role="img"` with a descriptive `aria-label` (e.g., "Rating: 4 out of 5").
- When no value is present, the `aria-label` falls back to the placeholder text or "No rating".
- The label is rendered via `VcLabel` with optional tooltip, maintaining consistent label semantics.
- Star icons are decorative and do not receive focus since the component is display-only.

## Related Components

- [VcField](../vc-field/) -- Read-only field display, often used alongside ratings in detail views
- [VcLabel](../../atoms/vc-label/) -- Label atom used internally for the label and tooltip
- [VcIcon](../../atoms/vc-icon/) -- Renders the star icons internally

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint. No additional props or configuration needed.

