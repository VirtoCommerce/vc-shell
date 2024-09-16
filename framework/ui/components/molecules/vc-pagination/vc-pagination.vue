<template>
  <div class="vc-pagination">
    <!-- Pagination Controls -->
    <div class="vc-pagination__controls">
      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': currentPage === 1 }"
        @click="currentPage !== 1 && setPage(currentPage - 1)"
      >
        <VcIcon
          size="xs"
          icon="fas fa-arrow-left"
        ></VcIcon>
      </div>

      <div
        v-for="page in pagesToShow"
        :key="page"
        class="vc-pagination__item"
        :class="{
          'vc-pagination__item_current': page === currentPage,
          'vc-pagination__item_hover': page !== '...' && page !== currentPage,
        }"
        @click="setPage(page)"
      >
        {{ page }}
      </div>

      <div
        class="vc-pagination__item"
        :class="{ 'vc-pagination__item_disabled': currentPage === pages }"
        @click="currentPage !== pages && setPage(currentPage + 1)"
      >
        <VcIcon
          size="xs"
          icon="fas fa-arrow-right"
        ></VcIcon>
      </div>

      <!-- Jump to page input -->
      <div
        v-if="variant === 'default' && pages > 5"
        class="vc-pagination__jump"
      >
        <p class="tw-mr-3">{{ $t("COMPONENTS.MOLECULES.VC_PAGINATION.JUMP") }}</p>

        <VcInput
          type="number"
          size="small"
          :model-value="jumpPage"
          @update:model-value="handleInputChange"
        >
          <template #control="{ modelValue }">
            <input
              :value="modelValue"
              class="tw-w-full"
              :max="props.pages"
              @input="(event) => handleInputChange((event.target as HTMLInputElement)?.value)"
              @keyup.enter="setPage(jumpPage)"
              @keydown="onKeyDown"
            />
          </template>
        </VcInput>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRefs } from "vue";
import { VcIcon, VcInput } from "./../../";

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

const { currentPage, variant } = toRefs(props);

const jumpPage = ref();

const setPage = (page: number | string) => {
  if (typeof page === "undefined" || (typeof page === "number" && isNaN(page))) return;
  const pageNumber = typeof page === "string" ? parseInt(page) : page;
  if (pageNumber < 1 || pageNumber > props.pages || page === "...") return;
  currentPage.value = pageNumber;
  emit("itemClick", pageNumber);
};

const handleInputChange = (value: unknown) => {
  const numberValue: number = typeof value === "string" ? parseInt(value) : Number(value);
  let parsedValue = numberValue;

  if (parsedValue > props.pages) {
    parsedValue = props.pages;
  } else if (parsedValue < 1) {
    parsedValue = 1;
  }

  jumpPage.value = parsedValue;
};

function onKeyDown(e: KeyboardEvent) {
  const allowedKeys = ["Backspace", "Delete", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (
    (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) ||
    (jumpPage.value >= props.pages && e.key !== "Backspace" && e.key !== "Delete")
  ) {
    e.preventDefault();
  }
}

const pagesToShow = computed(() => {
  const pages = [];
  const range = 1;
  const totalPages = props.pages;
  const current = currentPage.value;

  if (props.pages <= 5) {
    for (let i = 1; i <= props.pages; i++) {
      pages.push(i);
    }
  } else {
    const addRange = (start: number, end: number) => {
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    };

    pages.push(1);

    if (current <= 4) {
      addRange(2, 5);
      pages.push("...");
    } else if (current >= totalPages - 3) {
      pages.push("...");
      addRange(totalPages - 4, totalPages - 1);
    } else {
      pages.push("...");
      addRange(current - range, current + range);
      pages.push("...");
    }

    pages.push(props.pages);
  }

  return pages;
});
</script>

<style lang="scss">
:root {
  --pagination-item-width: 30px;
  --pagination-item-height: 30px;
  --pagination-item-color: var(--neutrals-800);
  --pagination-item-color-hover: var(--primary-500);
  --pagination-item-color-current: var(--additional-50);
  --pagination-item-color-disabled: var(--neutrals-400);
  --pagination-item-background-color: var(--additional-50);
  --pagination-item-background-color-hover: var(--primary-100);
  --pagination-item-background-color-current: var(--primary-500);
  --pagination-item-background-color-disabled: var(--neutrals-100);
  --pagination-item-border-radius: 3px;
  --pagination-item-border-color: var(--neutrals-200);
  --pagination-item-border-color-hover: var(--neutrals-200);
  --pagination-item-border-color-current: var(--neutrals-200);
  --pagination-item-border-color-disabled: var(--neutrals-200);
}

.vc-pagination {
  display: flex;
  align-items: center;
  gap: 10px;

  &__results {
    margin-right: 20px;
  }

  &__page-size {
    margin-right: 20px;
  }

  &__controls {
    display: flex;
    align-items: center;
  }

  &__item {
    @apply tw-flex tw-items-center tw-justify-center tw-w-[var(--pagination-item-width)]
    tw-h-[var(--pagination-item-height)]
    tw-bg-[color:var(--pagination-item-background-color)]
    tw-border tw-border-solid tw-border-[color:var(--pagination-item-border-color)]
    tw-rounded-[var(--pagination-item-border-radius)]
    tw-text-[color:var(--pagination-item-color)]
    tw-box-border
    tw-transition tw-duration-200
    tw-mr-3 tw-select-none last:tw-mr-0;

    &_current,
    &_current:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-current)]
      tw-text-[color:var(--pagination-item-color-current)]
      tw-border tw-border-solid tw-border-[color:var(--pagination-item-border-color-current)]
      tw-cursor-auto;
    }

    &_disabled,
    &_disabled:hover {
      @apply tw-bg-[color:var(--pagination-item-background-color-disabled)]
      tw-text-[color:var(--pagination-item-color-disabled)]
      tw-border tw-border-solid tw-border-[color:var(--pagination-item-border-color-disabled)]
      tw-cursor-auto;
    }

    &_hover {
      @apply hover:tw-bg-[color:var(--pagination-item-background-color-hover)]
    hover:tw-text-[color:var(--pagination-item-color-hover)]
    hover:tw-border hover:tw-border-solid
    hover:tw-border-[color:var(--pagination-item-border-color-hover)] tw-cursor-pointer;
    }
  }

  &__jump {
    display: flex;
    align-items: center;
  }

  &__jump input {
    width: 50px;
    text-align: center;
  }
}
</style>
