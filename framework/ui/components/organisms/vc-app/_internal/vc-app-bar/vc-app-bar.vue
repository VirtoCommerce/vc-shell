<template>
  <div
    v-if="$isDesktop.value"
    class="vc-app-bar--padding"
    :class="{
      'vc-app-bar--padding-expanded': state.isSidebarExpanded,
    }"
  ></div>
  <div
    class="vc-app-bar"
    :class="appBarClasses"
    @mouseenter="$isDesktop.value && !state.isSidebarExpanded && handleHoverExpand(true)"
    @mouseleave="$isDesktop.value && !state.isSidebarExpanded && handleHoverExpand(false)"
  >
    <div
      class="vc-app-bar__wrap"
      :class="wrapClasses"
    >
      <div
        v-if="!$isMobile.value"
        class="vc-app-bar__collapse-button"
        @click="toggleSidebar"
      >
        <div class="vc-app-bar__collapse-button-wrap">
          <Transition name="rotate">
            <VcIcon
              v-show="true"
              class="vc-app-bar__collapse-button-icon"
              :icon="ChevronLeftIcon"
              size="xs"
              :class="{ 'rotate-180': !state.isSidebarExpanded }"
            />
          </Transition>
        </div>
      </div>

      <div
        class="vc-app-bar__wrapper"
        :class="{
          'vc-app-bar__wrapper--mobile': $isMobile.value,
          'vc-app-bar__wrapper--hover-collapsed': $isDesktop.value && !isHoverExpanded && !state.isSidebarExpanded,
        }"
      >
        <AppBarHeader
          :logo="logo"
          :expanded="state.isSidebarExpanded"
          class="vc-app-bar__header"
          :class="{
            'vc-app-bar__header--hover-expanded': $isDesktop.value && isHoverExpanded && !state.isSidebarExpanded,
            'vc-app-bar__header--collapsed': $isDesktop.value && !state.isSidebarExpanded && !isHoverExpanded,
          }"
          @logo:click="$emit('logo:click')"
          @toggle-menu="toggleMenu"
        >
          <template #notifications>
            <slot name="notifications-dropdown" />
          </template>
        </AppBarHeader>

        <Transition name="overlay">
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
        </Transition>

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
import { ref, computed, provide, inject } from "vue";
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
}

const props = defineProps<Props>();
defineEmits<Emits>();
defineSlots<Slots>();

const {
  state,
  toggleSidebar,
  toggleMenu: toggleMenuState,
  closeAll,
  toggleHoverExpanded,
  isHoverExpanded,
} = useAppMenuState();
const { overlayContent, overlayProps, hideContent, isOverlayed } = useAppBarOverlay();

const isMobile = inject("isMobile", ref(false));
const isDesktop = inject("isDesktop", ref(true));

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

// Simple hover effect processing
const handleHoverExpand = (shouldExpand?: boolean) => {
  toggleHoverExpanded(shouldExpand);
};

const shouldShowOverlay = computed(() => {
  return isOverlayed.value || (!state.value.isMenuOpen && overlayContent.value);
});

const shouldShowInMenu = computed(() => {
  return overlayContent.value && !isOverlayed.value && state.value.isMenuOpen;
});

const appBarClasses = computed(() => {
  return {
    "vc-app-bar--mobile": isMobile.value,
    "vc-app-bar--desktop": isDesktop.value,
    "vc-app-bar--collapsed": !state.value.isSidebarExpanded && isDesktop.value,
    "vc-app-bar--hover-expanded": isDesktop.value && isHoverExpanded.value,
    "vc-app-bar--hover-collapsed": isDesktop.value && !state.value.isSidebarExpanded && !isHoverExpanded.value,
  };
});

const wrapClasses = computed(() => {
  return {
    "vc-app-bar__wrap--mobile-expanded": isMobile.value && state.value.isSidebarExpanded,
    "vc-app-bar__wrap--desktop-collapsed": isDesktop.value && !state.value.isSidebarExpanded,
    "vc-app-bar__wrap--desktop-expanded": isDesktop.value && state.value.isSidebarExpanded,
    "vc-app-bar__wrap--hover-expanded": isDesktop.value && isHoverExpanded.value && !state.value.isSidebarExpanded,
    "vc-app-bar__wrap--hover-collapsed": isDesktop.value && !isHoverExpanded.value && !state.value.isSidebarExpanded,
  };
});
</script>

<style lang="scss">
:root {
  // Sizes
  --app-bar-height: 94px;
  --app-bar-mobile-height: 58px;
  --app-bar-width: 246px;
  --app-bar-mobile-width: 300px;
  --app-bar-collapsed-width: 76px;
  --app-bar-padding: 18px;
  --app-bar-padding-mobile: 28px;
  --app-bar-shadow: 0 16px 10px 0 rgba(0, 0, 0, 0.14);

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
  --app-bar-transition-duration: 200ms;
  --app-bar-hover-transition-duration: 250ms;
  --app-bar-hover-leave-duration: 400ms;
  --app-bar-hover-transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
}

.vc-app-bar {
  @apply tw-relative tw-flex tw-flex-col;
  // transition-property: width, transform, box-shadow;
  // transition-timing-function: var(--app-bar-hover-transition-timing-function);
  // transition-duration: var(--app-bar-hover-transition-duration);
  background-color: var(--app-bar-background);
  // border-right: 1px solid var(--app-bar-border);
  z-index: 50;

  &--desktop {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--app-bar-width);
  }

  &--mobile {
    @apply tw-w-full;
  }

  &--padding {
    @apply tw-w-[var(--app-bar-collapsed-width)];
  }

  &--padding-expanded {
    @apply tw-w-[var(--app-bar-width)];
  }

  &--collapsed {
    width: var(--app-bar-collapsed-width);
    transition:
      width var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function),
      transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);

    &:not(.vc-app-bar--hover-expanded) {
      ~ .vc-app-content {
        margin-left: var(--app-bar-collapsed-width);
        transition: margin-left var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
      }
    }
  }

  &--hover-expanded {
    width: var(--app-bar-width) !important;
    transition-duration: var(--app-bar-hover-transition-duration);

    .vc-app-bar__wrap {
      width: var(--app-bar-width);
    }
  }

  &--hover-collapsed {
    transition-duration: var(--app-bar-hover-leave-duration);
  }

  &__wrap {
    @apply tw-h-full tw-relative;
    transition-property: width, transform, box-shadow;
    transition-timing-function: var(--app-bar-hover-transition-timing-function);
    transition-duration: var(--app-bar-hover-transition-duration);

    &--desktop-collapsed {
      width: var(--app-bar-collapsed-width);
    }

    &--desktop-expanded {
      width: var(--app-bar-width);
    }

    &--hover-expanded {
      @apply tw-fixed tw-top-0 tw-left-0 tw-h-full tw-z-[100];
      width: var(--app-bar-width) !important;
      box-shadow: var(--app-bar-shadow);
      background-color: var(--app-bar-background);
      transition-duration: var(--app-bar-hover-transition-duration);
    }

    &--hover-collapsed {
      transition-duration: var(--app-bar-hover-leave-duration);
    }
  }

  &__collapse-button {
    @apply tw-absolute tw-right-[-13px] tw-top-[50%] tw-translate-y-[-50%] tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-z-[12];
    width: var(--app-bar-collapse-button-width);
    height: var(--app-bar-collapse-button-height);
    border-radius: var(--app-bar-collapse-button-border-radius);
    background-color: var(--app-bar-background);
    border: 1px solid var(--app-bar-border);
    opacity: 0;
    transition: opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);

    &-wrap {
      @apply tw-flex tw-items-center tw-justify-center;
    }

    &-icon {
      color: var(--app-bar-button);
    }
  }

  &:hover &__collapse-button {
    @apply tw-opacity-100;
  }

  &__logo {
    @apply tw-cursor-pointer tw-mx-2;
    max-width: var(--app-bar-logo-width);
    max-height: var(--app-bar-logo-height);
    transition:
      opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function),
      transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
  }

  &__title {
    @apply tw-font-medium;
    color: var(--app-bar-product-name);
    transition:
      opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function),
      transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
  }

  &__wrapper {
    @apply tw-h-full tw-relative;
    transition: opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
  }

  &__menu-dropdowns {
    @apply tw-overflow-auto tw-max-h-[250px];
  }

  &__header {
    transition-property: all, width, transform;
    transition-timing-function: var(--app-bar-hover-transition-timing-function);
    transition-duration: var(--app-bar-hover-transition-duration);

    &--collapsed {
      @apply tw-w-[var(--app-bar-collapsed-width)];
    }

    &--hover-expanded {
      @apply tw-w-[var(--app-bar-collapsed-width)];
    }

    &--hover-collapsed {
      transition-duration: var(--app-bar-hover-leave-duration);
    }
  }
}

.overlay-enter-active,
.overlay-leave-active,
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function),
    transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
}

.overlay-enter-from,
.menu-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.overlay-leave-to,
.menu-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
}

.rotate-180 {
  transform: rotate(180deg);
}

// Анимация контента
.vc-app-content {
  margin-left: var(--app-bar-width);
  transition: margin-left var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
}
</style>
