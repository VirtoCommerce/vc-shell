<template>
  <div class="vc-pagination vc-flex">
    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="$emit('itemClick', 1)"
    >
      <vc-icon size="xs" icon="fas fa-angle-double-left"></vc-icon>
    </div>

    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === 1,
      }"
      @click="$emit('itemClick', currentPage - 1)"
    >
      <vc-icon size="xs" icon="fas fa-arrow-left"></vc-icon>
    </div>

    <div
      v-for="page in pages"
      :key="page"
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_current': page === currentPage,
      }"
      @click="$emit('itemClick', page)"
    >
      {{ page }}
    </div>

    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === pages,
      }"
      @click="$emit('itemClick', currentPage + 1)"
    >
      <vc-icon size="xs" icon="fas fa-arrow-right"></vc-icon>
    </div>

    <div
      class="vc-pagination__item"
      :class="{
        'vc-pagination__item_disabled': currentPage === pages,
      }"
      @click="$emit('itemClick', pages)"
    >
      <vc-icon size="xs" icon="fas fa-angle-double-right"></vc-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcPagination",

  components: { VcIcon },

  props: {
    pages: {
      type: Number,
      default: 1,
    },

    currentPage: {
      type: Number,
      default: 1,
    },
  },

  emits: ["itemClick"],
});
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
