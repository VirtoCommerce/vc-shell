---
title: VcDynamicProperty
category: components
group: form
---

# VcDynamicProperty

Renders a VirtoCommerce platform dynamic property as the appropriate form control, automatically selecting the input component based on value type, dictionary, and multivalue flags. VcDynamicProperty eliminates the need for manual `v-if` chains when rendering properties whose type is determined at runtime — it maps each combination of `valueType`, `dictionary`, and `multivalue` to the correct input molecule and passes through all relevant props.

::storybook id="data-display-vcdynamicproperty--default"

## When to Use

- Use to render dynamic properties from the VirtoCommerce platform (catalog properties, member properties, store properties, etc.)
- Use when the input type is determined at runtime based on property metadata
- Use inside `v-for` loops to render a list of dynamic properties from the API
- When NOT to use: for static, known-at-design-time form fields (use VcInput, VcSelect, etc. directly)

## Basic Usage

```vue
<template>
  <VcDynamicProperty
    :property="property"
    :model-value="property.value"
    :value-type="property.valueType ?? ''"
    :name="property.name"
    :required="property.required"
    :dictionary="property.dictionary"
    :multivalue="property.multivalue"
    :multilanguage="property.multilanguage"
    :current-language="currentLocale"
    :rules="{
      min: property.validationRule?.charCountMin,
      max: property.validationRule?.charCountMax,
      regex: property.validationRule?.regExp,
    }"
    :options-getter="loadDictionaryOptions"
    @update:model-value="handlePropertyUpdate"
  />
</template>
```

The prop names match the `DynamicObjectProperty` shape returned by the platform — pass `property.dictionary`, `property.multivalue`, `property.required` directly without renaming. Always pass `valueType` with a string fallback because the API can return `undefined` for newly-created properties. The `:multilanguage` and `:current-language` props are required when the property supports localized values; the `:rules` object maps the property's `validationRule` to the form-validation engine.

## Key Props

| Prop                 | Type                         | Default    | Description                                                                                                                                              |
| -------------------- | ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `property`           | `T`                          | _required_ | Property object with `id` and metadata                                                                                                                   |
| `modelValue`         | `any`                        | _required_ | Current property value (v-model)                                                                                                                         |
| `valueType`          | `string`                     | _required_ | Type: ShortText, LongText, Number, Integer, DateTime, Boolean, Measure, Color                                                                            |
| `name`               | `string`                     | _required_ | Property name for display and field identification                                                                                                       |
| `required`           | `boolean`                    | _required_ | Whether the field is required                                                                                                                            |
| `disabled`           | `boolean`                    | `false`    | Disables the input                                                                                                                                       |
| `dictionary`         | `boolean`                    | `false`    | Uses VcSelect/VcMultivalue with options                                                                                                                  |
| `multivalue`         | `boolean`                    | `false`    | Supports multiple values                                                                                                                                 |
| `multilanguage`      | `boolean`                    | `false`    | Supports localized values                                                                                                                                |
| `currentLanguage`    | `string`                     | -          | Active locale used for localized values                                                                                                                  |
| `optionsGetter`      | `Function`                   | _required_ | Async loader for dictionary options, called as `(propertyId, keyword?, locale?)`                                                                         |
| `measurementsGetter` | `Function`                   | -          | Async loader for measurement units                                                                                                                       |
| `optionsValue`       | `string`                     | `"id"`     | Field on each option used as its value (VcSelect mapping)                                                                                                |
| `optionsLabel`       | `string`                     | `"value"`  | Inert. The option label is fixed to `"value"` when `multilanguage` is true and `"alias"` otherwise; only `optionsValue` is honored for VcSelect mapping. |
| `displayNames`       | `{ name?; languageCode? }[]` | -          | Localized display names used to resolve the field label per locale                                                                                       |
| `placeholder`        | `string`                     | -          | Placeholder text for the input                                                                                                                           |
| `rules`              | `object`                     | -          | Validation rules: `{ min, max, regex }`                                                                                                                  |

::storybook id="data-display-vcdynamicproperty--property-form" height="500"

## Value Type to Component Mapping

| valueType | dictionary | multivalue | Component                    |
| --------- | ---------- | ---------- | ---------------------------- |
| ShortText | false      | false      | VcInput                      |
| ShortText | false      | true       | VcMultivalue                 |
| ShortText | true       | false      | VcSelect                     |
| ShortText | true       | true       | VcMultivalue (with options)  |
| LongText  | -          | -          | VcTextarea                   |
| Number    | -          | false      | VcInput (number)             |
| Number    | -          | true       | VcMultivalue (number)        |
| Integer   | -          | false      | VcInput (integer, step=1)    |
| Integer   | -          | true       | VcMultivalue (integer)       |
| DateTime  | -          | -          | VcInput (datetime-local)     |
| Boolean   | -          | -          | VcSwitch                     |
| Measure   | -          | -          | VcInputDropdown              |
| Color     | false      | false      | VcInput (color)              |
| Color     | false      | true       | VcMultivalue (color)         |
| Color     | true       | false      | VcSelect (with swatches)     |
| Color     | true       | true       | VcMultivalue (with swatches) |

## Recipe: Rendering a List of Dynamic Properties

The most common pattern is iterating over an array of properties from the API:

```vue
<script setup lang="ts">
import { ref } from "vue";

const properties = ref([]);

async function loadProperties() {
  const result = await api.getDynamicProperties(productId);
  properties.value = result;
}

async function loadDictionaryOptions(propertyId: string, keyword?: string, locale?: string) {
  return await api.searchDictionaryItems(propertyId, keyword, locale);
}

function handlePropertyUpdate(property: any, newValue: any) {
  property.values = Array.isArray(newValue) ? newValue.map((v) => ({ value: v })) : [{ value: newValue }];
}
</script>

<template>
  <div class="tw-space-y-4">
    <VcDynamicProperty
      v-for="prop in properties"
      :key="prop.id"
      :property="prop"
      :model-value="prop.values?.[0]?.value"
      :value-type="prop.valueType"
      :name="prop.name"
      :required="prop.isRequired"
      :dictionary="prop.isDictionary"
      :multivalue="prop.isMultivalue"
      :multilanguage="prop.isMultilanguage"
      :options-getter="loadDictionaryOptions"
      @update:model-value="(payload) => handlePropertyUpdate(prop, payload.value)"
    />
  </div>
</template>
```

`update:model-value` emits an object, not a raw value: `{ value, dictionary?, locale?, unitOfMeasureId?, colorCode? }`. Read `payload.value` for the primary value; the other keys carry dictionary items, the active locale, the selected measure unit, and a color code where applicable. `optionsGetter` is invoked as `(propertyId, keyword?, locale?)` — bind it directly rather than wrapping the property id into the first argument.

::storybook id="data-display-vcdynamicproperty--required-with-validation" height="300"

## Recipe: Dynamic Property with Validation

```vue
<VcDynamicProperty :property="skuProperty" :model-value="skuProperty.values?.[0]?.value" value-type="ShortText" name="SKU" :required="true" :rules="{ regex: '^[A-Z0-9-]+$', min: 3, max: 50 }" @update:model-value="(payload) => updateProperty(skuProperty, payload.value)" />
```

## Recipe: Measurement Property with Units

```vue
<VcDynamicProperty :property="weightProperty" :model-value="weightProperty.values?.[0]?.value" value-type="Measure" name="Weight" :measurements-getter="loadMeasurementUnits" @update:model-value="(payload) => updateProperty(weightProperty, payload.value)" />
```

## Common Mistakes

- **Passing the wrong `valueType` string** -- The value type must match exactly: `"ShortText"`, `"LongText"`, `"Number"`, `"Integer"`, `"DateTime"`, `"Boolean"`, `"Measure"`, `"Color"`. Mismatched casing or typos will result in no component being rendered.
- **Forgetting `optionsGetter` for dictionary properties** -- When `dictionary` is true, VcDynamicProperty needs `optionsGetter` to fetch dropdown options. Without it, the select will have no items.
- **Not unwrapping the value** -- The API returns values as `[{ value: "actual" }]`. Pass `prop.values?.[0]?.value` as `modelValue`, not the entire values array.

## Tips

- VcDynamicProperty uses vee-validate internally. Validation errors appear automatically below the input when rules are violated.
- For Color type with `dictionary: true`, the dropdown options include color swatches alongside text labels, making it easy for users to identify colors visually.
- The `multilanguage` prop enables localized value editing. When active, the component shows a language selector and manages separate values per locale.
- Boolean properties render as VcSwitch, which does not have a "required" visual indicator. If you need to enforce a boolean value, handle it in your form validation logic.

## Accessibility

- Each rendered input component provides its own label association and ARIA attributes
- Required fields are indicated visually through the child component
- Validation errors from vee-validate are displayed as error messages below the input
- All input types support keyboard navigation (Tab, Enter, Escape where applicable)
- Color dictionary options display color swatches alongside text for visual identification

## Related Components

- **VcInput** - Text, number, date, and color inputs
- **VcTextarea** - Multi-line text input
- **VcSelect** - Dropdown select for dictionary properties
- **VcMultivalue** - Tag-based multi-value input
- **VcSwitch** - Boolean toggle
- **VcInputDropdown** - Input with dropdown (used for Measure type)
