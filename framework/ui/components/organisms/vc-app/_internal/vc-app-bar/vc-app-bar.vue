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

    <AppBarHeader
      :logo="logo"
      :expanded="state.isSidebarExpanded"
      @logo:click="$emit('logo:click')"
      @toggle-menu="toggleDropdown"
    />

    <AppBarMenu
      v-model:is-open="state.isDropdownOpen"
      :menu-button-ref="menuButtonRef"
      @toggle-menu="toggleDropdown"
    >
      <template #toolbar>
        <slot name="toolbar" />
      </template>
      <template
        v-if="$isDesktop.value"
        #app-switcher
      >
        <slot name="app-switcher" />
      </template>
      <template
        v-if="state.isNavigationOpen"
        #navmenu
      >
        <slot name="navmenu" />
      </template>
      <template
        v-if="state.isNavigationOpen"
        #user-dropdown
      >
        <slot name="user-dropdown" />
      </template>
    </AppBarMenu>

    <AppBarContent :is-content-open="shouldShowContent">
      <template #navmenu>
        <slot name="navmenu" />
      </template>
      <template #user-dropdown>
        <slot name="user-dropdown" />
      </template>
    </AppBarContent>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcIcon } from "../../../../";
import { default as AppBarHeader } from "./_internal/AppBarHeader.vue";
import { default as AppBarMenu } from "./_internal/AppBarMenu.vue";
import { default as AppBarContent } from "./_internal/AppBarContent.vue";
import { IBladeToolbar } from "../../../../../../core/types";
import { ChevronLeftIcon } from "../../../../atoms/vc-icon/icons";
import { useAppBarStateProvider } from "../../composables/useAppBarState";

export interface Props {
  logo?: string;
  title?: string;
  disableMenu?: boolean;
}

export interface Emits {
  (event: "logo:click"): void;
  (event: "backlink:click"): void;
  (event: "button:click", item: IBladeToolbar): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { state, toggleDropdown, toggleSidebar, shouldShowContent } = useAppBarStateProvider();

const menuButtonRef = ref<HTMLElement | null>(null);
</script>

<style lang="scss">
:root {
  --app-bar-height: 82px;
  --app-bar-mobile-height: 70px;
  --app-bar-width: 246px;
  --app-bar-collapsed-width: 76px;
  --app-bar-logo-width: 125px;
  --app-bar-logo-height: 46px;
  --app-bar-background-color: var(--neutrals-50);
  --app-bar-button-width: 50px;
  --app-bar-padding: 18px;
  --app-bar-collapse-button-width: 26px;
  --app-bar-collapse-button-height: 26px;
  --app-bar-collapse-button-border-radius: 3px;
  --app-bar-collapse-button-border-color: var(--neutrals-400);
  --app-bar-collapse-button-bg-color: var(--neutrals-50);
  --app-bar-collapse-button-icon-color: var(--neutrals-500);
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
}

.vc-app-bar {
  @apply tw-relative tw-flex tw-flex-col tw-w-[var(--app-bar-width)];
  background-color: var(--app-bar-background-color);
  @apply tw-box-border;

  &__collapse-button {
    @apply tw-absolute tw-right-[-16px] tw-top-[50%] tw-translate-y-[-50%]
           tw-w-[var(--app-bar-collapse-button-width)] tw-h-[var(--app-bar-collapse-button-height)] tw-rounded-[var(--app-bar-collapse-button-border-radius)] tw-bg-[var(--app-bar-collapse-button-bg-color)]
           tw-border tw-border-[var(--app-bar-collapse-button-border-color)] tw-border-solid
           tw-flex tw-items-center tw-justify-center tw-cursor-pointer
           tw-opacity-0 tw-transition-opacity tw-duration-300 tw-z-[1001];

    &-wrap {
      @apply tw-flex tw-items-center tw-justify-center;
    }

    &-icon {
      @apply tw-transition-transform tw-duration-300 tw-text-[var(--app-bar-collapse-button-icon-color)];
    }
  }

  &:hover &__collapse-button {
    @apply tw-opacity-100;
  }

  &--collapsed {
    @apply tw-w-[var(--app-bar-collapsed-width)];

    .vc-app-bar__collapse-button {
      svg {
        @apply tw-rotate-180;
      }
    }
  }

  &__logo {
    @apply tw-cursor-pointer tw-max-w-[var(--app-bar-logo-width)] tw-max-h-[var(--app-bar-logo-height)] tw-mx-2;
  }

  &__title {
    @apply tw-text-[color:var(--app-bar-product-name-color)] tw-font-medium;
    font-size: var(--app-bar-product-name-size);
  }

  &--mobile {
    @apply tw-w-full tw-z-[1001];
  }
}
</style>
