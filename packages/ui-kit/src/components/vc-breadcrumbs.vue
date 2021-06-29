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
import VcIcon from "./vc-icon.vue";

export default defineComponent({
  components: { VcIcon },

  props: {
    items: {
      type: Array,
    },
  },
});
</script>
