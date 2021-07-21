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
import VcDrawerItem from "../../molecules/vc-drawer-item/vc-drawer-item.vue";
import VcDrawerToggler from "../../molecules/vc-drawer-toggler/vc-drawer-toggler.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";

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

<style lang="less">
.vc-drawer {
  width: var(--drawer-width);
  height: 100%;
  border-right: 1px solid var(--drawer-border-right-color);
  background: var(--drawer-background-color);

  &__top {
    height: var(--drawer-top-height);
    background: var(--drawer-top-background-color);
    align-items: center;
    color: white;
    display: flex;
    border-right: 1px solid var(--drawer-top-border-right-color);
    margin-right: -1px;
    padding: 15px;
    box-sizing: border-box;

    &-image {
      height: var(--drawer-top-image-height);
      background-repeat: no-repeat;
      background-size: auto 100%;
      width: 178px;
    }

    &-version {
      color: var(--drawer-top-version-color);
      font-size: var(--font-size-xs);
    }
  }

  &_collapsed {
    width: var(--drawer-width-collapsed);

    .vc-drawer-item__title {
      display: none;
    }

    .vc-drawer__top-image {
      width: var(--drawer-top-image-height);
    }

    .vc-drawer__top-version {
      display: none;
    }
  }
}
</style>
