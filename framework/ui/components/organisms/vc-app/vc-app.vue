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

    <div class="vc-app__main-content">
      <!-- Init main menu -->
      <VcAppBar
        class="vc-app__app-bar"
        :logo="logo"
        :title="title"
        :disable-menu="disableMenu"
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

        <template #logo:append>
          <slot name="logo:append"></slot>
        </template>

        <!-- Toolbar slot -->
        <template #toolbar>
          <slot name="toolbar" />
        </template>

        <template #notifications-dropdown>
          <NotificationDropdown />
        </template>

        <template #navmenu>
          <VcAppMenu
            v-if="!disableMenu"
            ref="menu"
            class="vc-app__app-menu"
            :version="version"
            @item:click="onMenuItemClick"
          >
          </VcAppMenu>
        </template>

        <template #user-dropdown>
          <UserDropdownButton
            :avatar="avatar"
            :name="name"
            :role="role"
          />
        </template>
      </VcAppBar>

      <!-- Blade navigation -->
      <div
        v-if="isAuthenticated"
        class="vc-app__workspace"
      >
        <VcBladeNavigation />
      </div>

      <!-- Popup container -->
      <VcPopupContainer />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, inject, provide, computed } from "vue";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import {
  VcPopupContainer,
  UserDropdownButton,
  useAppSwitcher,
  useBladeNavigation,
  NotificationDropdown,
  BladeRoutesRecord,
} from "./../../../../shared/components";
import { useNotifications, useUser } from "../../../../core/composables";
import { useRoute, useRouter } from "vue-router";
import { watchOnce, useLocalStorage } from "@vueuse/core";
import { MenuItem } from "../../../../core/types";
import { useToolbarSlots } from "./composables/useToolbarSlots";
import { useSettingsMenu, SettingsMenuKey } from "../../../../shared/composables/useSettingsMenu";
import { LanguageSelector } from "../../../../shared/components/language-selector";
import { ThemeSelector } from "../../../../shared/components/theme-selector";
import { ChangePasswordButton } from "../../../../shared/components/change-password-button";
import { LogoutButton } from "../../../../shared/components/logout-button";
import { useI18n } from "vue-i18n";
import { createGlobalSearch } from "../../../../core/composables/useGlobalSearch";

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
  toolbar: void;
  "toolbar:user-dropdown": (props: { userDropdown: typeof UserDropdownButton }) => void;
  "toolbar:language-selector": void;
  "toolbar:theme-selector": void;
  "logo:append": void;
}>();

const props = defineProps<Props>();

console.debug("vc-app: Init vc-app");

const internalRoutes = inject("bladeRoutes") as BladeRoutesRecord[];
const dynamicModules = inject("$dynamicModules", undefined) as Record<string, unknown> | undefined;
const router = useRouter();
createGlobalSearch();

const { openBlade, closeBlade, resolveBladeByName, blades, goToRoot } = useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();

const { loadFromHistory } = useNotifications();
const route = useRoute();
const { isAuthenticated } = useUser();
const routes = router.getRoutes();

const { getToolbarMenuItems } = useToolbarSlots();

const settingsMenu = useSettingsMenu();
provide(SettingsMenuKey, settingsMenu);

const { t } = useI18n({ useScope: "global" });

const { registerMenuItem } = settingsMenu;

registerMenuItem({
  id: "language-selector",
  component: LanguageSelector,
  order: 20,
});

registerMenuItem({
  id: "theme-selector",
  component: ThemeSelector,
  order: 10,
});

registerMenuItem({
  id: "change-password",
  component: ChangePasswordButton,
  order: 30,
});

registerMenuItem({
  id: "logout",
  component: LogoutButton,
  order: 100,
});

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
    router.push(goToRoot());
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
    @apply tw-w-full tw-overflow-hidden tw-flex tw-grow tw-basis-0 tw-relative;

    .vc-app_mobile & {
      @apply tw-p-0;
    }
  }

  &__user-dropdown-button {
    @apply tw-p-0 tw-mb-2 tw-w-full tw-h-auto;
  }

  &_mobile {
    .vc-app__main-content {
      @apply tw-flex-col;
    }
  }
}
</style>
