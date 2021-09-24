<template>
  <div
    class="vc-app-menu"
    :class="{
      'vc-app-menu_collapsed': $isDesktop.value && collapsed,
      'vc-app-menu_mobile': $isMobile.value,
      'vc-app-menu_mobile-visible': mobileVisible,
    }"
  >
    <div
      v-if="$isMobile.value"
      class="vc-app-menu__overlay"
      @click="toggleMobileMenu"
    ></div>
    <div class="vc-app-menu__inner">
      <div
        v-if="$isMobile.value"
        class="
          vc-app-menu__mobile-close
          vc-flex
          vc-flex-justify_end
          vc-flex-align_center
          vc-padding_l
        "
      >
        <vc-icon
          icon="fas fa-times"
          size="xl"
          @click="toggleMobileMenu"
        ></vc-icon>
      </div>
      <vc-app-menu-toggle
        v-if="$isDesktop.value"
        @click="toggleCollapsed"
      ></vc-app-menu-toggle>
      <vc-container :noPadding="true" class="vc-app-menu__content">
        <vc-app-menu-item
          v-for="item in items"
          :key="item.id"
          v-bind="item"
          @click="toggleMobileMenu"
        />
      </vc-container>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import VcAppMenuToggle from "./_internal/vc-app-menu-toggle/vc-app-menu-toggle.vue";
import VcContainer from "../../../../atoms/vc-container/vc-container.vue";

export default defineComponent({
  name: "VcAppMenu",

  components: { VcAppMenuItem, VcAppMenuToggle, VcContainer },

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
    const mobileVisible = ref(false);

    return {
      mobileVisible,

      toggleCollapsed() {
        emit(props.collapsed ? "expand" : "collapse");
      },

      toggleMobileMenu() {
        mobileVisible.value = !mobileVisible.value;
      },
    };
  },
});
</script>

<style lang="less">
:root {
  --app-menu-width: 240px;
  --app-menu-width-collapsed: 60px;
  --app-menu-background-color: #ffffff;
  --app-menu-border-right-color: #ffffff;
}

.vc-app-menu {
  position: relative;
  width: var(--app-menu-width);
  border-right: 1px solid var(--app-menu-border-right-color);

  &_collapsed {
    width: var(--app-menu-width-collapsed);

    .vc-app-menu-item__title {
      display: none;
    }
  }

  &__content {
    flex-grow: 1;
  }

  &_mobile {
    display: none;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    bottom: 0;
    z-index: 9999;

    &-visible {
      display: block;
    }
  }

  &__overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
    background: #808c99;
    opacity: 0.6;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    background: var(--app-menu-background-color);
    height: 100%;
  }

  &_mobile &__inner {
    position: absolute;
    z-index: 9999;
    right: 0;
    top: 0;
    bottom: 0;
    left: 40%;
  }

  &__mobile-close {
    color: #319ed4;
  }
}
</style>
