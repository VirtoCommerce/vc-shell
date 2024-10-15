<template>
  <div
    class="vc-app-bar"
    :class="{ 'vc-app-bar--mobile': $isMobile.value }"
  >
    <slot name="app-switcher"></slot>

    <template v-if="!$isMobile.value || quantity === 0">
      <div class="tw-w-auto">
        <!-- Logo -->
        <img
          class="vc-app-bar__logo"
          :class="{
            'vc-app-bar__logo--mobile': $isMobile.value,
          }"
          alt="logo"
          :src="logo"
          @click="$emit('logo:click')"
        />
      </div>

      <!-- Title -->
      <div
        v-if="title && $isDesktop.value"
        class="vc-app-bar__title"
      >
        {{ title }}
      </div>
    </template>

    <template v-if="$isMobile.value">
      <!-- Show blades name when at least one blade is opened -->
      <div
        v-if="quantity === 1"
        class="vc-app-bar__blade-title"
      >
        {{ viewTitle }}
      </div>

      <!-- Show back link when more than one blade is opened -->
      <VcLink
        v-else-if="quantity > 1"
        class="vc-app-bar__backlink"
        @click="$emit('backlink:click')"
      >
        <VcIcon
          icon="fas fa-chevron-left"
          size="s"
        ></VcIcon>
        <span class="vc-app-bar__backlink-text">{{ t("COMPONENTS.ORGANISMS.VC_APP.INTERNAL.VC_APP_BAR.BACK") }}</span>
      </VcLink>
    </template>

    <!-- Additional spacer -->
    <div class="vc-app__spacer"></div>

    <!-- Toolbar container -->
    <div class="vc-app__toolbar">
      <slot name="toolbar"></slot>
    </div>

    <!-- Show menu toggler on mobile devices -->
    <div
      v-if="!disableMenu && $isMobile.value"
      class="vc-app__menu-toggler"
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
import { Ref, ref } from "vue";
import { watchDebounced } from "@vueuse/core";

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

const viewTitle: Ref<string> = ref("");
const quantity = ref();

watchDebounced(
  blades,
  (newVal) => {
    viewTitle.value = newVal[newVal.length - 1]?.props?.navigation?.instance?.title ?? "";

    quantity.value = newVal.length;
  },
  { deep: true, immediate: true, flush: "post", debounce: 1 },
);
</script>

<style lang="scss">
:root {
  --app-bar-height: 60px;
  --app-bar-background-color: var(--additional-50);
  --app-bar-button-width: 50px;
  --app-bar-button-border-color: var(--app-bar-background-color);
  --app-bar-button-color: var(--secondary-600);
  --app-bar-button-background-color: var(--app-bar-background-color);
  --app-bar-button-color-hover: var(--secondary-700);
  --app-bar-button-background-color-hover: var(--app-bar-background-color);
  --app-bar-product-name-color: var(--neutrals-600);
  --app-bar-product-name-size: 20px;
  --app-bar-toolbar-icon-background-hover: var(--neutrals-600);
  --app-bar-divider-color: var(--additional-50);
  --app-bar-account-info-role-color: var(--neutrals-400);

  --app-bar-burger-color: var(--primary-500);

  --app-bar-shadow-color: var(--additional-950);
  --app-bar-shadow: 0px 2px 4px 0px rgba(var(--app-bar-shadow-color), 0.07);
}

.vc-app-bar {
  @apply tw-relative tw-flex tw-items-center tw-justify-between tw-px-4;
  height: var(--app-bar-height);
  background-color: var(--app-bar-background-color);
  box-shadow: var(--app-bar-shadow);
  @apply tw-box-border;
}

.vc-app-bar--mobile {
  @apply tw-pr-0 tw-pl-3 #{!important};
}

.vc-app-bar__logo {
  @apply tw-h-1/2 tw-cursor-pointer tw-mx-4;

  &--mobile {
    @apply tw-mx-1;
  }
}

.vc-app-bar__title {
  @apply tw-text-[color:var(--app-bar-product-name-color)] tw-font-medium;
  font-size: var(--app-bar-product-name-size);
}

.vc-app-bar__blade-title {
  @apply tw-overflow-ellipsis tw-overflow-hidden tw-whitespace-nowrap tw-text-2xl tw-ml-2;
  @apply tw-leading-snug;
}

.vc-app-bar__backlink {
  @apply tw-ml-3;
}

.vc-app-bar__backlink-text {
  @apply tw-ml-2 tw-text-lg;
}

.vc-app__spacer {
  @apply tw-grow tw-basis-0;
}

.vc-app__toolbar {
  @apply tw-flex tw-h-full tw-box-border;
}

.vc-app__menu-toggler {
  @apply tw-text-[color:var(--app-bar-burger-color)] tw-w-12 tw-flex tw-items-center tw-justify-center tw-h-full tw-box-border tw-cursor-pointer;
}
</style>
