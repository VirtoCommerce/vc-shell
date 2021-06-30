<template>
  <div class="vc-drawer" :class="{ 'vc-drawer_collapsed': collapsed }">
    <div class="vc-drawer__top">
      <div
        class="vc-drawer__top-image"
        :style="{ 'background-image': `url(${logo})` }"
      ></div>
      <div class="vc-drawer__top-version">{{ version }}</div>
    </div>
    <vc-drawer-toggler @click="toggleCollapsed()"></vc-drawer-toggler>
    <vc-container class="vc-drawer__content">
      <vc-drawer-item icon="home" to="/" sticky="sticky" title="Home" />
      <vc-drawer-item
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
        @click="$emit('itemClick', item)"
      />
      <vc-drawer-item icon="ellipsis-h" sticky="sticky" title="More" />
    </vc-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcDrawerItem from "./vc-drawer-item.vue";
import VcDrawerToggler from "./vc-drawer-toggler.vue";
import VcContainer from "./vc-container.vue";

export default defineComponent({
  components: { VcDrawerItem, VcDrawerToggler, VcContainer },

  props: {
    logo: {
      type: String,
    },

    version: {
      type: String,
    },

    items: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  emits: ["itemClick", "collapse", "expand"],

  setup(_props, { emit }) {
    const collapsed = ref(false);

    return {
      collapsed,

      toggleCollapsed() {
        collapsed.value = !collapsed.value;
        emit(collapsed.value ? "collapse" : "expand");
      },
    };
  },
});
</script>
