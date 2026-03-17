# useDynamicProperties

Generic composable for managing dynamic (runtime-defined) property values with support for multilanguage, multivalue, dictionary, color, and measurement property types. Handles loading dictionary items, getting/setting property values by locale, and unit-of-measure lookups.

## When to Use

- In product, category, or any entity detail blades that display platform dynamic properties
- When properties are defined at runtime (not compile-time) and may be multilanguage or dictionary-based
- When NOT to use: for static, compile-time form fields, use standard Vue reactive state

## Basic Usage

```typescript
import { useDynamicProperties } from '@vc-shell/framework';

const { loading, loadDictionaries, getPropertyValue, setPropertyValue } =
  useDynamicProperties(
    searchDictionaryItems,       // API function to search dictionary items
    PropertyValueConstructor,    // Class constructor for property values
    PropertyDictionaryItemConstructor, // Class constructor for dictionary items
    searchMeasurements,          // Optional: API function for measurement units
  );
```

## API

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchDictionaryItemsFunction` | `(criteria) => Promise<TPropertyDictionaryItem[] \| undefined>` | Yes | API function to search dictionary items by property ID and keyword |
| `PropertyValueConstructor` | `new (data?) => TPropertyValue` | Yes | Constructor class for creating property value instances |
| `PropertyDictionaryItemConstructor` | `new (data?) => TPropertyDictionaryItem` | Yes | Constructor class for creating dictionary item instances |
| `searchMeasurementFunction` | `(measureId, locale?) => Promise<TMeasurement[] \| undefined>` | No | API function for loading measurement/unit-of-measure dictionaries |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `ComputedRef<boolean>` | Whether a dictionary or measurement lookup is in progress |
| `loadDictionaries` | `(propertyId, keyword?, locale?) => Promise<TPropertyDictionaryItem[] \| undefined>` | Loads dictionary items for a property, optionally localized |
| `getPropertyValue` | `(property, locale) => string \| TPropertyValue[] \| boolean` | Reads the display value for a property in the given locale |
| `setPropertyValue` | `(params: SetPropertyValueParams) => void` | Writes a value to a property, handling all property type variants |
| `loadMeasurements` | `(measureId, keyword?, locale?) => Promise<TMeasurement[] \| undefined>` | Loads measurement units for a measure-type property |

### SetPropertyValueParams

| Field | Type | Description |
|-------|------|-------------|
| `property` | `TProperty` | The property object to update |
| `value` | `string \| TPropertyValue[] \| TPropertyDictionaryItem[]` | The new value |
| `dictionary` | `TPropertyDictionaryItem[]?` | Dictionary items for dictionary properties |
| `locale` | `string?` | Current locale for multilanguage properties |
| `initialProp` | `TProperty?` | Original property state (for empty-value detection) |
| `unitOfMeasureId` | `string?` | Unit of measure ID for measure properties |
| `colorCode` | `string?` | Color code for color properties |

## Common Patterns

### Reading and writing a multilanguage dictionary property

```typescript
const value = getPropertyValue(property, 'en-US');
// Returns valueId string for dictionary props, or display value for others

const dictItems = await loadDictionaries(property.id!, 'search term', 'en-US');

setPropertyValue({
  property,
  value: selectedDictItem.id,
  dictionary: dictItems,
  locale: 'en-US',
});
```

## Related

- [useLanguages](../useLanguages/useLanguages.docs.md) -- locale management for multilanguage property rendering
