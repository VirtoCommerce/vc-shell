# VcHint

A small text component for displaying helper text, validation messages, or supplementary guidance below form fields.

## When to Use

- Show helper text beneath input fields explaining expected format or constraints
- Display validation error messages in a consistent style
- Provide supplementary guidance like file size limits or password requirements
- When NOT to use: for prominent alert messages, use [VcBanner](../vc-banner/); for field labels, use [VcLabel](../vc-label/)

## Basic Usage

```vue
<VcHint>Maximum file size: 5MB</VcHint>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | Optional id for linking with `aria-describedby` on the associated input |
| `error` | `boolean` | `false` | Shows the hint in error state (danger color) |

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--hint-color` | `var(--neutrals-500)` | Default text color |
| `--hint-error-color` | `var(--danger-500)` | Text color in error state |
| `--hint-font-size` | `12px` | Font size |
| `--hint-line-height` | `1.4` | Line height |

## Common Patterns

### Helper Text Below an Input

```vue
<VcInput label="Email" v-model="email" aria-describedby="email-hint" />
<VcHint id="email-hint">We'll never share your email with anyone else.</VcHint>
```

### Validation Error Message

```vue
<VcInput label="SKU" v-model="sku" :error="!isValid" aria-describedby="sku-hint" />
<VcHint v-if="!isValid" id="sku-hint" error>SKU must be unique and non-empty.</VcHint>
```

### Multiple Requirement Hints

```vue
<VcLabel>Password</VcLabel>
<VcInput type="password" v-model="password" />
<VcHint>Must be at least 8 characters long</VcHint>
<VcHint>Must include at least one number</VcHint>
<VcHint>Must include at least one special character</VcHint>
```

### Hint with Inline Link

```vue
<VcHint>
  This field is optional. Learn more in our
  <a href="/docs" class="tw-text-[color:var(--primary-500)] tw-underline">documentation</a>.
</VcHint>
```

## Accessibility

- When `error` is true, the hint renders with `role="alert"` for live screen reader announcement
- Use the `id` prop with `aria-describedby` on the associated input to create a programmatic link
- Muted color styling differentiates hints from primary content visually

## Related Components

- [VcLabel](../vc-label/) — field label component, typically placed above the input
- [VcBanner](../vc-banner/) — for longer or more prominent alert messages
- [VcInput](../../molecules/vc-input/) — form input component often paired with VcHint
