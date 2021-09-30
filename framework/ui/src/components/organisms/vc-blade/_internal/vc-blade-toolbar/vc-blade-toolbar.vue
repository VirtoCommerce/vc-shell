<template>
  <div v-if="items" class="vc-blade-toolbar vc-flex-shrink_0">
    <template v-for="item in items" :key="item.id">
      <vc-blade-toolbar-button
        v-if="item.isVisible === undefined || item.isVisible"
        v-bind="item"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcBladeToolbarButton from "./_internal/vc-blade-toolbar-button/vc-blade-toolbar-button.vue";

export default defineComponent({
  name: "VcBladeToolbar",

  components: {
    VcBladeToolbarButton,
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
:root {
  --blade-toolbar-height: 50px;
  --blade-toolbar-background-color: #ffffff;
}

.vc-blade-toolbar {
  height: var(--blade-toolbar-height);
  background-color: var(--blade-toolbar-background-color);
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  padding: 0 var(--padding-s);
  overflow-x: auto;
}
</style>
