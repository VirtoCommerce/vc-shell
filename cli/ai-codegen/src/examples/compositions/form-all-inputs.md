# Form with All Input Components

Complete example showing all available form input components in VC-Shell.

## Overview

This example demonstrates how to use all form input components together in a single form, including validation with vee-validate.

## Complete Form Example

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="$t('FORM.TITLE')"
    :toolbar-items="bladeToolbar"
    width="70%"
    :modified="isModified"
    @close="$emit('close:blade')"
  >
    <VcContainer class="tw-p-4">
      <VcCard :header="$t('FORM.BASIC_INFORMATION')">
        <div class="tw-space-y-4 tw-p-4">
          <!-- VcInput: Text Input -->
          <Field
            v-slot="{ field, errorMessage, errors }"
            :label="$t('FORM.NAME')"
            :model-value="item.name"
            rules="required|min:3"
            name="name"
          >
            <VcInput
              v-bind="field"
              v-model="item.name"
              :label="$t('FORM.NAME')"
              :placeholder="$t('FORM.NAME_PLACEHOLDER')"
              required
              clearable
              :error="!!errors.length"
              :error-message="errorMessage"
            />
          </Field>

          <!-- VcInput: Email Input -->
          <Field
            v-slot="{ field, errorMessage, errors }"
            :label="$t('FORM.EMAIL')"
            :model-value="item.email"
            rules="required|email"
            name="email"
          >
            <VcInput
              v-bind="field"
              v-model="item.email"
              type="email"
              :label="$t('FORM.EMAIL')"
              :placeholder="$t('FORM.EMAIL_PLACEHOLDER')"
              required
              :error="!!errors.length"
              :error-message="errorMessage"
            />
          </Field>

          <!-- VcTextarea: Description -->
          <VcTextarea
            v-model="item.description"
            :label="$t('FORM.DESCRIPTION')"
            :placeholder="$t('FORM.DESCRIPTION_PLACEHOLDER')"
            :rows="4"
          />

          <!-- VcEditor: Rich Text Editor -->
          <VcEditor
            v-model="item.content"
            :label="$t('FORM.CONTENT')"
            :placeholder="$t('FORM.CONTENT_PLACEHOLDER')"
            assets-folder="items"
          />
        </div>
      </VcCard>

      <VcCard :header="$t('FORM.CATEGORIES_AND_TAGS')">
        <div class="tw-space-y-4 tw-p-4">
          <!-- VcSelect: Single Selection -->
          <Field
            v-slot="{ errorMessage, handleChange, errors }"
            :label="$t('FORM.CATEGORY')"
            :model-value="item.categoryId"
            rules="required"
            name="category"
          >
            <VcSelect
              v-model="item.categoryId"
              :label="$t('FORM.CATEGORY')"
              :placeholder="$t('FORM.CATEGORY_PLACEHOLDER')"
              required
              searchable
              :options="categories"
              option-value="id"
              option-label="name"
              :error="!!errors.length"
              :error-message="errorMessage"
              @update:model-value="handleChange"
            />
          </Field>

          <!-- VcMultivalue: Tags -->
          <VcMultivalue
            v-model="item.tags"
            :label="$t('FORM.TAGS')"
            :placeholder="$t('FORM.TAGS_PLACEHOLDER')"
            type="text"
          />

          <!-- VcMultivalue: Categories (with dropdown) -->
          <VcMultivalue
            v-model="item.additionalCategories"
            :label="$t('FORM.ADDITIONAL_CATEGORIES')"
            :placeholder="$t('FORM.SELECT_CATEGORIES')"
            :options="categories"
            option-value="id"
            option-label="name"
            multivalue
          />
        </div>
      </VcCard>

      <VcCard :header="$t('FORM.PRICING_AND_MEASUREMENTS')">
        <div class="tw-space-y-4 tw-p-4">
          <!-- VcInputCurrency: Price -->
          <VcInputCurrency
            v-model:model-value="item.price"
            v-model:option="item.currency"
            :label="$t('FORM.PRICE')"
            :placeholder="$t('FORM.PRICE_PLACEHOLDER')"
            :options="currencies"
            required
          />

          <!-- VcInputDropdown: Weight -->
          <VcInputDropdown
            v-model="item.weight"
            v-model:option="item.weightUnit"
            :label="$t('FORM.WEIGHT')"
            :placeholder="$t('FORM.WEIGHT_PLACEHOLDER')"
            :options="['g', 'kg', 'lb', 'oz']"
            input-type="number"
          />

          <!-- VcInputDropdown: Dimensions -->
          <div class="tw-grid tw-grid-cols-3 tw-gap-4">
            <VcInputDropdown
              v-model="item.length"
              v-model:option="item.lengthUnit"
              :label="$t('FORM.LENGTH')"
              :options="['mm', 'cm', 'm']"
              input-type="number"
            />
            <VcInputDropdown
              v-model="item.width"
              v-model:option="item.widthUnit"
              :label="$t('FORM.WIDTH')"
              :options="['mm', 'cm', 'm']"
              input-type="number"
            />
            <VcInputDropdown
              v-model="item.height"
              v-model:option="item.heightUnit"
              :label="$t('FORM.HEIGHT')"
              :options="['mm', 'cm', 'm']"
              input-type="number"
            />
          </div>
        </div>
      </VcCard>

      <VcCard :header="$t('FORM.STATUS_AND_OPTIONS')">
        <div class="tw-space-y-4 tw-p-4">
          <!-- VcCheckbox: Active State -->
          <VcCheckbox
            v-model="item.isActive"
            :label="$t('FORM.IS_ACTIVE')"
          />

          <!-- VcSwitch: Featured -->
          <VcSwitch
            v-model="item.isFeatured"
            :label="$t('FORM.IS_FEATURED')"
          />

          <!-- VcRadioButton: Availability -->
          <div class="tw-space-y-2">
            <VcLabel>{{ $t('FORM.AVAILABILITY') }}</VcLabel>
            <VcRadioButton
              v-model="item.availability"
              value="in-stock"
              :label="$t('FORM.IN_STOCK')"
            />
            <VcRadioButton
              v-model="item.availability"
              value="out-of-stock"
              :label="$t('FORM.OUT_OF_STOCK')"
            />
            <VcRadioButton
              v-model="item.availability"
              value="preorder"
              :label="$t('FORM.PREORDER')"
            />
          </div>

          <!-- VcRating: Quality Rating -->
          <VcRating
            v-model="item.qualityRating"
            :label="$t('FORM.QUALITY_RATING')"
            :max="5"
            variant="stars"
          />

          <!-- VcSlider: Priority (using input instead, as VcSlider is for carousels) -->
          <VcInput
            v-model="item.priority"
            type="number"
            :label="$t('FORM.PRIORITY')"
            :placeholder="$t('FORM.PRIORITY_PLACEHOLDER')"
          />
        </div>
      </VcCard>

      <VcCard :header="$t('FORM.MEDIA')">
        <div class="tw-space-y-4 tw-p-4">
          <!-- VcGallery: Image Gallery -->
          <VcGallery
            :images="item.images"
            :label="$t('FORM.IMAGES')"
            multiple
            @upload="handleImageUpload"
            @edit="handleImageEdit"
            @remove="handleImageRemove"
            @sort="handleImageSort"
          />

          <!-- VcFileUpload: Documents -->
          <VcFileUpload
            variant="file-upload"
            accept=".pdf, .doc, .docx"
            :multiple="true"
            @upload="handleDocumentUpload"
          />
          <VcHint>{{ $t('FORM.ACCEPTED_FORMATS') }}: PDF, DOC, DOCX</VcHint>

          <!-- VcVideo: Product Video -->
          <VcVideo
            v-if="item.videoUrl"
            :label="$t('FORM.PRODUCT_VIDEO')"
            :source="item.videoUrl"
          />
        </div>
      </VcCard>
    </VcContainer>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Field } from "vee-validate";
import {
  VcBlade,
  VcContainer,
  VcCard,
  VcInput,
  VcTextarea,
  VcEditor,
  VcSelect,
  VcMultivalue,
  VcInputCurrency,
  VcInputDropdown,
  VcCheckbox,
  VcSwitch,
  VcRadioButton,
  VcRating,
  VcGallery,
  VcFileUpload,
  VcVideo,
  VcLabel,
  VcHint,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Mock item data
const item = ref({
  name: "",
  email: "",
  description: "",
  content: "",
  categoryId: null,
  tags: [],
  additionalCategories: [],
  price: null,
  currency: "USD",
  weight: null,
  weightUnit: "kg",
  length: null,
  lengthUnit: "cm",
  width: null,
  widthUnit: "cm",
  height: null,
  heightUnit: "cm",
  isActive: true,
  isFeatured: false,
  availability: "in-stock",
  qualityRating: 5,
  priority: 1,
  images: [],
  videoUrl: null,
});

// Mock categories
const categories = ref([
  { id: "1", name: "Electronics" },
  { id: "2", name: "Clothing" },
  { id: "3", name: "Home & Garden" },
  { id: "4", name: "Books" },
]);

// Mock currencies
const currencies = ref([
  { title: "USD", value: "USD" },
  { title: "EUR", value: "EUR" },
  { title: "GBP", value: "GBP" },
]);

const loading = ref(false);
const isModified = ref(false);

const bladeToolbar = computed(() => [
  {
    id: "save",
    title: t("COMMON.SAVE"),
    icon: "material-save",
    async: true,
    clickHandler: async () => {
      // Save logic
    },
  },
]);

function handleImageUpload(files: FileList) {
  // Image upload logic
}

function handleImageEdit(image: any) {
  // Image edit logic
}

function handleImageRemove(image: any) {
  // Image remove logic
}

function handleImageSort(images: any[]) {
  item.value.images = images;
}

function handleDocumentUpload(files: FileList) {
  // Document upload logic
}
</script>
```

## Key Points

### Form Validation

- Use `Field` from `vee-validate` for validation
- Pass `errorMessage` and `errors` to input components
- Set `:error="!!errors.length"` for error state
- Use `:error-message="errorMessage"` for error text

### Component Usage

1. **VcInput** - Text, email, number, date inputs
2. **VcTextarea** - Multi-line text
3. **VcEditor** - Rich text with Markdown
4. **VcSelect** - Single dropdown selection
5. **VcMultivalue** - Tags and multi-select
6. **VcInputCurrency** - Money amounts with currency
7. **VcInputDropdown** - Input with unit selection
8. **VcCheckbox** - Boolean toggle with label
9. **VcSwitch** - Boolean toggle switch
10. **VcRadioButton** - Single choice from options
11. **VcRating** - Star ratings
12. **VcGallery** - Image upload and management
13. **VcFileUpload** - File attachments
14. **VcVideo** - Video embeds

### Best Practices

- Group related fields in `VcCard` sections
- Use `VcHint` for field instructions
- Use `VcLabel` for complex labels with tooltips
- Always use i18n for all text
- Track form modifications with `:modified` prop
- Show loading state during async operations

