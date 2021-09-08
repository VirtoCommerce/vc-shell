<template>
  <div v-if="items" class="vc-breadcrumbs">
    <vc-breadcrumbs-item
      v-for="(item, i) in items"
      :key="item.id"
      v-bind="item"
      :current="i === items.length - 1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";

export default defineComponent({
  name: "VcBreadcrumbs",

  components: {
    VcBreadcrumbsItem,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
});
</script>

<style lang="less">
.vc-breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
</style>
