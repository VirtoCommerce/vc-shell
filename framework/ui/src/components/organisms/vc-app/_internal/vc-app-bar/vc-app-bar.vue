<template>
  <div
    class="relative flex items-center content-between h-[var(--app-bar-height)] bg-[color:var(--app-bar-background-color)] pl-4"
  >
    <!-- Logo container for mobile devices -->
    <template v-if="$isMobile.value">
      <!-- Show logo on mobile dashboard -->
      <img
        v-if="workspace.length === 0"
        class="h-3/6 cursor-pointer"
        :src="logo"
        @click="$emit('logo:click')"
      />

      <!-- Show workspace name when at least one blade is opened -->
      <div
        v-else-if="workspace.length === 1"
        class="overflow-ellipsis overflow-hidden whitespace-nowrap text-[length:var(--font-size-header)] leading-[var(--line-height-header)]"
      >
        {{ workspace[0].title }}
      </div>

      <!-- Show back link when more than one blade is opened -->
      <VcLink v-else @click="$emit('backlink:click')">
        <VcIcon icon="fas fa-chevron-left" size="s"></VcIcon>
        <span class="ml-s text-lg">{{ $t("Back") }}</span>
      </VcLink>
    </template>

    <!-- Logo container for desktop devices -->
    <template v-else>
      <img
        class="h-3/6 cursor-pointer"
        :src="logo"
        @click="$emit('logo:click')"
      />
      <div
        class="text-[color:var(--app-bar-version-color)] text-xs ml-[30px]"
        @click="$emit('version:click')"
      >
        {{ version }}
      </div>
    </template>

    <!-- Product name slot -->
    <div
      class="text-[color:var(--app-bar-product-name-color)] text-[length:var(--app-bar-product-name-size)] font-medium ml-[30px]"
      v-if="$slots['productName']"
    >
      <slot name="productName"></slot>
    </div>

    <!-- Additional spacer -->
    <div class="grow basis-0"></div>

    <!-- Toolbar container -->
    <div class="flex h-full box-border">
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
            class="relative flex items-center justify-center w-[var(--app-bar-button-width)] border-l border-solid border-[color:var(--app-bar-button-border-color)] cursor-pointer text-[color: var(--app-bar-button-color)] bg-[color:var(--app-bar-button-background-color)] transition-[color] duration-200 hover:text-[color:var(--app-bar-button-color-hover)] hover:bg-[color:var(--app-bar-button-background-color-hover)]"
            :class="{ 'vc-app-bar__button_accent': item.isAccent }"
            :title="item.title"
            @click="$emit('button:click', item)"
          >
            <VcIcon
              :icon="typeof item.icon === 'function' ? item.icon() : item.icon"
              size="xl"
            ></VcIcon>
          </div>
        </template>
      </template>
    </div>

    <!-- Show menu toggler on mobile devices -->
    <div
      v-if="$isMobile.value"
      class="text-[#319ed4] w-[var(--app-bar-button-width)] flex items-center justify-center h-full box-border"
      @click="$emit('menubutton:click')"
    >
      <VcIcon icon="fas fa-bars"></VcIcon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
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

<style lang="scss">
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
  &__button {
    &_accent:before {
      @apply content-[""] block absolute right-3 top-[18px] w-[7px] h-[7px] bg-[#ff4a4a] rounded-full z-[1];
    }
  }
}
</style>
