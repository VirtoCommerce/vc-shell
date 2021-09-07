<template>
  <div class="vc-nav" :class="{ 'vc-nav_collapsed': collapsed }">
    <vc-nav-toggle @click="toggleCollapsed"></vc-nav-toggle>
    <vc-container :noPadding="true" class="vc-nav__content">
      <vc-nav-item v-for="item in items" :key="item.id" v-bind="item" />
    </vc-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcNavItem from "../../molecules/vc-nav-item/vc-nav-item.vue";
import VcNavToggle from "../../molecules/vc-nav-toggle/vc-nav-toggle.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";

export default defineComponent({
  components: { VcNavItem, VcNavToggle, VcContainer },

  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },

    items: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["collapse", "expand"],

  setup(props, { emit }) {
    return {
      toggleCollapsed() {
        emit(props.collapsed ? "expand" : "collapse");
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --nav-width: 240px;
  --nav-width-collapsed: 60px;
  --nav-background-color: #ffffff;
  --nav-border-right-color: #ffffff;
}

.vc-nav {
  width: var(--nav-width);
  border-right: 1px solid var(--nav-border-right-color);
  background: var(--nav-background-color);
  display: flex;
  flex-direction: column;

  &_collapsed {
    width: var(--nav-width-collapsed);

    .vc-nav-item__title {
      display: none;
    }
  }

  &__content {
    flex-grow: 1;
  }
}
</style>
