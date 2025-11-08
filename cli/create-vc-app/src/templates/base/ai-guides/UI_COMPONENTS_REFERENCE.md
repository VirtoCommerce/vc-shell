# VC-Shell UI Components Reference

> Comprehensive guide to all UI components available in VC-Shell framework

## Table of Contents

- [VC-Shell UI Components Reference](#vc-shell-ui-components-reference)
  - [Table of Contents](#table-of-contents)
  - [Form Components](#form-components)
    - [VcInput](#vcinput)
    - [VcSelect](#vcselect)
    - [VcEditor](#vceditor)
    - [VcGallery](#vcgallery)
    - [VcInputCurrency](#vcinputcurrency)
    - [VcMultivalue](#vcmultivalue)
    - [VcSwitch](#vcswitch)
    - [VcCheckbox](#vccheckbox)
    - [VcRadioButton](#vcradiobutton)
    - [VcTextarea](#vctextarea)
    - [VcFileUpload](#vcfileupload)
    - [VcForm](#vcform)
  - [Layout Components](#layout-components)
    - [VcCard](#vccard)
    - [VcBlade](#vcblade)
  - [Data Display Components](#data-display-components)
    - [VcTable](#vctable)
    - [VcWidget](#vcwidget)
  - [Navigation \& Actions](#navigation--actions)
    - [VcButton](#vcbutton)
  - [Feedback Components](#feedback-components)
    - [VcLabel](#vclabel)
    - [VcHint](#vchint)
    - [VcStatus](#vcstatus)
    - [VcBadge](#vcbadge)
    - [VcTooltip](#vctooltip)
    - [VcLoading](#vcloading)
    - [VcIcon](#vcicon)
    - [VcPopup](#vcpopup)
    - [VcContainer](#vccontainer)
  - [Component Organization Patterns](#component-organization-patterns)
    - [Grouping with VcCard](#grouping-with-vccard)
    - [Nested Data with VcTable](#nested-data-with-vctable)
  - [Validation Integration](#validation-integration)
  - [Theme Customization](#theme-customization)
  - [Common Pitfalls](#common-pitfalls)
  - [Complete Example](#complete-example)

---

## Form Components

### VcInput

Text input component for various data types.

**Props:**
- `modelValue` - Input value (string | number | Date)
- `type` - Input type: `text`, `password`, `email`, `tel`, `url`, `time`, `color`, `number`, `integer`, `date`, `datetime-local`
- `label` - Field label
- `placeholder` - Placeholder text
- `required` - Mark as required
- `disabled` - Disable input
- `error` - Show error state
- `errorMessage` - Error message text
- `hint` - Helper text
- `clearable` - Show clear button
- `prefix` / `suffix` - Text prefix/suffix
- `maxlength` - Maximum character length
- `multilanguage` - Show language indicator
- `currentLanguage` - Current language code
- `size` - Size variant: `default` | `small`

**Usage:**

```vue
<VcInput
  v-model="user.email"
  type="email"
  label="Email Address"
  placeholder="Enter email"
  required
  :error="!!errors.email"
  :error-message="errors.email"
/>
```

---

### VcSelect

Dropdown select component with search and async loading support.

**Props:**
- `modelValue` - Selected value(s)
- `options` - Array of options or async function
- `optionLabel` - Property name for label (default: `title`)
- `optionValue` - Property name for value (default: `id`)
- `multiple` - Allow multiple selection
- `searchable` - Enable search
- `emitValue` - Emit value instead of object
- `mapOptions` - Map selected values to options
- `clearable` - Show clear button
- `disabled` - Disable select
- `label` - Field label
- `placeholder` - Placeholder text
- `required` - Mark as required
- `error` / `errorMessage` - Error state
- `size` - Size variant: `default` | `small`

**Usage:**

```vue
<VcSelect
  v-model="product.categoryId"
  :options="categories"
  option-label="name"
  option-value="id"
  label="Category"
  required
  searchable
  emit-value
/>
```

**Async Options:**

```typescript
const loadOptions = async (keyword?: string, skip?: number, ids?: string[]) => {
  const response = await api.search({ keyword, skip, ids });
  return {
    results: response.items,
    totalCount: response.totalCount
  };
};
```

---

### VcEditor

Rich text editor with Markdown/HTML support.

**Props:**
- `modelValue` - Content (string)
- `label` - Field label
- `placeholder` - Placeholder text
- `required` - Mark as required
- `disabled` - Disable editor
- `maxlength` - Maximum character length
- `toolbar` - Array of toolbar items
- `extensions` - Custom TipTap extensions

**Toolbar Items:**
`bold`, `italic`, `underline`, `strikethrough`, `heading1`, `heading2`, `heading3`, `bulletList`, `orderedList`, `blockquote`, `link`, `image`, `table`, `fontSize`, `separator`

**Usage:**

```vue
<VcEditor
  v-model="product.description"
  label="Description"
  :toolbar="['bold', 'italic', 'bulletList', 'link']"
  :maxlength="5000"
/>
```

---

### VcGallery

Image gallery with drag-and-drop, upload, and reordering.

**Props:**
- `images` - Array of image objects
- `label` - Field label
- `required` - Mark as required
- `disabled` - Disable gallery
- `multiple` - Allow multiple upload
- `variant` - Variant: `gallery` | `file-upload`
- `itemActions` - Enable actions: `{ preview, edit, remove }`

**Events:**
- `@upload` - Handle file upload
- `@sort` - Handle reordering
- `@edit` - Handle edit action
- `@remove` - Handle remove action

**Usage:**

```vue
<VcGallery
  :images="product.images"
  label="Product Images"
  multiple
  @upload="handleUpload"
  @sort="handleSort"
  @remove="handleRemove"
/>
```

---

### VcInputCurrency

Currency input with formatting and currency selection.

**Props:**
- `modelValue` - Numeric value
- `option` - Selected currency code
- `options` - Available currencies
- `label` - Field label
- `precision` - Decimal places (0-15)
- `currencyDisplay` - Display mode

**Events:**
- `@update:modelValue` - Value changed
- `@update:option` - Currency changed

**Usage:**

```vue
<VcInputCurrency
  v-model="product.price"
  v-model:option="product.currency"
  :options="currencies"
  label="Price"
  :precision="2"
/>
```

---

### VcMultivalue

Multi-value input for tags, keywords, or lists.

**Props:**
- `modelValue` - Array of values
- `type` - Input type: `text`, `number`, `integer`, `color`
- `multivalue` - Enable dictionary mode
- `options` - Dictionary options
- `optionLabel` - Property for label
- `optionValue` - Property for value
- `label` - Field label
- `placeholder` - Placeholder text

**Usage:**

```vue
<VcMultivalue
  v-model="product.tags"
  label="Tags"
  placeholder="Enter tag"
/>

<VcMultivalue
  v-model="product.categories"
  :options="categoryDictionary"
  option-label="name"
  option-value="id"
  multivalue
  label="Categories"
/>
```

---

### VcSwitch

Toggle switch for boolean values.

**Props:**
- `modelValue` - Boolean value
- `label` - Field label
- `tooltip` - Helper tooltip
- `required` - Mark as required
- `disabled` - Disable switch
- `trueValue` / `falseValue` - Custom values (default: true/false)

**Usage:**

```vue
<VcSwitch
  v-model="product.isActive"
  label="Active"
  tooltip="Enable or disable product"
/>
```

---

### VcCheckbox

Checkbox component for boolean or array selections.

**Props:**
- `modelValue` - Boolean value or array of values
- `value` - Value for array mode
- `label` - Field label
- `tooltip` - Helper tooltip
- `required` - Mark as required
- `disabled` - Disable checkbox
- `indeterminate` - Show indeterminate state
- `trueValue` / `falseValue` - Custom values (default: true/false)
- `size` - Size variant: `default` | `small`
- `errorMessage` - Error message text

**Usage:**

```vue
<!-- Single checkbox -->
<VcCheckbox
  v-model="product.featured"
  label="Featured Product"
  tooltip="Show on homepage"
/>

<!-- Multiple checkboxes -->
<VcCheckbox
  v-model="selectedCategories"
  :value="category.id"
  v-for="category in categories"
  :key="category.id"
>
  {{ category.name }}
</VcCheckbox>
```

---

### VcRadioButton

Radio button for single selection from multiple options.

**Props:**
- `modelValue` - Selected value
- `value` - Value of this option
- `label` - Option label
- `name` - Radio group name
- `disabled` - Disable radio button
- `binary` - Treat as boolean
- `error` - Error state
- `errorMessage` - Error message text

**Usage:**

```vue
<VcRadioButton
  v-model="product.availability"
  value="in_stock"
  label="In Stock"
  name="availability"
/>
<VcRadioButton
  v-model="product.availability"
  value="out_of_stock"
  label="Out of Stock"
  name="availability"
/>
```

---

### VcTextarea

Multi-line text input component.

**Props:**
- `modelValue` - Text value
- `label` - Field label
- `placeholder` - Placeholder text
- `required` - Mark as required
- `disabled` - Disable textarea
- `maxlength` - Maximum character length
- `error` - Error state
- `errorMessage` - Error message text
- `multilanguage` - Show language indicator
- `currentLanguage` - Current language code
- `tooltip` - Helper tooltip

**Usage:**

```vue
<VcTextarea
  v-model="product.shortDescription"
  label="Short Description"
  placeholder="Enter brief description"
  :maxlength="500"
  required
/>
```

---

### VcFileUpload

File upload component with drag-and-drop support.

**Props:**
- `variant` - Variant: `gallery` | `file-upload`
- `loading` - Show loading state
- `accept` - Accepted file types (e.g., `.jpg, .png`)
- `multiple` - Allow multiple file selection
- `icon` - Upload icon
- `customText` - Custom text: `{ dragHere, browse }`
- `errorMessage` - Error message text

**Events:**
- `@upload` - Emitted when files are uploaded

**Usage:**

```vue
<VcFileUpload
  :accept="'.pdf, .doc, .docx'"
  multiple
  @upload="handleFileUpload"
/>
```

---

### VcForm

Form wrapper with submit handling.

**Events:**
- `@submit` - Form submitted

**Usage:**

```vue
<VcForm @submit="handleSubmit">
  <VcInput v-model="form.name" label="Name" />
  <VcButton type="submit">Save</VcButton>
</VcForm>
```

---

## Layout Components

### VcCard

Card container for grouping content into sections.

**Props:**
- `header` - Header text
- `icon` - Header icon
- `isCollapsable` - Enable collapse
- `isCollapsed` - Initial collapsed state
- `fill` - Fill available space
- `variant` - Visual variant: `default`, `success`, `danger`

**Slots:**
- `default` - Card content
- `header` - Custom header
- `actions` - Header actions

**Events:**
- `@header:click` - Header clicked
- `@state:collapsed` - Collapse state changed

**Usage:**

```vue
<VcCard header="Product Information" icon="material-info" is-collapsable>
  <VcInput v-model="product.name" label="Name" />
  <VcInput v-model="product.sku" label="SKU" />
</VcCard>

<VcCard header="Pricing" variant="success">
  <template #actions>
    <VcButton text icon="material-edit" @click="editPricing" />
  </template>
  <VcInputCurrency v-model="product.price" label="Price" />
</VcCard>
```

---

### VcBlade

Main container for blade pages.

**Props:**
- `title` - Blade title
- `subtitle` - Blade subtitle
- `icon` - Title icon
- `width` - Blade width (px or %)
- `expanded` - Expanded state
- `closable` - Show close button
- `toolbarItems` - Toolbar buttons array
- `modified` - Show unsaved changes indicator

**Events:**
- `@close` - Blade closed
- `@expand` / `@collapse` - Blade resized

**Usage:**

```vue
<VcBlade
  :title="product.name || 'New Product'"
  subtitle="Product Details"
  icon="material-shopping_cart"
  :toolbar-items="toolbarItems"
  :modified="isModified"
  width="50%"
  @close="handleClose"
>
  <template #actions>
    <VcButton @click="handleSave">Save</VcButton>
  </template>

  <!-- Blade content -->
  <VcCard header="General">
    <VcInput v-model="product.name" label="Name" />
  </VcCard>
</VcBlade>
```

---

## Data Display Components

### VcTable

Advanced data table with sorting, filtering, selection, and actions.

**Props:**
- `items` - Data array
- `columns` - Column definitions
- `stateKey` - Unique key for state persistence
- `multiselect` - Enable row selection
- `header` / `footer` - Show header/footer
- `searchValue` - Search query
- `searchPlaceholder` - Search placeholder
- `totalCount` / `pages` - Pagination
- `currentPage` - Current page
- `sort` - Sort state (e.g., `"name:desc"`)
- `resizableColumns` - Allow column resize
- `reorderableColumns` - Allow column reorder
- `reorderableRows` - Allow row reorder
- `editing` - Enable inline editing
- `itemActionBuilder` - Row actions function

**Column Definition:**

```typescript
interface ITableColumns {
  id: string;
  title: string;
  width?: number;
  sortable?: boolean;
  alwaysVisible?: boolean;
  type?: 'image' | 'link' | 'status' | 'date' | 'dateTime' | 'number' | 'money';
}
```

**Events:**
- `@itemClick` - Row clicked
- `@headerClick` - Column header clicked
- `@selectionChanged` - Selection changed
- `@paginationClick` - Page changed
- `@search:change` - Search changed
- `@row:reorder` - Rows reordered

**Usage:**

```vue
<VcTable
  :items="products"
  :columns="columns"
  :total-count="totalCount"
  :pages="pages"
  :current-page="currentPage"
  :sort="sort"
  state-key="products-grid"
  multiselect
  @itemClick="openDetails"
  @headerClick="handleSort"
  @selectionChanged="handleSelection"
>
  <!-- Custom cell templates -->
  <template #item_name="{ item }">
    <div class="tw-font-bold">{{ item.name }}</div>
  </template>

  <template #item_status="{ item }">
    <VcStatus :variant="item.status" />
  </template>
</VcTable>
```

**Columns Array:**

```typescript
const columns: ITableColumns[] = [
  { id: 'name', title: 'Name', width: 200, sortable: true },
  { id: 'sku', title: 'SKU', width: 150, sortable: true },
  { id: 'price', title: 'Price', width: 100, type: 'money' },
  { id: 'status', title: 'Status', width: 100, type: 'status' },
  { id: 'createdDate', title: 'Created', width: 150, type: 'dateTime' },
];
```

---

### VcWidget

Widget component for blade sidebars (PROPS ONLY, NO CUSTOM HTML).

**Props:**
- `icon` - Widget icon
- `title` - Widget title
- `value` - Counter value (shown as badge)
- `disabled` - Disable widget
- `isExpanded` - Expanded state
- `horizontal` - Horizontal layout

**Events:**
- `@click` - Widget clicked

**IMPORTANT:** VcWidget accepts ONLY props. Do NOT add custom HTML content inside.

**Usage:**

```vue
<VcWidget
  :value="stats.count"
  :title="$t('WIDGETS.STATS')"
  icon="material-analytics"
  @click="openStatsBlade"
/>
```

---

## Navigation & Actions

### VcButton

Button component with variants and sizes.

**Props:**
- `variant` - Style variant: `primary` | `secondary`
- `size` - Button size: `xs` | `sm` | `base`
- `icon` - Icon name
- `iconSize` - Icon size
- `disabled` - Disable button
- `text` - Text-only style (no background)
- `selected` - Selected state

**Events:**
- `@click` - Button clicked

**Usage:**

```vue
<VcButton variant="primary" @click="save">Save</VcButton>
<VcButton variant="secondary" icon="material-add" @click="add">Add Item</VcButton>
<VcButton text icon="material-edit" @click="edit" />
```

---

## Feedback Components

### VcLabel

Label component with required indicator and tooltip.

**Props:**
- `required` - Show required asterisk
- `multilanguage` - Show language indicator
- `currentLanguage` - Current language
- `error` - Error state styling

**Slots:**
- `default` - Label text
- `tooltip` - Tooltip content

**Usage:**

```vue
<VcLabel required>
  <span>Product Name</span>
  <template #tooltip>Enter unique product name</template>
</VcLabel>
```

---

### VcHint

Helper text component.

**Usage:**

```vue
<VcHint>This field is optional</VcHint>
```

---

### VcStatus

Status badge component.

**Props:**
- `variant` - Status variant (auto-styled based on value)

**Usage:**

```vue
<VcStatus :variant="product.status" />
```

---

### VcBadge

Badge component for notifications and counts.

**Props:**
- `content` - Badge content (number or text)
- `variant` - Visual variant: `primary` | `success` | `warning` | `danger` | `info` | `secondary`
- `size` - Size: `s` | `m`
- `isDot` - Show as dot indicator
- `active` - Active state styling
- `disabled` - Disable badge
- `clickable` - Enable click interaction
- `customPosition` - Use custom positioning
- `top` / `right` - Custom position values

**Events:**
- `@click` - Badge clicked (if clickable)

**Usage:**

```vue
<VcBadge :content="5" variant="danger">
  <VcIcon icon="material-notifications" />
</VcBadge>

<!-- Dot indicator -->
<VcBadge isDot variant="success">
  <VcIcon icon="material-person" />
</VcBadge>
```

---

### VcTooltip

Tooltip component for contextual information.

**Props:**
- `placement` - Tooltip position: `top` | `right` | `bottom` | `left` | `top-start` | `top-end` | `bottom-start` | `bottom-end`
- `offset` - Position offset: `{ crossAxis, mainAxis }`
- `delay` - Show delay in ms

**Slots:**
- `default` - Trigger element
- `tooltip` - Tooltip content

**Usage:**

```vue
<VcTooltip placement="top">
  <VcButton icon="material-info" text />
  <template #tooltip>
    This is helpful information
  </template>
</VcTooltip>
```

---

### VcLoading

Loading overlay indicator.

**Props:**
- `active` - Show/hide loading overlay

**Usage:**

```vue
<div v-loading="loading" class="content">
  <!-- Content -->
</div>

<!-- Or as component -->
<VcLoading :active="loading" />
```

---

### VcIcon

Icon component with multiple icon library support.

**Props:**
- `icon` - Icon identifier (string or component)
  - `"material-*"` - Material icons (e.g., `"material-home"`)
  - `"fas fa-*"` - Font Awesome (e.g., `"fas fa-user"`)
  - `"bi-*"` - Bootstrap icons (e.g., `"bi-house"`)
  - `"lucide-*"` - Lucide icons (e.g., `"lucide-home"`)
  - `"svg:path"` - SVG icons
- `size` - Icon size: `xs` | `s` | `m` | `l` | `xl` | `xxl` | `xxxl`
- `variant` - Color variant: `warning` | `danger` | `success`
- `useContainer` - Wrap in fixed-size container
- `customSize` - Custom size in pixels

**Usage:**

```vue
<VcIcon icon="material-shopping_cart" size="xl" />
<VcIcon icon="fas fa-check" variant="success" />
<VcIcon icon="bi-bell" :custom-size="24" />
```

---

### VcPopup

Modal popup/dialog component.

**Props:**
- `title` - Popup title
- `variant` - Visual variant: `default` | `success` | `warning` | `danger` | `info`
- `icon` - Header icon (auto-selected based on variant)
- `closable` - Show close button
- `modalWidth` - Custom width class
- `isFullscreen` - Fullscreen mode

**Slots:**
- `header` - Custom header content
- `content` - Main content
- `footer` - Footer actions

**Events:**
- `@close` - Popup closed

**Usage:**

```vue
<VcPopup
  title="Confirm Action"
  variant="warning"
  closable
  @close="handleClose"
>
  <template #content>
    Are you sure you want to proceed?
  </template>
  <template #footer>
    <VcButton variant="secondary" @click="handleClose">Cancel</VcButton>
    <VcButton variant="primary" @click="handleConfirm">Confirm</VcButton>
  </template>
</VcPopup>
```

---

### VcContainer

Scrollable container with pull-to-refresh support.

**Props:**
- `shadow` - Show shadow on scroll
- `noPadding` - Remove default padding
- `usePtr` - Enable pull-to-refresh (mobile)

**Events:**
- `@scroll:ptr` - Pull-to-refresh triggered
- `@scroll` - Scroll event

**Usage:**

```vue
<VcContainer
  shadow
  use-ptr
  @scroll:ptr="handleRefresh"
>
  <!-- Content -->
</VcContainer>
```

---

## Component Organization Patterns

### Grouping with VcCard

Use `VcCard` to organize form fields into logical sections:

```vue
<VcBlade title="Product Details">
  <VcCard header="General Information" icon="material-info">
    <VcInput v-model="product.name" label="Name" required />
    <VcInput v-model="product.sku" label="SKU" required />
    <VcEditor v-model="product.description" label="Description" />
  </VcCard>

  <VcCard header="Pricing" icon="material-attach_money">
    <VcInputCurrency v-model="product.price" label="Price" />
    <VcInputCurrency v-model="product.listPrice" label="List Price" />
  </VcCard>

  <VcCard header="Media" icon="material-image">
    <VcGallery :images="product.images" @upload="handleUpload" />
  </VcCard>
</VcBlade>
```

### Nested Data with VcTable

Display related data within details blades:

```vue
<VcCard header="Order Items">
  <VcTable
    :items="order.items"
    :columns="itemColumns"
    state-key="order-items"
  >
    <template #item_product="{ item }">
      {{ item.productName }}
    </template>
  </VcTable>
</VcCard>
```

---

## Validation Integration

Use VeeValidate for form validation:

```typescript
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  price: yup.number().min(0, 'Price must be positive').required()
});

const { errors, validate } = useForm({ validationSchema: schema });
const { value: name } = useField<string>('name');
const { value: email } = useField<string>('email');
```

```vue
<VcInput
  v-model="name"
  label="Name"
  required
  :error="!!errors.name"
  :error-message="errors.name"
/>
```

---

## Theme Customization

All components support CSS custom properties for theming:

```scss
:root {
  // Override component colors
  --input-border-color: #custom-color;
  --button-primary-background-color: #custom-primary;
  --table-row-bg-hover: #custom-hover;
}
```

Use the `useTheme` composable for dynamic theme management.

---

## Common Pitfalls

1. **VcWidget**: Never add custom HTML inside. Use only props.
2. **VcSelect with async**: Always return `{ results, totalCount }` from async function.
3. **VcTable state**: Always provide unique `stateKey` for state persistence.
4. **VcEditor maxlength**: Character limit applies to Markdown/HTML, not visual text.
5. **VcCard sections**: Use multiple `VcCard` components, NOT tabs (tabs don't exist).
6. **Computed fields**: Use Vue `computed()` for calculated values.
7. **Nested tables**: Use `VcTable` inside `VcCard` for related data.
8. **VcCheckbox arrays**: Use `value` prop for array mode, omit for boolean mode.
9. **VcRadioButton groups**: All options must share the same `name` prop.
10. **VcTextarea vs VcInput**: Use `VcTextarea` for multi-line, `VcInput` with `type="textarea"` is deprecated.
11. **VcIcon prefixes**: Always use correct prefix (`material-`, `fas fa-`, `bi-`, `lucide-`).
12. **VcPopup closing**: Handle close event to remove popup from DOM.
13. **VcFileUpload validation**: Validate file types and sizes in upload handler.
14. **VcTooltip placement**: Ensure tooltip doesn't overflow viewport, use `shift` middleware.
15. **VcContainer PTR**: Pull-to-refresh only works on mobile devices with `usePtr` prop.

---

## Complete Example

```vue
<template>
  <VcBlade
    :title="product.name || 'New Product'"
    :toolbar-items="toolbarItems"
    :modified="isModified"
    @close="handleClose"
  >
    <template #actions>
      <VcButton
        variant="primary"
        :disabled="loading"
        @click="handleSave"
      >
        Save
      </VcButton>
    </template>

    <VcCard header="General Information" icon="material-info" is-collapsable>
      <VcInput
        v-model="product.name"
        label="Product Name"
        required
        :error="!!errors.name"
        :error-message="errors.name"
      />
      <VcInput v-model="product.sku" label="SKU" required />
      <VcSelect
        v-model="product.categoryId"
        :options="categories"
        label="Category"
        searchable
        emit-value
      />
      <VcEditor
        v-model="product.description"
        label="Description"
        :maxlength="5000"
      />
    </VcCard>

    <VcCard header="Pricing" icon="material-attach_money">
      <VcInputCurrency
        v-model="product.price"
        v-model:option="product.currency"
        :options="currencies"
        label="Price"
        required
      />
      <VcSwitch
        v-model="product.taxIncluded"
        label="Tax Included"
      />
    </VcCard>

    <VcCard header="Images" icon="material-image">
      <VcGallery
        :images="product.images"
        multiple
        @upload="handleImageUpload"
        @sort="handleImageSort"
        @remove="handleImageRemove"
      />
    </VcCard>

    <VcCard header="Tags" icon="material-label">
      <VcMultivalue
        v-model="product.tags"
        label="Product Tags"
        placeholder="Enter tag"
      />
    </VcCard>

    <VcCard header="Availability" icon="material-store">
      <VcCheckbox
        v-model="product.isAvailable"
        label="Available for Purchase"
      />
      <VcRadioButton
        v-model="product.stockStatus"
        value="in_stock"
        label="In Stock"
        name="stock"
      />
      <VcRadioButton
        v-model="product.stockStatus"
        value="low_stock"
        label="Low Stock"
        name="stock"
      />
      <VcRadioButton
        v-model="product.stockStatus"
        value="out_of_stock"
        label="Out of Stock"
        name="stock"
      />
    </VcCard>

    <VcCard header="Additional Information" icon="material-description">
      <VcTextarea
        v-model="product.notes"
        label="Internal Notes"
        :maxlength="1000"
        placeholder="Enter notes for internal use"
      />
      <VcFileUpload
        multiple
        @upload="handleDocumentsUpload"
      />
    </VcCard>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required(),
  sku: yup.string().required(),
  price: yup.number().min(0).required(),
});

const { errors } = useForm({ validationSchema: schema });
const { value: product } = useField('product');

const isModified = computed(() => /* modification logic */);
const toolbarItems = computed(() => [/* toolbar config */]);

async function handleSave() {
  // Save logic
}

async function handleDocumentsUpload(files: FileList) {
  // Upload logic
}
</script>
```

