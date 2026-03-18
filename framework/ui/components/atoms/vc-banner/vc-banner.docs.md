# VcBanner

A contextual alert component for displaying important messages, warnings, or status information. VcBanner supports four semantic variants (`info`, `warning`, `danger`, `success`), each with a distinct accent color and left border stripe. Long content is automatically collapsed behind a "Show more" toggle, keeping the blade layout clean while still giving users access to the full message.

## When to Use

- Display validation errors or decline reasons on detail blades
- Show informational notices about feature requirements or limitations
- Warn users before destructive or irreversible actions
- Confirm successful operations inline
- When NOT to use: for brief inline status labels, use [VcBadge](../vc-badge/) with `inline` mode; for toast-style notifications, use the notification system instead; for short helper text below a field, use [VcHint](../vc-hint/)

## Basic Usage

```vue
<VcBanner variant="info" icon="lucide-info">
  <template #title>Heads up!</template>
  You can add components to your app using the CLI.
</VcBanner>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"info" \| "warning" \| "danger" \| "success"` | `"info"` | Semantic color variant |
| `icon` | `string` | -- | Icon identifier (e.g. `lucide-info`, `lucide-triangle-alert`) |
| `iconSize` | `IconSize` | `"l"` | Size of the leading icon |
| `iconVariant` | `IconVariant` | -- | Color variant for the icon |
| `collapsedHeight` | `number` | `100` | Max height in pixels before content becomes collapsible |

## Slots

| Slot | Description |
|------|-------------|
| `title` | Bold title text above the body content |
| `default` | Body/description content |
| `trigger` | Custom expand/collapse trigger (receives `{ isExpanded, toggle }` props) |

## Features

### Auto-Collapsing Content

When the body content exceeds `collapsedHeight` (default 100px), VcBanner automatically collapses it and shows a "Show more" button. A gradient fade at the bottom hints that more content is available. The expand/collapse is animated with a smooth `max-height` transition.

### Left Accent Stripe

Each variant displays a 3px colored stripe on the left border, providing a strong visual signal even when the banner is seen in peripheral vision. The stripe color matches the variant's accent.

### Legacy Variant Support

For backward compatibility, the deprecated variants `"light-danger"`, `"info-dark"`, and `"primary"` are automatically mapped to `"danger"`, `"info"`, and `"info"` respectively. A console warning is emitted in development mode.

## Common Patterns

### Validation Error List

```vue
<VcBanner variant="danger" icon="lucide-circle-alert" :collapsed-height="60">
  <template #title>Validation Errors</template>
  <ul class="tw-list-disc tw-pl-4 tw-mt-1 tw-space-y-1">
    <li>Product SKU is required and must be unique</li>
    <li>Price must be a positive number</li>
    <li>At least one product image is required</li>
  </ul>
</VcBanner>
```

### Decline Reason on a Detail Blade

```vue
<VcBanner
  v-if="declineReason"
  variant="danger"
  icon="lucide-circle-alert"
  icon-variant="danger"
>
  <template #title>Decline Reason</template>
  {{ declineReason }}
</VcBanner>
```

### Title-Only Warning

```vue
<VcBanner variant="warning" icon="lucide-triangle-alert">
  <template #title>This action cannot be undone.</template>
</VcBanner>
```

### Success Confirmation

```vue
<VcBanner variant="success" icon="lucide-circle-check">
  Your changes have been saved successfully.
</VcBanner>
```

## Recipe: Banner at the Top of a Blade

Place a banner inside a blade to notify the user of important context before they interact with the form:

```vue
<template>
  <VcBlade title="Edit Product">
    <VcBanner
      v-if="product.isDiscontinued"
      variant="warning"
      icon="lucide-triangle-alert"
    >
      <template #title>Discontinued Product</template>
      This product has been marked as discontinued. Editing is limited to metadata fields only.
    </VcBanner>

    <VcInput label="Name" v-model="product.name" :disabled="product.isDiscontinued" />
    <VcTextarea label="Notes" v-model="product.notes" />
  </VcBlade>
</template>
```

## Recipe: Custom Expand/Collapse Trigger

Override the default "Show more" button with a custom trigger:

```vue
<VcBanner variant="info" icon="lucide-info" :collapsed-height="80">
  <template #title>Release Notes</template>
  <div v-html="releaseNotesHtml" />
  <template #trigger="{ isExpanded, toggle }">
    <VcLink @click="toggle">
      {{ isExpanded ? 'Collapse' : 'Read full release notes' }}
    </VcLink>
  </template>
</VcBanner>
```

## Tips

- The `collapsedHeight` prop controls when the "Show more" toggle appears. Set a lower value (e.g., `60`) for compact layouts or a higher value (e.g., `200`) if you want more content visible by default.
- Title-only banners (no default slot content) are vertically centered and do not show the expand/collapse trigger.
- The gradient fade overlay at the bottom of collapsed content uses the banner's background color, so it blends seamlessly regardless of variant.
- Use the recommended icon for each variant: `lucide-info` for info, `lucide-triangle-alert` for warning, `lucide-circle-alert` for danger, `lucide-circle-check` for success.

## Accessibility

- Danger and warning variants render with `role="alert"` for screen reader announcement
- Info and success variants render with `role="region"`
- Appropriate `aria-label` is set based on variant ("Error", "Warning", "Information")
- The collapse trigger button has `aria-expanded` state
- Icon is marked `aria-hidden="true"` since the variant conveys meaning via color and role

## Related Components

- [VcHint](../vc-hint/) -- for short helper text below form fields
- [VcCard](../vc-card/) -- for general-purpose content containers
- [VcIcon](../vc-icon/) -- used internally for the leading icon
- [VcBadge](../vc-badge/) -- for inline status pill labels
