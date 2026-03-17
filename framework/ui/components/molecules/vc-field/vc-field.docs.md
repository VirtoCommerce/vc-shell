# VcField

Read-only display component for labeled information, supporting various content types like text, dates, links, and emails.

## When to Use

- Displaying read-only detail fields in blade views (e.g., order date, customer email)
- Showing labeled key-value pairs in summary sections
- When NOT editing data — use `VcInput` for editable fields

## Basic Usage

```vue
<template>
  <VcField label="Customer Name" model-value="John Doe" />
</template>

<script setup lang="ts">
import { VcField } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label text |
| `modelValue` | `string \| number \| Date` | — | Field content to display |
| `type` | `"text" \| "date" \| "date-ago" \| "link" \| "email"` | `"text"` | Content type for formatting |
| `copyable` | `boolean` | `false` | Show a copy-to-clipboard button |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction of label and value |
| `aspectRatio` | `[number, number]` | `[1, 1]` | Column width ratio for label and value in horizontal mode |
| `tooltip` | `string` | — | Tooltip shown on the label |

## Common Patterns

### Order Details Panel

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <VcField label="Order Number" model-value="ORD-2024-1234" copyable />
    <VcField label="Created" :model-value="order.createdDate" type="date" />
    <VcField label="Last Modified" :model-value="order.modifiedDate" type="date-ago" />
    <VcField label="Store URL" :model-value="order.storeUrl" type="link" />
    <VcField label="Contact Email" :model-value="order.email" type="email" />
  </div>
</template>
```

### Horizontal Layout with Custom Ratio

```vue
<VcField
  label="Description"
  model-value="Premium subscription plan with extended features"
  orientation="horizontal"
  :aspect-ratio="[1, 3]"
/>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--field-gap` | `0.5rem` | Gap between label and value in vertical mode |

## Accessibility

- The label is rendered via `VcLabel`, which associates with the field content
- The copy button has `aria-label="Copy to clipboard"`
- Provides visual feedback (checkmark icon) after successful copy

## Related Components

- [VcInput](../vc-input/) — editable text field (use instead when user input is needed)
- [VcLabel](../../atoms/vc-label/) — standalone label atom used internally
