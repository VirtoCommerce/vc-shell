<template>
  <VcLoading
    v-if="!isReady"
    active
    class="vc-app__loader"
  />
  <div
    v-else
    class="vc-app"
    :class="{
      'vc-app_mobile': $isMobile.value,
    }"
  >
    <!-- Init application top bar -->
    <VcAppBar
      class="vc-app__app-bar"
      :logo="logo"
      :title="title"
      :disable-menu="disableMenu"
      @menubutton:click="($refs.menu as Record<'isMobileVisible', boolean>).isMobileVisible = true"
      @backlink:click="closeBlade(blades.length - 1)"
      @logo:click="openRoot"
    >
      <template #app-switcher>
        <slot name="app-switcher">
          <VcAppSwitcher
            :apps-list="appsList"
            @on-click="switchApp($event)"
          />
        </slot>
      </template>

      <!-- Toolbar slot -->
      <template #toolbar>
        <slot
          name="toolbar"
          v-bind="{
            LanguageSelector,
            UserDropdownButton,
            NotificationDropdown,
            ThemeSelector,
          }"
        >
          <slot
            v-if="$slots['toolbar:prepend']"
            name="toolbar:prepend"
          ></slot>
          <slot name="toolbar:theme-selector">
            <ThemeSelector />
          </slot>
          <slot name="toolbar:language-selector">
            <LanguageSelector
              v-if="$isDesktop.value ? $isDesktop.value : $isMobile.value ? route.path === '/' : false"
            />
          </slot>
          <slot name="toolbar:notifications-dropdown">
            <NotificationDropdown />
          </slot>
          <slot
            name="toolbar:user-dropdown"
            :user-dropdown="UserDropdownButton"
          >
            <UserDropdownButton
              :avatar-url="avatar"
              :role="role"
              :name="name"
            />
          </slot>
        </slot>
      </template>
    </VcAppBar>

    <div class="vc-app__main-content">
      <!-- Init main menu -->
      <VcAppMenu
        v-if="!disableMenu"
        ref="menu"
        class="vc-app__app-menu"
        :version="version"
        @item:click="onMenuItemClick"
      >
      </VcAppMenu>

      <!-- Blade navigation -->
      <div
        v-if="isAuthenticated"
        class="vc-app__workspace"
      >
        <slot name="blade-navigation">
          <VcBladeNavigation />
        </slot>
      </div>

      <!-- Popup container -->
      <VcPopupContainer />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, provide } from "vue";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import {
  VcPopupContainer,
  LanguageSelector,
  UserDropdownButton,
  useAppSwitcher,
  useBladeNavigation,
  NotificationDropdown,
  BladeRoutesRecord,
  ThemeSelector,
} from "./../../../../shared/components";
import { useNotifications, useUser } from "../../../../core/composables";
import { useRoute, useRouter } from "vue-router";
import { watchOnce } from "@vueuse/core";
import { MenuItem } from "../../../../core/types";

export interface Props {
  isReady: boolean;
  logo?: string;
  version?: string;
  title?: string;
  avatar?: string;
  name?: string;
  disableMenu?: boolean;
  role?: string;
}

defineOptions({
  inheritAttrs: false,
});

defineSlots<{
  "app-switcher": void;
  toolbar: (props: {
    UserDropdownButton: typeof UserDropdownButton;
    LanguageSelector: typeof LanguageSelector;
    NotificationDropdown: typeof NotificationDropdown;
  }) => void;
  "toolbar:prepend": void;
  "toolbar:language-selector": void;
  "toolbar:notifications-dropdown": void;
  "toolbar:user-dropdown": (props: { userDropdown: typeof UserDropdownButton }) => void;
  "blade-navigation": void;
  "toolbar:theme-selector": void;
}>();

const props = defineProps<Props>();

console.debug("vc-app: Init vc-app");

const internalRoutes = inject("bladeRoutes") as BladeRoutesRecord[];
const dynamicModules = inject("$dynamicModules", undefined) as Record<string, unknown> | undefined;
const router = useRouter();

const { openBlade, closeBlade, resolveBladeByName, blades } = useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();

const { loadFromHistory } = useNotifications();
const route = useRoute();
const { isAuthenticated } = useUser();
const routes = router.getRoutes();

const onMenuItemClick = function (item: MenuItem) {
  console.debug(`vc-app#onMenuItemClick() called.`);
  if (item.routeId) {
    openBlade(
      {
        blade: resolveBladeByName(item.routeId),
      },
      true,
    );
  } else if (!item.routeId && item.url) {
    const menuRoute = routes.find((r) => {
      return "/" + r.path.split("/").filter((part) => part !== "")[1] === item.url || r.path === item.url;
    });
    if (typeof menuRoute === "undefined") {
      openRoot();
    } else {
      router.push({ name: menuRoute?.name, params: route.params });
    }
  }
};

const openRoot = async () => {
  const isPrevented = await closeBlade(1);

  if (!isPrevented) {
    const mainRoute = routes.find((route) => route.meta?.root);
    const mainRouteAlias = routes.find((route) => route.aliasOf?.path === mainRoute?.path) ?? mainRoute;

    router.push({ name: mainRouteAlias?.name, params: route.params });
  }
};

watchOnce(
  () => props.isReady,
  async (newVal) => {
    if (isAuthenticated.value && newVal) {
      await loadFromHistory();
      await getApps();
    }
  },
);

provide("internalRoutes", internalRoutes);
provide("$dynamicModules", dynamicModules);
</script>

<style lang="scss">
:root {
  --app-background: var(--secondary-200);
}

.vc-app {
  @apply tw-flex tw-flex-col tw-w-full tw-h-full tw-box-border tw-m-0 tw-overflow-hidden tw-text-base;
  background: var(--app-background);

  &__loader {
    background: var(--app-background);
  }

  &__app-bar {
    @apply tw-shrink-0;
  }

  &__app-menu {
    @apply tw-shrink-0;
  }

  &__main-content {
    @apply tw-overflow-hidden tw-flex tw-grow tw-basis-0;
  }

  &__workspace {
    @apply tw-px-2 tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative;

    .vc-app_mobile & {
      @apply tw-p-0;
    }
  }

  &__user-dropdown-button {
    @apply tw-p-0 tw-mb-2 tw-w-full tw-h-auto;
  }
}
</style>
