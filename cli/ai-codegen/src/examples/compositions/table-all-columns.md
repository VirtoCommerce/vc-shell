# Table with All Column Types

Complete example showing all available column types and custom slots in VcTable.

## Overview

This example demonstrates how to use different column types and custom slot templates to display various data formats in a table.

## Complete Table Example

```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="$t('PRODUCTS.TITLE')"
    :toolbar-items="bladeToolbar"
    width="100%"
    expanded
    @close="$emit('close:blade')"
  >
    <VcTable
      :items="items"
      :columns="columns"
      :loading="loading"
      :total-count="totalCount"
      :pages="pages"
      :current-page="currentPage"
      :sort="sort"
      :search-value="searchValue"
      state-key="products-all-columns"
      multiselect
      :selected-item-id="selectedItemId"
      @item-click="onItemClick"
      @header-click="onHeaderClick"
      @pagination-click="onPaginationClick"
      @search:change="onSearchChange"
      @selection-changed="onSelectionChanged"
    >
      <!-- Mobile view template -->
      <template #mobile-item="{ item }">
        <div class="tw-p-4">
          <div class="tw-flex tw-items-start tw-gap-3">
            <VcImage
              :src="item.imageUrl"
              size="s"
              bordered
              clickable
              @click="onItemClick(item)"
            />
            <div class="tw-flex-1">
              <div class="tw-font-medium tw-mb-1">{{ item.name }}</div>
              <div class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mb-2">
                {{ item.sku }}
              </div>
              <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <VcBadge :content="item.stock" variant="primary" />
                <VcStatus :variant="getStatusVariant(item.status)">
                  {{ item.status }}
                </VcStatus>
              </div>
              <div class="tw-font-bold tw-text-lg">
                {{ formatCurrency(item.price, item.currency) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom column slots -->
      
      <!-- Image column with VcImage -->
      <template #item_image="{ item }">
        <VcImage
          :src="item.imageUrl"
          size="s"
          bordered
          clickable
          @click="openImagePreview(item)"
        />
      </template>

      <!-- Name with VcLink -->
      <template #item_name="{ item }">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcLink @click="onItemClick(item)">
            {{ item.name }}
          </VcLink>
          <VcBadge
            v-if="item.isNew"
            variant="success"
            content="NEW"
          />
        </div>
      </template>

      <!-- Status with VcStatus -->
      <template #item_status="{ item }">
        <VcStatus :variant="getStatusVariant(item.status)">
          {{ item.status }}
        </VcStatus>
      </template>

      <!-- Price with formatted currency -->
      <template #item_price="{ item }">
        <div class="tw-font-medium">
          {{ formatCurrency(item.price, item.currency) }}
        </div>
      </template>

      <!-- Stock with VcBadge -->
      <template #item_stock="{ item }">
        <VcBadge
          :content="item.stock"
          :variant="getStockVariant(item.stock)"
        />
      </template>

      <!-- Rating with VcRating -->
      <template #item_rating="{ item }">
        <VcRating
          :model-value="item.rating"
          :max="5"
          variant="star-and-text"
        >
          <template #details>
            <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
              ({{ item.reviewCount }})
            </span>
          </template>
        </VcRating>
      </template>

      <!-- Active status with VcStatusIcon -->
      <template #item_isActive="{ item }">
        <div class="tw-flex tw-items-center tw-justify-center">
          <VcStatusIcon :status="item.isActive" />
        </div>
      </template>

      <!-- Featured with VcSwitch (read-only) -->
      <template #item_isFeatured="{ item }">
        <VcSwitch
          :model-value="item.isFeatured"
          disabled
        />
      </template>

      <!-- Category with VcBadge -->
      <template #item_category="{ item }">
        <VcBadge variant="info">
          {{ item.category }}
        </VcBadge>
      </template>

      <!-- Tags with multiple VcBadge -->
      <template #item_tags="{ item }">
        <div class="tw-flex tw-flex-wrap tw-gap-1">
          <VcBadge
            v-for="tag in item.tags"
            :key="tag"
            variant="secondary"
            size="s"
          >
            {{ tag }}
          </VcBadge>
        </div>
      </template>

      <!-- Created date with VcHint -->
      <template #item_createdDate="{ item }">
        <VcTooltip placement="top">
          <div>{{ formatDate(item.createdDate) }}</div>
          <template #tooltip>
            {{ formatDateTime(item.createdDate) }}
          </template>
        </VcTooltip>
      </template>

      <!-- Video indicator with VcIcon -->
      <template #item_hasVideo="{ item }">
        <div v-if="item.hasVideo" class="tw-flex tw-items-center tw-justify-center">
          <VcIcon icon="material-videocam" variant="success" />
        </div>
      </template>

      <!-- Dimensions with formatted text -->
      <template #item_dimensions="{ item }">
        <div class="tw-text-sm">
          <div>{{ item.length }} × {{ item.width }} × {{ item.height }} {{ item.unit }}</div>
          <VcHint>Weight: {{ item.weight }} {{ item.weightUnit }}</VcHint>
        </div>
      </template>

      <!-- Actions with buttons -->
      <template #item_actions="{ item }">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcTooltip placement="top">
            <VcButton
              icon="material-edit"
              text
              size="sm"
              @click.stop="editItem(item)"
            />
            <template #tooltip>{{ $t('COMMON.EDIT') }}</template>
          </VcTooltip>

          <VcTooltip placement="top">
            <VcButton
              icon="material-content_copy"
              text
              size="sm"
              @click.stop="duplicateItem(item)"
            />
            <template #tooltip>{{ $t('COMMON.DUPLICATE') }}</template>
          </VcTooltip>

          <VcTooltip placement="top">
            <VcButton
              icon="material-delete"
              text
              size="sm"
              @click.stop="deleteItem(item)"
            />
            <template #tooltip>{{ $t('COMMON.DELETE') }}</template>
          </VcTooltip>
        </div>
      </template>

      <!-- Empty state -->
      <template #empty>
        <div class="tw-flex tw-flex-col tw-items-center tw-py-8">
          <VcIcon icon="material-inventory_2" size="xxxl" class="tw-mb-4 tw-text-[var(--neutrals-300)]" />
          <div class="tw-text-lg tw-font-medium tw-mb-2">
            {{ $t('PRODUCTS.EMPTY.TITLE') }}
          </div>
          <VcHint class="tw-mb-4">
            {{ $t('PRODUCTS.EMPTY.SUBTITLE') }}
          </VcHint>
          <VcButton variant="primary" @click="createNewProduct">
            {{ $t('PRODUCTS.CREATE_NEW') }}
          </VcButton>
        </div>
      </template>

      <!-- Not found state -->
      <template #notfound>
        <div class="tw-flex tw-flex-col tw-items-center tw-py-8">
          <VcIcon icon="material-search_off" size="xxxl" class="tw-mb-4 tw-text-[var(--neutrals-300)]" />
          <div class="tw-text-lg tw-font-medium tw-mb-2">
            {{ $t('PRODUCTS.NOT_FOUND.TITLE') }}
          </div>
          <VcHint class="tw-mb-4">
            {{ $t('PRODUCTS.NOT_FOUND.SUBTITLE') }}
          </VcHint>
          <VcButton variant="secondary" @click="resetSearch">
            {{ $t('PRODUCTS.RESET_SEARCH') }}
          </VcButton>
        </div>
      </template>
    </VcTable>
  </VcBlade>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import {
  VcBlade,
  VcTable,
  VcImage,
  VcLink,
  VcBadge,
  VcStatus,
  VcRating,
  VcStatusIcon,
  VcSwitch,
  VcTooltip,
  VcButton,
  VcIcon,
  VcHint,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Table columns configuration
const columns = computed(() => [
  {
    id: "image",
    title: t("PRODUCTS.COLUMNS.IMAGE"),
    width: 80,
  },
  {
    id: "name",
    title: t("PRODUCTS.COLUMNS.NAME"),
    sortable: true,
    width: 200,
  },
  {
    id: "sku",
    title: t("PRODUCTS.COLUMNS.SKU"),
    sortable: true,
  },
  {
    id: "category",
    title: t("PRODUCTS.COLUMNS.CATEGORY"),
    sortable: true,
  },
  {
    id: "price",
    title: t("PRODUCTS.COLUMNS.PRICE"),
    sortable: true,
    align: "right",
  },
  {
    id: "stock",
    title: t("PRODUCTS.COLUMNS.STOCK"),
    sortable: true,
    align: "center",
  },
  {
    id: "rating",
    title: t("PRODUCTS.COLUMNS.RATING"),
    sortable: true,
    width: 150,
  },
  {
    id: "status",
    title: t("PRODUCTS.COLUMNS.STATUS"),
    sortable: true,
  },
  {
    id: "isActive",
    title: t("PRODUCTS.COLUMNS.ACTIVE"),
    align: "center",
    width: 80,
  },
  {
    id: "isFeatured",
    title: t("PRODUCTS.COLUMNS.FEATURED"),
    align: "center",
    width: 100,
  },
  {
    id: "tags",
    title: t("PRODUCTS.COLUMNS.TAGS"),
    width: 200,
  },
  {
    id: "hasVideo",
    title: t("PRODUCTS.COLUMNS.VIDEO"),
    align: "center",
    width: 80,
  },
  {
    id: "dimensions",
    title: t("PRODUCTS.COLUMNS.DIMENSIONS"),
    width: 150,
  },
  {
    id: "createdDate",
    title: t("PRODUCTS.COLUMNS.CREATED"),
    sortable: true,
  },
  {
    id: "actions",
    title: "",
    width: 120,
  },
]);

// Mock data
const items = ref([
  {
    id: "1",
    imageUrl: "https://picsum.photos/200/200?random=1",
    name: "Premium Headphones",
    sku: "SKU-001",
    category: "Electronics",
    price: 299.99,
    currency: "USD",
    stock: 45,
    rating: 4.5,
    reviewCount: 128,
    status: "Active",
    isActive: true,
    isFeatured: true,
    tags: ["wireless", "premium", "noise-canceling"],
    hasVideo: true,
    length: 20,
    width: 18,
    height: 8,
    unit: "cm",
    weight: 250,
    weightUnit: "g",
    createdDate: new Date("2024-01-15"),
    isNew: true,
  },
  // Add more mock items...
]);

const loading = ref(false);
const totalCount = ref(100);
const pages = ref(10);
const currentPage = ref(1);
const sort = ref("name:ASC");
const searchValue = ref("");
const selectedItemId = ref<string | null>(null);

const bladeToolbar = computed(() => [
  {
    id: "refresh",
    title: t("COMMON.REFRESH"),
    icon: "material-refresh",
    async: true,
    clickHandler: async () => {
      // Refresh logic
    },
  },
  {
    id: "create",
    title: t("PRODUCTS.CREATE_NEW"),
    icon: "material-add",
    clickHandler: () => {
      // Create logic
    },
  },
]);

// Helper functions
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    Active: "success",
    Inactive: "danger",
    Draft: "info",
    Pending: "warning",
  };
  return variants[status] || "info";
}

function getStockVariant(stock: number): string {
  if (stock > 50) return "success";
  if (stock > 10) return "warning";
  return "danger";
}

// Event handlers
function onItemClick(item: any) {
  // Navigate to details
}

function onHeaderClick(column: any) {
  // Handle sorting
}

function onPaginationClick(page: number) {
  currentPage.value = page;
}

function onSearchChange(value: string) {
  searchValue.value = value;
}

function onSelectionChanged(items: any[]) {
  // Handle selection
}

function openImagePreview(item: any) {
  // Open image in popup
}

function editItem(item: any) {
  // Edit item
}

function duplicateItem(item: any) {
  // Duplicate item
}

function deleteItem(item: any) {
  // Delete item
}

function createNewProduct() {
  // Create new product
}

function resetSearch() {
  searchValue.value = "";
}
</script>
```

## Column Types and Components

### Image Display
- **VcImage** - Product images, thumbnails
- Props: `size`, `bordered`, `clickable`

### Text and Links
- **VcLink** - Clickable names, IDs
- **Plain text** - SKU, descriptions

### Status Indicators
- **VcStatus** - Order status, item states
- **VcStatusIcon** - Boolean indicators
- **VcBadge** - Counts, labels, categories

### Ratings and Reviews
- **VcRating** - Star ratings with counts
- Variants: `stars`, `star-and-text`, `text`

### Boolean States
- **VcSwitch** - Feature toggles (read-only in table)
- **VcStatusIcon** - Active/inactive states

### Tags and Categories
- **VcBadge** (multiple) - Tags, keywords
- **VcBadge** (single) - Category labels

### Actions
- **VcButton** with icons - Edit, delete, duplicate
- **VcTooltip** - Action hints

### Empty States
- **VcIcon** - Large placeholder icons
- **VcHint** - Explanatory text
- **VcButton** - Call-to-action

## Best Practices

1. **Use custom slots for complex data**
   - Images, statuses, ratings, actions

2. **Format data properly**
   - Currency, dates, numbers

3. **Add tooltips for additional info**
   - Full timestamps, descriptions

4. **Provide empty/not found states**
   - Guide users with clear messaging

5. **Mobile-responsive**
   - Use `mobile-item` slot for mobile view

6. **Loading states**
   - Show loading during data fetch

7. **Sorting and pagination**
   - Handle via events

8. **Multi-select**
   - Enable for bulk actions

