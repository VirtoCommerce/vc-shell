<template>
  <div
    v-if="items"
    class="vc-breadcrumbs vc-flex vc-flex-align_center vc-flex-nowrap"
  >
    <template v-for="(item, i) in items" :key="item.id">
      <div
        class="vc-breadcrumbs__item vc-flex vc-flex-align_center"
        :class="{
          'vc-breadcrumbs__item_disabled': item.disabled,
          'vc-breadcrumbs__item_current': i === items.length - 1,
        }"
      >
        <vc-icon
          v-if="item.icon"
          class="vc-breadcrumbs__item-icon"
          :icon="item.icon"
          size="s"
        />
        <div class="vc-breadcrumbs__item-title">
          {{ item.title }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../vc-icon/vc-icon.vue";

export default defineComponent({
  components: { VcIcon },

  props: {
    items: {
      type: Array,
    },
  },
});
</script>

<style lang="less">
.vc-breadcrumbs {
  &__item {
    height: 28px;
    box-sizing: border-box;
    border-radius: 14px;
    border: 1px solid #a1c0d4;
    color: #43b0e6;
    white-space: nowrap;
    padding: 0 14px;
    margin-right: 6px;
    font-size: var(--font-size-s);
    cursor: pointer;

    &:hover {
      border: 1px solid #8fb0c6;
    }

    &-icon {
      margin-right: 6px;
      color: #a1c0d4;
    }

    &_disabled {
      opacity: 0.4;
    }

    &_current {
      color: #465769;
      border: 1px solid #838d9a;
      cursor: default;

      &:hover {
        border: 1px solid #838d9a;
      }
    }
  }
}
</style>
