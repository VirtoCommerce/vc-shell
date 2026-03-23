# VcDatePicker

A date and datetime picker that wraps the [VueDatePicker](https://vue3datepicker.com/) library with the standard form field chrome (label, hint, error, focus ring). Formats dates using the browser's locale and automatically detects 12-hour vs. 24-hour time format.

## When to Use

- Selecting a single date value (e.g., delivery date, publication date)
- Selecting a date and time value (e.g., scheduled publishing, event start)
- When consistent locale-aware date formatting is needed across the application

**When NOT to use:**

- Free-form text entry -- use [VcInput](../vc-input/)
- Time-only input -- use `VcInput` with `type="time"`
- Selecting multiple dates or date ranges -- currently not supported (use VueDatePicker directly)

> **Note:** `VcInput` with `type="date"` or `type="datetime-local"` automatically delegates to this component internally. You can also use `VcDatePicker` directly for more explicit control over date-specific props.

## Quick Start

```vue
<template>
  <VcDatePicker v-model="date" label="Delivery date" placeholder="Pick a date..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcDatePicker } from "@vc-shell/framework";

const date = ref<Date | null>(null);
</script>
```

## Features

### Date vs. DateTime Mode

The `type` prop controls whether the picker shows a date-only calendar or includes an inline time picker.

```vue
<!-- Date only (default) -->
<VcDatePicker v-model="startDate" label="Start date" />

<!-- Date and time -->
<VcDatePicker
  v-model="scheduledAt"
  type="datetime-local"
  label="Schedule publication"
  placeholder="Pick date and time..."
/>
```

In `datetime-local` mode, the time picker is rendered inline below the calendar. The component auto-detects whether to show 12-hour (AM/PM) or 24-hour format based on the browser's locale.

### Clearable

When `clearable` is set, a small "x" button appears once a date is selected, allowing the user to reset the field to `null`.

```vue
<VcDatePicker
  v-model="optionalDate"
  label="Expiration date"
  clearable
  hint="Leave empty for no expiration"
/>
```

### Size Variants

Two height variants are available:

| Size | Value | Height |
|------|-------|--------|
| Default | `"default"` | 36px |
| Small | `"small"` | 32px |

```vue
<VcDatePicker v-model="date" label="Default size" size="default" />
<VcDatePicker v-model="date" label="Small size" size="small" />
```

The small variant is useful in compact layouts such as table filter headers or inline editing fields.

### Custom VueDatePicker Options

Pass any VueDatePicker prop through the `datePickerOptions` prop for advanced configurations like minimum/maximum dates, disabled dates, or calendar starting day.

```vue
<VcDatePicker
  v-model="date"
  label="Booking date"
  :date-picker-options="{
    minDate: new Date(),
    maxDate: new Date(2027, 11, 31),
    noDisabledRange: true,
    weekStart: 1,
  }"
/>
```

> **Tip:** Refer to the [VueDatePicker documentation](https://vue3datepicker.com/) for the full list of available options. All props passed via `datePickerOptions` are spread onto the underlying `<VueDatePicker>` component.

### Validation with vee-validate Field

Integrate with vee-validate for form-level validation:

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.startDate"
    name="startDate"
    rules="required"
  >
    <VcDatePicker
      v-model="form.startDate"
      label="Start date"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field } from "vee-validate";
import { VcDatePicker } from "@vc-shell/framework";

const form = reactive({
  startDate: null as Date | null,
});
</script>
```

### States

```vue
<!-- Required -->
<VcDatePicker v-model="date" label="Due date" required />

<!-- Disabled with a pre-filled value -->
<VcDatePicker :model-value="new Date()" label="Created at" disabled />

<!-- Error state -->
<VcDatePicker
  v-model="date"
  label="Start date"
  :error="true"
  error-message="Start date is required"
/>

<!-- With hint text -->
<VcDatePicker
  v-model="date"
  label="Delivery date"
  hint="Select a date within the next 30 days"
/>
```

### Multilanguage Support

Like other form fields, the date picker supports the multilanguage label indicator:

```vue
<VcDatePicker
  v-model="localizedDate"
  label="Event date"
  multilanguage
  current-language="de-DE"
/>
```

## Recipes

### Date Range with Two Pickers

Use two `VcDatePicker` instances with min/max constraints to create a date range:

```vue
<template>
  <VcRow>
    <VcCol size="6">
      <VcDatePicker
        v-model="range.start"
        label="Start date"
        :date-picker-options="{ maxDate: range.end || undefined }"
        required
      />
    </VcCol>
    <VcCol size="6">
      <VcDatePicker
        v-model="range.end"
        label="End date"
        :date-picker-options="{ minDate: range.start || undefined }"
        required
      />
    </VcCol>
  </VcRow>
</template>

<script setup lang="ts">
import { reactive } from "vue";
const range = reactive({
  start: null as Date | null,
  end: null as Date | null,
});
</script>
```

### Scheduling with DateTime in a Blade

```vue
<template>
  <VcBlade title="Schedule Campaign">
    <VcContainer>
      <VcRow>
        <VcCol size="6">
          <Field
            v-slot="{ errorMessage, handleChange, errors }"
            :model-value="campaign.scheduledAt"
            name="scheduledAt"
            rules="required"
          >
            <VcDatePicker
              v-model="campaign.scheduledAt"
              type="datetime-local"
              label="Launch date and time"
              required
              clearable
              :date-picker-options="{ minDate: new Date() }"
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            />
          </Field>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>
```

## Common Mistakes

### 1. Forgetting to wire handleChange with vee-validate

```vue
<!-- ❌ Field does not know when the date changes -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.date" name="date" rules="required">
  <VcDatePicker v-model="form.date" :error="!!errors.length" :error-message="errorMessage" />
</Field>

<!-- ✅ Always call handleChange -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.date" name="date" rules="required">
  <VcDatePicker
    v-model="form.date"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 2. Passing a string instead of a Date object

```vue
<!-- ❌ May cause formatting issues — VueDatePicker expects Date objects -->
const date = ref("2025-01-15");

<!-- ✅ Use Date objects or null -->
const date = ref<Date | null>(new Date("2025-01-15"));
```

> **Important:** The `modelValue` type accepts `Date | string | null`, but for reliable behavior always prefer `Date` objects. If you receive ISO strings from an API, convert them to `Date` before binding.

### 3. Setting clearable on a required field without handling null

```vue
<!-- ❌ User can clear the field but form requires a value — confusing UX -->
<VcDatePicker v-model="date" label="Start date" required clearable />

<!-- ✅ If clearable + required, add validation to show an error when cleared -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="date" name="date" rules="required">
  <VcDatePicker
    v-model="date"
    label="Start date"
    required
    clearable
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Date \| string \| null` | `undefined` | Bound value via `v-model` |
| `type` | `"date" \| "datetime-local"` | `"date"` | Date only or date + time mode |
| `label` | `string` | -- | Label text above the field |
| `placeholder` | `string` | auto (localized) | Placeholder text; auto-generated from locale if not provided |
| `hint` | `string` | -- | Helper text below the field |
| `tooltip` | `string` | -- | Tooltip on the label info icon |
| `clearable` | `boolean` | `false` | Shows a clear button when a date is selected |
| `loading` | `boolean` | `false` | Shows a spinning loader icon |
| `size` | `"default" \| "small"` | `"default"` | Field height variant |
| `required` | `boolean` | `false` | Shows a required indicator |
| `error` | `boolean` | `false` | Enables error styling |
| `errorMessage` | `string` | -- | Error message below the field |
| `disabled` | `boolean` | `false` | Disables the date picker |
| `autofocus` | `boolean` | `false` | Focus the field on mount |
| `name` | `string` | `"Field"` | HTML name attribute |
| `multilanguage` | `boolean` | `false` | Shows language badge on the label |
| `currentLanguage` | `string` | -- | Language code for the badge |
| `datePickerOptions` | `VueDatePickerProps` | -- | Pass-through options to VueDatePicker |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Date \| string \| null` | Emitted when the selected date changes |
| `focus` | -- | Emitted when the picker gains focus or opens |
| `blur` | `Event` | Emitted when the picker loses focus or closes |

## CSS Variables

Uses the same `--input-*` variables as VcInput for consistent styling across all input molecules:

| Variable | Default | Description |
|----------|---------|-------------|
| `--input-height` | `36px` | Default field height |
| `--input-height-small` | `32px` | Small variant field height |
| `--input-border-radius` | `6px` | Corner radius |
| `--input-border-color` | `var(--neutrals-300)` | Default border color |
| `--input-border-color-focus` | `var(--primary-500)` | Focus border color |
| `--input-border-color-error` | `var(--danger-500)` | Error border color |
| `--input-background-color` | `var(--additional-50)` | Background color |
| `--input-text-color` | `var(--neutrals-800)` | Text color |
| `--input-placeholder-color` | `var(--neutrals-400)` | Placeholder color |
| `--input-focus-ring-color` | `var(--primary-100)` | Focus ring color |
| `--input-error-ring-color` | `var(--danger-100)` | Error ring color |

## Accessibility

- Label is linked via `aria-labelledby`
- Hint and error text are linked via `aria-describedby`
- `aria-invalid` is set in error state
- `aria-required` is set for required fields
- Clear button has `aria-label="Clear date"`
- On mobile, the picker popup teleports to the center of the screen for better usability
- Auto-detects 12h/24h time format from the browser's locale
- Date-only mode limits the maximum date to `9999-12-31` to prevent invalid entries

## Related Components

- [VcInput](../vc-input/) -- general-purpose input; delegates to VcDatePicker for `type="date"` and `type="datetime-local"`
- [VcMultivalue](../vc-multivalue/) -- can handle multiple date values with `type="date"`
