<template>
  <div
    class="tw-relative tw-flex tw-items-center tw-content-between tw-h-[var(--app-bar-height)] tw-bg-[color:var(--app-bar-background-color)] tw-pl-4"
  >
    <slot name="appSwitcher"></slot>
    <!-- Logo container for mobile devices -->
    <template v-if="$isMobile.value">
      <!-- Show logo on mobile dashboard -->
      <img
        v-if="blades.length === 0"
        class="h-3/6 tw-cursor-pointer"
        alt="logo"
        :src="logo"
        @click="$emit('logo:click')"
      />

      <!-- Show blades name when at least one blade is opened -->
      <div
        v-else-if="blades.length === 1"
        class="tw-overflow-ellipsis tw-overflow-hidden tw-whitespace-nowrap tw-text-2xl tw-leading-header"
      >
        {{ blades[0].title }}
      </div>

      <!-- Show back link when more than one blade is opened -->
      <VcLink v-else @click="$emit('backlink:click')">
        <VcIcon icon="fas fa-chevron-left" size="s"></VcIcon>
        <span class="tw-ml-2 tw-text-lg">{{ $t("Back") }}</span>
      </VcLink>
    </template>

    <!-- Logo container for desktop devices -->
    <template v-else>
      <img
        class="tw-h-3/6 tw-cursor-pointer"
        :src="logo"
        alt="logo"
        @click="$emit('logo:click')"
      />
      <div
        class="tw-text-[color:var(--app-bar-version-color)] tw-text-xs tw-ml-[30px]"
        @click="$emit('version:click')"
      >
        {{ version }}
      </div>
    </template>

    <!-- Product name slot -->
    <div
      class="tw-text-[color:var(--app-bar-product-name-color)] tw-text-[length:var(--app-bar-product-name-size)] tw-font-medium tw-ml-[30px]"
      v-if="title"
    >
      {{ title }}
    </div>

    <!-- Additional spacer -->
    <div class="tw-grow tw-basis-0 tw-basis-0"></div>

    <!-- Toolbar container -->
    <div class="tw-flex tw-h-full tw-box-border">
      <template v-for="(item, index) in buttons" :key="index">
        <template v-if="item.isVisible === undefined || item.isVisible">
          <!-- Draw custom component is it is passed -->
          <component
            v-if="item.component"
            :is="item.component"
            v-bind="item.bladeOptions"
            :isAccent="item.isAccent"
          ></component>

          <!-- Otherwise draw default toolbar button -->
          <div
            v-else
            class="tw-relative tw-flex tw-items-center tw-justify-center tw-w-[var(--app-bar-button-width)] tw-border-l tw-border-solid tw-border-[color:var(--app-bar-button-border-color)] tw-cursor-pointer tw-text-[color: var(--app-bar-button-color)] tw-bg-[color:var(--app-bar-button-background-color)] tw-transition-[color] tw-duration-200 hover:tw-text-[color:var(--app-bar-button-color-hover)] hover:tw-bg-[color:var(--app-bar-button-background-color-hover)]"
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
      class="tw-text-[#319ed4] tw-w-[var(--app-bar-button-width)] tw-flex tw-items-center tw-justify-center tw-h-full tw-box-border tw-cursor-pointer"
      @click="$emit('menubutton:click')"
    >
      <VcIcon icon="fas fa-bars"></VcIcon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@/ui/components";
import { IBladeToolbar } from "@/core/types";
import { IBladeElement } from "@/shared";

export interface Props {
  logo: string;
  version: string;
  blades: IBladeElement[];
  buttons: IBladeToolbar[];
  title?: string;
}

withDefaults(defineProps<Props>(), {
  logo: "",
  version: "",
  blades: () => [],
  buttons: () => [],
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
      @apply tw-content-[""] tw-block tw-absolute tw-right-3 tw-top-[18px] tw-w-[7px] tw-h-[7px] tw-bg-[#ff4a4a] tw-rounded-full tw-z-[1];
    }
  }
}
</style>