<template>
  <div class="vc-pagination flex">
    <!-- To first page chevron -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="currentPage !== 1 && $emit('itemClick', 1)"
    >
      <VcIcon size="xs" icon="fas fa-angle-double-left"></VcIcon>
    </div>

    <!-- To previous page arrow -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="currentPage !== 1 && $emit('itemClick', currentPage - 1)"
    >
      <VcIcon size="xs" icon="fas fa-arrow-left"></VcIcon>
    </div>

    <template v-if="expanded && $isDesktop.value">
      <!-- To preprevious page with number -->
      <div
        v-if="currentPage > 2"
        class="vc-pagination__item"
        @click="$emit('itemClick', currentPage - 2)"
      >
        {{ currentPage - 2 }}
      </div>

      <!-- To previous page with number -->
      <div
        v-if="currentPage > 1"
        class="vc-pagination__item"
        @click="$emit('itemClick', currentPage - 1)"
      >
        {{ currentPage - 1 }}
      </div>
    </template>

    <!-- Current page -->
    <div class="vc-pagination__item vc-pagination__item_current">
      {{ currentPage }}
    </div>

    <template v-if="expanded && $isDesktop.value">
      <!-- To next page with number -->
      <div
        v-if="currentPage < pages"
        class="vc-pagination__item"
        @click="$emit('itemClick', currentPage + 1)"
      >
        {{ currentPage + 1 }}
      </div>

      <!-- To postnext page with number -->
      <div
        v-if="currentPage < pages - 1"
        class="vc-pagination__item"
        @click="$emit('itemClick', currentPage + 2)"
      >
        {{ currentPage + 2 }}
      </div>
    </template>

    <!-- To next page arrow -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === pages,
      }"
      @click="currentPage !== pages && $emit('itemClick', currentPage + 1)"
    >
      <VcIcon size="xs" icon="fas fa-arrow-right"></VcIcon>
    </div>

    <!-- To last page chevron -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === pages,
      }"
      @click="currentPage !== pages && $emit('itemClick', pages)"
    >
      <VcIcon size="xs" icon="fas fa-angle-double-right"></VcIcon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@components";

defineProps({
  expanded: {
    type: Boolean,
    default: false,
  },

  pages: {
    type: Number,
    default: 1,
  },

  currentPage: {
    type: Number,
    default: 1,
  },
});

defineEmits(["itemClick"]);
</script>

<style lang="scss">
:root {
  --pagination-item-width: 30px;
  --pagination-item-height: 30px;
  --pagination-item-color: #000000;
  --pagination-item-color-hover: #000000;
  --pagination-item-color-current: #ffffff;
  --pagination-item-color-disabled: #9c9c9c;
  --pagination-item-background-color: #ffffff;
  --pagination-item-background-color-hover: #dfeef9;
  --pagination-item-background-color-current: #43b0e6;
  --pagination-item-background-color-disabled: #ffffff;
  --pagination-item-border-radius: 3px;
  --pagination-item-border-color: #eaecf2;
  --pagination-item-border-color-hover: #eaecf2;
  --pagination-item-border-color-current: #eaecf2;
  --pagination-item-border-color-disabled: #eaecf2;
}

.vc-pagination {
  &__item {
    @apply flex items-center justify-center w-[var(--pagination-item-width)]
    h-[var(--pagination-item-height)]
    bg-[color:var(--pagination-item-background-color)]
    border border-solid border-[color:var(--pagination-item-border-color)]
    rounded-[var(--pagination-item-border-radius)]
    text-[color:var(--pagination-item-color)]
    box-border cursor-pointer
    transition duration-200
    mr-3 select-none last:mr-0
    hover:bg-[color:var(--pagination-item-background-color-hover)]
    hover:text-[color:var(--pagination-item-color-hover)]
    hover:border hover:border-solid
    hover:border-[color:var(--pagination-item-border-color-hover)];

    &_current,
    &_current:hover {
      @apply bg-[color:var(--pagination-item-background-color-current)]
      text-[color:var(--pagination-item-color-current)]
      border border-solid border-[color:var(--pagination-item-border-color-current)]
      cursor-auto;
    }

    &_disabled,
    &_disabled:hover {
      @apply bg-[color:var(--pagination-item-background-color-disabled)]
      text-[color:var(--pagination-item-color-disabled)]
      border border-solid border-[color:var(--pagination-item-border-color-disabled)]
      cursor-auto;
    }
  }
}
</style>
