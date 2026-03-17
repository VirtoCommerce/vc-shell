# VcBadge

A small indicator component for displaying counts, status dots, or short text labels. Supports two rendering modes: positioned overlay on a slotted element, or standalone inline badge.

## When to Use

- Show unread notification counts on icons or buttons
- Display item counts (cart, wishlist, messages)
- Indicate status with a colored dot (online, new content)
- Render inline tag/pill labels with semantic color variants
- When NOT to use: for longer status text or multi-line content, use [VcBanner](../vc-banner/) instead

## Basic Usage

```vue
<VcBadge content="3" variant="danger">
  <VcIcon icon="lucide-bell" size="xl" />
</VcBadge>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| number` | — | Text or number displayed inside the badge |
| `variant` | `"primary" \| "success" \| "warning" \| "danger" \| "info" \| "secondary"` | `"primary"` | Color variant |
| `size` | `"s" \| "m"` | `"m"` | Badge size |
| `isDot` | `boolean` | `false` | Renders as a small dot without text |
| `inline` | `boolean` | `false` | Renders as an inline element without absolute positioning |
| `clickable` | `boolean` | `false` | Makes the badge respond to click events |
| `disabled` | `boolean` | `false` | Disables interaction on clickable badges |
| `customPosition` | `boolean` | `false` | Enables custom `top`/`right` positioning |

## Common Patterns

### Notification Count on an Icon

```vue
<VcBadge :content="unreadCount" variant="danger">
  <VcButton variant="ghost" size="icon" icon="lucide-bell" aria-label="Notifications" />
</VcBadge>
```

### Dot Indicator for New Content

```vue
<VcBadge is-dot variant="success">
  <VcIcon icon="lucide-message-square" size="l" />
</VcBadge>
```

### Inline Tag / Pill

```vue
<div class="tw-flex tw-gap-2">
  <VcBadge inline content="Active" variant="success" />
  <VcBadge inline content="Draft" variant="secondary" />
  <VcBadge inline content="Rejected" variant="danger" />
</div>
```

### Clickable Badge with Dismiss

```vue
<VcBadge
  :content="count"
  clickable
  variant="primary"
  @click="clearNotifications"
>
  <VcIcon icon="lucide-inbox" size="xl" />
</VcBadge>
```

## Accessibility

- Clickable badges receive `role="button"` and are keyboard-focusable (`tabindex="0"`)
- Supports Enter and Space key activation
- Dot badges default to `aria-label="Notification"` when no custom `ariaLabel` is provided
- Disabled clickable badges set `aria-disabled="true"`
- Focus ring appears on `:focus-visible` for keyboard navigation

## Related Components

- [VcButton](../vc-button/) — for primary interactive actions
- [VcIcon](../vc-icon/) — commonly used as slotted content inside badges
- [VcBanner](../vc-banner/) — for longer contextual messages and alerts
