# VcLabel

A form field label component with support for required indicators, info tooltips, multilanguage badges, and error states. Renders as a `<label>` when linked to an input via `htmlFor`, or a `<div>` otherwise. VcLabel is the standard way to label any form control in the framework and is used internally by most input molecules (VcInput, VcSelect, VcTextarea, etc.).

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

| Prop              | Type      | Default         | Description                                                           |
| ----------------- | --------- | --------------- | --------------------------------------------------------------------- |
| `required`        | `boolean` | `false`         | Shows a red asterisk after the label text                             |
| `error`           | `boolean` | `false`         | Renders the label in error state (danger color)                       |
| `htmlFor`         | `string`  | --              | Links the label to an input; when set, renders as `<label for="...">` |
| `tooltipIcon`     | `string`  | `"lucide-info"` | Icon used for the tooltip trigger                                     |
| `multilanguage`   | `boolean` | `false`         | Shows a language indicator badge                                      |
| `currentLanguage` | `string`  | --              | Language code displayed in the badge (e.g. `"EN"`, `"DE"`)            |

## Slots

| Slot      | Description                                  |
| --------- | -------------------------------------------- |
| `default` | Label text content                           |
| `tooltip` | Content displayed inside the tooltip popover |

## CSS Custom Properties

| Variable                 | Default               | Description                    |
| ------------------------ | --------------------- | ------------------------------ |
| `--label-text-color`     | `var(--neutrals-700)` | Default text color             |
| `--label-required-color` | `var(--danger-500)`   | Color of the required asterisk |
| `--label-tooltip-color`  | `var(--neutrals-400)` | Tooltip icon color             |
| `--label-lang-color`     | `var(--neutrals-500)` | Language badge text color      |
| `--label-error-color`    | `var(--danger-500)`   | Text color in error state      |

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

## Recipe: Complete Form Field Group

Compose VcLabel, an input, and VcHint into a reusable field pattern:

```vue
<template>
  <div class="tw-space-y-1">
    <VcLabel
      html-for="slug"
      required
      :error="!!slugError"
    >
      URL Slug
      <template #tooltip> The URL-friendly identifier for this page. Auto-generated from the title if left blank. </template>
    </VcLabel>
    <VcInput
      id="slug"
      v-model="form.slug"
      :error="!!slugError"
      aria-describedby="slug-hint"
      aria-required="true"
    />
    <VcHint
      id="slug-hint"
      :error="!!slugError"
    >
      {{ slugError || "Lowercase letters, numbers, and hyphens only." }}
    </VcHint>
  </div>
</template>
```

## Recipe: Custom Tooltip Icon

Use a different icon for the tooltip trigger:

```vue
<VcLabel html-for="api-key" tooltip-icon="lucide-shield">
  API Key
  <template #tooltip>
    Keep this key secret. Rotate it regularly for security.
  </template>
</VcLabel>
```

## Tips

- When `htmlFor` is provided, VcLabel renders as a native `<label>` element. Clicking the label will focus the linked input automatically. Without `htmlFor`, it renders as a `<div>` and does not create an implicit association.
- The required asterisk is purely visual (`aria-hidden="true"`). Always set `aria-required="true"` on the input itself so screen readers convey the requirement.
- The language badge (shown when `multilanguage` is true) appears on the right side of the label and uses a small pill with a neutral background. It displays the value of `currentLanguage` (e.g., "EN", "DE", "FR").
- Label text is truncated with an ellipsis if it overflows. For very long labels, consider using the tooltip slot to provide the full text.

## Accessibility

- Renders as a native `<label>` when `htmlFor` is provided, creating an implicit input association
- The required asterisk is marked `aria-hidden="true"` since the required state should be communicated via `aria-required` on the input itself
- Tooltip icon is focusable and keyboard-accessible via the underlying VcTooltip component
- Error state changes the visual color but does not add ARIA attributes to the label; pair with `aria-invalid` and `aria-describedby` on the input

## Related Components

- [VcHint](../vc-hint/) -- helper/error text placed below the input
- [VcTooltip](../vc-tooltip/) -- used internally for the info tooltip
- [VcInput](../../molecules/vc-input/) -- form input component commonly paired with VcLabel
