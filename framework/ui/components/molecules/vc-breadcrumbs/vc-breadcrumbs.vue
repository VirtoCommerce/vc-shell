<template>
  <div
    v-if="items && items.length"
    class="tw-flex tw-items-center tw-flex-wrap tw-gap-[10px]"
  >
    <VcBreadcrumbsItem
      v-for="(item, i) in items"
      :key="item.id"
      v-bind="item"
      :current="i === items.length - 1"
    />
  </div>
</template>

<script lang="ts" setup>
import { Breadcrumbs } from "../../../types";
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";

export interface Props {
  items?: Breadcrumbs[];
}

withDefaults(defineProps<Props>(), {
  items: () => [],
});
</script>
