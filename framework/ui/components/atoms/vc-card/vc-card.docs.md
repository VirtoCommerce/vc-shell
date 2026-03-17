# VcCard

A bordered container with an optional header, icon, action buttons, and collapsible body. Used to group related content into visually distinct sections.

## When to Use

- Group form fields or detail sections on a blade
- Create collapsible sections for secondary content
- Highlight success or error states with colored header variants
- When NOT to use: for scrollable content panels, use [VcContainer](../vc-container/); for alert messages, use [VcBanner](../vc-banner/)

## Basic Usage

```vue
<VcCard header="Product Details">
  <div class="tw-p-4">
    <p>Card body content goes here.</p>
  </div>
</VcCard>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `string` | — | Title text displayed in the card header |
| `icon` | `string` | — | Icon identifier shown before the title |
| `variant` | `"default" \| "success" \| "danger"` | `"default"` | Header color variant |
| `isCollapsable` | `boolean` | `false` | Enables collapse/expand on header click |
| `isCollapsed` | `boolean` | `false` | Controls the initial collapsed state |
| `fill` | `boolean` | `false` | Makes body content fill available vertical space |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Card body content |
| `header` | Custom header content (replaces the default title + icon) |
| `actions` | Action buttons rendered on the right side of the header |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `header:click` | — | Emitted when the header is clicked |
| `state:collapsed` | `boolean` | Emitted when collapsed state changes |

## Common Patterns

### Collapsible Section with Icon

```vue
<VcCard
  header="Shipping Information"
  icon="lucide-truck"
  is-collapsable
  @state:collapsed="onToggle"
>
  <div class="tw-p-4">
    <!-- shipping form fields -->
  </div>
</VcCard>
```

### Card with Header Actions

```vue
<VcCard header="Order Items">
  <template #actions>
    <VcButton variant="primary" size="sm" icon="lucide-plus">Add Item</VcButton>
  </template>
  <div class="tw-p-4">
    <!-- order items list -->
  </div>
</VcCard>
```

### Danger Variant for Error State

```vue
<VcCard header="Validation Errors" variant="danger">
  <div class="tw-p-4">
    <ul class="tw-list-disc tw-pl-4">
      <li>SKU is required</li>
      <li>Price must be positive</li>
    </ul>
  </div>
</VcCard>
```

### Initially Collapsed

```vue
<VcCard
  header="Advanced Settings"
  is-collapsable
  is-collapsed
>
  <div class="tw-p-4">
    <!-- advanced form fields -->
  </div>
</VcCard>
```

## Accessibility

- Collapsable headers render with `role="button"` and `tabindex="0"`
- `aria-expanded` reflects the current collapsed state
- `aria-controls` links the header to the body panel via a unique ID
- Supports Enter and Space key activation for toggling
- Focus ring appears on `:focus-visible` for keyboard navigation

## Related Components

- [VcContainer](../vc-container/) — scrollable content wrapper without header/collapsing
- [VcBanner](../vc-banner/) — for alert messages rather than content grouping
- [VcCol](../vc-col/) / [VcRow](../vc-row/) — for grid-based layout within card bodies
