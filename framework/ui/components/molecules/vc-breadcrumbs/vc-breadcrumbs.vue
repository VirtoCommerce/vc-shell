<template>
  <div v-if="items" class= "tw-flex tw-items-center tw-flex-nowrap">
    <VcBreadcrumbsItem
      v-for="(item, i) in items"
      :key="item.id"
      v-bind="item"
      :current="i === items.length - 1"
    />
  </div>
</template>

<script lang="ts" setup>
import VcBreadcrumbsItem from "./_internal/vc-breadcrumbs-item/vc-breadcrumbs-item.vue";

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});
</script>