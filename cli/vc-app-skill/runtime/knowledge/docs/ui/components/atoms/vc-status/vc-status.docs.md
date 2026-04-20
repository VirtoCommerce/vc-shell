# VcStatus

A colored badge that communicates the state of an entity -- such as an order, product, or workflow step -- using semantic color variants.

## When to Use

- Display order or fulfillment status (e.g., "Paid", "Pending", "Cancelled")
- Tag items with severity levels in tables or detail views
- Show a compact dot indicator when label text is not needed
- When NOT to use: boolean on/off state (use [VcStatusIcon](../vc-status-icon/) instead)

## Basic Usage

```vue
<template>
  <VcStatus variant="success">Published</VcStatus>
</template>

<script setup lang="ts">
import { VcStatus } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop      | Type                                                                                         | Default  | Description                                                                  |
| --------- | -------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `variant` | `"info" \| "warning" \| "danger" \| "success" \| "light-danger" \| "info-dark" \| "primary"` | `"info"` | Semantic color theme                                                         |
| `extend`  | `boolean`                                                                                    | --       | Extended layout with larger padding, rounded corners, and colored background |
| `dot`     | `boolean`                                                                                    | `false`  | Renders as a small colored circle without text                               |

## Common Patterns

### Status in a Table Cell

```vue
<template>
  <VcStatus :variant="statusVariant(order.status)">
    {{ order.status }}
  </VcStatus>
</template>

<script setup lang="ts">
function statusVariant(status: string) {
  const map: Record<string, string> = {
    Paid: "success",
    Pending: "warning",
    Cancelled: "danger",
    Draft: "info",
  };
  return map[status] ?? "info";
}
</script>
```

### Dot Indicators

Use the `dot` prop for compact status representation alongside text labels.

```vue
<template>
  <div class="tw-flex tw-items-center tw-gap-2">
    <VcStatus
      variant="success"
      dot
    />
    <span>Online</span>
  </div>
</template>
```

### Extended Alert-Style Status

The `extend` prop creates a banner-like status with a colored background, suitable for detail blade headers.

```vue
<template>
  <VcStatus
    variant="danger"
    extend
  >
    <div class="tw-flex tw-items-center">
      <VcIcon
        icon="lucide-triangle-alert"
        size="xl"
        variant="danger"
        class="tw-mr-3"
      />
      <div>
        <h3 class="tw-font-bold">Payment Failed</h3>
        <p>The last transaction was declined. Please update your payment method.</p>
      </div>
    </div>
  </VcStatus>
</template>
```

## CSS Custom Properties

Each variant has its own set of CSS variables following the pattern `--status-{variant}-color`, `--status-{variant}-main-color`, `--status-{variant}-bg-color`. Key shared variables:

| Variable                          | Default               | Description                       |
| --------------------------------- | --------------------- | --------------------------------- |
| `--status-border-radius`          | `9999px`              | Pill shape for standard mode      |
| `--status-border-radius-extended` | `6px`                 | Rounded corners for extended mode |
| `--status-dot-size`               | `10px`                | Diameter of the dot indicator     |
| `--status-text-color`             | `var(--neutrals-700)` | Default label text color          |

## Accessibility

- `role="status"` for screen reader announcements
- In `dot` mode, `aria-label` is set to the variant name so the color meaning is conveyed
- Text content is truncated with `text-overflow: ellipsis` in standard mode; extended mode wraps normally

## Related Components

- [VcStatusIcon](../vc-status-icon/) -- boolean check/cross icon for active/inactive states
- [VcBadge](../vc-badge/) -- numeric count badge overlay
