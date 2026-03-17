# VcForm

Lightweight HTML `<form>` wrapper that provides consistent styling and prevents default browser submission.

## When to Use

- Wrapping groups of form fields that should submit together
- Any blade or dialog that collects user input
- When NOT needed: purely read-only views — use plain `<div>` or `VcField` instead

## Basic Usage

```vue
<template>
  <VcForm @submit="handleSubmit">
    <VcInput v-model="name" label="Name" required />
    <VcInput v-model="email" label="Email" required />
    <VcButton type="submit">Save</VcButton>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcForm, VcInput, VcButton } from "@vc-shell/framework";

const name = ref("");
const email = ref("");

function handleSubmit() {
  console.log("Submitted:", { name: name.value, email: email.value });
}
</script>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | — | Accessible label for the form element |
| `ariaLabelledby` | `string` | — | ID of an element that labels the form |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | — | Emitted on form submission (native submit is prevented) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Form content (inputs, buttons, fieldsets) |

## Common Patterns

### Two-Column Layout

```vue
<VcForm aria-label="Product details" @submit="save">
  <div class="tw-flex tw-flex-col tw-gap-4">
    <div class="tw-flex tw-gap-4">
      <VcInput v-model="firstName" label="First Name" class="tw-w-1/2" />
      <VcInput v-model="lastName" label="Last Name" class="tw-w-1/2" />
    </div>
    <VcInput v-model="email" label="Email" />
    <VcButton type="submit">Submit</VcButton>
  </div>
</VcForm>
```

### With Fieldset Groups

```vue
<VcForm @submit="save">
  <fieldset>
    <legend>Personal Information</legend>
    <VcInput v-model="name" label="Name" />
    <VcInput v-model="phone" label="Phone" />
  </fieldset>
  <fieldset>
    <legend>Address</legend>
    <VcInput v-model="city" label="City" />
    <VcInput v-model="zip" label="ZIP Code" />
  </fieldset>
</VcForm>
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--form-gap` | `1rem` | Default gap between form children |

## Accessibility

- Renders a native `<form>` element with `novalidate` (validation is handled by vee-validate)
- Supports `aria-label` and `aria-labelledby` for screen readers
- `submit` event is already `preventDefault`-ed

## Related Components

- [VcInput](../vc-input/) — text input field
- [VcCheckboxGroup](../vc-checkbox-group/) — grouped checkboxes for form use
- [VcRadioGroup](../vc-radio-group/) — grouped radio buttons for form use
