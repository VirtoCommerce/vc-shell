# VcButton

A versatile button component supporting 9 style variants, multiple sizes, loading state, and icon integration. The primary interactive element for triggering actions.

## When to Use

- Trigger form submissions, data saves, or destructive actions
- Open blades, dialogs, or navigate between views
- Provide toolbar actions and icon-only compact controls
- When NOT to use: for navigation links that change the URL, use a standard `<a>` or router-link; for toggle states, consider a checkbox or switch component

## Basic Usage

```vue
<VcButton variant="primary" @click="handleSave">Save Changes</VcButton>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "danger" \| "warning" \| "success" \| "info" \| "outline" \| "ghost" \| "link"` | `"primary"` | Visual style variant |
| `size` | `"sm" \| "default" \| "lg" \| "icon" \| "icon-sm"` | `"default"` | Button size; `"icon"` renders a 36px square, `"icon-sm"` a 24px square |
| `icon` | `string \| Component` | — | Icon identifier (e.g. `lucide-plus`) or Vue component |
| `iconSize` | `IconSize` | `"s"` | Size of the icon |
| `loading` | `boolean` | `false` | Shows a spinner and disables interaction |
| `disabled` | `boolean` | `false` | Disables the button |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |
| `ariaLabel` | `string` | — | Accessible label (required for icon-only buttons) |

## Variant Guide

| Category | Variants | Purpose |
|----------|----------|---------|
| Filled | `primary`, `danger`, `warning`, `success`, `info` | High-emphasis actions with solid background |
| Structural | `secondary`, `outline` | Medium-emphasis with border, transparent or light background |
| Minimal | `ghost`, `link` | Low-emphasis actions that blend with surrounding content |

## Common Patterns

### Primary Action with Icon

```vue
<VcButton variant="primary" icon="lucide-plus" @click="addItem">
  Add Item
</VcButton>
```

### Destructive Action with Confirmation Loading

```vue
<VcButton
  variant="danger"
  icon="lucide-trash-2"
  :loading="isDeleting"
  @click="deleteItem"
>
  Delete
</VcButton>
```

### Icon-Only Button (Toolbar)

```vue
<VcButton
  variant="ghost"
  size="icon"
  icon="lucide-settings"
  aria-label="Open settings"
  @click="openSettings"
/>
```

### Compact Icon Button (Table Cell)

```vue
<VcButton
  variant="ghost"
  size="icon-sm"
  icon="lucide-pencil"
  aria-label="Edit row"
  @click="editRow(item)"
/>
```

### Secondary Cancel / Primary Save Pair

```vue
<div class="tw-flex tw-gap-2">
  <VcButton variant="secondary" @click="cancel">Cancel</VcButton>
  <VcButton variant="primary" :loading="isSaving" @click="save">Save</VcButton>
</div>
```

### Link-Style Button

```vue
<VcButton variant="link" icon="lucide-external-link" @click="openDocs">
  View Documentation
</VcButton>
```

## Accessibility

- Focus ring appears on `:focus-visible` only (keyboard navigation), not on mouse click
- Touch target is expanded to 44px minimum via a pseudo-element (WCAG 2.5.8)
- `aria-busy` is set during loading state
- `aria-pressed` reflects the `selected` prop
- Icon-only buttons must include `ariaLabel` for screen readers
- Disabled buttons use `pointer-events: none` to prevent interaction

## Related Components

- [VcIcon](../vc-icon/) — used internally for button icons
- [VcBadge](../vc-badge/) — can wrap a button to show notification counts
