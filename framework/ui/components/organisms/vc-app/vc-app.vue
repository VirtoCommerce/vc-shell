<template>
  <VcLoading
    v-if="!isReady"
    active
    class="vc-app__loader"
  />
  <div
    v-else
    class="vc-app tw-flex tw-flex-col tw-w-full tw-h-full tw-box-border tw-m-0 tw-overflow-hidden tw-text-base"
    :class="[
      `vc-theme_${theme}`,
      {
        'vc-app_touch': $isTouch,
        'vc-app_phone': $isPhone.value,
        'vc-app_mobile': $isMobile.value,
      },
    ]"
  >
    <!-- Init application top bar -->
    <VcAppBar
      class="tw-shrink-0"
      :logo="logo"
      :title="title"
      :disable-menu="disableMenu"
      @menubutton:click="($refs.menu as Record<'isMobileVisible', boolean>).isMobileVisible = true"
      @backlink:click="closeBlade(blades.length - 1)"
      @logo:click="openRoot"
    >
      <template #app-switcher>
        <slot
          v-if="!$slots['app-switcher']"
          name="app-switcher"
        >
          <VcAppSwitcher
            :apps-list="appsList"
            @on-click="switchApp($event)"
          />
        </slot>
      </template>

      <!-- Toolbar slot -->
      <template #toolbar>
        <slot
          v-if="$slots['toolbar:prepend']"
          name="toolbar:prepend"
        ></slot>
        <slot
          v-if="!$slots['toolbar:language-selector']"
          name="toolbar:language-selector"
        >
          <LanguageSelector v-if="$isDesktop.value ? $isDesktop.value : $isMobile.value ? route.path === '/' : false" />
        </slot>
        <slot name="toolbar:notifications-dropdown">
          <NotificationDropdown />
        </slot>
        <template v-if="$isDesktop.value">
          <slot
            name="toolbar:user-dropdown"
            :user-dropdown="UserDropdownButton"
          >
            <UserDropdownButton />
          </slot>
        </template>
      </template>
    </VcAppBar>

    <div class="tw-overflow-hidden tw-flex tw-grow tw-basis-0">
      <!-- Init main menu -->
      <VcAppMenu
        v-if="!disableMenu"
        ref="menu"
        class="tw-shrink-0"
        :version="version"
        @item:click="onMenuItemClick"
      >
        <template #mobile>
          <UserDropdownButton class="tw-p-0 tw-mb-2 tw-w-full tw-h-auto" />
        </template>
      </VcAppMenu>

      <!-- Blade navigation -->
      <div
        v-if="isAuthenticated"
        class="vc-app__workspace tw-px-2 tw-w-full tw-overflow-hidden !tw-flex tw-grow tw-basis-0 tw-relative"
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
} from "./../../../../shared/components";
import { useNotifications, useUser } from "../../../../core/composables";
import { useRoute, useRouter } from "vue-router";
import { watchOnce } from "@vueuse/core";
import { MenuItem } from "../../../../core/types";

export interface Props {
  isReady: boolean;
  logo?: string;
  version?: string;
  theme?: "light" | "dark";
  title?: string;
  disableMenu?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

defineSlots<{
  "app-switcher": void;
  toolbar: void;
  "toolbar:prepend": void;
  "toolbar:language-selector": void;
  "toolbar:notifications-dropdown": void;
  "toolbar:user-dropdown": (props: { userDropdown: typeof UserDropdownButton }) => void;
  "blade-navigation": void;
}>();

const props = defineProps<Props>();

console.debug("vc-app: Init vc-app");

const internalRoutes = inject("bladeRoutes") as BladeRoutesRecord[];
const router = useRouter();

const { openBlade, closeBlade, resolveBladeByName, blades } = useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();

const { loadFromHistory } = useNotifications();
const route = useRoute();
const { isAuthenticated } = useUser();

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
    router.push(item.url);
  }
};

const openRoot = async () => {
  const isPrevented = await closeBlade(1);

  if (!isPrevented) {
    const mainRoute = router.getRoutes().find((route) => route.meta?.root);
    const mainRouteAlias = router.getRoutes().find((route) => route.aliasOf?.path === mainRoute?.path) ?? mainRoute;

    router.replace({ name: mainRouteAlias?.name, params: route.params });
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
</script>

<style lang="scss">
:root {
  --app-background: #eff2fa;
}

.vc-app {
  background: var(--app-background);

  &__workspace {
    .vc-app_mobile & {
      @apply tw-p-0;
    }
  }

  &__loader {
    background: var(--app-background);
  }
}
</style>
