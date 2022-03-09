<template>
  <div class="vc-pagination vc-flex">
    <!-- To first page chevron -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="currentPage !== 1 && $emit('itemClick', 1)"
    >
      <vc-icon size="xs" icon="fas fa-angle-double-left"></vc-icon>
    </div>

    <!-- To previous page arrow -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="currentPage !== 1 && $emit('itemClick', currentPage - 1)"
    >
      <vc-icon size="xs" icon="fas fa-arrow-left"></vc-icon>
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
      <vc-icon size="xs" icon="fas fa-arrow-right"></vc-icon>
    </div>

    <!-- To last page chevron -->
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === pages,
      }"
      @click="currentPage !== pages && $emit('itemClick', pages)"
    >
      <vc-icon size="xs" icon="fas fa-angle-double-right"></vc-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcPagination",
});
</script>

<script lang="ts" setup>
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

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

<style lang="less">
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
  --pagination-item-margin: var(--margin-m);
  --pagination-item-border-radius: 3px;
  --pagination-item-border-color: #eaecf2;
  --pagination-item-border-color-hover: #eaecf2;
  --pagination-item-border-color-current: #eaecf2;
  --pagination-item-border-color-disabled: #eaecf2;
}

.vc-pagination {
  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--pagination-item-width);
    height: var(--pagination-item-height);
    background-color: var(--pagination-item-background-color);
    border: 1px solid var(--pagination-item-border-color);
    border-radius: var(--pagination-item-border-radius);
    color: var(--pagination-item-color);
    box-sizing: border-box;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-right: var(--pagination-item-margin);
    user-select: none;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: var(--pagination-item-background-color-hover);
      color: var(--pagination-item-color-hover);
      border: 1px solid var(--pagination-item-border-color-hover);
    }

    &_current,
    &_current:hover {
      background-color: var(--pagination-item-background-color-current);
      color: var(--pagination-item-color-current);
      border: 1px solid var(--pagination-item-border-color-current);
      cursor: auto;
    }

    &_disabled,
    &_disabled:hover {
      background-color: var(--pagination-item-background-color-disabled);
      color: var(--pagination-item-color-disabled);
      border: 1px solid var(--pagination-item-border-color-disabled);
      cursor: auto;
    }
  }
}
</style>
