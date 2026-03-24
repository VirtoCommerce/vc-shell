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

            <!-- Date/DateTime field: VcDatePicker (preferred over VcInput type="datetime-local") -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.CREATED_DATE.LABEL')"
              :model-value="entity.createdDate"
              name="createdDate"
              rules="required"
            >
              <VcDatePicker
                v-model="entity.createdDate"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.CREATED_DATE.LABEL')"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Textarea field: for long text (description, notes, comments) -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.DESCRIPTION.LABEL')"
              :model-value="entity.description"
              name="description"
            >
              <VcTextarea
                v-model="entity.description"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.DESCRIPTION.LABEL')"
                :placeholder="$t('MODULE.FIELDS.DESCRIPTION.PLACEHOLDER')"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Rich text / HTML field: VcEditor (WYSIWYG) -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.BODY.LABEL')"
              :model-value="entity.body"
              name="body"
            >
              <VcEditor
                v-model="entity.body"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.BODY.LABEL')"
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Currency field: VcInputCurrency (formatted monetary input) -->
            <Field
              v-slot="{ errorMessage, handleChange, errors }"
              :label="$t('MODULE.FIELDS.PRICE.LABEL')"
              :model-value="entity.price"
              name="price"
              rules="required|min_value:0"
            >
              <VcInputCurrency
                v-model="entity.price"
                class="tw-p-3"
                :label="$t('MODULE.FIELDS.PRICE.LABEL')"
                currency="USD"
                required
                :error="!!errors.length"
                :error-message="errorMessage"
                @update:model-value="handleChange"
              />
            </Field>

            <!-- Multi-select / Tags field: VcMultivalue -->
            <VcMultivalue
              v-model="entity.tags"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.TAGS.LABEL')"
              :placeholder="$t('MODULE.FIELDS.TAGS.PLACEHOLDER')"
            />

            <!-- Checkbox field: alternative to VcSwitch for accept/agree semantics -->
            <VcCheckbox
              v-model="entity.agreeTerms"
              class="tw-p-3"
            >
              {{ $t('MODULE.FIELDS.AGREE_TERMS.LABEL') }}
            </VcCheckbox>

            <!-- Radio group: for enum fields with 2-5 options -->
            <VcRadioGroup
              v-model="entity.priority"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.PRIORITY.LABEL')"
              :options="priorityOptions"
              option-value="id"
              option-label="name"
            />

            <!-- Rating field: VcRating -->
            <VcRating
              v-model="entity.rating"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.RATING.LABEL')"
            />

            <!-- Slider field: VcSlider (numeric range) -->
            <VcSlider
              v-model="entity.discount"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.DISCOUNT.LABEL')"
              :min="0"
              :max="100"
            />

            <!-- Color field: VcColorInput -->
            <VcColorInput
              v-model="entity.brandColor"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.BRAND_COLOR.LABEL')"
            />

            <!-- Image upload field: VcImageUpload -->
            <VcImageUpload
              v-model="entity.avatar"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.AVATAR.LABEL')"
            />

            <!-- File upload field: VcFileUpload -->
            <VcFileUpload
              v-model="entity.attachment"
              class="tw-p-3"
              :label="$t('MODULE.FIELDS.ATTACHMENT.LABEL')"
              :accept="'.pdf,.doc,.docx'"
            />
          </VcCol>
        </VcRow>

        <!-- Form sections with VcCard for visual grouping -->
        <VcRow>
          <VcCol>
            <VcCard :header="$t('MODULE.SECTIONS.ADVANCED.TITLE')">
              <!-- Group related fields inside a card -->
            </VcCard>
          </VcCol>
        </VcRow>

        <!-- Collapsible sections with VcAccordion -->
        <VcRow>
          <VcCol>
            <VcAccordion :header="$t('MODULE.SECTIONS.SETTINGS.TITLE')">
              <!-- Fields that are less frequently edited -->
            </VcAccordion>
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

## Read-Only Details Pattern (VcField)

For details blades that display data without editing (e.g., order details, transaction history), use `VcField` instead of `VcInput`. This is a common pattern for view-only pages.

Source: `apps/vendor-portal/src/modules/orders/pages/order-details.vue`

```vue
<VcCard :header="$t('MODULE.SECTIONS.INFO.TITLE')">
  <div class="tw-p-4 tw-space-y-4">
    <VcField
      :label="$t('MODULE.FIELDS.ORDER_REF.LABEL')"
      :model-value="entity.number || entity.id"
      orientation="horizontal"
      :aspect-ratio="[1, 2]"
      copyable
      type="text"
    />
    <VcField
      :label="$t('MODULE.FIELDS.STATUS.LABEL')"
      :model-value="entity.status"
      orientation="horizontal"
      :aspect-ratio="[1, 2]"
      type="text"
      :tooltip="$t('MODULE.FIELDS.STATUS.TOOLTIP')"
    />
    <VcField
      :label="$t('MODULE.FIELDS.TOTAL.LABEL')"
      :model-value="withCurrency(entity.total)"
      orientation="horizontal"
      :aspect-ratio="[1, 2]"
      type="text"
      class="tw-font-semibold"
    />
  </div>
</VcCard>
```

Key `VcField` props:
- `orientation="horizontal"` — label left, value right (default is vertical)
- `:aspect-ratio="[1, 2]"` — label takes 1/3, value takes 2/3
- `copyable` — adds a copy-to-clipboard button
- `:tooltip` — adds an info icon with hover text

Use `VcField` when:
- The blade is read-only (order details, audit log, transaction view)
- Showing summary/computed data that users don't edit
- Displaying key-value pairs in a structured layout

---

## Contextual Banners Pattern (VcBanner)

Use `VcBanner` at the top of a form to show contextual alerts, warnings, or informational messages based on entity state.

Source: `apps/vendor-portal/src/modules/offers/pages/offers-details.vue`, `seller-details-edit.vue`

```vue
<!-- Error banner (shown conditionally) -->
<VcBanner
  v-if="errorMessage"
  variant="danger"
  icon="lucide-alert-circle"
  icon-size="l"
  icon-variant="danger"
>
  <template #title>
    {{ $t("MODULE.ALERTS.ERROR") }}
  </template>
  <template #default>
    {{ errorMessage }}
  </template>
</VcBanner>

<!-- Info banner with action button -->
<VcBanner
  v-if="!entity.id"
  variant="info"
  icon="lucide-lightbulb"
  icon-size="l"
>
  {{ $t("MODULE.ALERTS.CREATE_NEW_HINT") }}
</VcBanner>

<!-- Warning banner with inline action -->
<VcBanner
  v-if="entity.id && !entity.priceLists?.length"
  variant="info"
  icon="lucide-lightbulb"
  icon-size="l"
>
  <div class="tw-flex tw-flex-row tw-justify-between tw-items-center">
    <span>{{ $t("MODULE.ALERTS.MISSING_PRICES") }}</span>
    <VcButton
      icon="lucide-plus"
      variant="link"
      size="sm"
      class="tw-shrink-0"
      @click="openBlade({ name: 'PricesList' })"
    >{{ $t("MODULE.ACTIONS.ADD_PRICE") }}</VcButton>
  </div>
</VcBanner>
```

Banner variants: `"info"`, `"warning"`, `"danger"`, `"success"`.

Use banners when:
- Entity is in a special state (new, error, incomplete)
- User needs to take action (missing required data)
- Showing validation errors at form level

---

## Blade Widgets Pattern (useBladeWidgets)

Blade widgets appear as icon buttons in the blade sidebar, showing related entities with badge counts. Clicking a widget opens a child blade.

Source: `apps/vendor-portal/src/modules/products/widgets/useProductWidgets.ts`

```ts
import { useBladeWidgets, type UseBladeWidgetsReturn } from "@vc-shell/framework";

export function useProductWidgets(options: { item: Ref<Product | undefined> }): UseBladeWidgetsReturn {
  const { item } = options;
  const { openBlade } = useBlade();

  const { count: offersCount, loading: offersLoading, refresh: refreshOffers } = useOfferCount(item);

  const widgets = useBladeWidgets([
    {
      id: "OffersWidget",
      icon: "lucide-tag",
      title: "PRODUCTS.PAGES.DETAILS.WIDGETS.OFFERS",
      badge: offersCount,
      loading: offersLoading,
      isVisible: computed(() => !!item.value?.id),
      onClick: () => openBlade({ name: "Offers", options: { product: item.value } }),
      onRefresh: refreshOffers,
    },
    // ... more widgets
  ]);

  return widgets;
}
```

Use in the blade:
```ts
const { widgets } = useProductWidgets({ item: entity });
```

Use widgets when:
- Entity has related sub-entities (product → offers, videos, assets)
- You want sidebar navigation with counts
- Each widget opens a different child blade

---

## Key Rules

1. **`defineBlade({ name: "XxxDetails" })`** — no `url`, no `isWorkspace` for blades opened from list. Add `url` + `isWorkspace: true` only for standalone workspace blades (settings pages, profile pages).
2. **`useForm({ validateOnMount: false })`** — always set `validateOnMount: false` to avoid showing errors on initial open.
3. **Modification tracking lives in the composable**, not the blade. The blade just reads `modified` from the composable.
4. **`onBeforeClose`** guard pattern: return `false` to allow close, return `true` to block. `!(await showConfirmation(...))` returns `true` when user cancels (blocks close), `false` when user confirms (allows close).
5. **After save/delete**: always `callParent("reload")` first, then `closeSelf()`.
6. **`isVisible`** on toolbar items: use `!!param.value` for edit-only actions (save, reset, delete), `!param.value` for create-only actions.
7. **`disabled: computed(...)`** on toolbar items must be a computed, not a plain boolean, for reactivity.

---

## Field Type → Component Mapping

Use this table to choose the correct component for each field type during generation. The `formField.type` value comes from the design prompt analysis (Phase 2 of `/vc-app design`) or from API type inference.

| Field Type | Component | When to Use | Notes |
|---|---|---|---|
| `string` | `VcInput` | Default for short text (name, title, email, phone, URL) | Use `type="number"` for numeric strings, `rules="email"` for emails |
| `text` | `VcTextarea` | Long text: description, notes, comments, bio | Multi-line input, no formatting |
| `rich-text` | `VcEditor` | HTML content: article body, email template, product description | WYSIWYG HTML editor |
| `number` | `VcInput` | Plain numbers: quantity, count, age, priority | Set `type="number"`, use `rules="bigint\|min_value:0"` |
| `currency` | `VcInputCurrency` | Money: price, cost, amount, salary, budget | Formatted with currency symbol and decimals |
| `boolean` | `VcSwitch` | Toggle: isActive, isEnabled, isPublished | No `Field` wrapper needed |
| `boolean` | `VcCheckbox` | Consent/agree: agreeTerms, acceptPolicy | Use when "agree/accept" semantics, not toggle |
| `date-time` | `VcDatePicker` | Date/datetime: createdDate, deadline, startDate, birthday | Calendar picker, preferred over `VcInput type="datetime-local"` |
| `enum` | `VcSelect` | Dropdown: status, type, category (6+ options or dynamic) | Use `option-value` + `option-label` |
| `enum` | `VcRadioGroup` | Radio: priority, type (2-5 static options) | More visual for small option sets |
| `multi-select` | `VcMultivalue` | Tags/multi-pick: tags, categories, permissions, roles | Tag-style chips with add/remove |
| `multi-select` | `VcCheckboxGroup` | Multi-check: features, capabilities (few static options) | Vertical checkbox list |
| `rating` | `VcRating` | Star rating: rating, score, quality | 1-5 star picker |
| `range` | `VcSlider` | Range: discount, opacity, volume, percentage | Numeric slider with min/max |
| `color` | `VcColorInput` | Color: brandColor, backgroundColor, themeColor | Color picker with hex input |
| `image` | `VcImageUpload` | Single image: avatar, logo, thumbnail, banner | Upload with preview |
| `gallery` | `VcGallery` | Multiple images: productPhotos, screenshots | Multi-image management grid |
| `file` | `VcFileUpload` | Attachment: document, contract, certificate | File upload with accept filter |

### Selection heuristics (when type is ambiguous)

When the field type from prompt analysis is plain `"string"`, use field name patterns to upgrade:

| Field name pattern | Upgrade to |
|---|---|
| `description`, `notes`, `comment`, `bio`, `summary`, `about` | `text` → `VcTextarea` |
| `body`, `content`, `html`, `template`, `article` | `rich-text` → `VcEditor` |
| `price`, `cost`, `amount`, `total`, `salary`, `budget`, `fee` | `currency` → `VcInputCurrency` |
| `avatar`, `logo`, `photo`, `thumbnail`, `banner`, `icon` | `image` → `VcImageUpload` |
| `photos`, `images`, `screenshots`, `gallery` | `gallery` → `VcGallery` |
| `file`, `attachment`, `document`, `contract`, `certificate` | `file` → `VcFileUpload` |
| `tags`, `labels`, `categories`, `roles`, `permissions` | `multi-select` → `VcMultivalue` |
| `rating`, `score`, `stars` | `rating` → `VcRating` |
| `color`, `colour`, `brandColor`, `backgroundColor` | `color` → `VcColorInput` |
| `discount`, `opacity`, `volume`, `percentage`, `progress` | `range` → `VcSlider` |
| `email` | `string` → `VcInput` with `rules="required\|email"` |
| `phone`, `tel` | `string` → `VcInput` with `type="tel"` |
| `url`, `website`, `link` | `string` → `VcInput` with `type="url"` |

### Layout heuristics

- **3+ fields in a form** → use `VcRow` / `VcCol` grid to arrange fields in 2 columns
- **5+ fields with logical groups** → wrap groups in `VcCard` with a section header
- **8+ fields** → consider `VcAccordion` for secondary/advanced fields
- **Mixed required + optional fields** → put required fields at the top, optional in a collapsible section
