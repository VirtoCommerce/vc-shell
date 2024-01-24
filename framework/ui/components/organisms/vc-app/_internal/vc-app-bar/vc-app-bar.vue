<template>
  <div
    class="tw-relative tw-flex tw-items-center tw-content-between tw-h-[var(--app-bar-height)] tw-bg-[color:var(--app-bar-background-color)] tw-px-4 tw-shadow-[0px_2px_5px_0px_#3654751A]"
    :class="{ '!tw-pr-0 !tw-pl-[10px]': $isMobile.value }"
  >
    <slot name="app-switcher"></slot>

    <template v-if="!$isMobile.value || blades.length === 0">
      <!-- Logo -->
      <img
        class="tw-h-1/2 tw-cursor-pointer tw-mx-3"
        alt="logo"
        :src="logo"
        @click="$emit('logo:click')"
      />

      <!-- Title -->
      <div
        v-if="title"
        class="tw-text-[color:var(--app-bar-product-name-color)] tw-text-[length:var(--app-bar-product-name-size)] tw-font-medium"
      >
        {{ title }}
      </div>
    </template>

    <template v-if="$isMobile.value">
      <!-- Show blades name when at least one blade is opened -->
      <div
        v-if="blades.length === 1"
        class="tw-overflow-ellipsis tw-overflow-hidden tw-whitespace-nowrap tw-text-2xl tw-leading-header tw-ml-2"
      >
        {{ toValue(blades[blades.length - 1]?.props?.navigation?.instance)?.title || "" }}
      </div>

      <!-- Show back link when more than one blade is opened -->
      <VcLink
        v-else-if="blades.length > 1"
        class="tw-ml-3"
        @click="$emit('backlink:click')"
      >
        <VcIcon
          icon="fas fa-chevron-left"
          size="s"
        ></VcIcon>
        <span class="tw-ml-2 tw-text-lg">{{ t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.VC_APP_BAR.BACK") }}</span>
      </VcLink>
    </template>

    <!-- Additional spacer -->
    <div class="tw-grow tw-basis-0"></div>

    <!-- Toolbar container -->
    <div class="tw-flex tw-h-full tw-box-border">
      <slot name="toolbar"></slot>
    </div>

    <!-- Show menu toggler on mobile devices -->
    <div
      v-if="!disableMenu && $isMobile.value"
      class="tw-text-[#319ed4] tw-w-[var(--app-bar-button-width)] tw-flex tw-items-center tw-justify-center tw-h-full tw-box-border tw-cursor-pointer"
      @click="$emit('menubutton:click')"
    >
      <VcIcon icon="fas fa-bars"></VcIcon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { VcIcon, VcLink } from "./../../../../";
import { IBladeToolbar } from "./../../../../../../core/types";
import { useBladeNavigation } from "./../../../../../../shared";
import { toValue } from "vue";

export interface Props {
  logo?: string;
  title?: string;
  disableMenu?: boolean;
}

export interface Emits {
  (event: "logo:click"): void;
  (event: "backlink:click"): void;
  (event: "menubutton:click"): void;
  (event: "button:click", item: IBladeToolbar): void;
}

defineProps<Props>();

defineEmits<Emits>();

const { t } = useI18n({ useScope: "global" });

const { blades } = useBladeNavigation();
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
  --app-bar-product-name-color: #34414f;
  --app-bar-product-name-size: 20px;
}
</style>
