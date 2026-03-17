# VcLabel

A form field label component with support for required indicators, info tooltips, multilanguage badges, and error states. Renders as a `<label>` when linked to an input, or a `<div>` otherwise.

## When to Use

- Label form inputs, selects, and textareas
- Indicate required fields with an asterisk
- Provide contextual help via tooltip icons
- Show the current language on multilingual fields
- When NOT to use: for helper text below a field, use [VcHint](../vc-hint/); for section headings, use a standard heading element or [VcCard](../vc-card/) header

## Basic Usage

```vue
<VcLabel html-for="product-name" required>
  Product Name
  <template #tooltip>The display name shown to customers</template>
</VcLabel>
<input id="product-name" />
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `required` | `boolean` | `false` | Shows a red asterisk after the label text |
| `error` | `boolean` | `false` | Renders the label in error state (danger color) |
| `htmlFor` | `string` | — | Links the label to an input; when set, renders as `<label for="...">` |
| `tooltipIcon` | `string` | `"lucide-info"` | Icon used for the tooltip trigger |
| `multilanguage` | `boolean` | `false` | Shows a language indicator badge |
| `currentLanguage` | `string` | — | Language code displayed in the badge (e.g. `"EN"`, `"DE"`) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Label text content |
| `tooltip` | Content displayed inside the tooltip popover |

## Common Patterns

### Required Field with Tooltip

```vue
<VcLabel html-for="sku" required>
  SKU
  <template #tooltip>
    Stock Keeping Unit. Must be unique across all products.
  </template>
</VcLabel>
```

### Multilanguage Field Label

```vue
<VcLabel html-for="description" multilanguage :current-language="locale">
  Description
</VcLabel>
```

### Error State

```vue
<VcLabel html-for="price" required :error="!!errors.price">
  Price
</VcLabel>
<VcInput id="price" v-model="form.price" :error="!!errors.price" />
<VcHint v-if="errors.price" error>{{ errors.price }}</VcHint>
```

### Simple Label Without Tooltip

```vue
<VcLabel html-for="notes">Notes</VcLabel>
```

## Accessibility

- Renders as a native `<label>` when `htmlFor` is provided, creating an implicit input association
- The required asterisk is marked `aria-hidden="true"` since the required state should be communicated via `aria-required` on the input itself
- Tooltip icon is focusable and keyboard-accessible via the underlying VcTooltip component
- Error state changes the visual color but does not add ARIA attributes to the label; pair with `aria-invalid` and `aria-describedby` on the input

## Related Components

- [VcHint](../vc-hint/) — helper/error text placed below the input
- [VcTooltip](../vc-tooltip/) — used internally for the info tooltip
- [VcInput](../../molecules/vc-input/) — form input component commonly paired with VcLabel
