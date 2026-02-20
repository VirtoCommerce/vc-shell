<template>
  <div class="vc-paginator">
    <!-- Page report (e.g., "1-10 of 100") -->
    <div
      v-if="showCurrentPageReport"
      class="vc-paginator__report"
    >
      {{ currentPageReportText }}
    </div>

    <!-- Rows per page selector -->
    <div
      v-if="rowsPerPageOptions && rowsPerPageOptions.length > 0"
      class="vc-paginator__rows-per-page"
    >
      <span class="vc-paginator__rows-label">Rows per page:</span>
      <select
        :value="internalRows"
        class="vc-paginator__select"
        @change="onRowsChange($event)"
      >
        <option
          v-for="option in rowsPerPageOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Pagination Controls -->
    <div class="vc-paginator__controls">
      <!-- First page button -->
      <div
        class="vc-paginator__item"
        :class="{ 'vc-paginator__item_disabled': currentPage === 1 }"
        @click="currentPage !== 1 && changePage(1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </div>

      <!-- Previous page button -->
      <div
        class="vc-paginator__item"
        :class="{ 'vc-paginator__item_disabled': currentPage === 1 }"
        @click="currentPage !== 1 && changePage(currentPage - 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>

      <!-- Page numbers -->
      <div
        v-for="page in pagesToShow"
        :key="page"
        class="vc-paginator__item"
        :class="{
          'vc-paginator__item_current': page === currentPage,
          'vc-paginator__item_hover': page !== currentPage,
        }"
        @click="changePage(page)"
      >
        {{ page }}
      </div>

      <!-- Next page button -->
      <div
        class="vc-paginator__item"
        :class="{ 'vc-paginator__item_disabled': currentPage === totalPages }"
        @click="currentPage !== totalPages && changePage(currentPage + 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <!-- Last page button -->
      <div
        class="vc-paginator__item"
        :class="{ 'vc-paginator__item_disabled': currentPage === totalPages }"
        @click="currentPage !== totalPages && changePage(totalPages)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, type Ref } from "vue";
import { IsMobileKey } from "@framework/injection-keys";

export interface Props {
  /**
   * Total number of records
   */
  totalRecords: number;
  /**
   * Number of rows to display per page (v-model:rows)
   */
  rows?: number;
  /**
   * Index of the first record to display (v-model:first)
   */
  first?: number;
  /**
   * Options for rows per page dropdown
   */
  rowsPerPageOptions?: number[];
  /**
   * Whether to show current page report
   */
  showCurrentPageReport?: boolean;
  /**
   * Template for current page report
   * Available placeholders: {first}, {last}, {totalRecords}, {currentPage}, {totalPages}
   */
  currentPageReportTemplate?: string;
  /**
   * Number of page links to display
   */
  pageLinkSize?: number;
  /**
   * Whether to always show the paginator
   */
  alwaysShow?: boolean;
}

export interface Emits {
  (e: "update:first", value: number): void;
  (e: "update:rows", value: number): void;
  (e: "page", event: { page: number; first: number; rows: number; pageCount: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 10,
  first: 0,
  pageLinkSize: 5,
  showCurrentPageReport: true,
  currentPageReportTemplate: "{first}-{last} of {totalRecords}",
  alwaysShow: false,
});

const emit = defineEmits<Emits>();

const isMobile = inject(IsMobileKey, ref(false));

// Internal state
const internalFirst = ref(props.first);
const internalRows = ref(props.rows);

// Sync with props
watch(
  () => props.first,
  (newVal) => {
    internalFirst.value = newVal;
  }
);

watch(
  () => props.rows,
  (newVal) => {
    internalRows.value = newVal;
  }
);

// Computed values
const totalPages = computed(() => {
  if (props.totalRecords === 0 || internalRows.value === 0) return 1;
  return Math.ceil(props.totalRecords / internalRows.value);
});

const currentPage = computed(() => {
  if (internalRows.value === 0) return 1;
  return Math.floor(internalFirst.value / internalRows.value) + 1;
});

const firstRecordIndex = computed(() => {
  if (props.totalRecords === 0) return 0;
  return internalFirst.value + 1;
});

const lastRecordIndex = computed(() => {
  const last = internalFirst.value + internalRows.value;
  return Math.min(last, props.totalRecords);
});

// Current page report text
const currentPageReportText = computed(() => {
  return props.currentPageReportTemplate
    .replace("{first}", String(firstRecordIndex.value))
    .replace("{last}", String(lastRecordIndex.value))
    .replace("{totalRecords}", String(props.totalRecords))
    .replace("{currentPage}", String(currentPage.value))
    .replace("{totalPages}", String(totalPages.value));
});

// Pages to show
const pagesToShow = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  const maxPages = isMobile.value ? 3 : props.pageLinkSize;

  if (total <= maxPages) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(start + maxPages - 1, total);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

// Change page
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;

  const newFirst = (page - 1) * internalRows.value;
  internalFirst.value = newFirst;

  emit("update:first", newFirst);
  emit("page", {
    page: page - 1, // 0-indexed for API compatibility
    first: newFirst,
    rows: internalRows.value,
    pageCount: totalPages.value,
  });
};

// Change rows per page
const onRowsChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newRows = parseInt(target.value, 10);

  internalRows.value = newRows;
  internalFirst.value = 0; // Reset to first page

  emit("update:rows", newRows);
  emit("update:first", 0);
  emit("page", {
    page: 0,
    first: 0,
    rows: newRows,
    pageCount: Math.ceil(props.totalRecords / newRows),
  });
};
</script>

<style lang="scss">
:root {
  --paginator-item-width: 32px;
  --paginator-item-height: 32px;
  --paginator-item-color: var(--neutrals-600, #4b5563);
  --paginator-item-color-hover: var(--primary-600, #2563eb);
  --paginator-item-color-current: #fff;
  --paginator-item-color-disabled: var(--neutrals-400, #9ca3af);
  --paginator-item-bg: transparent;
  --paginator-item-bg-hover: var(--primary-100, #dbeafe);
  --paginator-item-bg-current: var(--primary-500, #3b82f6);
  --paginator-item-bg-disabled: transparent;
}

.vc-paginator {
  @apply tw-flex tw-items-center tw-gap-4 tw-flex-wrap;

  &__report {
    @apply tw-text-sm tw-text-neutrals-600;
  }

  &__rows-per-page {
    @apply tw-flex tw-items-center tw-gap-2;
  }

  &__rows-label {
    @apply tw-text-sm tw-text-neutrals-600;
  }

  &__select {
    @apply tw-px-2 tw-py-1 tw-border tw-border-neutrals-300 tw-rounded tw-text-sm tw-bg-white;
    @apply focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary-500 focus:tw-border-primary-500;
  }

  &__controls {
    @apply tw-flex tw-items-center tw-gap-1;
  }

  &__item {
    @apply tw-flex tw-items-center tw-justify-center tw-rounded-full tw-cursor-pointer tw-transition-colors tw-select-none tw-text-sm tw-font-medium;
    width: var(--paginator-item-width);
    height: var(--paginator-item-height);
    color: var(--paginator-item-color);
    background-color: var(--paginator-item-bg);

    &:hover:not(&_disabled):not(&_current) {
      color: var(--paginator-item-color-hover);
      background-color: var(--paginator-item-bg-hover);
    }

    &_current {
      color: var(--paginator-item-color-current);
      background-color: var(--paginator-item-bg-current);
      cursor: default;
    }

    &_disabled {
      color: var(--paginator-item-color-disabled);
      background-color: var(--paginator-item-bg-disabled);
      cursor: not-allowed;
    }

    &_hover {
      cursor: pointer;
    }

    svg {
      @apply tw-w-4 tw-h-4;
    }
  }
}
</style>
