# useDynamicProperties

Generic composable for managing dynamic (runtime-defined) property values with support for multilanguage, multivalue, dictionary, color, and measurement property types. This is one of the most complex composables in the framework because it must handle the combinatorial explosion of property configurations: a property can be multilanguage AND multivalue AND dictionary-backed, each combination requiring different get/set logic. The composable handles loading dictionary items from the API, getting/setting property values by locale, unit-of-measure lookups, and color code management.

The composable is generic over the property, value, dictionary item, and measurement types, allowing it to work with both the standard platform types and custom extensions.

## When to Use

- In product, category, or any entity detail blades that display platform dynamic properties
- When properties are defined at runtime (not compile-time) and may be multilanguage or dictionary-based
- When you need to render and edit property values that can be text, boolean, number, datetime, dictionary selection, color picker, or measurement with units
- When NOT to use: for static, compile-time form fields, use standard Vue reactive state. For simple key-value pairs without multilanguage/dictionary support, plain refs are sufficient.

## Quick Start

```typescript
import { useDynamicProperties } from '@vc-shell/framework';
import { PropertyValue, PropertyDictionaryItem } from '@core/api/platform';

const { loading, loadDictionaries, getPropertyValue, setPropertyValue, loadMeasurements } =
  useDynamicProperties(
    (criteria) => api.searchPropertyDictionaryItems(criteria),
    PropertyValue,
    PropertyDictionaryItem,
    (measureId, locale) => api.searchMeasurements(measureId, locale),
  );
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchDictionaryItemsFunction` | `(criteria) => Promise<TPropertyDictionaryItem[] \| undefined>` | Yes | API function to search dictionary items by property ID and keyword. Called when the user opens a dictionary dropdown. |
| `PropertyValueConstructor` | `new (data?) => TPropertyValue` | Yes | Constructor class for creating property value instances. Used when creating new values during `setPropertyValue`. |
| `PropertyDictionaryItemConstructor` | `new (data?) => TPropertyDictionaryItem` | Yes | Constructor class for creating dictionary item instances. Used when localizing dictionary items. |
| `searchMeasurementFunction` | `(measureId, locale?) => Promise<TMeasurement[] \| undefined>` | No | API function for loading measurement/unit-of-measure dictionaries. Only needed if you have measure-type properties. |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `ComputedRef<boolean>` | Whether a dictionary or measurement lookup is in progress. |
| `loadDictionaries` | `(propertyId, keyword?, locale?) => Promise<TPropertyDictionaryItem[] \| undefined>` | Loads dictionary items for a property. If `locale` is provided, resolves localized values from `localizedValues`. |
| `getPropertyValue` | `(property, locale) => string \| TPropertyValue[] \| boolean` | Reads the display value for a property in the given locale. Returns string for simple values, array for multivalue, boolean for boolean type. |
| `setPropertyValue` | `(params: SetPropertyValueParams) => void` | Writes a value to a property. Dispatches to specialized handlers based on property type (measure, color, dictionary, regular). |
| `loadMeasurements` | `(measureId, keyword?, locale?) => Promise<TMeasurement[] \| undefined>` | Loads measurement units for a measure-type property. No-op if `searchMeasurementFunction` was not provided. |

### SetPropertyValueParams

| Field | Type | Description |
|-------|------|-------------|
| `property` | `TProperty` | The property object to update. Modified in place. |
| `value` | `string \| TPropertyValue[] \| TPropertyDictionaryItem[]` | The new value. Type depends on property configuration. |
| `dictionary` | `TPropertyDictionaryItem[]?` | Dictionary items for dictionary properties. Required when setting a dictionary value. |
| `locale` | `string?` | Current locale for multilanguage properties. |
| `initialProp` | `TProperty?` | Original property state. Used for empty-value detection -- if the original was empty and the new value is empty, a placeholder is preserved; otherwise, the value array is cleared. |
| `unitOfMeasureId` | `string?` | Unit of measure ID for measure-type properties. |
| `colorCode` | `string?` | Color hex code for color-type properties. |

## How It Works

### Value Getting

`getPropertyValue` dispatches based on property flags:

- **Multilanguage**: Finds the value entry matching the locale. For multivalue, returns all entries for that locale as an array. For dictionary, returns the `valueId`. If no entry exists for the locale, creates a default entry using the first available alias.
- **Single-language**: Returns the first value entry. For multivalue, returns all entries as an array. For dictionary, returns the `valueId`.
- **Boolean**: Returns `false` if no value entry exists (instead of empty string).

### Value Setting

`setPropertyValue` checks property type in order:
1. **Measure** (`valueType === "Measure"`): Creates a single value entry with `unitOfMeasureId`.
2. **Color** (`valueType === "Color"`, no dictionary): Creates value entry/entries with `colorCode`.
3. **Dictionary**: Resolves the selected dictionary item(s), expanding `localizedValues` into per-locale value entries for multilanguage dictionaries.
4. **Regular**: Handles the remaining cases -- simple text, number, boolean, datetime.

### Dictionary Localization

When `loadDictionaries` is called with a locale, each dictionary item's `localizedValues` array is searched for the matching locale. The localized display value replaces the generic `alias` for UI rendering. This is why the function returns `Promise<TPropertyDictionaryItem[]>` -- the items are cloned and enriched.

## Recipe: Rendering a Dynamic Property Form

```vue
<script setup lang="ts">
import { useDynamicProperties, useLanguages } from '@vc-shell/framework';
import { ref, watch } from 'vue';

const { currentLocale } = useLanguages();
const { loading, loadDictionaries, getPropertyValue, setPropertyValue } =
  useDynamicProperties(searchDictionaryItems, PropertyValue, PropertyDictionaryItem);

const properties = ref<Property[]>([]);

// Display values, keyed by property ID
function displayValue(property: Property) {
  return getPropertyValue(property, currentLocale.value);
}

// Handle value change from a form input
async function onValueChange(property: Property, newValue: string) {
  if (property.dictionary) {
    const dictItems = await loadDictionaries(property.id!, '', currentLocale.value);
    setPropertyValue({
      property,
      value: newValue,
      dictionary: dictItems ?? [],
      locale: currentLocale.value,
    });
  } else {
    setPropertyValue({
      property,
      value: newValue,
      locale: currentLocale.value,
    });
  }
}
</script>
```

## Recipe: Dictionary Property with Search-as-You-Type

```vue
<script setup lang="ts">
import { useDynamicProperties } from '@vc-shell/framework';
import { ref } from 'vue';

const { loadDictionaries } = useDynamicProperties(/* ... */);

const dictOptions = ref<PropertyDictionaryItem[]>([]);

async function onDictionarySearch(property: Property, keyword: string, locale: string) {
  const items = await loadDictionaries(property.id!, keyword, locale);
  dictOptions.value = items ?? [];
}
</script>

<template>
  <VcSelect
    :options="dictOptions"
    option-value="id"
    option-label="value"
    @search="(keyword) => onDictionarySearch(property, keyword, currentLocale)"
    @update:model-value="(val) => onValueChange(property, val)"
  />
</template>
```

## Tips

- **`setPropertyValue` mutates the property in place.** Unlike `useAssets` which returns new arrays, this composable modifies `property.values` directly. This is by design because dynamic properties are typically part of a larger entity object that gets saved as a whole.
- **Always pass `dictionary` when setting dictionary values.** Without the dictionary items, the composable cannot resolve `valueId` to the correct alias and localized values. Omitting it results in incomplete value entries.
- **Empty value handling depends on `initialProp`.** When the user clears a field, the behavior differs based on whether the property originally had a value. If it did, clearing sets `values: []` (explicit empty). If it was always empty, a placeholder value entry is preserved. This distinction matters for the platform's diff/save logic.
- **Boolean properties always have a value entry.** Unlike other types where clearing removes the value, boolean properties always maintain a value entry (with `value: false`). This ensures checkboxes render correctly.
- **The composable is generic but not abstract.** You must pass concrete constructor classes, not interfaces. The constructors are called with `new` to create value and dictionary item instances.

## Related

- [useLanguages](../useLanguages/useLanguages.docs.md) -- locale management for multilanguage property rendering
- `IBaseProperty`, `IBasePropertyValue` -- base interfaces defined in the composable file
- `PropertyValue`, `PropertyDictionaryItem` from `@core/api/platform` -- concrete types for the standard platform
