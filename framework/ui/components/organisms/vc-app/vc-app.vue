<template>
  <VcLoading
    v-if="!isAppReady"
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
      />

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
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { inject, provide, watch, ref, onUnmounted, computed, useSlots } from "vue";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import { provideAppSlots } from "./composables/useAppSlots";
import {
  VcPopupContainer,
  useBladeNavigation,
  NotificationDropdown,
  BladeRoutesRecord,
} from "./../../../../shared/components";
import { useAppSwitcher } from "../../../../shared/components/app-switcher/composables/useAppSwitcher";
import { provideAppBarWidget, useNotifications } from "../../../../core/composables";
import { useRoute, useRouter } from "vue-router";
import { watchOnce } from "@vueuse/core";
import { MenuItem } from "../../../../core/types";
import { provideSettingsMenu } from "../../../../core/composables/useSettingsMenu";
import { LanguageSelector } from "../../../../shared/components/language-selector";
import { ThemeSelector } from "../../../../shared/components/theme-selector";
import { ChangePasswordButton } from "../../../../shared/components/change-password-button";
import { LogoutButton } from "../../../../shared/components/logout-button";
import { provideGlobalSearch } from "../../../../core/composables/useGlobalSearch";
import { provideDashboardService } from "../../../../core/composables/useDashboard";
import { DynamicModulesKey, EMBEDDED_MODE, AuthProviderKey } from "../../../../injection-keys";
import { provideMenuService } from "../../../../core/composables/useMenuService";
import { provideAppBarMobileButtonsService } from "../../../../core/composables/useAppBarMobileButtons";
import { useUserManagement } from "../../../../core/composables/useUserManagement";
import { shouldEnablePlatformFeatures } from "../../../../core/providers/auth-provider-utils";

export interface Props {
  isReady: boolean;
  logo?: string;
  version?: string;
  title?: string;
  avatar?: string;
  name?: string;
  disableMenu?: boolean;
  disableAppSwitcher?: boolean;
  role?: string;
}

defineEmits<{
  (e: "logo-click", goToRoot: () => void): void;
}>();

defineOptions({
  inheritAttrs: false,
});

defineSlots<{
  "app-switcher": (props: any) => any;
}>();

const props = defineProps<Props>();
const slots = useSlots();

console.debug("vc-app: Init vc-app");

const internalRoutes = inject("bladeRoutes") as BladeRoutesRecord[];
const dynamicModules = inject(DynamicModulesKey, undefined);

// Inject auth provider to check if platform features should be enabled
const authProvider = inject(AuthProviderKey);

// Automatically disable app switcher for custom authentication providers
const shouldDisableAppSwitcher = computed(() => {
  // If explicitly disabled via prop, respect that
  if (props.disableAppSwitcher) return true;

  // If using custom auth provider, disable platform-specific features
  if (!shouldEnablePlatformFeatures(authProvider)) {
    console.log("[VcApp] App Switcher disabled - custom authentication provider detected");
    return true;
  }

  return false;
});

const isAppReady = ref(props.isReady);

const route = useRoute();
const router = useRouter();

const isEmbedded = route.query.EmbeddedMode === "true";

const { openBlade, closeBlade, resolveBladeByName, blades, goToRoot } = useBladeNavigation();
const { appsList, switchApp, getApps } = useAppSwitcher();

const { loadFromHistory, notifications } = useNotifications();

const { isAuthenticated } = useUserManagement();

const routes = router.getRoutes();

const { register: registerMenuItem } = provideSettingsMenu();
const { register: registerAppBarWidget } = provideAppBarWidget();

const hasUnreadNotifications = computed(() => {
  return notifications.value.some((item) => item.isNew);
});

const { register: registerMobileButton } = provideAppBarMobileButtonsService();

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

registerAppBarWidget({
  id: "notification-dropdown",
  component: NotificationDropdown,
  icon: "lucide-bell",
  order: 10,
  badge: () => hasUnreadNotifications.value,
});

registerMobileButton({
  id: "notification-dropdown",
  component: NotificationDropdown,
  icon: "lucide-bell",
  order: 10,
  isVisible: !isEmbedded,
});

const onMenuItemClick = function (item: MenuItem) {
  console.debug(`vc-app#onMenuItemClick() called.`);

  if (item.routeId) {
    const bladeComponent = resolveBladeByName(item.routeId);
    if (bladeComponent) {
      openBlade(
        {
          blade: bladeComponent,
        },
        true,
      );
    } else {
      console.error(`Blade component with routeId '${item.routeId}' not found.`);
    }
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
    isAppReady.value = newVal;
    if (isAuthenticated.value && newVal) {
      await loadFromHistory();
      await getApps();
    }
  },
);

watch(isAuthenticated, (newVal) => {
  isAppReady.value = newVal;
});

provide("internalRoutes", internalRoutes);
provide(DynamicModulesKey, dynamicModules);
provideDashboardService();
provideMenuService();
provideGlobalSearch();
provide(EMBEDDED_MODE, isEmbedded);
// Provide slots to child components with all necessary props and handlers
provideAppSlots(
  slots,
  {
    disableMenu: props.disableMenu,
    disableAppSwitcher: shouldDisableAppSwitcher.value,
    version: props.version,
    avatar: props.avatar,
    name: props.name,
    role: props.role,
    appsList: appsList,
    isEmbedded,
  },
  {
    onMenuItemClick,
    switchApp,
  },
);

onUnmounted(() => {
  isAppReady.value = false;
});
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
