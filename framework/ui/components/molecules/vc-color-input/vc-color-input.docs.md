# VcColorInput

A color input that combines a text field for hex values with a clickable color swatch that opens the native browser color picker. Accepts hex codes and CSS color names.

## When to Use

- Selecting a color value (brand colors, theme settings, product attributes)
- When both manual hex entry and visual picking are desired
- When NOT to use: general text input (use [VcInput](../vc-input/))

> **Note:** `VcInput` with `type="color"` automatically delegates to this component. You can also use `VcColorInput` directly.

## Basic Usage

```vue
<template>
  <VcColorInput v-model="color" label="Brand color" placeholder="Enter hex color..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcColorInput } from "@vc-shell/framework";

const color = ref<string | null>(null);
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| null` | `undefined` | Color value via `v-model` (hex string or CSS color name) |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | -- | Placeholder text |
| `clearable` | `boolean` | `false` | Shows a clear button when a value is present |
| `size` | `"default" \| "small"` | `"default"` | Field height variant |
| `error` / `errorMessage` | `boolean` / `string` | -- | Error styling and validation message |
| `disabled` | `boolean` | `false` | Disables the input and color picker |

## Common Patterns

### With Validation

```vue
<VcColorInput
  v-model="color"
  label="Background color"
  required
  :error="!color"
  error-message="Please select a color"
  clearable
/>
```

### Pre-filled Value

```vue
<VcColorInput v-model="color" label="Accent color" />
<!-- Accepts "#3b82f6", "#fff", "red", "cornflowerblue", etc. -->
```

## How It Works

1. Type a hex value (e.g., `#ff5733`) or a CSS color name (e.g., `red`) in the text field
2. The color swatch updates in real-time to reflect the entered color
3. Click the color swatch to open the native browser color picker
4. Selecting from the picker updates both the swatch and the text field

## Accessibility

- Label linked via `aria-labelledby`
- Hint/error linked via `aria-describedby`
- `aria-invalid` set in error state
- Color swatch button has descriptive `aria-label` (e.g., "Pick color: #ff5733")
- Clear button has `aria-label="Clear color"`
- Focus ring on both the text input and the color swatch button

## CSS Variables

Uses the same `--input-*` variables as VcInput, plus:

- `--color-input-swatch-size` -- swatch square size (default 20px)
- `--color-input-swatch-border-radius`, `--color-input-swatch-border-color`

## Related Components

- [VcInput](../vc-input/) -- general-purpose input (delegates to VcColorInput for `type="color"`)
