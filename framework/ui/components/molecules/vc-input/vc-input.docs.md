# VcInput

A single-line text input component for forms in vc-shell applications. Supports multiple input types (text, number, password, email, and more), prefix/suffix decorations, inner/outer slot content, built-in clearable state, password visibility toggle, loading indicator, debounced model updates, and integration with vee-validate for validation.

## When to Use

| Scenario | Component |
|----------|-----------|
| Single-line text: names, emails, URLs, phone numbers | **VcInput** |
| Password entry with show/hide toggle | **VcInput** `type="password"` |
| Numeric entry (integers or decimals) | **VcInput** `type="number"` or `type="integer"` |
| Input with prefix/suffix text or inner icons | **VcInput** with `prefix`/`suffix` props or slots |
| Multi-line text | [VcTextarea](../vc-textarea/) |
| Rich text / HTML editing | [VcEditor](../vc-editor/) |
| Selecting from a dropdown list | [VcSelect](../vc-select/) |
| Currency with formatting and currency selector | [VcInputCurrency](../vc-input-currency/) |
| Date or date-time picking | [VcDatePicker](../vc-date-picker/) (also available via `type="date"`) |
| Color selection | [VcColorInput](../vc-color-input/) (also available via `type="color"`) |

> **Note:** When you set `type="date"`, `type="datetime-local"`, or `type="color"`, VcInput internally delegates to VcDatePicker or VcColorInput. All props are forwarded automatically. You can use VcInput as a single entry point for all these types, but for date/color-specific options (like `datePickerOptions`), consider using the dedicated component directly.

---

## Quick Start

The simplest possible usage -- a text input bound to a reactive ref:

```vue
<template>
  <VcInput v-model="productName" label="Product Name" placeholder="Enter product name" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput } from "@vc-shell/framework";

const productName = ref("");
</script>
```

This renders a labeled text input with placeholder text. The value is two-way bound via `v-model`.

---

## Input Types

VcInput supports the following `type` values. Each type adjusts the native `<input>` behavior and, in some cases, adds extra UI or filtering logic.

| Type | Behavior |
|------|----------|
| `text` (default) | Standard single-line text input |
| `password` | Masked input with a built-in show/hide toggle button |
| `email` | Native email keyboard on mobile, browser email validation hints |
| `number` | Numeric input; blocks `-`, `e`, `+` keys; emits parsed `number` or `null` |
| `integer` | Like `number` but blocks decimal points and non-digit keys; emits truncated integers |
| `tel` | Telephone keyboard on mobile devices |
| `url` | URL keyboard on mobile devices |
| `time` | Native time input |
| `date` | Delegates to **VcDatePicker** with locale-aware formatting |
| `datetime-local` | Delegates to **VcDatePicker** in datetime mode |
| `color` | Delegates to **VcColorInput** |

### Number vs. Integer

```vue
<!-- Allows decimals: 12.5, 99.99 -->
<VcInput v-model="weight" type="number" label="Weight (kg)" step="0.1" />

<!-- Whole numbers only: 1, 2, 100 -->
<VcInput v-model="quantity" type="integer" label="Quantity" />
```

> **Important:** Both `number` and `integer` types block negative values. The `number` type emits a parsed `float`; the `integer` type emits a truncated `int`. Both emit `null` when the field is cleared.

---

## Validation with vee-validate Field

This is the **standard validation pattern** in vc-shell applications. VcInput does not have built-in validation rules. Instead, you wrap it with the `Field` component from [vee-validate](https://vee-validate.logaretm.com/v4/) and pass validation state through props.

### Basic Pattern

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="form.name"
    name="name"
    rules="required"
  >
    <VcInput
      v-model="form.name"
      label="Name"
      placeholder="Enter name"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field, useForm } from "vee-validate";
import { VcInput } from "@vc-shell/framework";

const { meta } = useForm({ validateOnMount: false });

const form = reactive({
  name: "",
});
</script>
```

### How It Works

1. **`Field` wraps `VcInput`** and manages the validation lifecycle. It does NOT render any extra DOM -- it uses a scoped slot (`v-slot`).
2. **`:model-value` on `Field`** tells vee-validate what the current value is, so it can evaluate rules against it.
3. **`@update:model-value="handleChange"`** is critical. Without it, `Field` never knows the value changed, so validation never triggers. This is the most common mistake developers make.
4. **`errors` and `errorMessage`** flow from `Field` to VcInput's `:error` and `:error-message` props, which control the red border and error text display.
5. **`useForm()`** at the blade level collects all `Field` instances. Use `meta.valid` to check if the entire form passes validation before saving.

### Multiple Rules

```vue
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  :model-value="form.email"
  name="contactEmail"
  :rules="{ required: true, email: true, max: 128 }"
>
  <VcInput
    v-model="form.email"
    type="email"
    label="Contact Email"
    placeholder="user@example.com"
    required
    maxlength="128"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### Checking Form Validity Before Save

```ts
const { meta, resetForm } = useForm({ validateOnMount: false });

// In your toolbar save handler:
async function onSave() {
  if (meta.value.valid) {
    await saveData();
  } else {
    showError("Please fix validation errors before saving.");
  }
}

// Reset validation state when discarding changes:
function onReset() {
  resetFormData();
  resetForm();
}
```

> **Tip:** Set `validateOnMount: false` in `useForm()` to avoid showing errors immediately when the blade opens. Errors will appear after the user interacts with a field.

---

## States

### Disabled

A disabled input is non-interactive, visually dimmed, and has `pointer-events: none`.

```vue
<VcInput v-model="sku" label="SKU" disabled />
```

### Loading

Shows a spinning loader icon inside the field. The input remains interactive.

```vue
<VcInput v-model="search" label="Search" placeholder="Searching..." loading />
```

### Error

Error state is activated when `error` is `true` or `errorMessage` is truthy. The border turns red and an error ring appears. If `errorMessage` is provided, it displays below the field with a slide-up animation.

```vue
<VcInput
  v-model="email"
  label="Email"
  :error="true"
  error-message="Please enter a valid email address"
/>
```

### Required

Adds a red asterisk to the label. This is purely visual -- actual validation must be handled via `Field` from vee-validate (see [Validation](#validation-with-vee-validate-field)).

```vue
<VcInput v-model="name" label="Name" required />
```

---

## Slots

VcInput provides six slots for customizing different areas of the component.

### prepend / append (outer slots)

Content placed **outside** the input border, to the left (`prepend`) or right (`append`). Useful for buttons or labels that are visually separate from the field.

```vue
<VcInput v-model="domain" label="Website" placeholder="example.com">
  <template #prepend>
    <span class="tw-px-3 tw-flex tw-items-center tw-text-sm tw-text-[color:var(--neutrals-500)]">
      https://
    </span>
  </template>
  <template #append>
    <VcButton size="small" @click="verifyDomain">Verify</VcButton>
  </template>
</VcInput>
```

### prepend-inner / append-inner (inner slots)

Content placed **inside** the input border. Useful for icons, badges, or character counters.

```vue
<VcInput v-model="searchQuery" placeholder="Search products...">
  <template #prepend-inner>
    <VcIcon icon="lucide-search" />
  </template>
  <template #append-inner>
    <span class="tw-text-xs tw-text-[color:var(--neutrals-400)]">
      {{ searchQuery.length }}/100
    </span>
  </template>
</VcInput>
```

All four positional slots receive a `{ focus }` function in their scope, which you can call to programmatically focus the native input:

```vue
<template #prepend-inner="{ focus }">
  <VcIcon icon="lucide-search" @click="focus" class="tw-cursor-pointer" />
</template>
```

### control slot

Replaces the native `<input>` element entirely while keeping the VcInput shell (label, border, error display, etc.). Useful for integrating third-party input components.

```vue
<VcInput v-model="maskedPhone" label="Phone">
  <template #control="{ modelValue, emitValue, placeholder }">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="(e) => emitValue((e.target as HTMLInputElement).value)"
      class="tw-w-full tw-h-full tw-outline-none tw-border-none tw-text-sm"
    />
  </template>
</VcInput>
```

| Scope property | Type | Description |
|----------------|------|-------------|
| `modelValue` | `string \| number \| Date \| null` | Current field value |
| `emitValue` | `(value) => void` | Call this to update the model (respects debounce) |
| `placeholder` | `string \| undefined` | The placeholder prop value |
| `editable` | `boolean \| undefined` | Whether the field is disabled |
| `focused` | `boolean \| undefined` | Whether autofocus is set |

### error / hint slots

Override the default error message or hint text rendering.

```vue
<VcInput v-model="code" label="Promo Code" error error-message="Invalid code">
  <template #error>
    <div class="tw-flex tw-items-center tw-gap-1 tw-mt-1 tw-text-[color:var(--danger-500)]">
      <VcIcon icon="lucide-circle-alert" size="xs" />
      <span class="tw-text-xs">This promo code has expired. <a href="#">View active codes</a></span>
    </div>
  </template>
</VcInput>
```

---

## Sizes

Two size variants are available:

| Size | Height | Use case |
|------|--------|----------|
| `"default"` | 36px | Standard forms, blade detail pages |
| `"small"` | 32px | Compact UI, table inline editing, toolbars |

```vue
<VcInput v-model="tag" label="Tag" size="small" placeholder="Enter tag" />
```

---

## Clearable

When `clearable` is `true`, a small "x" button appears inside the field whenever the value is non-empty. Clicking it sets the model to `null`.

```vue
<VcInput v-model="filter" label="Filter" clearable placeholder="Type to filter..." />
```

> **Note:** The clear button does not appear on `type="password"` fields. Password fields always show the show/hide toggle instead.

---

## Prefix and Suffix

Static text displayed inside the field, before or after the user's input. Useful for units, currency symbols, or URL protocols.

```vue
<VcInput v-model="price" type="number" label="Price" prefix="$" suffix="USD" placeholder="0.00" />
```

Prefix and suffix elements are non-interactive (`pointer-events: none`) and do not receive focus.

---

## Debounce

Delays the `update:modelValue` emission by the specified number of milliseconds. Useful for search fields to avoid firing API requests on every keystroke.

```vue
<VcInput
  v-model="searchQuery"
  placeholder="Search products..."
  :debounce="300"
/>
```

When debounce is set, the internal `temp` value updates immediately (so the user sees their typing), but the `v-model` update and any `@update:model-value` handlers fire only after the debounce period elapses without further input.

---

## Multilanguage Label

When a field supports multiple languages, enable the language badge on the label:

```vue
<VcInput
  v-model="localizedName"
  label="Product Name"
  multilanguage
  current-language="en-US"
/>
```

This renders a small language indicator (e.g., "EN-US") next to the label, signaling to the user which language they are editing.

---

## Tooltip

Display additional context about a field via a tooltip icon next to the label:

```vue
<VcInput
  v-model="slug"
  label="URL Slug"
  tooltip="The URL-friendly version of the product name. Used in the storefront URL."
  placeholder="my-product"
/>
```

---

## Recipes

### Input in a Blade Form with VcRow/VcCol Layout

This is the standard pattern for detail blade forms in vc-shell applications. Fields are organized into rows and columns using `VcRow` and `VcCol`, wrapped in `VcForm` and `VcContainer`.

```vue
<template>
  <VcBlade
    :title="title"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol class="tw-space-y-4">
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :model-value="product.name"
              name="productName"
              rules="required"
            >
              <VcInput
                v-model="product.name"
                label="Product Name"
                placeholder="Enter product name"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <VcInput
              v-model="product.sku"
              label="SKU"
              placeholder="Enter SKU"
            />
          </VcCol>
        </VcRow>

        <VcRow class="tw-gap-4">
          <VcCol>
            <VcInput
              v-model="product.weight"
              type="number"
              label="Weight"
              suffix="kg"
              step="0.01"
            />
          </VcCol>
          <VcCol>
            <VcInput
              v-model="product.height"
              type="number"
              label="Height"
              suffix="cm"
              step="0.1"
            />
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { Field, useForm } from "vee-validate";
import { VcInput, VcBlade, VcContainer, VcForm, VcRow, VcCol } from "@vc-shell/framework";

const { meta, resetForm } = useForm({ validateOnMount: false });

const product = reactive({
  name: "",
  sku: "",
  weight: null as number | null,
  height: null as number | null,
});
</script>
```

### Password Field with Toggle Visibility

VcInput handles this automatically when `type="password"`. An eye icon appears inside the field that toggles between masked and plain text.

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="credentials.password"
    name="password"
    rules="required|min:8"
  >
    <VcInput
      v-model="credentials.password"
      type="password"
      label="Password"
      placeholder="At least 8 characters"
      required
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>
```

The toggle button automatically receives appropriate ARIA labels ("Show password" / "Hide password").

### Search Input with Debounce

Combine the `debounce` prop with `prepend-inner` slot for a search icon and `clearable` for easy reset:

```vue
<template>
  <VcInput
    v-model="searchQuery"
    placeholder="Search orders..."
    :debounce="400"
    clearable
    @update:model-value="onSearch"
  >
    <template #prepend-inner>
      <VcIcon icon="lucide-search" />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcInput, VcIcon } from "@vc-shell/framework";

const searchQuery = ref("");

function onSearch(query: string | number | Date | null | undefined) {
  // This fires at most once every 400ms
  console.log("Searching for:", query);
  // Call your API or filter logic here
}
</script>
```

### Address Form with Multiple Validated Fields

A realistic example from a fulfillment center blade, showing multiple `Field`-wrapped inputs in a two-column layout:

```vue
<VcRow class="tw-gap-4">
  <VcCol>
    <Field
      v-slot="{ errorMessage, handleChange, errors }"
      :model-value="address.postalCode"
      name="zipCode"
      :rules="{ required: true, max: 32 }"
    >
      <VcInput
        v-model="address.postalCode"
        label="ZIP Code"
        placeholder="Enter ZIP code"
        required
        maxlength="32"
        :error="!!errors.length"
        :error-message="errorMessage"
        @update:model-value="handleChange"
      />
    </Field>
  </VcCol>
  <VcCol>
    <Field
      v-slot="{ errorMessage, handleChange, errors }"
      :model-value="address.city"
      name="city"
      :rules="{ required: true, max: 128 }"
    >
      <VcInput
        v-model="address.city"
        label="City"
        placeholder="Enter city"
        required
        maxlength="128"
        :error="!!errors.length"
        :error-message="errorMessage"
        @update:model-value="handleChange"
      />
    </Field>
  </VcCol>
</VcRow>
```

---

## Common Mistakes

### 1. Forgetting `handleChange` on `@update:model-value`

Without calling `handleChange`, vee-validate never knows the value changed, so validation never triggers and `meta.valid` stays stale.

```vue
<!-- WRONG: Field never receives value changes -->
<Field v-slot="{ errorMessage, errors }" :model-value="form.name" name="name" rules="required">
  <VcInput
    v-model="form.name"
    label="Name"
    :error="!!errors.length"
    :error-message="errorMessage"
  />
</Field>

<!-- CORRECT: handleChange notifies Field of every change -->
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="form.name" name="name" rules="required">
  <VcInput
    v-model="form.name"
    label="Name"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 2. Using VcInput validation props without Field

The `required` prop on VcInput only adds a visual asterisk. It does NOT perform validation. You must wrap with `Field` for actual validation.

```vue
<!-- WRONG: Looks required but no validation occurs -->
<VcInput v-model="form.name" label="Name" required />

<!-- CORRECT: Field enforces the rule; VcInput displays the result -->
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  :model-value="form.name"
  name="name"
  rules="required"
>
  <VcInput
    v-model="form.name"
    label="Name"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 3. Setting error-message without error prop

VcInput only shows the error message when the computed `invalid` state is true. If you pass `error-message` but forget `error`, the message may not display.

```vue
<!-- WRONG: error-message alone may not trigger error styling -->
<VcInput v-model="val" label="Name" error-message="Required" />

<!-- CORRECT: both error flag and message together -->
<VcInput v-model="val" label="Name" :error="true" error-message="Required" />
```

> **Note:** As of the current implementation, `invalid` is computed as `!!error || !!errorMessage`. So passing only `errorMessage` does work, but it is best practice to pass both for clarity and forward compatibility.

### 4. Expecting negative numbers from type="number"

VcInput blocks the minus key for both `number` and `integer` types. If you need negative numbers, use the `control` slot to provide your own `<input>` element.

```vue
<!-- WRONG: typing "-5" is blocked, user sees "5" -->
<VcInput v-model="temperature" type="number" label="Temperature" />

<!-- CORRECT: use control slot for negative number support -->
<VcInput v-model="temperature" label="Temperature">
  <template #control="{ modelValue, emitValue, placeholder }">
    <input
      type="number"
      :value="modelValue"
      :placeholder="placeholder"
      @input="(e) => emitValue(Number((e.target as HTMLInputElement).value))"
      class="tw-w-full tw-h-full tw-outline-none tw-border-none tw-text-sm"
    />
  </template>
</VcInput>
```

---

## Full API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| Date \| null` | `undefined` | Bound value via `v-model` |
| `type` | `"text" \| "password" \| "email" \| "tel" \| "url" \| "time" \| "number" \| "integer" \| "date" \| "datetime-local" \| "color"` | `"text"` | Input type. `date`/`datetime-local` delegate to VcDatePicker; `color` delegates to VcColorInput |
| `label` | `string` | -- | Label text displayed above the field |
| `placeholder` | `string` | -- | Placeholder text inside the field |
| `hint` | `string` | -- | Help text displayed below the field |
| `tooltip` | `string` | -- | Tooltip text shown on hover next to the label |
| `prefix` | `string` | -- | Static text rendered before the input value |
| `suffix` | `string` | -- | Static text rendered after the input value |
| `name` | `string` | `"Field"` | HTML `name` attribute on the native input |
| `clearable` | `boolean` | `false` | Shows a clear (x) button when the field has a value |
| `disabled` | `boolean` | `false` | Disables the input (also inherits from `VcInputGroup` context) |
| `required` | `boolean` | `false` | Adds a red asterisk to the label (visual only, no validation) |
| `loading` | `boolean` | `false` | Shows a spinning loader icon inside the field |
| `autofocus` | `boolean` | `false` | Auto-focuses the input on mount |
| `error` | `boolean` | `false` | Activates error styling (red border and ring) |
| `errorMessage` | `string` | -- | Error text shown below the field; also activates error styling when truthy |
| `debounce` | `string \| number` | -- | Delay in ms before emitting model updates |
| `maxlength` | `string \| number` | `"1024"` | Maximum character length |
| `step` | `string` | `"1"` | Step granularity for number inputs |
| `size` | `"default" \| "small"` | `"default"` | Field height variant (36px / 32px) |
| `multilanguage` | `boolean` | `false` | Shows a language indicator badge on the label |
| `currentLanguage` | `string` | -- | Language code to display in the multilanguage badge |
| `datePickerOptions` | `VueDatePickerProps` | -- | Options forwarded to VcDatePicker (only when `type` is `date` or `datetime-local`) |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| Date \| null \| undefined` | Emitted when the value changes. For `number`/`integer` types, the payload is a parsed number or `null`. Respects `debounce` if set. |
| `blur` | `Event` | Emitted when the native input loses focus |
| `focus` | -- | Emitted when the native input receives focus |

### Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `prepend` | `{ focus: () => void }` | Content **outside** the field border, to the left |
| `append` | `{ focus: () => void }` | Content **outside** the field border, to the right |
| `prepend-inner` | `{ focus: () => void }` | Content **inside** the field border, to the left |
| `append-inner` | `{ focus: () => void }` | Content **inside** the field border, to the right |
| `control` | `{ editable, focused, modelValue, emitValue, placeholder }` | Replaces the native `<input>` element entirely |
| `error` | -- | Custom error message markup (replaces default VcHint error) |
| `hint` | -- | Custom hint text markup (replaces default VcHint) |

---

## CSS Variables

VcInput uses CSS custom properties for theming, defined on `:root`. Override these to customize the appearance across your application.

| Variable | Default | Description |
|----------|---------|-------------|
| `--input-height` | `36px` | Height of the default size field |
| `--input-height-small` | `32px` | Height of the small size field |
| `--input-border-radius` | `6px` | Border radius of the field wrapper |
| `--input-border-color` | `var(--neutrals-300)` | Border color in the normal state |
| `--input-padding` | `12px` | Horizontal padding inside the field |
| `--input-background-color` | `var(--additional-50)` | Background color of the field |
| `--input-placeholder-color` | `var(--neutrals-400)` | Color of placeholder text |
| `--input-text-color` | `var(--neutrals-800)` | Color of the input text |
| `--input-clear-color` | `var(--neutrals-400)` | Color of the clear and show/hide buttons |
| `--input-clear-color-hover` | `var(--neutrals-600)` | Hover color of the clear and show/hide buttons |
| `--input-disabled-text-color` | `var(--neutrals-500)` | Text color when disabled |
| `--input-disabled-bg-color` | `var(--neutrals-200)` | Background color when disabled |
| `--input-text-color-error` | `var(--danger-500)` | Text color in error state |
| `--input-border-color-error` | `var(--danger-500)` | Border color in error state |
| `--input-border-color-focus` | `var(--primary-500)` | Border color when focused |
| `--input-focus-ring-color` | `var(--primary-100)` | Focus ring color (3px outline) |
| `--input-error-ring-color` | `var(--danger-100)` | Error ring color (3px outline) |

### Theming Example

```css
/* In your app's global styles or a scoped blade style */
.my-custom-form {
  --input-border-radius: 8px;
  --input-border-color-focus: var(--primary-400);
  --input-focus-ring-color: var(--primary-50);
}
```

---

## Accessibility

VcInput follows WAI-ARIA best practices for form fields:

- **Label association:** The label element is linked to the native `<input>` via `aria-labelledby`, ensuring screen readers announce the label when the input is focused.
- **Error and hint association:** Error and hint text are linked via `aria-describedby`. Screen readers announce these descriptions when the user focuses the field.
- **Error state:** When `error` is true or `errorMessage` is truthy, the native input receives `aria-invalid="true"`.
- **Required fields:** The native input exposes `aria-required="true"` when the `required` prop is set.
- **Password toggle:** The show/hide button has a dynamic `aria-label` that reads "Show password" or "Hide password" depending on the current state.
- **Clear button:** The clear button has `aria-label="Clear"`.
- **Keyboard navigation:** The input is fully tabbable (`tabindex="0"`). Clear and password toggle buttons are standard `<button>` elements and can be activated with Enter or Space.
- **InputGroup context:** When VcInput is used inside a `VcInputGroup`, it automatically inherits the group's disabled state, name, and `aria-describedby` values.

---

## Related Components

- [VcTextarea](../vc-textarea/) -- Multi-line text input
- [VcSelect](../vc-select/) -- Dropdown selection
- [VcInputCurrency](../vc-input-currency/) -- Formatted currency input with currency selector
- [VcInputDropdown](../vc-input-dropdown/) -- Input with an attached dropdown for unit/option selection
- [VcDatePicker](../vc-date-picker/) -- Standalone date picker (also used internally when `type="date"`)
- [VcColorInput](../vc-color-input/) -- Standalone color picker (also used internally when `type="color"`)
- [VcInputGroup](../vc-input-group/) -- Groups multiple inputs with shared label, error state, and disabled state
- [VcLabel](../../atoms/vc-label/) -- The label atom used internally by VcInput
- [VcHint](../../atoms/vc-hint/) -- The hint/error atom used internally by VcInput
