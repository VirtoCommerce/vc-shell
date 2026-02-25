<template>
  <nav
    class="vc-pagination"
    aria-label="Pagination"
  >
    <!-- Pagination Controls -->
    <div class="vc-pagination__controls">
      <!-- First page button -->
      <button
        v-if="effectiveShowFirstLast"
        type="button"
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item--disabled': localCurrentPage === 1 }"
        :disabled="localCurrentPage === 1"
        aria-label="First page"
        @click="setPage(1)"
      >
        <VcIcon
          icon="lucide-chevrons-left"
          aria-hidden="true"
        ></VcIcon>
      </button>

      <!-- Previous page button -->
      <button
        type="button"
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item--disabled': localCurrentPage === 1 }"
        :disabled="localCurrentPage === 1"
        aria-label="Previous page"
        @click="setPage(localCurrentPage - 1)"
      >
        <VcIcon
          icon="lucide-chevron-left"
          aria-hidden="true"
        ></VcIcon>
      </button>

      <button
        v-for="page in pagesToShow"
        :key="page"
        type="button"
        class="vc-pagination__item"
        :class="{
          'vc-pagination__item--current': page === localCurrentPage,
          'vc-pagination__item--hover': page !== localCurrentPage,
        }"
        :aria-current="page === localCurrentPage ? 'page' : undefined"
        :aria-label="`Page ${page}`"
        @click="setPage(page)"
      >
        {{ page }}
      </button>

      <!-- Next page button -->
      <button
        type="button"
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item--disabled': localCurrentPage === pages }"
        :disabled="localCurrentPage === pages"
        aria-label="Next page"
        @click="setPage(localCurrentPage + 1)"
      >
        <VcIcon
          icon="lucide-chevron-right"
          aria-hidden="true"
        ></VcIcon>
      </button>

      <!-- Last page button -->
      <button
        v-if="effectiveShowFirstLast"
        type="button"
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item--disabled': localCurrentPage === pages }"
        :disabled="localCurrentPage === pages"
        aria-label="Last page"
        @click="setPage(pages)"
      >
        <VcIcon
          icon="lucide-chevrons-right"
          aria-hidden="true"
        ></VcIcon>
      </button>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref, computed, inject, type Ref, watch } from "vue";
import { IsMobileKey } from "@framework/injection-keys";
import { VcIcon } from "@ui/components";

export interface Props {
  expanded?: boolean;
  pages?: number;
  currentPage?: number;
  variant?: "default" | "minimal";
  /** Override the number of page buttons to show. When set, takes priority over the isMobile-based default (3 mobile / 5 desktop). */
  maxPages?: number;
  /** Whether to show first/last page navigation buttons (« »). Defaults to true. */
  showFirstLast?: boolean;
}

export interface Emits {
  (event: "itemClick", pages: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  pages: 1,
  currentPage: 1,
  variant: "default",
  maxPages: undefined,
  showFirstLast: undefined,
});

const emit = defineEmits<Emits>();

const isMobile = inject(IsMobileKey)!;

/** Number of page buttons to show on mobile devices */
const MAX_PAGES_MOBILE = 3;
/** Number of page buttons to show on desktop devices */
const MAX_PAGES_DESKTOP = 5;

const localCurrentPage = ref(props.currentPage);

watch(
  () => props.currentPage,
  (newValue) => {
    localCurrentPage.value = newValue;
  },
  { immediate: true },
);

/** Resolved showFirstLast — prop wins, otherwise true by default */
const effectiveShowFirstLast = computed(() => props.showFirstLast ?? true);

const setPage = (page: number | string) => {
  if (typeof page === "undefined" || (typeof page === "number" && isNaN(page))) return;
  const pageNumber = typeof page === "string" ? parseInt(page) : page;
  if (pageNumber < 1 || pageNumber > props.pages) return;
  localCurrentPage.value = pageNumber;
  emit("itemClick", pageNumber);
};

const pagesToShow = computed(() => {
  const pages = [];
  const totalPages = props.pages;
  const current = localCurrentPage.value;
  const maxPages = props.maxPages ?? (isMobile.value ? MAX_PAGES_MOBILE : MAX_PAGES_DESKTOP);

  if (maxPages === 0) return [];

  if (totalPages <= maxPages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(start + maxPages - 1, totalPages);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});
</script>

<style lang="scss">
:root {
  --pagination-item-width: 29px;
  --pagination-item-height: 29px;
  --pagination-item-color: var(--neutrals-500);
  --pagination-item-color-hover: var(--primary-500);
  --pagination-item-color-current: var(--additional-50);
  --pagination-item-color-disabled: var(--neutrals-400);
  --pagination-item-background-color: var(--additional-50);
  --pagination-item-background-color-hover: var(--primary-100);
  --pagination-item-background-color-current: var(--primary-500);
  --pagination-item-background-color-disabled: var(--neutrals-100);
  --pagination-item-border-color: var(--secondary-100);
  --pagination-item-border-color-hover: var(--neutrals-200);
  --pagination-item-border-color-current: var(--neutrals-200);
  --pagination-item-border-color-disabled: var(--neutrals-200);
  --pagination-focus-ring-color: var(--primary-100);
}

.vc-pagination {
  display: flex;
  align-items: center;

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__item {
    @apply tw-flex tw-items-center tw-justify-center tw-w-[var(--pagination-item-width)]
    tw-h-[var(--pagination-item-height)]
    tw-rounded-full
    tw-text-[color:var(--pagination-item-color)]
    tw-box-border tw-border-none tw-bg-transparent tw-outline-none
    tw-transition tw-duration-200
    tw-select-none tw-text-xs tw-cursor-pointer tw-shrink-0 tw-font-semibold;

    &:hover:not(:disabled) {
      @apply tw-bg-[color:var(--pagination-item-background-color-hover)]
      tw-text-[color:var(--pagination-item-color-hover)]
      tw-cursor-pointer;
    }

    &:focus-visible {
      @apply tw-ring-[3px] tw-ring-[color:var(--pagination-focus-ring-color)] tw-outline-none;
    }

    &--current,
    &--current:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-current)]
      tw-text-[color:var(--pagination-item-color-current)]
      tw-cursor-auto;
    }

    &:disabled,
    &--disabled {
      @apply tw-bg-[color:var(--pagination-item-background-color-disabled)]
      tw-text-[color:var(--pagination-item-color-disabled)]
      tw-cursor-not-allowed tw-opacity-50;
    }

    &--hover {
      @apply hover:tw-bg-[color:var(--pagination-item-background-color-hover)]
    hover:tw-text-[color:var(--pagination-item-color-hover)] tw-cursor-pointer;
    }
  }
}
</style>
