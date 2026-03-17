# VcDynamicProperty

Renders a VirtoCommerce platform dynamic property as the appropriate form control, automatically selecting the input component based on value type, dictionary, and multivalue flags.

## When to Use

- Use to render dynamic properties from the VirtoCommerce platform (catalog properties, member properties, etc.)
- Use when the input type is determined at runtime based on property metadata
- When NOT to use: for static, known-at-design-time form fields (use VcInput, VcSelect, etc. directly)

## Basic Usage

```vue
<template>
  <VcDynamicProperty
    :property="dynamicProperty"
    :model-value="propertyValue"
    :value-type="dynamicProperty.valueType"
    :name="dynamicProperty.name"
    :required="dynamicProperty.isRequired"
    :dictionary="dynamicProperty.isDictionary"
    :multivalue="dynamicProperty.isMultivalue"
    :options-getter="loadDictionaryOptions"
    @update:model-value="handlePropertyUpdate"
  />
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `property` | `T` | - | Property object with `id` and metadata |
| `modelValue` | `any` | - | Current property value (v-model) |
| `valueType` | `string` | - | Type: ShortText, LongText, Number, Integer, DateTime, Boolean, Measure, Color |
| `name` | `string` | - | Property name for display and field identification |
| `required` | `boolean` | - | Whether the field is required |
| `disabled` | `boolean` | `false` | Disables the input |
| `dictionary` | `boolean` | `false` | Uses VcSelect/VcMultivalue with options |
| `multivalue` | `boolean` | `false` | Supports multiple values |
| `multilanguage` | `boolean` | `false` | Supports localized values |
| `optionsGetter` | `Function` | - | Async loader for dictionary options |
| `measurementsGetter` | `Function` | - | Async loader for measurement units |
| `rules` | `object` | - | Validation rules: `{ min, max, regex }` |

## Value Type to Component Mapping

| valueType | dictionary | multivalue | Component |
|-----------|-----------|------------|-----------|
| ShortText | false | false | VcInput |
| ShortText | false | true | VcMultivalue |
| ShortText | true | false | VcSelect |
| ShortText | true | true | VcMultivalue (with options) |
| LongText | - | - | VcTextarea |
| Number | - | false | VcInput (number) |
| Number | - | true | VcMultivalue (number) |
| Integer | - | false | VcInput (integer, step=1) |
| Integer | - | true | VcMultivalue (integer) |
| DateTime | - | - | VcInput (datetime-local) |
| Boolean | - | - | VcSwitch |
| Measure | - | - | VcInputDropdown |
| Color | false | false | VcInput (color) |
| Color | false | true | VcMultivalue (color) |
| Color | true | false | VcSelect (with swatches) |
| Color | true | true | VcMultivalue (with swatches) |

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
