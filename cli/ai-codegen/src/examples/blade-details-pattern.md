# Blade Details Pattern (Form Layout)

This pattern is used for creating or editing a single item with form fields, validation, and save/delete operations.

## Use Case

- Product details
- Order details
- Vendor profile
- Any entity create/edit form

## Key Features

- Field (vee-validate) + VcInput/VcSelect/VcTextarea for form inputs
- vee-validate for validation
- Modified state tracking
- Save and Delete toolbar actions
- Confirmation on close with unsaved changes
- Browser unload warning for unsaved changes

**IMPORTANT:** Use Field from vee-validate, NOT VcField! VcField is only for read-only data display.

## Using VcCard for Field Grouping

VcCard is used to group related form fields into visually distinct sections.

### Important Rules

1. **VcCard default slot has NO padding** - Always add `tw-p-4` for forms, `tw-p-2` for galleries
2. **Use icons for clarity** - Add meaningful icons to identify card purpose (`icon` prop)
3. **Collapsible sections** - Use `is-collapsable` for large forms to reduce visual clutter
4. **Persist collapse state** - Save user preferences in localStorage

### Basic Example

```vue
<VcCard 
  :header="$t('PRODUCTS.FORM.BASIC_INFO.TITLE')"
  icon="material-info"
>
  <!-- ALWAYS add padding! -->
  <div class="tw-p-4 tw-space-y-4">
    <Field v-slot="{ field }" name="name" rules="required">
      <VcInput v-bind="field" v-model="product.name" label="Name" />
    </Field>
    <Field v-slot="{ field }" name="sku" rules="required">
      <VcInput v-bind="field" v-model="product.sku" label="SKU" />
    </Field>
  </div>
</VcCard>
```

### Collapsible Card Example

```vue
<VcCard
  :header="$t('PRODUCTS.FORM.GALLERY.TITLE')"
  :is-collapsable="true"
  :is-collapsed="restoreCollapsed('product_gallery')"
  @state:collapsed="handleCollapsed('product_gallery', $event)"
>
  <div class="tw-p-2">
    <VcGallery :images="product.images" />
  </div>
</VcCard>
```

**See:** `VcCard-demo.md` for complete documentation and examples.

## Widgets

Widgets are interactive UI components that can be registered in details blades. They appear in a dedicated widget area and are typically used for related data or actions.

### Important Rules

1. **Widget registration BEFORE onMounted** - Register widgets immediately after defining the registration function, NOT inside `onMounted`
2. **Unregister in onBeforeUnmount** - Always clean up widgets when blade closes
3. **Use VcWidget component as base** - All widgets should extend/use VcWidget
4. **Location:** `components/widgets/{widget-name}/` within the module

### Basic Widget Registration

```typescript
import { useWidgets } from "@vc-shell/framework";
import { ShippingWidget } from "../components/widgets";

const { registerWidget, unregisterWidget } = useWidgets();

// Define registration function
function registerWidgets() {
  registerWidget(
    {
      id: "ShippingWidget",
      component: ShippingWidget,
      props: { 
        order: computed(() => order.value)
      },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// ✅ CORRECT: Register BEFORE onMounted
registerWidgets();

// Clean up on unmount
onBeforeUnmount(() => {
  unregisterWidget("ShippingWidget", blade?.value.id);
});
```

**See:** `widgets-pattern.md` for complete documentation, `VcWidget-demo.md` for widget component examples.

## Complete Example

### ProductDetails.vue

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="bladeTitle"
    :toolbar-items="bladeToolbar"
    :closable="closable"
    :expanded="expanded"
    :modified="isModified"
    width="70%"
    @close="$emit('close:blade')"
    @expand="$emit('expand:blade')"
    @collapse="$emit('collapse:blade')"
  >
    <VcContainer class="tw-p-4">
      <VcRow class="tw-space-x-4">
        <VcCol :size="6">
          <!-- Main Form -->
          <div class="tw-space-y-4">
            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="name"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.name"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.NAME_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="sku"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.sku"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.SKU_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="description"
            >
              <VcTextarea
                v-bind="field"
                v-model="item.description"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.DESCRIPTION_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                :rows="4"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="price"
              rules="required"
            >
              <VcInput
                v-bind="field"
                v-model="item.price"
                type="number"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.PRICE_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <Field
              v-slot="{ field, errorMessage, handleChange }"
              name="category"
            >
              <VcSelect
                v-bind="field"
                v-model="item.category"
                :options="categoryOptions"
                :placeholder="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.CATEGORY_PLACEHOLDER')"
                :disabled="loading"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <VcSwitch
              v-model="item.isActive"
              :label="$t('PRODUCTS.PAGES.DETAILS.FORM.INFO.IS_ACTIVE')"
            />
          </div>
        </VcCol>
      </VcRow>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { IBladeToolbar, IParentCallArgs, useBladeNavigation, useBeforeUnload, usePopup } from "@vc-shell/framework";
import { useProductDetails } from "../composables";
import { Field, useForm } from "vee-validate";

// Import your types
// import { IProduct } from "@/api/products";

export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string; // Product ID
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();

// Define blade metadata
defineOptions({
  name: "ProductDetails",
  url: "/products/:id?",
});

const { t } = useI18n({ useScope: "global" });
const { onBeforeClose } = useBladeNavigation();
const { showConfirmation, showInfo } = usePopup();
const { meta } = useForm({ validateOnMount: false });

// Use the details composable
const { item, loading, loadProduct, saveProduct, deleteProduct, isModified, resetModificationState } = useProductDetails();

// Category options for select
const categoryOptions = ref([
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food" },
]);

const bladeTitle = computed(() => {
  return props.param ? item.value?.name || t("PRODUCTS.PAGES.DETAILS.TITLE") : t("PRODUCTS.PAGES.DETAILS.TITLE_NEW");
});

const bladeToolbar = computed((): IBladeToolbar[] => [
  {
    id: "save",
    title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.SAVE"),
    icon: "material-save",
    disabled: computed(() => !isModified.value),
    async clickHandler() {
      if (!meta.value.valid) {
        await showInfo({
          title: t("PRODUCTS.PAGES.ALERTS.NOT_VALID"),
        });
        return;
      }
      await saveProduct();
      resetModificationState();
      await showInfo({
        title: t("PRODUCTS.PAGES.ALERTS.SAVED"),
      });
    },
  },
  {
    id: "delete",
    title: t("PRODUCTS.PAGES.DETAILS.TOOLBAR.DELETE"),
    icon: "material-delete",
    isVisible: computed(() => !!props.param),
    async clickHandler() {
      if (
        await showConfirmation({
          title: t("PRODUCTS.PAGES.ALERTS.DELETE"),
        })
      ) {
        await deleteProduct(props.param!);
        emit("close:blade");
      }
    },
  },
]);

// Confirm before closing if there are unsaved changes
onBeforeClose(async () => {
  if (isModified.value) {
    return await showConfirmation({
      title: t("PRODUCTS.PAGES.ALERTS.CLOSE_CONFIRMATION"),
    });
  }
});

// Warn before browser unload if there are unsaved changes
useBeforeUnload(isModified);

onMounted(async () => {
  if (props.param) {
    await loadProduct(props.param);
  }
});

defineExpose({
  title: bladeTitle,
});
</script>
```

## Required i18n Keys

```json
{
  "PRODUCTS": {
    "PAGES": {
      "DETAILS": {
        "TITLE": "Product Details",
        "TITLE_NEW": "New Product",
        "FORM": {
          "INFO": {
            "NAME": "Name",
            "NAME_PLACEHOLDER": "Enter product name",
            "SKU": "SKU",
            "SKU_PLACEHOLDER": "Enter SKU",
            "DESCRIPTION": "Description",
            "DESCRIPTION_PLACEHOLDER": "Enter description",
            "PRICE": "Price",
            "PRICE_PLACEHOLDER": "Enter price",
            "CATEGORY": "Category",
            "CATEGORY_PLACEHOLDER": "Select category",
            "IS_ACTIVE": "Active"
          }
        },
        "TOOLBAR": {
          "SAVE": "Save",
          "DELETE": "Delete"
        }
      },
      "ALERTS": {
        "NOT_VALID": "Please fix validation errors",
        "SAVED": "Product saved successfully",
        "DELETE": "Are you sure you want to delete this product?",
        "CLOSE_CONFIRMATION": "You have unsaved changes. Are you sure you want to close?"
      }
    }
  }
}
```

## Patterns to Follow

1. **Use composable for data management**: All data operations in `useEntityDetails()`
2. **vee-validate integration**: Use `Field` component and `useForm` composable
3. **Modified state tracking**: Use `isModified` from composable and `useBeforeUnload`
4. **Confirmation dialogs**: Use `showConfirmation` for destructive actions
5. **Validation**: Check `meta.valid` before saving
6. **i18n for all strings**: Never hardcode strings
7. **Toolbar actions**: Save should be disabled when not modified
8. **Delete action**: Only visible when editing existing item (param exists)
9. **TypeScript**: Properly type Props, Emits, and data
10. **Field types**: Use appropriate input types (text, number, email, url, date)
11. **Layout**: Use `VcContainer`, `VcRow`, `VcCol` for responsive layout
