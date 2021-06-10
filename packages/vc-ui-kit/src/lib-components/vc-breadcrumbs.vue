<template>
  <div
    v-if="items"
    class="vc-breadcrumbs vc-flex vc-flex-align_center vc-flex-nowrap"
  >
    <template v-for="(item, i) in items">
      <div
        class="vc-breadcrumbs__item vc-flex vc-flex-align_center"
        :class="{
          'vc-breadcrumbs__item_disabled': item.disabled,
          'vc-breadcrumbs__item_current': i === items.length - 1,
        }"
        :key="item.id"
      >
        <vc-icon
          class="vc-breadcrumbs__item-icon"
          v-if="item.icon"
          :icon="item.icon"
          size="s"
        ></vc-icon>
        <div class="vc-breadcrumbs__item-title">{{ item.title }}</div>
      </div>
    </template>
  </div>
</template>

<script>
  import VcIcon from "./vc-icon.vue";
  import { defineComponent } from "@vue/composition-api";

  export default defineComponent({
    components: { VcIcon },
    
    props: {
      items: {
        type: Array,
      },
    },
  });
</script>
