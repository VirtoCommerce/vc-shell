# Details Blade Pattern

Reference source: `apps/vendor-portal/src/modules/team/pages/team-member-details.vue`
Secondary source: `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`

## Overview

A details blade is a form-based panel opened from a list blade (or navigation) to view/edit a single entity. It validates form fields, tracks modifications, confirms close on unsaved changes, and calls back to the parent list blade after save/delete.

---

## Full Template Skeleton

```vue
<template>
  <VcBlade
    :loading="loading"
    :modified="modified"
    :title="title"
    :toolbar-items="bladeToolbar"
    width="50%"
  >
    <VcContainer>
      <VcForm>
        <VcRow>
          <VcCol>
            <!-- String field with required validation -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.FIELD_NAME.LABEL')"
              :model-value="entity.fieldName"
              name="fieldName"
              rules="required"
            >
              <VcInput
                v-model="entity.fieldName"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.FIELD_NAME.LABEL')"
                :placeholder="$t('MODULE.FIELDS.FIELD_NAME.PLACEHOLDER')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Email field: rules="required|email" -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.EMAIL.LABEL')"
              :model-value="entity.email"
              name="email"
              rules="required|email"
            >
              <VcInput
                v-model="entity.email"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.EMAIL.LABEL')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Number field: type="number" + bigint|min_value rule -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.QUANTITY.LABEL')"
              :model-value="entity.quantity"
              name="quantity"
              rules="required|bigint|min_value:0"
            >
              <VcInput
                v-model="entity.quantity"
                class="tw-p-3"
                type="number"
                :label="$t('MODULE.FIELDS.QUANTITY.LABEL')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>

          <VcCol>
            <!-- Enum/reference field: VcSelect -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.STATUS.LABEL')"
              :model-value="entity.status"
              name="status"
              rules="required"
            >
              <VcSelect
                v-model="entity.status"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.STATUS.LABEL')"
                :options="statusOptions"
                option-value="id"
                option-label="name"
                required
                :clearable="false"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Boolean field: VcSwitch (no Field wrapper needed) -->
            <VcSwitch
              v-model="entity.isActive"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.IS_ACTIVE.LABEL')"
            />

            <!-- Date/DateTime field: VcInput type="datetime-local" -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.CREATED_DATE.LABEL')"
              :model-value="entity.createdDate"
              name="createdDate"
              rules="required"
            >
              <VcInput
                v-model="entity.createdDate"
                class="tw-p-3"
                type="datetime-local"
                :label="$t('MODULE.FIELDS.CREATED_DATE.LABEL')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>
          </VcCol>
        </VcRow>

        <!-- Nested collections: render as inline read-only VcDataTable -->
        <VcRow v-if="entity.lineItems && entity.lineItems.length">
          <VcCol>
            <VcDataTable
              :items="entity.lineItems"
              :columns="lineItemColumns"
            />
          </VcCol>
        </VcRow>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>
```

---

## Full Script Setup Skeleton

```vue
<script lang="ts" setup>
import { computed, ref, onMounted, unref } from "vue";
import { IBladeToolbar, usePopup, useBlade } from "@vc-shell/framework";
import { Field, useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { useXxx } from "../composables";
import type { ITableColumns } from "@vc-shell/framework";
import type { XxxLineItem } from "../../api_client/xxx-client";

// --- Blade metadata ---
// Opened from list blade via openBlade: no url, no isWorkspace
defineBlade({
  name: "XxxDetails",
});

// Exception — standalone details blade (e.g., settings/profile page):
// defineBlade({ name: "XxxDetails", url: "/xxx-details", isWorkspace: true });

// --- Framework composables ---
const { onBeforeClose, param, options, callParent, closeSelf } = useBlade<{
  // pass relevant option types here, e.g.: someOption: SomeType
}>();
const { t } = useI18n({ useScope: "global" });
const { showConfirmation, showError } = usePopup();
const { meta } = useForm({ validateOnMount: false });

// --- Details composable (entity + CRUD + modification tracking) ---
const {
  entity,
  loading,
  modified,
  getXxx,
  createXxx,
  updateXxx,
  deleteXxx,
  resetEntries,
  resetModificationState,
} = useXxx();

// --- Derived state ---
const title = computed(() =>
  param.value
    ? entity.value?.name ?? t("MODULE.PAGES.DETAILS.TITLE_EDIT")
    : t("MODULE.PAGES.DETAILS.TITLE_NEW"),
);

// Disabled when form is pristine/invalid
const isDisabled = computed(() => !meta.value.dirty || !meta.value.valid);

// --- Toolbar ---
const bladeToolbar = ref<IBladeToolbar[]>([
  {
    id: "save",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.SAVE")),
    icon: "lucide-save",
    async clickHandler() {
      if (param.value) {
        await updateXxx(entity.value);
      } else {
        await createXxx(entity.value);
      }
      callParent("reload");
      closeSelf();
    },
    // Show save button only when editing existing record (or always if create+save is single flow)
    isVisible: !!param.value,
    disabled: computed(() => !(!isDisabled.value && modified.value)),
  },
  {
    id: "create",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.CREATE")),
    icon: "lucide-plus",
    async clickHandler() {
      await createXxx(entity.value);
      callParent("reload");
      closeSelf();
    },
    isVisible: !param.value,
    disabled: computed(() => !(!isDisabled.value && modified.value)),
  },
  {
    id: "reset",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.RESET")),
    icon: "lucide-undo-2",
    clickHandler() {
      resetEntries();
    },
    isVisible: !!param.value,
    disabled: computed(() => !modified.value),
  },
  {
    id: "delete",
    title: computed(() => t("MODULE.PAGES.DETAILS.TOOLBAR.DELETE")),
    icon: "lucide-trash-2",
    async clickHandler() {
      if (
        param.value &&
        (await showConfirmation(
          computed(() => t("MODULE.PAGES.DETAILS.POPUP.ALERT.DELETE")),
        ))
      ) {
        await deleteXxx({ id: param.value });
        callParent("reload");
        closeSelf();
      }
    },
    isVisible: !!param.value,
    disabled: computed(() => false),
  },
]);

// --- Nested collection columns ---
// Derived from the nested type's fields (XxxLineItem). Keep read-only.
const lineItemColumns = computed<ITableColumns[]>(() => [
  { id: "productName", title: t("MODULE.PAGES.DETAILS.LINE_ITEMS.PRODUCT"), alwaysVisible: true },
  { id: "quantity", title: t("MODULE.PAGES.DETAILS.LINE_ITEMS.QUANTITY") },
  { id: "price", title: t("MODULE.PAGES.DETAILS.LINE_ITEMS.PRICE") },
]);

// --- Lifecycle ---
onMounted(async () => {
  if (param.value) {
    await getXxx({ id: param.value });
  }
  // For new entity: entity starts as {} — resetModificationState ensures
  // modification tracking baseline is clean after optional pre-fill from options.
  // If pre-filling from options, call resetModificationState() here:
  // entity.value.someField = options.value?.someField ?? "";
  // resetModificationState();
});

// --- Close guard ---
onBeforeClose(async () => {
  if (modified.value) {
    return !(await showConfirmation(
      unref(computed(() => t("MODULE.PAGES.ALERTS.CLOSE_CONFIRMATION"))),
    ));
  }
  return false;
});
</script>
```

---

## Field Type Mapping

| TypeScript/API type     | Component              | Notes                                      |
|-------------------------|------------------------|--------------------------------------------|
| `string`                | `VcInput`              | Default; add `rules="required"` if needed  |
| `boolean`               | `VcSwitch`             | No `Field` wrapper needed                  |
| enum / reference type   | `VcSelect`             | Supply `:options`, `option-value`, `option-label` |
| `Date` / `DateTime`     | `VcInput type="datetime-local"` | Or `VcDatePicker` if available in project |
| `number` / `bigint`     | `VcInput type="number"` | Add `rules="bigint|min_value:0"` for integers |
| `string[]` / array      | `VcDataTable`          | Inline read-only table (see Nested Collections) |
| nested object array     | `VcDataTable`          | Inline read-only table (see Nested Collections) |

---

## Validation Rules Reference

Rules are composed with `|` (pipe) separator:

| Rule          | Example                            | Description                    |
|---------------|------------------------------------|--------------------------------|
| `required`    | `rules="required"`                 | Field must have a value        |
| `email`       | `rules="required|email"`           | Valid email format             |
| `min:N`       | `rules="required|min:3"`           | Minimum string length          |
| `min_value:N` | `rules="required|min_value:0"`     | Minimum numeric value          |
| `bigint`      | `rules="bigint|min_value:0"`       | Integer (no decimals)          |

**Dynamic rules** via `:rules` binding:
```vue
<Field
  :rules="entity.trackInventory ? 'required|bigint|min_value:0' : 'bigint|min_value:0'"
  ...
>
```

---

## Nested Collections Handling

When the entity has array-type fields (e.g., `lineItems: LineItem[]`), render them as an inline read-only `VcDataTable` within the form layout. The generator scopes to the top-level entity; deeper nesting is left for the developer to extend.

```vue
<VcRow v-if="entity.lineItems && entity.lineItems.length">
  <VcCol>
    <VcDataTable
      :items="entity.lineItems"
      :columns="lineItemColumns"
    />
  </VcCol>
</VcRow>
```

Define columns as a computed from the nested type's fields:

```ts
const lineItemColumns = computed<ITableColumns[]>(() => [
  { id: "productName", title: t("MODULE.LINE_ITEMS.PRODUCT"), alwaysVisible: true },
  { id: "quantity",    title: t("MODULE.LINE_ITEMS.QUANTITY") },
  { id: "price",       title: t("MODULE.LINE_ITEMS.PRICE") },
]);
```

The `VcDataTable` here is read-only — no toolbar, no selection, no pagination needed for inline display. If the user needs to edit line items, that becomes a separate child blade (outside the scope of this generator).

---

## Key Rules

1. **`defineBlade({ name: "XxxDetails" })`** — no `url`, no `isWorkspace` for blades opened from list. Add `url` + `isWorkspace: true` only for standalone workspace blades (settings pages, profile pages).
2. **`useForm({ validateOnMount: false })`** — always set `validateOnMount: false` to avoid showing errors on initial open.
3. **Modification tracking lives in the composable**, not the blade. The blade just reads `modified` from the composable.
4. **`onBeforeClose`** guard pattern: return `false` to allow close, return `true` to block. `!(await showConfirmation(...))` returns `true` when user cancels (blocks close), `false` when user confirms (allows close).
5. **After save/delete**: always `callParent("reload")` first, then `closeSelf()`.
6. **`isVisible`** on toolbar items: use `!!param.value` for edit-only actions (save, reset, delete), `!param.value` for create-only actions.
7. **`disabled: computed(...)`** on toolbar items must be a computed, not a plain boolean, for reactivity.
