# VcBanner

A contextual alert component for displaying important messages, warnings, or status information. Automatically collapses long content with a "Show more" toggle.

## When to Use

- Display validation errors or decline reasons on detail blades
- Show informational notices about feature requirements or limitations
- Warn users before destructive or irreversible actions
- Confirm successful operations inline
- When NOT to use: for brief inline status labels, use [VcBadge](../vc-badge/) with `inline` mode; for toast-style notifications, use the notification system instead

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
| `icon` | `string` | — | Icon identifier (e.g. `lucide-info`, `lucide-triangle-alert`) |
| `iconSize` | `IconSize` | `"l"` | Size of the leading icon |
| `iconVariant` | `IconVariant` | — | Color variant for the icon |
| `collapsedHeight` | `number` | `100` | Max height in pixels before content becomes collapsible |

## Slots

| Slot | Description |
|------|-------------|
| `title` | Bold title text above the body content |
| `default` | Body/description content |
| `trigger` | Custom expand/collapse trigger (receives `{ isExpanded, toggle }` props) |

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

## Accessibility

- Danger and warning variants render with `role="alert"` for screen reader announcement
- Info and success variants render with `role="region"`
- Appropriate `aria-label` is set based on variant ("Error", "Warning", "Information")
- The collapse trigger button has `aria-expanded` state
- Icon is marked `aria-hidden="true"` since the variant conveys meaning via color and role

## Related Components

- [VcHint](../vc-hint/) — for short helper text below form fields
- [VcCard](../vc-card/) — for general-purpose content containers
- [VcIcon](../vc-icon/) — used internally for the leading icon
