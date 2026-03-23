# VcCheckboxGroup

Accessible checkbox group that wraps multiple checkboxes in a semantic fieldset with shared label, hint, error state, and layout control.

## When to Use

- Selecting multiple options from a set (e.g., notification channels, feature flags)
- When checkboxes need shared validation, label, and error messaging
- When NOT to use: for mutually exclusive options, use `VcRadioGroup`; for a single toggle, use `VcCheckbox` or `VcSwitch`

## Basic Usage

```vue
<template>
  <VcCheckboxGroup
    v-model="selected"
    label="Notification Channels"
    :options="channels"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCheckboxGroup } from "@vc-shell/framework";

const selected = ref<string[]>(["email"]);
const channels = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" },
];
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[]` | `[]` | Selected values (v-model) |
| `options` | `CheckboxGroupOption<T>[]` | `[]` | Options to render as checkboxes |
| `label` | `string` | — | Group label (rendered as fieldset legend) |
| `tooltip` | `string` | — | Tooltip on the label |
| `hint` | `string` | — | Hint text below the group |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction of options |
| `size` | `"s" \| "m" \| "l"` | `"s"` | Checkbox size for all items |
| `name` | `string` | auto-generated | Shared name for native checkboxes |
| `disabled` | `boolean` | `false` | Disable all checkboxes |
| `required` | `boolean` | `false` | Mark group as required |
| `error` | `boolean` | `false` | External error flag |
| `errorMessage` | `string` | — | Error message text |

## CheckboxGroupOption Interface

```ts
interface CheckboxGroupOption<V = string | number | boolean> {
  label: string;
  value: V;
  disabled?: boolean;  // Disable individual options
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `T[]` | Selected values changed |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Custom checkbox layout (replaces options-based rendering) |

## Common Patterns

### Horizontal Layout

```vue
<VcCheckboxGroup
  v-model="permissions"
  label="Permissions"
  orientation="horizontal"
  :options="[
    { label: 'Read', value: 'read' },
    { label: 'Write', value: 'write' },
    { label: 'Delete', value: 'delete' },
  ]"
/>
```

### With Disabled Option

```vue
<VcCheckboxGroup
  v-model="selected"
  label="Features"
  :options="[
    { label: 'Basic', value: 'basic' },
    { label: 'Premium', value: 'premium', disabled: true },
    { label: 'Enterprise', value: 'enterprise' },
  ]"
/>
```

### Validation Error

```vue
<VcCheckboxGroup
  v-model="selected"
  label="Required Selection"
  required
  :error="selected.length === 0"
  error-message="Select at least one option"
  :options="options"
/>
```

### Custom Slot Layout

```vue
<VcCheckboxGroup
  v-model="flags"
  label="Feature Flags"
  hint="Custom layout via default slot"
  orientation="horizontal"
  name="feature-flags"
>
  <VcCheckbox v-model="flags" value="feature-a">Feature A</VcCheckbox>
  <VcCheckbox v-model="flags" value="feature-b">Feature B</VcCheckbox>
  <VcCheckbox v-model="flags" value="feature-c">Feature C</VcCheckbox>
</VcCheckboxGroup>
```

## Accessibility

- Container is a semantic `<fieldset>` with `role="group"`
- Label is rendered as a `<legend>` element
- All checkboxes share the group `name` attribute
- Hint and error messages are linked via `aria-describedby`
- Individual options can be disabled independently

## Related Components

- [VcCheckbox](../vc-checkbox/) — individual checkbox component
- [VcRadioGroup](../vc-radio-group/) — mutually exclusive option group
- [VcInputGroup](../vc-input-group/) — generic form field group (used internally)
