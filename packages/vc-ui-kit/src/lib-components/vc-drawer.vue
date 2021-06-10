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
        :to="item.to"
        :title="item.title"
      />
      <vc-drawer-item icon="ellipsis-h" sticky="sticky" title="More" />
    </vc-container>
  </div>
</template>

<script>
  import VcDrawerItem from "./vc-drawer-item.vue";
  import VcDrawerToggler from "./vc-drawer-toggler.vue";
  import VcContainer from "./vc-container.vue";
  import { defineComponent } from "@vue/composition-api";

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
        default: [],
      },
    },

    setup() {
      return {
        collapsed: false,

        toggleCollapsed() {
          this.collapsed = !this.collapsed;
          this.$emit(this.collapsed ? "collapse" : "expand");
        },
      };
    },
  });
</script>
