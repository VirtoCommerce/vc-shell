# 08. Dynamic Views Removal

## What Changed

The **Dynamic Views** system — a schema-driven UI that rendered blades from JSON schemas — has been completely removed.

### Removed Exports

| Category | Removed |
|----------|---------|
| Module factory | `createDynamicAppModule` |
| Blade factories | `useDetailsFactory`, `useListFactory` |
| Blade pages | `DynamicBladeList`, `DynamicBladeForm` |
| Schema types | `DynamicSchema`, `DynamicGridSchema`, `DynamicDetailsSchema`, `ControlSchema`, `FormContentSchema`, `ListContentSchema`, `SettingsSchema`, `OverridesSchema`, all field schema types |
| Composables | `useDynamicViewsUtils`, `useToolbarReducer`, `useTableTemplates`, `useFilterBuilder` |
| Components | `SchemaRender`, all field renderers (InputField, SelectField, Card, Fieldset, etc.) |

### Also removed: useDynamicModules loader

The runtime module loader (`loader.ts`) that powered `useDynamicModules()` has been removed. The `DynamicModulesKey` injection key still exists but with a simplified `DynamicModuleRegistry` interface — it's now used for the platform's module federation system rather than the old JSON-schema dynamic modules.

## Migration

Modules using `createDynamicAppModule()` must be rewritten to standard Vue components with `defineAppModule()`.

**Before:**
```typescript
import { createDynamicAppModule } from "@vc-shell/framework";
import * as schema from "./schema";
import * as composables from "./composables";
import * as locales from "./locales";

export default createDynamicAppModule({
  schema,
  composables,
  locales,
});
```

**After:**
```typescript
import { defineAppModule } from "@vc-shell/framework";
import * as blades from "./pages";
import * as locales from "./locales";

export default defineAppModule({
  blades,
  locales,
});
```

Instead of JSON schemas, write standard Vue `<script setup>` components:

**Before (JSON schema):**
```json
{
  "settings": {
    "id": "product-details",
    "component": "DynamicBladeForm",
    "composable": "useProductDetails"
  },
  "content": [{
    "id": "productForm",
    "component": "vc-form",
    "children": [
      { "id": "name", "component": "vc-input", "property": "name", "label": "Name" },
      { "id": "category", "component": "vc-select", "property": "categoryId", "label": "Category" }
    ]
  }]
}
```

**After (Vue component):**
```vue
<template>
  <VcBlade title="Product Details" :toolbar-items="bladeToolbar">
    <VcForm>
      <VcInput v-model="item.name" label="Name" />
      <VcSelect v-model="item.categoryId" label="Category" :options="categories" />
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { VcBlade, VcForm, VcInput, VcSelect } from "@vc-shell/framework";
</script>
```

## How to Find

```bash
grep -rn "createDynamicAppModule\|DynamicBladeForm\|DynamicBladeList\|useDynamicViewsUtils\|useDetailsFactory\|useListFactory" src/
```
