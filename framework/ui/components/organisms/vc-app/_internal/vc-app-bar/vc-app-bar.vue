<template>
  <div
    class="vc-app-bar"
    :class="{ 'vc-app-bar--mobile': $isMobile.value }"
  >
    <div class="vc-app-bar__header">
      <template v-if="!$isMobile.value || quantity === 0">
        <div class="tw-w-auto tw-h-[var(--app-bar-height)] tw-flex tw-items-center">
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
        <!-- <div
        v-if="title && $isDesktop.value"
        class="vc-app-bar__title"
      >
        {{ title }}
      </div> -->
      </template>
      <div
        ref="referenceButton"
        class="vc-app-bar__menu-button"
        @click="toggleMenu"
      >
        <div class="vc-app-bar__menu-button-wrap">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 11H11M1 6H11M1 1H11"
              stroke="#737373"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div
            v-if="hasUnreadNotifications"
            class="vc-app-bar__menu-button-accent"
          ></div>
        </div>
      </div>
    </div>

    <div
      v-if="isMenuOpen"
      v-on-click-outside="[
        () => {
          isMenuOpen = false;
        },
        { ignore: [referenceButton] },
      ]"
      class="vc-app-bar__menu"
    >
      <div class="vc-app-bar__menu-header">
        <slot name="toolbar"></slot>
        <div class="vc-app__spacer"></div>

        <div class="vc-app-bar__menu-close-button">
          <VcButton
            icon-class="vc-app-bar__menu-close-button-icon"
            icon="fas fa-times"
            icon-size="l"
            text
            @click.stop="toggleMenu"
          >
          </VcButton>
        </div>
      </div>

      <div class="vc-app-bar__menu-content">
        <!-- Dropdowns -->
        <div
          id="vc-app-bar__menu-dropdowns"
          class="vc-app-bar__menu-dropdowns"
        ></div>

        <slot name="app-switcher"></slot>
      </div>
    </div>

    <!-- <slot name="app-switcher"></slot> -->

    <!-- <template v-if="isMenuOpen">
      <div class="vc-app-bar__menu"></div>
    </template>

    <template v-if="$isMobile.value">
      Show blades name when at least one blade is opened
      <div
        v-if="quantity === 1"
        class="vc-app-bar__blade-title"
      >
        {{ viewTitle }}
      </div>

      Show back link when more than one blade is opened
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
    </template> -->

    <div class="vc-app-bar__content">
      <slot name="navmenu"></slot>
    </div>

    <!-- Additional spacer -->
    <!-- <div class="vc-app__spacer"></div> -->

    <!-- Toolbar container -->
    <!-- <div class="vc-app__toolbar">
      <slot name="toolbar"></slot>
    </div> -->

    <div class="vc-app-bar__footer">
      <slot name="user-dropdown"></slot>
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
import { Ref, computed, ref } from "vue";
import { watchDebounced } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import { useNotifications } from "../../../../../../core/composables";

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
const { notifications } = useNotifications();

const { blades } = useBladeNavigation();

const viewTitle: Ref<string> = ref("");
const quantity = ref();
const isMenuOpen = ref(false);
const referenceButton = ref<HTMLElement | null>(null);

const hasUnreadNotifications = computed(() => {
  return notifications.value.some((item) => item.isNew);
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

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
  --app-bar-height: 82px;
  --app-bar-width: 246px;
  --app-bar-logo-width: 125px;
  --app-bar-logo-height: 46px;
  --app-bar-background-color: var(--neutrals-50);
  --app-bar-button-width: 50px;
  --app-bar-header-bottom-border-color: var(--neutrals-200);
  --app-bar-button-color: var(--neutrals-500);
  --app-bar-button-background-color: var(--app-bar-background-color);
  --app-bar-button-color-hover: var(--neutrals-600);
  --app-bar-button-background-color-hover: var(--app-bar-background-color);
  --app-bar-product-name-color: var(--neutrals-600);
  --app-bar-product-name-size: 20px;
  --app-bar-toolbar-icon-background-hover: var(--neutrals-600);
  --app-bar-divider-color: var(--additional-50);
  --app-bar-account-info-role-color: var(--neutrals-400);

  --app-bar-content-visible-border-color: var(--primary-500);
  --app-bar-burger-color: var(--primary-500);

  --app-bar-shadow-color: var(--additional-950);
  --app-bar-shadow: 0px 2px 4px 0px rgba(var(--app-bar-shadow-color), 0.07);
}

.vc-app-bar {
  @apply tw-relative tw-flex tw-flex-col tw-w-[var(--app-bar-width)];
  background-color: var(--app-bar-background-color);
  @apply tw-box-border;
}

.vc-app-bar__menu-button {
  @apply tw-cursor-pointer tw-relative;

  &-wrap {
    @apply tw-relative;
  }

  &-accent {
    @apply tw-block tw-absolute tw-right-[-7px] tw-top-[-5px]
           tw-w-[5px] tw-h-[5px]
           tw-bg-[color:var(--notification-dropdown-accent-color)]
           tw-rounded-full tw-z-[1];
  }
}

.vc-app-bar__header {
  @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-4;
  border-bottom: 1px solid var(--app-bar-border-color);
}

.vc-app-bar__menu-close-button {
  @apply tw-pr-4 tw-flex tw-items-center tw-justify-center;
}

.vc-app-bar__menu-close-button-icon {
  @apply tw-text-[color:var(--app-bar-button-color)];
}

.vc-app-bar__content {
  @apply tw-flex-grow tw-px-4;
  // border-top: 1px solid var(--app-bar-header-bottom-border-color);
}

.vc-app-bar__menu-content {
  @apply tw-relative;

  &:before {
    content: "";
    @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px] tw-bg-[color:var(--app-bar-header-bottom-border-color)] tw-z-[1];
  }

  .vc-app-bar__menu-dropdowns:not(:empty) {
    &:before {
      content: "";
      @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px] tw-bg-[color:var(--app-bar-content-visible-border-color)] tw-z-[1] #{!important};
    }
  }
}

.vc-app-bar__footer {
  @apply tw-flex-none;
}

.vc-app-bar__menu {
  @apply tw-w-full tw-h-full tw-absolute tw-top-0 tw-left-0 tw-z-[999] tw-bg-[color:var(--app-bar-background-color)];
}

.vc-app-bar__menu-header {
  @apply tw-flex tw-h-[var(--app-bar-height)];
  // border-bottom: 1px solid var(--app-bar-header-bottom-border-color);
}

.vc-app-bar__menu-dropdowns {
  @apply tw-w-full tw-h-full tw-invisible;

  &:not(:empty) {
    @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-header-bottom-border-color)] tw-z-[2];
  }
}

.vc-app-bar--mobile {
  @apply tw-pr-0 tw-pl-3 #{!important};
}

.vc-app-bar__logo {
  @apply tw-cursor-pointer tw-max-w-[var(--app-bar-logo-width)] tw-max-h-[var(--app-bar-logo-height)] tw-mx-2;

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
