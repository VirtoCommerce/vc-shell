<template>
  <VcLoading
    v-if="!isAppReady"
    active
    class="vc-app__loader"
  />
  <div
    v-else
    ref="appRootRef"
    class="vc-app"
    :class="{
      'vc-app_mobile': $isMobile.value,
    }"
  >
    <div class="vc-app__main-content">
      <!-- Layout: desktop sidebar or mobile top bar -->
      <slot
        name="layout"
        :is-mobile="$isMobile.value"
        :sidebar="sidebar"
        :apps-list="appsList"
        :switch-app="switchApp"
        :open-root="openRoot"
        :handle-menu-item-click="handleMenuItemClick"
      >
        <component
          :is="$isDesktop.value ? DesktopLayout : MobileLayout"
          :logo="logo"
          :avatar="avatar"
          :user-name="name"
          :user-role="role"
          :title="title"
          :disable-menu="disableMenu"
          :disable-app-switcher="disableAppSwitcher"
          :apps-list="appsList"
          @logo:click="openRoot"
          @item:click="handleMenuItemClick"
          @switch-app="switchApp"
        >
          <template
            v-if="$slots['app-switcher'] && !disableAppSwitcher"
            #app-switcher="{ appsList: slotAppsList, switchApp: slotSwitchApp }"
          >
            <slot
              name="app-switcher"
              :apps-list="slotAppsList"
              :switch-app="slotSwitchApp"
            />
          </template>
          <template
            v-if="$slots.menu"
            #menu="menuScope"
          >
            <slot
              name="menu"
              v-bind="menuScope"
            />
          </template>
          <template
            v-if="$slots['sidebar-header']"
            #sidebar-header="headerScope"
          >
            <slot
              name="sidebar-header"
              v-bind="headerScope"
            />
          </template>
          <template
            v-if="$slots['sidebar-footer']"
            #sidebar-footer="footerScope"
          >
            <slot
              name="sidebar-footer"
              v-bind="footerScope"
            />
          </template>
        </component>
      </slot>

      <!-- Blade navigation / workspace -->
      <slot
        name="workspace"
        :is-authenticated="isAuthenticated"
      >
        <div
          v-if="isAuthenticated"
          class="vc-app__workspace"
        >
          <VcBladeNavigation />
          <!-- AI Agent Panel (shown when plugin is installed) -->
          <VcAiAgentPanel v-if="aiAgentConfig?.url" />
        </div>
      </slot>

      <!-- Popup container -->
      <VcPopupContainer />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { inject, provide, ref } from "vue";
import DesktopLayout from "./_internal/layouts/DesktopLayout.vue";
import MobileLayout from "./_internal/layouts/MobileLayout.vue";
import { VcPopupContainer, BladeRoutesRecord } from "./../../../../shared/components";
import type { AppDescriptor } from "../../../../core/api/platform";
import type { MenuItem } from "../../../../core/types";
import type { SidebarStateReturn } from "./composables/useSidebarState";
import { VcAiAgentPanel } from "../../../../core/plugins/ai-agent";
import type { IAiAgentConfig } from "../../../../core/plugins/ai-agent";
import { useRoute, useRouter } from "vue-router";
import { AppRootElementKey, DynamicModulesKey } from "../../../../injection-keys";
import { createLogger } from "../../../../core/utilities";
import { provideSidebarState } from "./composables/useSidebarState";
import { provideAppBarState } from "./_internal/app-bar/composables/useAppBarState";
import { useShellBootstrap } from "./composables/useShellBootstrap";
import { useShellNavigation } from "./composables/useShellNavigation";
import { useShellLifecycle } from "./composables/useShellLifecycle";
import { defaultFeatures, SHELL_FEATURES_KEY } from "../../../../core/shell-features";
import type { ShellFeature } from "../../../../core/types/shell-feature";

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
  /** Custom shell features. Defaults to notifications + settings. */
  features?: ShellFeature[];
}

defineOptions({
  inheritAttrs: false,
});

defineSlots<{
  "app-switcher"?: (props: { appsList: AppDescriptor[]; switchApp: (app: AppDescriptor) => void }) => unknown;
  layout?: (props: {
    isMobile: boolean;
    sidebar: SidebarStateReturn;
    appsList: AppDescriptor[];
    switchApp: (app: AppDescriptor) => void;
    openRoot: () => void;
    handleMenuItemClick: (item: MenuItem) => void;
  }) => unknown;
  menu?: (props: { expanded: boolean; onItemClick: (item: MenuItem) => void }) => unknown;
  "sidebar-header"?: (props: { logo?: string; expanded: boolean; isMobile: boolean }) => unknown;
  "sidebar-footer"?: (props: { avatar?: string; name?: string; role?: string }) => unknown;
  workspace?: (props: { isAuthenticated: boolean }) => unknown;
}>();

const props = defineProps<Props>();

const logger = createLogger("vc-app");
logger.debug("Init vc-app");

const route = useRoute();
const router = useRouter();
const isEmbedded = route.query.EmbeddedMode === "true";

// Resolve features: prop > injection > defaults
const features = props.features ?? inject(SHELL_FEATURES_KEY, defaultFeatures);

// App root element ref (for scoped Teleport targets)
const appRootRef = ref<HTMLElement>();
provide(AppRootElementKey, appRootRef);

// Sidebar state (provide to all children)
const sidebar = provideSidebarState();
provideAppBarState();

// Lifecycle: isReady/isAuthenticated watchers
const { isAppReady, isAuthenticated, appsList, switchApp } = useShellLifecycle(props);

// Navigation: menu click handling + blade resolution
const { handleMenuItemClick, openRoot } = useShellNavigation();

// Injected config from parent
const internalRoutes = inject("bladeRoutes") as BladeRoutesRecord[];
const dynamicModules = inject(DynamicModulesKey, undefined);
const aiAgentConfig = inject<IAiAgentConfig | undefined>("aiAgentConfig", undefined);
const aiAgentAddGlobalToolbarButton = inject<boolean>("aiAgentAddGlobalToolbarButton", true);

// Bootstrap: provide services + process features
useShellBootstrap(features, {
  isEmbedded,
  internalRoutes,
  dynamicModules,
  aiAgentConfig,
  aiAgentAddGlobalToolbarButton,
  context: { router, route, isAuthenticated, isEmbedded },
});
</script>

<style lang="scss">
:root {
  --app-background: var(--secondary-200);
  // Shared transition timing for synchronized animations
  --app-panel-transition-duration: 0.3s;
  --app-panel-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
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
