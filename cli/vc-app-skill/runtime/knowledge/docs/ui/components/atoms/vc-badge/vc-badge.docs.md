# VcBadge

A small indicator component for displaying counts, status dots, or short text labels. Supports two rendering modes: **positioned overlay** on a slotted element (e.g., notification count on a bell icon), or **standalone inline** badge (e.g., a tag/pill label in a list). Inline badges use a softer color palette with tinted backgrounds, while overlay badges use solid fills for maximum contrast.

## When to Use

- Show unread notification counts on icons or buttons
- Display item counts (cart, wishlist, messages)
- Indicate status with a colored dot (online, new content)
- Render inline tag/pill labels with semantic color variants
- When NOT to use: for longer status text or multi-line content, use [VcBanner](../vc-banner/) instead; for labeled multi-state indicators, consider [VcStatus](../vc-status/)

## Basic Usage

```vue
<VcBadge content="3" variant="danger">
  <VcIcon icon="lucide-bell" size="xl" />
</VcBadge>
```

## Key Props

| Prop             | Type                                                                       | Default     | Description                                               |
| ---------------- | -------------------------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `content`        | `string \| number`                                                         | --          | Text or number displayed inside the badge                 |
| `variant`        | `"primary" \| "success" \| "warning" \| "danger" \| "info" \| "secondary"` | `"primary"` | Color variant                                             |
| `size`           | `"s" \| "m"`                                                               | `"m"`       | Badge size                                                |
| `isDot`          | `boolean`                                                                  | `false`     | Renders as a small dot without text                       |
| `inline`         | `boolean`                                                                  | `false`     | Renders as an inline element without absolute positioning |
| `clickable`      | `boolean`                                                                  | `false`     | Makes the badge respond to click events                   |
| `disabled`       | `boolean`                                                                  | `false`     | Disables interaction on clickable badges                  |
| `customPosition` | `boolean`                                                                  | `false`     | Enables custom `top`/`right` positioning                  |
| `top`            | `string`                                                                   | --          | Custom top offset (requires `customPosition`)             |
| `right`          | `string`                                                                   | --          | Custom right offset (requires `customPosition`)           |
| `ariaLabel`      | `string`                                                                   | --          | Custom accessible label for the badge                     |

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
<VcBadge :content="count" clickable variant="primary" @click="clearNotifications">
  <VcIcon icon="lucide-inbox" size="xl" />
</VcBadge>
```

## Recipe: Status Tags in a Table Cell

```vue
<VcColumn id="status" header="Status" :width="120">
  <template #default="{ row }">
    <VcBadge
      inline
      :content="row.status"
      :variant="statusVariantMap[row.status]"
      size="s"
    />
  </template>
</VcColumn>
```

```ts
const statusVariantMap: Record<string, string> = {
  Active: "success",
  Pending: "warning",
  Archived: "secondary",
  Rejected: "danger",
};
```

## Recipe: Custom Positioned Badge

Fine-tune the badge position relative to its parent:

```vue
<VcBadge content="NEW" variant="info" custom-position top="-4px" right="-12px">
  <img src="/product.jpg" class="tw-w-16 tw-h-16 tw-rounded" />
</VcBadge>
```

## Tips

- Content longer than 2 characters is automatically truncated with an ellipsis and capped at 40px width. For short counts, prefer numbers (`3`, `99+`) over words.
- Inline badges use a softer color scheme (e.g., `bg-primary-50` / `text-primary-700`) compared to overlay badges that use solid fills (`bg-primary-500` / white text). This is handled automatically based on the `inline` prop.
- The `isDot` variant ignores the `content` prop entirely and renders a small circle. Use it for presence indicators (online/offline) rather than counts.
- When `clickable` is true, the badge gains `role="button"`, `tabindex="0"`, and keyboard event handlers for Enter and Space. Always provide an `ariaLabel` for clickable badges so screen readers can announce the action.

## Accessibility

- Clickable badges receive `role="button"` and are keyboard-focusable (`tabindex="0"`)
- Supports Enter and Space key activation
- Dot badges default to `aria-label="Notification"` when no custom `ariaLabel` is provided
- Disabled clickable badges set `aria-disabled="true"`
- Focus ring appears on `:focus-visible` for keyboard navigation

## Related Components

- [VcButton](../vc-button/) -- for primary interactive actions
- [VcIcon](../vc-icon/) -- commonly used as slotted content inside badges
- [VcBanner](../vc-banner/) -- for longer contextual messages and alerts
- [VcStatus](../vc-status/) -- labeled multi-variant status indicator
