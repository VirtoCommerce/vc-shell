---
id: blade-details-complete
type: PATTERN
complexity: MODERATE
category: blade
tags: ["blade", "details", "VcForm", "validation"]
title: "Complete Details Blade Pattern"
description: "Full working example of details blade with form, validation, save/delete"
bladeContext: ["details"]
---

# Complete Details Blade Pattern

This document describes the authoritative pattern for details blades in VC-Shell.

## Authoritative Reference

**The single source of truth is:** `reference/blade-details.vue`

See [reference/blade-details.vue](../reference/blade-details.vue) for the complete, production-ready implementation.

## Use Cases

- Product details/edit
- Order details
- Customer profile
- Any entity detail view with form

## Key Features

- VcForm with VcCard sections
- Field (vee-validate) for all inputs
- :modified indicator for unsaved changes
- Save/Delete toolbar actions
- Unsaved changes confirmation
- Browser close warning
- Parent notification on save/delete

## Architecture

```
details-blade.vue
├── Uses: composable-details.ts (data management)
├── Uses: usePopup (confirmations/errors)
├── Uses: useBeforeUnload (browser warning)
├── Uses: useBladeNavigation.onBeforeClose (blade close)
├── Uses: vee-validate Field + useForm
└── Emits: parent:call to notify list blade
```

## Component Distinction

**IMPORTANT:**
- **Field (from vee-validate)**: Use for EDITABLE form inputs with validation
  - Wrap VcInput, VcSelect, VcTextarea for user input
  - Provides validation, error messages, field state
- **VcField (from @vc-shell/framework)**: Use for READ-ONLY data display
  - Shows label and static value (no editing)
  - Used in details views, reports, summaries

## Critical Patterns

### 1. defineOptions for Details Blade

```typescript
defineOptions({
  name: "ProductDetails",
  url: "/product",
  // ⚠️ Details blades are NOT workspace - no menuItem!
});
```

### 2. VcForm + VcCard Structure

```vue
<VcContainer>
  <VcForm class="tw-space-y-4">
    <VcCard :header="$t('...')" icon="material-info">
      <!-- IMPORTANT: Always add tw-p-4 for padding inside VcCard -->
      <div class="tw-p-4 tw-space-y-4">
        <!-- Form fields here -->
      </div>
    </VcCard>
  </VcForm>
</VcContainer>
```

### 3. Field with vee-validate

```vue
<Field
  v-slot="{ field, errorMessage, handleChange, errors }"
  :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.LABEL')"
  :model-value="item.name"
  name="name"
  rules="required|min:3"
>
  <VcInput
    v-bind="field"
    v-model="item.name"
    :label="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.LABEL')"
    :placeholder="$t('PRODUCTS.PAGES.DETAILS.FIELDS.NAME.PLACEHOLDER')"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>
```

### 4. VcCard Rules

1. **VcCard default slot has NO padding** - Always add `tw-p-4` for forms, `tw-p-2` for galleries
2. **Use icons for clarity** - Add meaningful icons to identify card purpose (`icon` prop)
3. **Collapsible sections** - Use `is-collapsable` for large forms to reduce visual clutter

### 5. Toolbar with Disabled State

```typescript
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "material-save",
    disabled: computed(() => !meta.value.valid || !isModified.value),
    async clickHandler() {
      await handleSave();
    },
  },
  {
    id: "delete",
    title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    isVisible: computed(() => !!props.param),  // Only show for existing items
    async clickHandler() {
      await handleDelete();
    },
  },
]);
```

### 6. Unsaved Changes Protection

```typescript
// Blade close protection
onBeforeClose(async () => {
  if (isModified.value && !loading.value) {
    return await showConfirmation(t("...UNSAVED_CHANGES"));
  }
  return true;
});

// Browser close protection
useBeforeUnload(computed(() => isModified.value && !loading.value));
```

### 7. Parent Notification

```typescript
// After save/delete, notify parent to reload
emit("parent:call", { method: "reload" });
emit("close:blade");  // Close after create or delete
```

## Required Composable Interface

Details blade expects composable to return:

```typescript
interface IUseProductDetails {
  item: Ref<IProduct>;
  loading: ComputedRef<boolean>;
  isModified: Readonly<Ref<boolean>>;
  resetModificationState: () => void;
  loadProduct: (id: string) => Promise<void>;
  saveProduct: (data?: IProduct) => Promise<IProduct | undefined>;
  deleteProduct: (id: string) => Promise<void>;
}
```

## Required i18n Keys

```json
{
  "PRODUCTS": {
    "PAGES": {
      "DETAILS": {
        "TITLE": "Product",
        "NEW_TITLE": "New Product",
        "SECTIONS": {
          "BASIC_INFO": "Basic Information",
          "DESCRIPTION": "Description"
        },
        "FIELDS": {
          "NAME": { "LABEL": "Name", "PLACEHOLDER": "Enter product name" },
          "SKU": { "LABEL": "SKU", "PLACEHOLDER": "Enter SKU" },
          "PRICE": { "LABEL": "Price", "PLACEHOLDER": "0.00" },
          "STATUS": {
            "LABEL": "Status",
            "PLACEHOLDER": "Select status",
            "ACTIVE": "Active",
            "INACTIVE": "Inactive",
            "PENDING": "Pending"
          },
          "IS_ACTIVE": { "LABEL": "Active" },
          "DESCRIPTION": { "LABEL": "Description", "PLACEHOLDER": "Enter description" }
        },
        "TOOLBAR": { "SAVE": "Save", "DELETE": "Delete" },
        "ALERTS": {
          "SAVE_ERROR": "Failed to save product",
          "NOT_VALID": "Please fix validation errors",
          "DELETE_CONFIRM": "Are you sure you want to delete this product?",
          "UNSAVED_CHANGES": "You have unsaved changes. Discard them?"
        }
      }
    }
  }
}
```

## Related Patterns

- [composable-details-complete.md](./composable-details-complete.md) - Data management
- [blade-list-complete.md](./blade-list-complete.md) - Parent list blade
- [details-validation.md](./details-validation.md) - Advanced validation
- [unsaved-changes.md](./unsaved-changes.md) - Change tracking
