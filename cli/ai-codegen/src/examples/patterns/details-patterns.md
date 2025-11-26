---
id: details-patterns
type: PATTERN
complexity: MODERATE
category: pattern
tags: [pattern]
title: "Details Patterns"
description: "Details Patterns pattern"
---

# Details Blade Template Selection Guide

This guide helps you choose the right details blade template for your requirements.

## Available Templates

### 1. details-simple.vue (180 lines) - Basic Form

**Use when:**
- Simple create/edit form with few fields (5-7 fields)
- Basic validation rules (required, email, etc.)
- Standard toolbar (save, delete)
- No complex async operations

**Features:**
- ✅ VcBlade + VcForm
- ✅ VcField + VcInput/VcSelect/VcTextarea
- ✅ vee-validate integration with Field component
- ✅ Save/Delete toolbar actions
- ✅ Modified state tracking
- ✅ Close confirmation on unsaved changes
- ✅ useBeforeUnload for browser refresh protection
- ✅ Simple VcSwitch for boolean fields
- ✅ Gallery for single/multiple images

**Based on:** Simplified from real details blades

**Example Use Cases:**
- User profile editing
- Simple product form
- Category create/edit
- Basic settings form

**Complexity:** Basic  
**Estimated adaptation time:** 15-20 minutes

---

### 2. details-validation.vue (290 lines) - Advanced Form with Async Validation

**Use when:**
- Complex form with many fields (> 7 fields)
- Async validation (check uniqueness, external validation)
- Async select options (fetch from API)
- Multiple sections or cards
- Gallery for images
- Debounced validation

**Features:**
- ✅ All features from details-simple
- ✅ Async select with searchable dropdown
- ✅ Custom select templates (selected-item, option slots)
- ✅ Debounced async validation (useDebounceFn)
- ✅ Loading states for validation and data fetching
- ✅ VcCard sections for organization
- ✅ Collapsible sections with localStorage persistence
- ✅ Image gallery with upload/edit/remove
- ✅ Complex field dependencies
- ✅ Error field mapping from backend

**Based on:** `offers-details.vue` from vendor-portal

**Example Use Cases:**
- Product offer with inventory
- Complex order form
- Vendor registration
- Multi-step form data
- Forms with external validation

**Requires:**
- Async validation composable method
- Debounce utility (@vueuse/core)
- Asset management composable
- Backend validation API

**Complexity:** Advanced  
**Estimated adaptation time:** 40-60 minutes

---

## Decision Tree

```
Does your form need async validation (check uniqueness, external API)?
├─ YES → details-validation.vue
└─ NO
    ├─ Do you have > 7 fields or complex sections?
    │   ├─ YES → details-validation.vue (use sections)
    │   └─ NO → details-simple.vue
```

## Common Adaptations

### For All Templates

1. **Entity Renaming:**
   - Replace `Entity` with your entity name (e.g., `Product`, `Order`, `User`)
   - Replace `entity` with lowercase version
   - Replace `ENTITIES` with uppercase in i18n keys

2. **Form Fields:**
```vue
<Field
  v-slot="{ field, errorMessage, handleChange, errors }"
  :label="$t('YOUR_MODULE.PAGES.DETAILS.FIELDS.NAME.LABEL')"
  :model-value="entity.name"
  name="name"
  rules="required"
>
  <VcInput
    v-bind="field"
    v-model="entity.name"
    :label="$t('YOUR_MODULE.PAGES.DETAILS.FIELDS.NAME.LABEL')"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

3. **Toolbar Actions:**
```typescript
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("YOUR_MODULE.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    async clickHandler() {
      if (meta.value.valid) {
        if (entity.value.id) {
          await updateEntity(entity.value);
        } else {
          await createEntity(entity.value);
        }
        // ... rest of save logic
      }
    },
    disabled: computed(() => !(meta.value.valid && modified.value)),
  },
  // Delete, additional actions...
]);
```

### For details-simple Template

**Add more fields:**

```vue
<VcRow>
  <VcCol>
    <Field v-slot="{ field, errorMessage, errors }" name="yourField" rules="required">
      <VcInput
        v-bind="field"
        v-model="entity.yourField"
        :label="$t('...')"
        required
        :error="!!errors.length"
        :error-message="errorMessage"
      />
    </Field>
  </VcCol>
</VcRow>
```

**Select fields:**

```vue
<Field v-slot="{ field, errorMessage, errors }" name="status" rules="required">
  <VcSelect
    v-bind="field"
    v-model="entity.status"
    :options="statusOptions"
    option-value="value"
    option-label="label"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    :clearable="false"
  />
</Field>
```

### For details-validation Template

**Async validation setup:**

```typescript
const validateCode = (value: string, property: string) => {
  isCodeValidating.value = true;

  const debouncedValidation = useDebounceFn(async () => {
    const result = await validateEntity({ ...entity.value, [property]: value });
    const errors = result?.filter((error) => error.propertyName?.toLowerCase() === property);
    
    setFieldError(
      property,
      errors.map((error) => t(`YOUR_MODULE.ERRORS.${error.errorCode}`)).join("\n"),
    );
    
    isCodeValidating.value = false;
  }, 1000);

  debouncedValidation();
};
```

**Async select with custom templates:**

```vue
<VcSelect
  v-model="entity.parentId"
  searchable
  :loading="fetchParentsLoading"
  :options="fetchParents"
  option-value="id"
  option-label="name"
>
  <template #selected-item="{ opt }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <span class="tw-font-medium">{{ opt.name }}</span>
    </div>
  </template>
  <template #option="{ opt }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <span>{{ opt.name }}</span>
      <span class="tw-text-gray-500">{{ opt.category }}</span>
    </div>
  </template>
</VcSelect>
```

**Collapsible sections:**

```vue
<VcCard
  :header="$t('...')"
  is-collapsable
  :is-collapsed="restoreCollapsed('section_key')"
  @state:collapsed="handleCollapsed('section_key', $event)"
>
  <!-- Section content -->
</VcCard>

<script setup>
function handleCollapsed(key: string, value: boolean): void {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}
</script>
```

**Image gallery:**

```vue
<VcGallery
  :images="entity.images"
  multiple
  @upload="assetsHandler.upload"
  @sort="assetsHandler.edit"
  @remove="assetsHandler.remove"
/>

<script setup>
import { useAssets } from "@vc-shell/framework";

const { upload, remove, edit, loading: assetsLoading } = useAssets();

const assetsHandler = {
  async upload(files: FileList, startingSortOrder?: number) {
    const uploaded = await upload(files, `entities/${entity.value?.id}`, startingSortOrder);
    entity.value.images = [...(entity.value?.images ?? []), ...uploaded];
  },
  async remove(file: IImage) {
    if (await showConfirmation(t("CONFIRM_DELETE_IMAGE"))) {
      entity.value.images = remove([file], entity.value?.images ?? []);
    }
  },
  edit(files: IImage[]) {
    entity.value.images = edit(files, entity.value?.images ?? []);
  },
};
</script>
```

## Validation Rules

Common vee-validate rules you can use:

- `required` - Field is required
- `email` - Valid email format
- `min:3` - Minimum length
- `max:100` - Maximum length
- `bigint` - Integer numbers only
- `min_value:0` - Minimum numeric value
- `url` - Valid URL format

**Custom rules:**

```vue
<Field
  name="sku"
  rules="required|min:3"
  v-slot="{ field, errorMessage, errors }"
>
  <!-- Input here -->
</Field>
```

## Integration with Composables

Both templates require a details composable:

```typescript
const {
  entity,           // Ref<Entity>
  loading,          // Ref<boolean>
  modified,         // Ref<boolean>
  loadEntity,       // (id: string) => Promise<void>
  createEntity,     // (data: Entity) => Promise<void>
  updateEntity,     // (data: Entity) => Promise<void>
  deleteEntity,     // (id: string) => Promise<void>
  validateEntity,   // (data: Entity) => Promise<ValidationError[]> (validation template only)
  resetModificationState, // () => void
} = useEntityDetails();
```

## Widget Integration

For details-validation template with widgets:

```typescript
import { useWidgets, useBlade } from "@vc-shell/framework";

const { registerWidget, unregisterWidget } = useWidgets();
const blade = useBlade();

registerWidget(
  {
    id: "YourWidget",
    component: YourWidgetComponent,
    props: { data: computed(() => entity.value.data) },
  },
  blade?.value.id,
);

// Cleanup on unmount
onBeforeUnmount(() => {
  unregisterWidget("YourWidget", blade?.value.id);
});
```

## Quality Checklist

After adapting template:

- [ ] Entity names renamed throughout
- [ ] All fields match your entity interface
- [ ] Validation rules appropriate for each field
- [ ] i18n keys updated
- [ ] Types imported correctly
- [ ] Composable name updated (useEntityDetails)
- [ ] Toolbar actions appropriate
- [ ] Save logic handles both create and update
- [ ] Delete confirmation works
- [ ] Modified state tracked correctly
- [ ] Browser refresh warning works
- [ ] Async validation debounced (validation template)
- [ ] Gallery handlers work (if using)
- [ ] Collapsible sections persist (if using)

## Common Mistakes to Avoid

1. **Don't remove watchers** - they manage state reactivity
2. **Don't skip resetModificationState** - causes false modified warnings
3. **Don't remove onBeforeClose** - users lose unsaved work
4. **Don't change event handler patterns** - they handle edge cases
5. **Always pass handleChange to vee-validate** - enables validation
6. **Keep meta.value.valid checks** - prevents invalid saves
7. **Preserve disabled computed logic** - prevents double-saves

## Tips

1. **Start with details-simple** if unsure - you can always upgrade
2. **Use VcCard sections** to organize complex forms
3. **Add tooltips to complex fields** - improves UX
4. **Use async selects** for large datasets (> 100 options)
5. **Debounce async validation** - avoids API spam
6. **Test with both new and existing entities** - different code paths

## Next Steps

After creating blade:
1. Create corresponding composable (useEntityDetails)
2. Create i18n translations for all fields
3. Add types for your entity
4. Register module in main.ts (AI does this automatically)
5. Test create, update, delete operations
6. Verify validation works correctly
7. Test unsaved changes warning

