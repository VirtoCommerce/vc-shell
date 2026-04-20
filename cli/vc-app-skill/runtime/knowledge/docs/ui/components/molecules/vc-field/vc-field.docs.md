# VcField

Read-only display component for labeled information, supporting various content types like text, dates, links, and emails.

## Overview

Blade detail views often need to show read-only information alongside editable fields: creation dates, order numbers, customer emails, store URLs, and similar metadata. Using `VcInput` in a disabled state for this purpose adds unnecessary complexity and visual noise.

`VcField` is a purpose-built read-only display component that renders a labeled value with type-aware formatting. It supports dates (absolute and relative), clickable links, email addresses with `mailto:` links, and plain text. An optional copy-to-clipboard button lets users quickly grab values like order IDs or tracking numbers.

The component uses a vertical layout by default (label above value), but supports horizontal layout with configurable column aspect ratios for key-value pair displays.

## When to Use

- Displaying read-only detail fields in blade views (e.g., order date, customer email)
- Showing labeled key-value pairs in summary sections
- When NOT editing data -- use `VcInput` for editable fields

## Basic Usage

```vue
<template>
  <VcField
    label="Customer Name"
    model-value="John Doe"
  />
</template>

<script setup lang="ts">
import { VcField } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop          | Type                                                  | Default      | Description                                               |
| ------------- | ----------------------------------------------------- | ------------ | --------------------------------------------------------- |
| `label`       | `string`                                              | --           | Field label text                                          |
| `modelValue`  | `string \| number \| Date`                            | --           | Field content to display                                  |
| `type`        | `"text" \| "date" \| "date-ago" \| "link" \| "email"` | `"text"`     | Content type for formatting                               |
| `copyable`    | `boolean`                                             | `false`      | Show a copy-to-clipboard button                           |
| `orientation` | `"vertical" \| "horizontal"`                          | `"vertical"` | Layout direction of label and value                       |
| `aspectRatio` | `[number, number]`                                    | `[1, 1]`     | Column width ratio for label and value in horizontal mode |
| `tooltip`     | `string`                                              | --           | Tooltip shown on the label                                |

## Type Formatting

Each `type` value renders the content differently:

| Type         | Behavior                                                 |
| ------------ | -------------------------------------------------------- |
| `"text"`     | Renders the value as plain text                          |
| `"date"`     | Formats the value as a localized date string             |
| `"date-ago"` | Formats the value as relative time (e.g., "3 hours ago") |
| `"link"`     | Renders as a clickable `<a>` tag opening in a new tab    |
| `"email"`    | Renders as a clickable `mailto:` link                    |

## Common Patterns

### Order Details Panel

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-4">
    <VcField
      label="Order Number"
      model-value="ORD-2024-1234"
      copyable
    />
    <VcField
      label="Created"
      :model-value="order.createdDate"
      type="date"
    />
    <VcField
      label="Last Modified"
      :model-value="order.modifiedDate"
      type="date-ago"
    />
    <VcField
      label="Store URL"
      :model-value="order.storeUrl"
      type="link"
    />
    <VcField
      label="Contact Email"
      :model-value="order.email"
      type="email"
    />
  </div>
</template>
```

### Horizontal Layout with Custom Ratio

Use horizontal layout for compact key-value displays where the label and value sit side by side. The `aspectRatio` controls the relative widths of the label and value columns:

```vue
<template>
  <div class="tw-flex tw-flex-col tw-gap-2">
    <VcField
      label="Description"
      model-value="Premium subscription plan with extended features"
      orientation="horizontal"
      :aspect-ratio="[1, 3]"
    />
    <VcField
      label="SKU"
      model-value="PREM-SUB-001"
      orientation="horizontal"
      :aspect-ratio="[1, 3]"
      copyable
    />
    <VcField
      label="Status"
      model-value="Active"
      orientation="horizontal"
      :aspect-ratio="[1, 3]"
    />
  </div>
</template>
```

### Copyable ID Fields

The copy button provides visual feedback (checkmark icon for 1 second) after a successful copy:

```vue
<template>
  <VcField
    label="Order ID"
    :model-value="order.id"
    copyable
  />
  <VcField
    label="Tracking Number"
    :model-value="shipment.trackingNumber"
    copyable
  />
  <VcField
    label="API Key"
    :model-value="apiKey"
    copyable
  />
</template>
```

### Conditional Type Based on Data

```vue
<template>
  <VcField
    v-for="field in displayFields"
    :key="field.name"
    :label="field.label"
    :model-value="field.value"
    :type="field.type"
    :copyable="field.copyable"
  />
</template>

<script setup lang="ts">
const displayFields = computed(() => [
  { name: "email", label: "Email", value: order.value.email, type: "email" as const },
  { name: "created", label: "Created", value: order.value.createdDate, type: "date-ago" as const },
  { name: "website", label: "Website", value: order.value.storeUrl, type: "link" as const, copyable: true },
]);
</script>
```

## CSS Variables

| Variable      | Default  | Description                                  |
| ------------- | -------- | -------------------------------------------- |
| `--field-gap` | `0.5rem` | Gap between label and value in vertical mode |

## Accessibility

- The label is rendered via `VcLabel`, which associates with the field content
- The copy button has `aria-label="Copy to clipboard"`
- Provides visual feedback (checkmark icon) after successful copy

## Tip: Prefer VcField Over Disabled VcInput

For read-only display, `VcField` is lighter and cleaner than a disabled `VcInput`. It renders without form-field chrome (borders, focus rings, placeholder) and formats content type-aware:

```vue
<!-- Preferred: clean, type-aware display -->
<VcField label="Created" :model-value="order.createdDate" type="date-ago" />

<!-- Avoid: disabled input adds unnecessary visual noise -->
<VcInput label="Created" :model-value="formattedDate" disabled />
```

## Common Mistake

The `type` prop affects rendering, not validation. Setting `type="email"` does not validate the email format -- it only renders the value as a `mailto:` link. For input validation, use VcInput with validation rules.

## Related Components

- [VcInput](../vc-input/) -- editable text field (use instead when user input is needed)
- [VcLabel](../../atoms/vc-label/) -- standalone label atom used internally
- [VcCol](../../atoms/vc-col/) -- column layout atom used for aspect ratio

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint. No additional props or configuration needed.
