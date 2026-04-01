# useDynamicProperties

Composable for managing dynamic (runtime-defined) property values with support for multilanguage, multivalue, dictionary, color, and measurement property types.

Internally uses a strategy pattern — each property type (regular, boolean, dictionary, measure, color) has a dedicated handler with `get`/`set` methods.

## When to Use

- In product, category, or any entity detail blades that display platform dynamic properties
- When properties are defined at runtime (not compile-time) and may be multilanguage or dictionary-based
- When you need to render and edit property values that can be text, boolean, number, datetime, dictionary selection, color picker, or measurement with units
- When NOT to use: for static, compile-time form fields, use standard Vue reactive state

## Quick Start

```typescript
import { useDynamicProperties } from "@vc-shell/framework";

const { getPropertyValue, setPropertyValue, loadDictionaries, loadMeasurements, loading } =
  useDynamicProperties({
    searchDictionary: (criteria) => api.searchPropertyDictionaryItems(criteria),
    searchMeasurements: (measureId, locale) => api.searchMeasurements(measureId, locale),
  });
```

## API

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `searchDictionary` | `(criteria: IBasePropertyDictionaryItemSearchCriteria) => Promise<IBasePropertyDictionaryItem[] \| undefined>` | Yes | API function to search dictionary items by property ID and keyword |
| `searchMeasurements` | `(measureId: string, locale?: string) => Promise<IBaseMeasurementDictionaryItem[] \| undefined>` | No | API function for loading measurement units. Only needed for measure-type properties |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `getPropertyValue` | `(property, locale) => PropertyDisplayValue` | Read display value for a property. Returns string, boolean, or array depending on type. Does NOT mutate the property. |
| `setPropertyValue` | `(params: SetPropertyValueParams) => void` | Write value to a property. Handles type-specific transformation and empty cleanup. |
| `loadDictionaries` | `(propertyId, keyword?, locale?) => Promise<...>` | Load dictionary items. If locale is provided, resolves localized values. |
| `loadMeasurements` | `(measureId, keyword?, locale?) => Promise<...>` | Load measurement units. No-op if `searchMeasurements` was not provided. |
| `loading` | `ComputedRef<boolean>` | Whether a dictionary lookup is in progress. |

### SetPropertyValueParams

| Field | Type | Description |
|-------|------|-------------|
| `property` | `IBaseProperty` | The property object to update. Modified in place. |
| `value` | `string \| IBasePropertyValue[] \| (IBasePropertyDictionaryItem & { value: string })[]` | The new value. Type depends on property configuration. |
| `dictionary` | `IBasePropertyDictionaryItem[]?` | Dictionary items. Required when setting a dictionary value. |
| `locale` | `string?` | Current locale for multilanguage properties. |
| `unitOfMeasureId` | `string?` | Unit of measure ID for measure-type properties. |
| `colorCode` | `string?` | Color hex code for color-type properties. |

### PropertyDisplayValue

```ts
type PropertyDisplayValue = string | IBasePropertyValue[] | boolean;
```

## How It Works

### Strategy Resolution

The composable resolves a strategy handler based on property flags:

| Priority | Condition | Strategy | Handles |
|----------|-----------|----------|---------|
| 1 | `valueType === "Measure"` | measureStrategy | Numeric input with unit dropdown |
| 2 | `valueType === "Color"` && !dictionary | colorStrategy | Color picker, multivalue colors |
| 3 | `valueType === "Boolean"` | booleanStrategy | Checkbox/switch |
| 4 | `dictionary === true` | dictionaryStrategy | Select dropdowns with localized options |
| 5 | (default) | regularStrategy | ShortText, LongText, Number, Integer, DateTime |

### Value Getting

Each strategy's `get()` reads from `property.values` without mutation:

- **Multilanguage**: Finds value matching locale, falls back to value without languageCode
- **Multivalue**: Returns full array (filtered by locale for multilanguage)
- **Dictionary**: Returns `valueId` instead of `value`
- **Boolean**: Returns `false` (not `""`) when no value exists

### Value Setting

Each strategy's `set()` writes to `property.values`:

- **Empty values are cleaned up automatically** via `cleanEmptyValues()`. When user clears a field, scaffolding objects are removed and `property.values` becomes `[]`. This prevents false modification detection in `useBladeForm`.
- **Multilanguage cleanup**: Only the value for the current locale is removed; other locales are preserved.
- **Dictionary**: Expands `localizedValues` into per-locale value entries.

### Empty Value Cleanup (cleanEmptyValues)

When `setPropertyValue` receives an empty value (`""`, `null`, `undefined`), it cleans up `property.values` instead of leaving scaffolding objects:

```
Before: values: [{ value: "", languageCode: "en", propertyId: "abc", ... }]
After:  values: []
```

This ensures that `useBladeForm`'s deep comparison correctly detects "no change" when user clears a field that was originally empty.

## Recipe: With VcDynamicProperty

```vue
<template>
  <VcDynamicProperty
    v-for="property in properties"
    :key="property.id"
    :property="property"
    :model-value="getPropertyValue(property, currentLocale)"
    :options-getter="loadDictionaries"
    :measurements-getter="loadMeasurements"
    :current-language="currentLocale"
    :value-type="property.valueType ?? ''"
    :dictionary="property.dictionary"
    :multivalue="property.multivalue"
    :multilanguage="property.multilanguage"
    @update:model-value="(ev) => setPropertyValue({ property, ...ev })"
  />
</template>

<script setup lang="ts">
import { useDynamicProperties } from "@vc-shell/framework";

const { getPropertyValue, setPropertyValue, loadDictionaries, loadMeasurements } =
  useDynamicProperties({
    searchDictionary: searchDictionaryItems,
    searchMeasurements: searchMeasurementItems,
  });
</script>
```

## Tips

- **`setPropertyValue` mutates the property in place.** `property.values` is modified directly. This is by design because dynamic properties are typically part of a larger entity object saved as a whole.
- **Always pass `dictionary` when setting dictionary values.** Without dictionary items, the composable cannot resolve `valueId` to the correct alias and localized values.
- **Boolean properties always have a value entry.** Unlike other types where clearing removes the value, boolean properties maintain a value entry (`value: false`). This ensures checkboxes render correctly.
- **No class constructors needed.** Values are created as plain objects via `createValue()`. No factory classes required.

## File Structure

```
useDynamicProperties/
  index.ts              — composable entry point (~60 lines)
  types.ts              — all interfaces
  utils.ts              — isEmptyValue, createValue, cleanEmptyValues, type guards
  strategies/
    index.ts            — resolveStrategy() registry
    types.ts            — PropertyValueStrategy interface
    regular.ts          — ShortText, LongText, Number, Integer, DateTime
    boolean.ts          — Boolean
    dictionary.ts       — Dictionary (all multi/single × language/value)
    measure.ts          — Measure
    color.ts            — Color
```

## Related

- [useBladeForm](../useBladeForm/useBladeForm.docs.md) — form state management that uses `semanticEqual` for modification detection. `cleanEmptyValues` ensures compatibility.
- [VcDynamicProperty](../../../../ui/components/organisms/vc-dynamic-property/vc-dynamic-property.docs.md) — UI component that renders dynamic properties
