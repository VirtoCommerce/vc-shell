<template>
  <div class="vc-app-bar">
    <!-- Logo container for mobile devices -->
    <template v-if="$isMobile.value">
      <!-- Show logo on mobile dashboard -->
      <img
        v-if="workspace.length === 0"
        class="vc-app-bar__logo"
        :src="logo"
        @click="$emit('logo:click')"
      />

      <!-- Show workspace name when at least one blade is opened -->
      <div
        v-else-if="workspace.length === 1"
        class="vc-ellipsis vc-font-size_header"
      >
        {{ workspace[0].title }}
      </div>

      <!-- Show back link when more than one blade is opened -->
      <vc-link v-else @click="$emit('backlink:click')">
        <vc-icon icon="fas fa-chevron-left" size="s"></vc-icon>
        <span class="vc-margin-left_s vc-font-size_l">{{ $t("Back") }}</span>
      </vc-link>
    </template>

    <!-- Logo container for desktop devices -->
    <template v-else>
      <img class="vc-app-bar__logo" :src="logo" @click="$emit('logo:click')" />
      <div class="vc-app-bar__version" @click="$emit('version:click')">
        {{ version }}
      </div>
    </template>

    <!-- Product name slot -->
    <div class="vc-app-bar__product-name" v-if="$slots['productName']">
      <slot name="productName"></slot>
    </div>

    <!-- Additional spacer -->
    <div class="vc-flex-grow_1"></div>

    <!-- Toolbar container -->
    <div class="vc-flex vc-fill_height">
      <template v-for="(item, index) in buttons" :key="index">
        <template v-if="item.isVisible === undefined || item.isVisible">
          <!-- Draw custom component is it is passed -->
          <component
            v-if="item.component"
            :is="item.component"
            v-bind="item.componentOptions"
            :isAccent="item.isAccent"
            :openPage="openPage"
            :closePage="closePage"
          ></component>

          <!-- Otherwise draw default toolbar button -->
          <div
            v-else
            class="vc-app-bar__button"
            :class="{ 'vc-app-bar__button_accent': item.isAccent }"
            :title="item.title"
            @click="$emit('button:click', item)"
          >
            <vc-icon
              :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
              size="xl"
            ></vc-icon>
          </div>
        </template>
      </template>
    </div>

    <!-- Show menu toggler on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="vc-app-bar__mobile-toggler vc-flex vc-flex-align_center vc-flex-justify_center vc-fill_height"
      @click="$emit('menubutton:click')"
    >
      <vc-icon icon="fas fa-bars"></vc-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "VcAppBar",
});
</script>

<script lang="ts" setup>
import VcIcon from "../../../../atoms/vc-icon/vc-icon.vue";
import { IBladeToolbar, IPage } from "../../../../../typings";

defineProps({
  logo: {
    type: String,
    default: "",
  },

  version: {
    type: String,
    default: "",
  },

  workspace: {
    type: Array as PropType<IPage[]>,
    default: () => [],
  },

  buttons: {
    type: Array as PropType<IBladeToolbar[]>,
    default: () => [],
  },

  openPage: {
    type: Function,
    default: undefined,
  },

  closePage: {
    type: Function,
    default: undefined,
  },
});

defineEmits([
  "logo:click",
  "backlink:click",
  "version:click",
  "toolbarbutton:click",
  "menubutton:click",
]);
</script>

<style lang="less">
:root {
  --app-bar-height: 60px;
  --app-bar-background-color: #ffffff;
  --app-bar-button-width: 50px;
  --app-bar-button-border-color: var(--app-bar-background-color);
  --app-bar-button-color: #7e8e9d;
  --app-bar-button-background-color: var(--app-bar-background-color);
  --app-bar-button-color-hover: #34414f;
  --app-bar-button-background-color-hover: var(--app-bar-background-color);
  --app-bar-version-color: #838d9a;
  --app-bar-product-name-color: #34414f;
  --app-bar-product-name-size: 20px;
}

.vc-app-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--app-bar-height);
  background-color: var(--app-bar-background-color);
  padding-left: var(--padding-l);

  &__logo {
    height: 50%;
    cursor: pointer;
  }

  &__version {
    color: var(--app-bar-version-color);
    font-size: var(--font-size-xs);
    margin-left: 30px;
  }

  &__product-name {
    color: var(--app-bar-product-name-color);
    font-size: var(--app-bar-product-name-size);
    font-weight: var(--font-weight-medium);
    margin-left: 30px;
  }

  &__button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--app-bar-button-width);
    border-left: 1px solid var(--app-bar-button-border-color);
    cursor: pointer;
    color: var(--app-bar-button-color);
    background-color: var(--app-bar-button-background-color);
    transition: color 0.2s ease;

    &:hover {
      color: var(--app-bar-button-color-hover);
      background-color: var(--app-bar-button-background-color-hover);
    }

    &_accent:before {
      content: "";
      display: block;
      position: absolute;
      right: 12px;
      top: 18px;
      width: 7px;
      height: 7px;
      background: #ff4a4a;
      border-radius: 50%;
      z-index: 1;
    }
  }

  &__mobile-toggler {
    color: #319ed4;
    width: var(--app-bar-button-width);
  }
}
</style>
