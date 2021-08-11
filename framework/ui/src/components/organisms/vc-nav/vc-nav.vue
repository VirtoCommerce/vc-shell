<template>
  <div class="vc-nav" :class="{ 'vc-nav_collapsed': collapsed }">
    <div class="vc-nav__top">
      <div
        class="vc-nav__top-image"
        :style="{ 'background-image': `url(${logo})` }"
      ></div>
      <div class="vc-nav__top-version">{{ version }}</div>
    </div>
    <vc-nav-toggle @click="toggleCollapsed()"></vc-nav-toggle>
    <vc-container class="vc-nav__content">
      <vc-nav-item icon="fas fa-home" to="/" sticky="sticky" title="Home" />
      <vc-nav-item
        v-for="item in items"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
        @click="$emit('itemClick', item)"
      />
      <vc-nav-item icon="fas fa-ellipsis-h" sticky="sticky" title="More" />
    </vc-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcNavItem from "../../molecules/vc-nav-item/vc-nav-item.vue";
import VcNavToggle from "../../molecules/vc-nav-toggle/vc-nav-toggle.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";

export default defineComponent({
  components: { VcNavItem, VcNavToggle, VcContainer },

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
.vc-nav {
  width: var(--nav-width);
  height: 100%;
  border-right: 1px solid var(--nav-border-right-color);
  background: var(--nav-background-color);

  &__top {
    height: var(--nav-top-height);
    background: var(--nav-top-background-color);
    align-items: center;
    color: white;
    display: flex;
    border-right: 1px solid var(--nav-top-border-right-color);
    margin-right: -1px;
    padding: 15px;
    box-sizing: border-box;

    &-image {
      height: var(--nav-top-image-height);
      background-repeat: no-repeat;
      background-size: auto 100%;
      width: 178px;
    }

    &-version {
      color: var(--nav-top-version-color);
      font-size: var(--font-size-xs);
    }
  }

  &_collapsed {
    width: var(--nav-width-collapsed);

    .vc-nav-item__title {
      display: none;
    }

    .vc-nav__top-image {
      width: var(--nav-top-image-height);
    }

    .vc-nav__top-version {
      display: none;
    }
  }
}
</style>
