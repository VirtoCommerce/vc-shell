<template>
  <div
    class="vc-app-menu"
    :class="{
      'vc-app-menu_collapsed': $isDesktop.value && isCollapsed,
      'vc-app-menu_mobile': $isMobile.value,
      'vc-app-menu_mobile-visible': isMobileVisible,
    }"
  >
    <!-- Show backdrop overlay on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="vc-app-menu__overlay"
      @click="isMobileVisible = false"
    ></div>
    <div class="vc-app-menu__inner">
      <!-- Show menu close handler on mobile devices -->
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
          @click="isMobileVisible = false"
        ></vc-icon>
      </div>

      <!-- Show menu collapse toggler on desktop devices -->
      <div
        v-if="$isDesktop.value"
        class="vc-app-menu__toggle"
        @click="isCollapsed = !isCollapsed"
      >
        <vc-app-menu-item sticky="sticky" icon="fas fa-bars"></vc-app-menu-item>
      </div>

      <!-- Show scrollable area with menu items -->
      <vc-container :noPadding="true" class="vc-app-menu__content">
        <template v-for="(item, index) in items" :key="index">
          <vc-app-menu-item
            v-if="item.isVisible"
            v-bind="item"
            @click="
              $emit('item:click', item);
              isMobileVisible = false;
            "
          />
        </template>
      </vc-container>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import VcContainer from "../../../../atoms/vc-container/vc-container.vue";

export default defineComponent({
  name: "VcAppMenu",

  components: { VcAppMenuItem, VcContainer },

  props: {
    // Array of menu items
    items: {
      type: Array,
      default: () => [],
    },

    // LocalStorage field name for menu collapsed state
    storageCollapsedProperty: {
      type: String,
      default: "menuCollapsed",
    },
  },

  emits: ["item:click"],

  setup(props) {
    const isMobileVisible = ref(false);

    let isCollapsedInitial = false;
    try {
      isCollapsedInitial = JSON.parse(
        localStorage.getItem(props.storageCollapsedProperty) || "false"
      );
    } catch (err) {
      isCollapsedInitial = false;
    }
    const isCollapsed = ref(isCollapsedInitial);

    watch(isCollapsed, (value) => {
      localStorage.setItem(props.storageCollapsedProperty, `${value}`);
    });

    return {
      isMobileVisible,
      isCollapsed,
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

  &__toggle {
    --app-menu-item-icon-color: #319ed4;
  }
}
</style>
