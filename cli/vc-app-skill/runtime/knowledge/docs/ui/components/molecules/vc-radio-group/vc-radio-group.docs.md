# VcRadioGroup

Accessible radio button group that wraps radio controls in a semantic fieldset with shared label, hint, error state, and layout control.

## When to Use

- Selecting exactly one option from a set (e.g., payment method, shipping speed)
- When radio buttons need shared validation, label, and error messaging
- When NOT to use: for multiple selections, use `VcCheckboxGroup`; for two-state toggle, use `VcSwitch`

## Basic Usage

```vue
<template>
  <VcRadioGroup
    v-model="paymentMethod"
    label="Payment Method"
    :options="methods"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRadioGroup } from "@vc-shell/framework";

const paymentMethod = ref("card");
const methods = [
  { label: "Credit Card", value: "card" },
  { label: "Invoice", value: "invoice" },
  { label: "Cash on Delivery", value: "cash" },
];
</script>
```

## Key Props

| Prop           | Type                         | Default        | Description                               |
| -------------- | ---------------------------- | -------------- | ----------------------------------------- |
| `modelValue`   | `T`                          | —              | Selected value (v-model)                  |
| `options`      | `RadioGroupOption<T>[]`      | `[]`           | Options to render as radio buttons        |
| `label`        | `string`                     | —              | Group label (rendered as fieldset legend) |
| `tooltip`      | `string`                     | —              | Tooltip on the label                      |
| `hint`         | `string`                     | —              | Hint text below the group                 |
| `orientation`  | `"vertical" \| "horizontal"` | `"vertical"`   | Layout direction of options               |
| `name`         | `string`                     | auto-generated | Shared name for native radio inputs       |
| `disabled`     | `boolean`                    | `false`        | Disable all radio buttons                 |
| `required`     | `boolean`                    | `false`        | Mark group as required                    |
| `error`        | `boolean`                    | `false`        | External error flag                       |
| `errorMessage` | `string`                     | —              | Error message text                        |

## RadioGroupOption Interface

```ts
interface RadioGroupOption<V = string | number | boolean> {
  label: string;
  value: V;
  disabled?: boolean; // Disable individual options
}
```

## Events

| Event               | Payload | Description            |
| ------------------- | ------- | ---------------------- |
| `update:modelValue` | `T`     | Selected value changed |

## Slots

| Slot      | Description                                                   |
| --------- | ------------------------------------------------------------- |
| `default` | Custom radio button layout (replaces options-based rendering) |

## Common Patterns

### Horizontal Layout

```vue
<VcRadioGroup
  v-model="priority"
  label="Priority"
  orientation="horizontal"
  :options="[
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]"
/>
```

### With Disabled Option

```vue
<VcRadioGroup
  v-model="plan"
  label="Subscription Plan"
  :options="[
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ]"
/>
```

### Validation Error

```vue
<VcRadioGroup v-model="selected" label="Shipping Method" required :error="!selected" error-message="Select a shipping method" :options="shippingOptions" />
```

### Custom Slot Layout

```vue
<VcRadioGroup v-model="frequency" label="Newsletter Frequency" hint="Custom layout via default slot" orientation="horizontal" name="newsletter-frequency">
  <VcRadioButton v-model="frequency" value="daily" label="Daily" />
  <VcRadioButton v-model="frequency" value="weekly" label="Weekly" />
  <VcRadioButton v-model="frequency" value="monthly" label="Monthly" />
</VcRadioGroup>
```

## Accessibility

- Container is a `<fieldset>` with `role="radiogroup"`
- Label is rendered as a `<legend>` element
- All radio buttons share the group `name` attribute
- Hint and error messages are linked via `aria-describedby`
- Arrow keys navigate between options (native radio group behavior)
- Individual options can be disabled independently

## Related Components

- [VcRadioButton](../vc-radio-button/) — individual radio button component
- [VcCheckboxGroup](../vc-checkbox-group/) — multiple-selection option group
- [VcInputGroup](../vc-input-group/) — generic form field group (used internally)

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component renders a skeleton placeholder matching its shape — a control indicator and label block. No configuration needed.
