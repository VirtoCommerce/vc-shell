<template>
  <div
    class="vc-app-menu vc-padding-top_l"
    :class="{
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
        class="vc-app-menu__mobile-close vc-flex vc-flex-justify_end vc-flex-align_center vc-padding_l"
      >
        <VcIcon
          icon="fas fa-times"
          size="xl"
          @click="isMobileVisible = false"
        ></VcIcon>
      </div>

      <!-- Show scrollable area with menu items -->
      <VcContainer :noPadding="true" class="vc-app-menu__content">
        <div
          class="vc-flex vc-flex-column vc-app-menu__content-inner vc-padding-left_l vc-padding-right_l"
        >
          <template
            v-for="(item, index) in mobileMenuItems"
            :key="`info_item_${index}`"
          >
            <template v-if="item.isVisible === undefined || item.isVisible">
              <component
                v-if="item.component"
                :is="item.component"
                v-bind="item.componentOptions"
                class="vc-padding_none vc-margin-bottom_s vc-fill_width"
              ></component>
            </template>
          </template>
          <template v-for="(item, index) in items" :key="index">
            <VcAppMenuItem
              v-if="item.isVisible === undefined || item.isVisible"
              v-bind="item"
              :isActive="item === activeItem"
              :activeChildItem="activeChildItem"
              @click="
                $emit('item:click', item);
                isMobileVisible = false;
              "
              @child:click="
                $emit('item:click', $event);
                isMobileVisible = false;
              "
            />
          </template>
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from "vue";
import VcAppMenuItem from "./_internal/vc-app-menu-item/vc-app-menu-item.vue";
import VcContainer from "../../../../atoms/vc-container/vc-container.vue";
import { IBladeToolbar, IMenuItems } from "../../../../../typings";

defineProps({
  // Array of menu items
  items: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },

  mobileMenuItems: {
    type: Array as PropType<IBladeToolbar[]>,
    default: () => [],
  },

  activeItem: {
    type: Object as PropType<IMenuItems>,
    default: undefined,
  },

  activeChildItem: {
    type: Object as PropType<IMenuItems>,
    default: undefined,
  },
});

defineEmits(["item:click"]);

const isMobileVisible = ref(false);
</script>

<style lang="less">
:root {
  --app-menu-width: 230px;
  --app-menu-width-collapsed: 60px;
  --app-menu-background-color: #ffffff;
}

.vc-app-menu {
  position: relative;
  width: var(--app-menu-width);
  transition: width 0.1s ease;

  &_collapsed {
    width: var(--app-menu-width-collapsed);

    .vc-app-menu-item__title {
      opacity: 0;
    }
  }

  &__content {
    flex-grow: 1;
  }

  &__content-inner {
    gap: 5px;
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
    height: 100%;
  }

  &_mobile &__inner {
    position: absolute;
    z-index: 9999;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    max-width: 60%;
    background: var(--app-menu-background-color);
  }

  &__mobile-close {
    color: #319ed4;
  }

  &__toggle {
    --app-menu-item-icon-color: #319ed4;
  }
}
</style>
