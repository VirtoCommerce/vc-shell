# VcSelect

A dropdown list component for selecting one or multiple values. Supports synchronous and asynchronous data sources, search with debounce, infinite scrolling, custom option templates, and full integration with the framework's validation system.

VcSelect is one of the most widely used components in vc-shell. It covers most selection scenarios: from a simple dropdown with a static list to searching via a server API with pagination.

## When to Use

| Scenario                                | Component                                |
| --------------------------------------- | ---------------------------------------- |
| Selection from a list (single/multiple) | **VcSelect**                             |
| Free text input                         | [VcInput](../vc-input/)                  |
| Number input + unit selection           | [VcInputDropdown](../vc-input-dropdown/) |
| Tags with free-form input               | [VcMultivalue](../vc-multivalue/)        |
| Date selection                          | [VcDatePicker](../vc-date-picker/)       |
| Color selection                         | [VcColorInput](../vc-color-input/)       |

## Quick Start

The simplest example — a static list:

```vue
<template>
  <VcSelect
    v-model="selectedId"
    :options="countries"
    option-value="code"
    option-label="name"
    label="Страна"
    placeholder="Выберите страну"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";

const selectedId = ref<string>();
const countries = [
  { code: "us", name: "United States" },
  { code: "de", name: "Germany" },
  { code: "jp", name: "Japan" },
];
</script>
```

> **Important:** by default `emitValue: true` — only the value (string/number) is passed to `v-model`, not the entire option object. If you need the full object, pass `:emit-value="false"`.

---

## Data Sources

VcSelect supports three ways to provide options.

### Static Array of Objects

The simplest approach. Pass an array directly:

```vue
<VcSelect
  v-model="status"
  :options="[
    { id: 'active', title: 'Active' },
    { id: 'draft', title: 'Draft' },
    { id: 'archived', title: 'Archived' },
  ]"
  label="Status"
/>
```

By default `option-value="id"` and `option-label="title"` — if your objects use these fields, you don't need to specify them.

### Array of Primitives

For simple lists of strings or numbers:

```vue
<VcSelect v-model="size" :options="['S', 'M', 'L', 'XL', 'XXL']" label="Размер" />
```

In this case `optionValue` and `optionLabel` are not needed — the component uses the value as-is.

### Async Function (Server API)

To load data from a server, pass a function instead of an array. This is the most powerful mode — it automatically provides:

- Search with debounce (500ms by default)
- Infinite scrolling (loads more on scroll down)
- Automatic resolution of the initial value by `ids`

```vue
<template>
  <VcSelect
    v-model="productId"
    :options="loadProducts"
    option-value="id"
    option-label="name"
    label="Продукт"
    placeholder="Поиск по названию..."
    searchable
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSelect } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";

const productId = ref<string>();

// Сигнатура функции, которую ожидает VcSelect:
// (keyword?: string, skip?: number, ids?: string[]) => Promise<{ results: T[]; totalCount: number }>
const loadProducts = async (keyword?: string, skip?: number, ids?: string[]) => {
  const client = useApiClient(CatalogModuleApi);

  // Если передан ids — это начальная загрузка для отображения уже выбранного значения
  if (ids?.length) {
    const products = await client.getProductsByIds(ids);
    return { results: products, totalCount: products.length };
  }

  // Обычный поиск с пагинацией
  const response = await client.searchProducts({
    keyword,
    skip: skip ?? 0,
    take: 20,
  });

  return {
    results: response.results ?? [],
    totalCount: response.totalCount ?? 0,
  };
};
</script>
```

> **How infinite scrolling works:** when the user scrolls to the end of the list, VcSelect calls your function with an increased `skip`. Loading continues as long as `results.length < totalCount`.

> **How the initial value works:** if `v-model` already contains an ID but the list has not been loaded yet, VcSelect will call the function with `ids: [currentValue]` to retrieve the object for displaying the label.

---

## Multiple Selection

Add `multiple` to enable selecting several values. The model becomes an array:

```vue
<template>
  <VcSelect
    v-model="selectedTags"
    :options="tags"
    option-value="id"
    option-label="name"
    label="Теги"
    placeholder="Выберите теги..."
    multiple
    clearable
  />
  <p>Выбрано: {{ selectedTags.length }} тегов</p>
</template>

<script setup lang="ts">
import { ref } from "vue";

const selectedTags = ref<string[]>([]);
const tags = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "food", name: "Food & Beverages" },
  { id: "sports", name: "Sports" },
];
</script>
```

Selected values are displayed as chips with a remove button. The `clearable` button resets all selections.

---

## Search and Filtering

Enable `searchable` to add a search field to the dropdown:

```vue
<VcSelect v-model="userId" :options="users" label="Пользователь" searchable :debounce="300" @search="onSearch" />
```

- **Static array:** filtering happens on the client side (by `optionLabel`)
- **Async function:** the search query is passed as the `keyword` parameter to your function
- **debounce:** delay before sending the request (500ms by default; can be reduced for local filtering)

---

## Custom Option Rendering

Use the `#option` slot for full control over how each option is rendered:

```vue
<template>
  <VcSelect
    v-model="statusId"
    :options="statuses"
    label="Статус заказа"
  >
    <template #option="{ opt, selected, toggleOption }">
      <div
        class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-cursor-pointer"
        :class="{ 'tw-bg-[var(--accent-100)]': selected }"
        @click="toggleOption(opt)"
      >
        <!-- Цветной индикатор -->
        <span
          class="tw-w-2 tw-h-2 tw-rounded-full tw-shrink-0"
          :style="{ backgroundColor: opt.color }"
        />
        <!-- Название и описание -->
        <div class="tw-flex tw-flex-col">
          <span class="tw-text-sm tw-font-medium">{{ opt.title }}</span>
          <span class="tw-text-xs tw-text-[var(--neutrals-400)]">{{ opt.description }}</span>
        </div>
        <!-- Галочка для выбранного -->
        <VcIcon
          v-if="selected"
          icon="lucide-check"
          size="xs"
          class="tw-ml-auto"
        />
      </div>
    </template>
  </VcSelect>
</template>

<script setup lang="ts">
const statuses = [
  { id: "new", title: "New", description: "Just created", color: "var(--info-500)" },
  { id: "processing", title: "Processing", description: "Being prepared", color: "var(--warning-500)" },
  { id: "shipped", title: "Shipped", description: "On the way", color: "var(--success-500)" },
  { id: "cancelled", title: "Cancelled", description: "Order cancelled", color: "var(--danger-500)" },
];
</script>
```

> **Required:** when using `#option`, you must call `toggleOption(opt)` on click yourself — the component does not add a click handler automatically.

---

## Custom Rendering of Selected Values

The `#selected-item` slot lets you change how chips look in multiple mode:

```vue
<VcSelect v-model="assignees" :options="users" multiple label="Исполнители">
  <template #selected-item="{ opt, index, removeAtIndex }">
    <div class="tw-flex tw-items-center tw-gap-1 tw-bg-[var(--primary-50)] tw-rounded tw-px-2 tw-py-0.5">
      <img :src="opt.avatar" class="tw-w-4 tw-h-4 tw-rounded-full" />
      <span class="tw-text-xs">{{ opt.name }}</span>
      <button @click="removeAtIndex(index)" class="tw-ml-1 tw-text-[var(--neutrals-400)]">×</button>
    </div>
  </template>
</VcSelect>
```

---

## Form Validation

VcSelect **does not contain built-in validation**. For validation, use the `Field` wrapper from vee-validate, which manages the error state and passes it to VcSelect through the `error` and `error-message` props.

### Basic Pattern — Field + VcSelect

```vue
<template>
  <Field
    v-slot="{ errorMessage, handleChange, errors }"
    :model-value="offer.productType"
    name="productType"
    rules="required"
    :label="$t('OFFERS.FIELDS.PRODUCT_TYPE.TITLE')"
  >
    <VcSelect
      v-model="offer.productType"
      :label="$t('OFFERS.FIELDS.PRODUCT_TYPE.TITLE')"
      required
      :placeholder="$t('OFFERS.FIELDS.PRODUCT_TYPE.PLACEHOLDER')"
      :options="productTypeOptions"
      option-value="value"
      option-label="label"
      :error="!!errors.length"
      :error-message="errorMessage"
      @update:model-value="handleChange"
    />
  </Field>
</template>

<script setup lang="ts">
import { Field, useForm } from "vee-validate";
import { VcSelect } from "@vc-shell/framework";

const { meta, errorBag } = useForm({ validateOnMount: false });
</script>
```

**How it works:**

1. `Field` wraps VcSelect and tracks the value through `:model-value`
2. `rules="required"` — the validation rule (you can combine them: `rules="required|min:1"`)
3. `v-slot="{ errorMessage, handleChange, errors }"` — destructuring the validation state
4. `@update:model-value="handleChange"` — **required!** Notifies Field about value changes
5. `:error="!!errors.length"` — switches VcSelect to the error (red) state
6. `:error-message="errorMessage"` — error text displayed below the field

> **Important:** `handleChange` must be called manually via `@update:model-value`. Without it, Field will not be aware of the change and validation will not trigger.

### Async Select with Validation

For an async select with search, the pattern is the same, but `handleChange` is called alongside business logic:

```vue
<Field v-slot="{ errorMessage, handleChange, errors }" :model-value="offer.productId" name="product" rules="required">
  <VcSelect
    v-model="offer.productId"
    label="Product"
    required
    searchable
    :options="fetchProducts"
    option-value="id"
    option-label="name"
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="
      (e) => {
        handleChange(e);
        loadProductDetails();
      }
    "
  />
</Field>
```

### Server-Side Validation

For errors coming from the server (e.g., duplicate SKU), use `setFieldError` from `useForm`:

```vue
<script setup lang="ts">
import { useForm, Field } from "vee-validate";

const { setFieldError } = useForm({ validateOnMount: false });

async function save() {
  try {
    await api.saveOffer(offer);
  } catch (e) {
    // Show a server error on a specific field
    setFieldError("productType", "This product type is not available");
  }
}
</script>
```

### Complete Form with Multiple Fields

```vue
<template>
  <VcBlade title="Offer Details">
    <VcForm>
      <Field
        v-slot="{ errorMessage, handleChange, errors }"
        :model-value="offer.productId"
        name="product"
        rules="required"
      >
        <VcSelect
          v-model="offer.productId"
          label="Product"
          required
          searchable
          :options="fetchProducts"
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>

      <Field
        v-slot="{ errorMessage, handleChange, errors }"
        :model-value="offer.name"
        name="name"
        rules="required"
      >
        <VcInput
          v-model="offer.name"
          label="Name"
          required
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>

      <Field
        v-slot="{ errorMessage, handleChange, errors }"
        :model-value="offer.categoryId"
        name="category"
        rules="required"
      >
        <VcSelect
          v-model="offer.categoryId"
          label="Category"
          required
          :options="categories"
          :error="!!errors.length"
          :error-message="errorMessage"
          @update:model-value="handleChange"
        />
      </Field>
    </VcForm>
  </VcBlade>
</template>
```

> **Tip:** `useForm()` collects all `Field` instances within the component. Check `meta.valid` before saving.

---

## Replacing the Trigger (Custom Control)

The `#control` slot lets you completely replace the trigger button:

```vue
<VcSelect v-model="view" :options="viewOptions" label="Вид отображения">
  <template #control="{ toggleHandler, isOpened }">
    <VcButton
      variant="outline"
      :icon="isOpened ? 'lucide-chevron-up' : 'lucide-chevron-down'"
      @click="toggleHandler"
    >
      {{ currentViewLabel }}
    </VcButton>
  </template>
</VcSelect>
```

---

## Recipes

### Linked Selects (Cascading Selection)

A typical pattern: selecting a category loads subcategories:

```vue
<template>
  <VcSelect
    v-model="categoryId"
    :options="categories"
    label="Категория"
    @update:model-value="subcategoryId = undefined"
  />

  <VcSelect
    v-model="subcategoryId"
    :options="loadSubcategories"
    label="Подкатегория"
    :disabled="!categoryId"
    :key="categoryId"
    searchable
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const categoryId = ref<string>();
const subcategoryId = ref<string>();

const categories = [
  { id: "electronics", title: "Electronics" },
  { id: "clothing", title: "Clothing" },
];

// Функция замыкается на текущий categoryId
const loadSubcategories = async (keyword?: string, skip?: number) => {
  const response = await api.searchSubcategories({
    parentId: categoryId.value,
    keyword,
    skip,
    take: 20,
  });
  return { results: response.results, totalCount: response.totalCount };
};
</script>
```

> **Key point:** `:key="categoryId"` on the second VcSelect forces the component to be fully recreated when the category changes, resetting the internal options cache.

### Select Inside a Blade Form

A typical pattern in vc-shell — a select on a details page:

```vue
<template>
  <VcBlade title="Product Details">
    <VcForm>
      <VcRow>
        <VcCol :size="6">
          <VcInput
            v-model="product.name"
            label="Name"
            required
          />
        </VcCol>
        <VcCol :size="6">
          <VcSelect
            v-model="product.categoryId"
            :options="loadCategories"
            label="Category"
            searchable
            required
          />
        </VcCol>
      </VcRow>
      <VcRow>
        <VcCol>
          <VcSelect
            v-model="product.tags"
            :options="availableTags"
            label="Tags"
            multiple
            clearable
          />
        </VcCol>
      </VcRow>
    </VcForm>
  </VcBlade>
</template>
```

### Empty State with a Custom Message

```vue
<VcSelect v-model="value" :options="filteredOptions" label="Product" searchable>
  <template #no-options>
    <div class="tw-p-4 tw-text-center tw-text-[var(--neutrals-400)]">
      <VcIcon icon="lucide-search-x" size="l" class="tw-mb-2" />
      <p>No products found. Try a different search term.</p>
    </div>
  </template>
</VcSelect>
```

---

## Common Mistakes

### Problem: v-model contains an object instead of an ID

```vue
<!-- ❌ Неправильно — emitValue: true (по умолчанию), но model ожидает объект -->
<VcSelect v-model="selectedUser" :options="users" />
<!-- selectedUser будет содержать "user-1", а не { id: "user-1", name: "John" } -->

<!-- ✅ Правильно — если нужен полный объект: -->
<VcSelect v-model="selectedUser" :options="users" :emit-value="false" />
```

### Problem: Label is not displayed for the initial value

If `v-model` contains an ID but the list has not been loaded yet — for static arrays, `mapOptions: true` (default) will resolve the label automatically. For async functions, the component will call your function with `ids: [currentValue]`.

```vue
<!-- ❌ Проблема: async функция не обрабатывает ids -->
const loadUsers = async (keyword?: string, skip?: number) => { return api.searchUsers({ keyword, skip, take: 20 }); };

<!-- ✅ Решение: обработайте ids параметр -->
const loadUsers = async (keyword?: string, skip?: number, ids?: string[]) => { if (ids?.length) { const users = await api.getUsersByIds(ids); return { results: users, totalCount: users.length }; } return api.searchUsers({ keyword, skip, take: 20 }); };
```

### Problem: Unnecessary requests with cascading selects

Don't forget `:key` with cascading selects, otherwise the second select will retain the cache of old options.

---

## Props

| Prop              | Type                                             | Default     | Description                                                 |
| ----------------- | ------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `modelValue`      | `T \| T[] \| string \| string[] \| null`         | `undefined` | Value (v-model). Type depends on `emitValue` and `multiple` |
| `options`         | `T[] \| ((keyword?, skip?, ids?) => Promise<P>)` | `[]`        | Static array or async function                              |
| `optionValue`     | `string \| ((opt: T) => string)`                 | `"id"`      | Object property used as the value                           |
| `optionLabel`     | `string \| ((opt: T) => string)`                 | `"title"`   | Object property used for display                            |
| `multiple`        | `boolean`                                        | `false`     | Multiple selection                                          |
| `searchable`      | `boolean`                                        | `false`     | Search through options                                      |
| `emitValue`       | `boolean`                                        | `true`      | `true` = emit the value, `false` = emit the full object     |
| `clearable`       | `boolean`                                        | `true`      | Clear button                                                |
| `debounce`        | `number \| string`                               | `500`       | Search delay (ms)                                           |
| `mapOptions`      | `boolean`                                        | `true`      | Automatically look up label by value in the array           |
| `placement`       | `string`                                         | `"bottom"`  | Dropdown position (Floating UI placements)                  |
| `size`            | `"default" \| "small"`                           | `"default"` | Field size                                                  |
| `outline`         | `boolean`                                        | `true`      | Show border outline                                         |
| `loading`         | `boolean`                                        | `false`     | Loading state                                               |
| `label`           | `string`                                         | —           | Label text                                                  |
| `placeholder`     | `string`                                         | —           | Placeholder                                                 |
| `required`        | `boolean`                                        | `false`     | Required field (asterisk)                                   |
| `disabled`        | `boolean`                                        | `false`     | Disable the component                                       |
| `error`           | `boolean`                                        | `false`     | Error state                                                 |
| `errorMessage`    | `string`                                         | —           | Error text                                                  |
| `hint`            | `string`                                         | —           | Hint text below the field                                   |
| `tooltip`         | `string`                                         | —           | Tooltip next to the label                                   |
| `prefix`          | `string`                                         | —           | Prefix inside the field                                     |
| `suffix`          | `string`                                         | —           | Suffix inside the field                                     |
| `multilanguage`   | `boolean`                                        | `false`     | Multilanguage icon on the label                             |
| `currentLanguage` | `string`                                         | —           | Current language                                            |
| `name`            | `string`                                         | `"Field"`   | Field name for validation                                   |

## Events

| Event               | Payload                                  | Description            |
| ------------------- | ---------------------------------------- | ---------------------- |
| `update:modelValue` | `T \| T[] \| string \| string[] \| null` | Selected value changed |
| `search`            | `string`                                 | Search query changed   |
| `close`             | —                                        | Dropdown closed        |

## Slots

| Slot                             | Scope                                     | Description                                                              |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `option`                         | `{ index, opt, selected, toggleOption }`  | Custom option rendering. **You must call `toggleOption(opt)` on click.** |
| `selected-item`                  | `{ index, opt, selected, removeAtIndex }` | Custom rendering of selected chips (multiple)                            |
| `control`                        | `{ toggleHandler, isOpened }`             | Full trigger replacement                                                 |
| `prepend` / `append`             | —                                         | Content outside the field                                                |
| `prepend-inner` / `append-inner` | —                                         | Content inside the field                                                 |
| `no-options`                     | —                                         | Shown when there are no options                                          |
| `error` / `hint`                 | —                                         | Custom rendering of error/hint                                           |

## CSS Variables

```css
:root {
  --select-height: 36px;
  --select-height-small: 28px;
  --select-border-radius: 4px;
  --select-border-color: var(--neutrals-300);
  --select-border-color-focus: var(--primary-100);
  --select-border-color-error: var(--danger-500);
  --select-text-color: var(--neutrals-800);
  --select-padding: 10px;
  --select-background-color: var(--additional-50);
  --select-background-color-disabled: var(--neutrals-200);
  --select-placeholder-color: var(--neutrals-400);
  --select-chevron-color: var(--primary-500);
  --select-clear-color: var(--primary-500);
  --select-dropdown-bg: var(--additional-50);
  --select-option-background-color-hover: var(--accent-100);
  --select-option-background-color-selected: var(--accent-200);
}
```

## Accessibility

- **Role:** the trigger has `role="combobox"` with `aria-expanded` and `aria-haspopup="listbox"`
- **Listbox:** the dropdown has `role="listbox"` linked via `aria-controls`
- **Label:** connected via `aria-labelledby`; hint/error connected via `aria-describedby`
- **Keyboard:** Arrow Down/Up for navigation, Enter to select, Escape to close, Tab to move focus
- **Multiple:** chip remove buttons are focusable
- **Required:** `aria-required` is passed for screen readers

## Related Components

- [VcMultivalue](../vc-multivalue/) — tags with free-form input (when options are created on the fly)
- [VcInputDropdown](../vc-input-dropdown/) — text input + dropdown (number + unit of measurement)
- [VcInput](../vc-input/) — simple text field
- [VcDatePicker](../vc-date-picker/) — date selection
- [VcField](../vc-field/) — wrapper with label/error/hint (read-only display)

## Skeleton / Loading State

When placed inside a `VcBlade` with `loading=true`, the component automatically renders a skeleton placeholder matching its visual footprint — a label block (when the `label` prop is set) and an input-shaped block. No additional props or configuration needed.

This behavior is powered by `BladeLoadingKey` via Vue's provide/inject. The component injects the loading state from the nearest `VcBlade` ancestor.
