<template>
  <div class="vc-pagination">
    <!-- Pagination Controls -->
    <div class="vc-pagination__controls">
      <!-- First page button -->
      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': localCurrentPage === 1 }"
        @click="localCurrentPage !== 1 && setPage(1)"
      >
        <VcIcon icon="material-keyboard_double_arrow_left"></VcIcon>
      </div>

      <!-- Previous page button -->
      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': localCurrentPage === 1 }"
        @click="localCurrentPage !== 1 && setPage(localCurrentPage - 1)"
      >
        <VcIcon icon="material-arrow_left_alt"></VcIcon>
      </div>

      <div
        v-for="page in pagesToShow"
        :key="page"
        class="vc-pagination__item"
        :class="{
          'vc-pagination__item_current': page === localCurrentPage,
          'vc-pagination__item_hover': page !== localCurrentPage,
        }"
        @click="setPage(page)"
      >
        {{ page }}
      </div>

      <!-- Next page button -->
      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': localCurrentPage === pages }"
        @click="localCurrentPage !== pages && setPage(localCurrentPage + 1)"
      >
        <VcIcon icon="material-arrow_right_alt"></VcIcon>
      </div>

      <!-- Last page button -->
      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': localCurrentPage === pages }"
        @click="localCurrentPage !== pages && setPage(pages)"
      >
        <VcIcon icon="material-keyboard_double_arrow_right"></VcIcon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRefs, inject, type Ref, watch } from "vue";
import { VcIcon } from "./../../";

export interface Props {
  expanded?: boolean;
  pages?: number;
  currentPage?: number;
  variant?: "default" | "minimal";
}

export interface Emits {
  (event: "itemClick", pages: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  pages: 1,
  currentPage: 1,
  variant: "default",
});

const emit = defineEmits<Emits>();

const isMobile = inject("isMobile") as Ref<boolean>;

/** Number of page buttons to show on mobile devices */
const MAX_PAGES_MOBILE = 3;
/** Number of page buttons to show on desktop devices */
const MAX_PAGES_DESKTOP = 5;

const { variant } = toRefs(props);
const localCurrentPage = ref(props.currentPage);

watch(
  () => props.currentPage,
  (newValue) => {
    localCurrentPage.value = newValue;
  },
  { immediate: true },
);

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
  const maxPages = isMobile.value ? MAX_PAGES_MOBILE : MAX_PAGES_DESKTOP;

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
  --pagination-item-border-radius: 3px;
  --pagination-item-border-color: var(--secondary-100);
  --pagination-item-border-color-hover: var(--neutrals-200);
  --pagination-item-border-color-current: var(--neutrals-200);
  --pagination-item-border-color-disabled: var(--neutrals-200);
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
    tw-box-border
    tw-transition tw-duration-200
    tw-select-none tw-text-xs tw-cursor-pointer tw-shrink-0 tw-font-semibold;

    &:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-hover)]
      tw-text-[color:var(--pagination-item-color-hover)]
      tw-cursor-pointer;
    }

    &_current,
    &_current:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-current)]
      tw-text-[color:var(--pagination-item-color-current)]
      tw-cursor-auto;
    }

    &_disabled,
    &_disabled:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-disabled)]
      tw-text-[color:var(--pagination-item-color-disabled)]
      tw-cursor-auto;
    }

    &_hover {
      @apply hover:tw-bg-[color:var(--pagination-item-background-color-hover)]
    hover:tw-text-[color:var(--pagination-item-color-hover)] tw-cursor-pointer;
    }
  }
}
</style>
