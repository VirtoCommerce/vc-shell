<template>
  <div
    class="vc-app-bar"
    :class="{
      'vc-app-bar--mobile': $isMobile.value,
      'vc-app-bar--collapsed': !state.isSidebarExpanded,
    }"
  >
    <div
      v-if="!$isMobile.value"
      class="vc-app-bar__collapse-button"
      @click="toggleSidebar"
    >
      <div class="vc-app-bar__collapse-button-wrap">
        <VcIcon
          class="vc-app-bar__collapse-button-icon"
          :icon="ChevronLeftIcon"
          size="xs"
        />
      </div>
    </div>

    <div
      class="vc-app-bar__wrapper"
      :class="{ 'vc-app-bar__wrapper--mobile': $isMobile.value }"
    >
      <AppBarHeader
        :logo="logo"
        :expanded="state.isSidebarExpanded"
        @logo:click="$emit('logo:click')"
        @toggle-menu="toggleMenu"
      >
        <template #notifications>
          <slot name="notifications-dropdown" />
        </template>
        <template
          v-if="$slots['logo:append']"
          #logo:append
        >
          <slot name="logo:append"></slot>
        </template>
      </AppBarHeader>

      <AppBarOverlay
        v-if="shouldShowOverlay"
        :is-sidebar-mode="state.isMenuOpen"
        :expanded="state.isSidebarExpanded"
      >
        <component
          :is="overlayContent"
          v-bind="overlayProps"
        />
      </AppBarOverlay>

      <MenuSidebar
        v-if="state.isMenuOpen"
        :is-opened="state.isMenuOpen"
        :expanded="state.isSidebarExpanded"
        @update:is-opened="handleMenuClose"
      >
        <template #toolbar>
          <slot name="notifications-dropdown" />
          <slot name="toolbar" />
        </template>
        <template #navmenu>
          <slot name="navmenu" />
        </template>
        <template #user-dropdown>
          <slot name="user-dropdown" />
        </template>
        <template #app-switcher>
          <slot name="app-switcher" />
        </template>
        <template #active-content>
          <div
            v-if="shouldShowInMenu"
            :class="['vc-app-bar__menu-dropdowns', { 'vc-app-bar__menu-dropdowns--mobile': $isMobile.value }]"
          >
            <component
              :is="overlayContent"
              v-bind="overlayProps || {}"
            />
          </div>
        </template>
      </MenuSidebar>

      <AppBarContent
        v-if="$isDesktop.value"
        :expanded="state.isSidebarExpanded"
      >
        <template #navmenu>
          <slot name="navmenu" />
        </template>
        <template #user-dropdown>
          <slot name="user-dropdown" />
        </template>
      </AppBarContent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "../../../../";
import { ChevronLeftIcon } from "../../../../atoms/vc-icon/icons";
import { useAppMenuState } from "../composables/useAppMenuState";
import { useAppBarOverlay } from "./composables/useAppBarOverlay";
import AppBarHeader from "./_internal/AppBarHeader.vue";
import AppBarOverlay from "./_internal/AppBarOverlay.vue";
import MenuSidebar from "./_internal/MenuSidebar.vue";
import AppBarContent from "./_internal/AppBarContent.vue";
import { ref, computed, provide } from "vue";
import { vOnClickOutside } from "@vueuse/components";

export interface Props {
  logo?: string;
  title?: string;
  disableMenu?: boolean;
}

export interface Emits {
  (event: "logo:click"): void;
  (event: "backlink:click"): void;
}

interface Slots {
  "notifications-dropdown": () => void;
  toolbar: () => void;
  "app-switcher": () => void;
  navmenu: () => void;
  "user-dropdown": () => void;
  "logo:append": () => void;
}

defineProps<Props>();
defineEmits<Emits>();
defineSlots<Slots>();

const { state, toggleSidebar, toggleMenu: toggleMenuState, closeAll } = useAppMenuState();
const { overlayContent, overlayProps, hideContent, isOverlayed } = useAppBarOverlay();

const menuButtonRef = ref<HTMLElement | null>(null);

// Provide appMenuState для дочерних компонентов
provide("appMenuState", { closeAll });

const toggleMenu = () => {
  toggleMenuState();
  if (!state.value.isMenuOpen) {
    hideContent();
  }
};

const handleMenuClose = (value: boolean) => {
  if (!value) {
    closeAll();
    hideContent();
  }
};

const handleClickOutside = () => {
  closeAll();
  hideContent();
};

const shouldShowOverlay = computed(() => {
  return isOverlayed.value || (!state.value.isMenuOpen && overlayContent.value);
});

const shouldShowInMenu = computed(() => {
  return overlayContent.value && !isOverlayed.value && state.value.isMenuOpen;
});
</script>

<style lang="scss">
:root {
  // Sizes
  --app-bar-height: 70px;
  --app-bar-collapsed-height: 94px;
  --app-bar-mobile-height: 58px;
  --app-bar-width: 246px;
  --app-bar-mobile-width: 300px;
  --app-bar-collapsed-width: 76px;
  --app-bar-padding: 18px;
  --app-bar-padding-mobile: 28px;

  // Logo
  --app-bar-logo-width: 125px;
  --app-bar-logo-height: 46px;
  --app-bar-logo-mobile-width: 46px;
  --app-bar-logo-mobile-height: 46px;
  // Collapse button
  --app-bar-collapse-button-width: 26px;
  --app-bar-collapse-button-height: 26px;
  --app-bar-collapse-button-border-radius: 3px;

  // Colors
  --app-bar-background: var(--neutrals-50);
  --app-bar-border: var(--neutrals-200);
  --app-bar-button: var(--neutrals-500);
  --app-bar-button-hover: var(--neutrals-600);
  --app-bar-product-name: var(--neutrals-600);
  --app-bar-divider: var(--additional-50);
  --app-bar-account-info-role: var(--neutrals-400);
  --app-bar-content-visible-border: var(--primary-500);
  --app-bar-burger: var(--primary-500);

  // Transition
  --app-bar-transition-duration: 0.1s;
  --app-bar-transition-timing-function: linear;
}

.vc-app-bar {
  @apply tw-relative tw-flex tw-flex-col;
  width: var(--app-bar-width);
  background-color: var(--app-bar-background);
  transition: width var(--app-bar-transition-duration) var(--app-bar-transition-timing-function);

  &__collapse-button {
    @apply tw-absolute tw-right-[-16px] tw-top-[50%] tw-translate-y-[-50%] tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-opacity-0 tw-transition-opacity tw-duration-300 tw-z-[12];
    width: var(--app-bar-collapse-button-width);
    height: var(--app-bar-collapse-button-height);
    border-radius: var(--app-bar-collapse-button-border-radius);
    background-color: var(--app-bar-background);
    border: 1px solid var(--app-bar-border);

    &-wrap {
      @apply tw-flex tw-items-center tw-justify-center;
    }

    &-icon {
      @apply tw-transition-transform tw-duration-300;
      color: var(--app-bar-button);
    }
  }

  &:hover &__collapse-button {
    @apply tw-opacity-100;
  }

  &--collapsed {
    width: var(--app-bar-collapsed-width);

    .vc-app-bar__collapse-button svg {
      @apply tw-rotate-180;
    }
  }

  &__logo {
    @apply tw-cursor-pointer tw-mx-2;
    max-width: var(--app-bar-logo-width);
    max-height: var(--app-bar-logo-height);
  }

  &__title {
    @apply tw-font-medium;
    color: var(--app-bar-product-name);
  }

  &--mobile {
    @apply tw-w-full;
  }

  &__wrapper {
    @apply tw-h-full tw-relative;

    // &--mobile {
    //   height: var(--app-bar-mobile-height);
    // }
  }

  &__menu-dropdowns {
    @apply tw-overflow-auto tw-max-h-[250px];
  }
}
</style>
