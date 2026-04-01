# 38. `useDynamicProperties` — Strategy-Based Refactor

## What Changed

The `useDynamicProperties` composable has been refactored from a monolithic function with generics and class constructors to a clean, options-based API using a strategy pattern internally.

| Old | New |
|---|---|
| 5 generic type parameters | No generics — types inferred from options |
| Class constructors for value/dictionary factories | Plain objects created internally |
| Positional arguments | Single options object |
| Side effects in getters | Pure getters, explicit mutations |
| Manual empty value cleanup | Built-in `cleanEmptyValues()` |

**Why:** The old API required consumers to define boilerplate factory classes (`PropertyValueFactory`, `PropertyDictionaryItemFactory`) that did nothing beyond `Object.assign`. The five generic type parameters made the call site unreadable and provided no real type safety benefit since the generics were only used to type the factory output. The refactored API eliminates this ceremony while adding automatic cleanup of empty property values.

## Before / After

### Consumer Code

**Before:**

```ts
import { useDynamicProperties } from "@vc-shell/framework";
import type {
  Property,
  PropertyValue,
  PropertyDictionaryItem,
  SearchPropertiesResult,
  SearchDictionaryItemsResult,
} from "@api/catalog";

class PropertyValueFactory {
  constructor(data?: Partial<PropertyValue>) {
    Object.assign(this, data);
  }
}

class PropertyDictionaryItemFactory {
  constructor(data?: Partial<PropertyDictionaryItem>) {
    Object.assign(this, data);
  }
}

const {
  loadDictionaries,
  getPropertyValue,
  handleDictionaryValue,
  setPropertyValue,
  removePropertyValue,
  properties,
  loading: propertiesLoading,
} = useDynamicProperties<
  Property,
  PropertyValue,
  PropertyDictionaryItem,
  SearchPropertiesResult,
  SearchDictionaryItemsResult
>(
  searchDictionaryItems,
  PropertyValueFactory,
  PropertyDictionaryItemFactory,
  searchMeasures,
);
```

**After:**

```ts
import { useDynamicProperties } from "@vc-shell/framework";

const {
  loadDictionaries,
  getPropertyValue,
  handleDictionaryValue,
  setPropertyValue,
  removePropertyValue,
  cleanEmptyValues,
  properties,
  loading: propertiesLoading,
} = useDynamicProperties({
  searchDictionary: searchDictionaryItems,
  searchMeasurements: searchMeasures,
});
```

### Template Usage

Template bindings remain unchanged. The composable returns the same reactive `properties` array and the same handler functions (`getPropertyValue`, `handleDictionaryValue`, `setPropertyValue`, `removePropertyValue`).

```vue
<template>
  <VcDynamicProperty
    v-for="prop in properties"
    :key="prop.id"
    :property="prop"
    :loading="propertiesLoading"
    :get-values="getPropertyValue"
    @value-changed="setPropertyValue"
    @dictionary-changed="handleDictionaryValue"
    @remove="removePropertyValue"
  />
</template>
```

## Key Improvements

### 1. No Factory Classes

The old API required two factory classes that were almost always identical boilerplate:

```ts
// REMOVE — no longer needed
class PropertyValueFactory {
  constructor(data?: Partial<PropertyValue>) {
    Object.assign(this, data);
  }
}
class PropertyDictionaryItemFactory {
  constructor(data?: Partial<PropertyDictionaryItem>) {
    Object.assign(this, data);
  }
}
```

The composable now creates plain objects internally. Delete these classes entirely.

### 2. No Generics

The old five generic type parameters are gone. The composable infers all types from the options object and the data you pass to its methods.

### 3. Options Object Instead of Positional Arguments

```ts
// Old — positional, hard to read
useDynamicProperties(searchFn, ValueFactory, DictFactory, measureFn);

// New — named, self-documenting
useDynamicProperties({
  searchDictionary: searchFn,
  searchMeasurements: measureFn,
});
```

### 4. `cleanEmptyValues()` — Automatic Empty Value Cleanup

A new `cleanEmptyValues(properties)` function is returned. Call it before save to strip property values that the user left empty (no value, no dictionary selection). This replaces manual filtering logic that many blades implemented individually.

```ts
async function handleSave() {
  // Remove properties with no user-entered values
  item.value.properties = cleanEmptyValues(item.value.properties);
  await save(item.value);
}
```

### 5. No Getter Side Effects

The old implementation had side effects inside computed getters (e.g., loading dictionaries on first access). The new implementation uses explicit method calls — `loadDictionaries()` is called once after data loads, and subsequent access is pure.

## Migration Checklist

- [ ] Delete `PropertyValueFactory` and `PropertyDictionaryItemFactory` classes (or equivalent)
- [ ] Replace `useDynamicProperties<A, B, C, D, E>(searchFn, ValueFactory, DictFactory, measureFn)` with `useDynamicProperties({ searchDictionary: searchFn, searchMeasurements: measureFn })`
- [ ] Remove generic type parameters from the call
- [ ] If you had manual empty-value filtering before save, replace with `cleanEmptyValues()`
- [ ] Verify template bindings are unchanged (they should be)
- [ ] If `searchMeasurements` was not used (passed as `undefined`), omit it from the options object
- [ ] Remove unused type imports (`SearchPropertiesResult`, `SearchDictionaryItemsResult`) if they were only used as generics

## Automated Migration

```bash
npx @vc-shell/migrate --transform dynamic-properties-refactor
```

The codemod handles:
- Removing factory class declarations
- Rewriting the `useDynamicProperties` call from positional to options-based
- Removing generic type parameters
- Adding `cleanEmptyValues` to the destructured return if empty-value filtering is detected nearby

Manual review is needed for:
- Custom factory classes that had logic beyond `Object.assign`
- Non-standard `searchDictionary` / `searchMeasurements` function signatures
- Consumers that extended the factory classes

## How to Find

```bash
# Find all useDynamicProperties usages
grep -rn "useDynamicProperties" src/ --include="*.vue" --include="*.ts"

# Find factory class declarations (candidates for removal)
grep -rn "class Property.*Factory" src/ --include="*.ts" --include="*.vue"

# Find manual empty-value filtering (candidates for cleanEmptyValues)
grep -rn "filter.*value.*length\|filter.*values.*empty" src/ --include="*.vue" --include="*.ts"
```
