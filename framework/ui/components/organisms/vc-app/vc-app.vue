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
      'vc-app--mobile': $isMobile.value,
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
          <!-- Phase 2: loading state while dynamic modules install -->
          <div
            v-if="!modulesReady"
            class="vc-app__modules-loading"
          >
            <VcLoading active />
            <p class="vc-app__modules-loading-text">Loading modules...</p>
          </div>
          <!-- Phase 2: error state when ALL modules fail to load -->
          <div
            v-else-if="modulesLoadError"
            class="vc-app__modules-error"
          >
            <VcIcon
              icon="fas fa-exclamation-triangle"
              size="xl"
            />
            <p class="vc-app__modules-error-title">Failed to load modules</p>
            <p class="vc-app__modules-error-text">
              Unable to load application modules. Please check your connection and try refreshing the page.
            </p>
          </div>
          <!-- Normal workspace when modules are ready -->
          <template v-else>
            <VcBladeNavigation />
            <!-- AI Agent Panel (shown when plugin is installed) -->
            <VcAiAgentPanel v-if="aiAgentConfig?.url" />
          </template>
        </div>
      </slot>

      <!-- Popup container -->
      <VcPopupContainer />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { inject, provide, ref, computed } from "vue";
import DesktopLayout from "@ui/components/organisms/vc-app/_internal/layouts/DesktopLayout.vue";
import MobileLayout from "@ui/components/organisms/vc-app/_internal/layouts/MobileLayout.vue";
import { VcPopupContainer, BladeRoutesRecord } from "@shared/components";
import type { AppDescriptor } from "@core/api/platform";
import type { MenuItem } from "@core/types";
import type { SidebarStateReturn } from "@core/composables/useSidebarState";
import { VcAiAgentPanel } from "@core/plugins/ai-agent";
import type { IAiAgentConfig } from "@core/plugins/ai-agent";
import { useRoute } from "vue-router";
import { AppRootElementKey, DynamicModulesKey, BladeRoutesKey, ModulesReadyKey, ModulesLoadErrorKey } from "@framework/injection-keys";
import { createLogger } from "@core/utilities";
import { provideSidebarState } from "@core/composables/useSidebarState";
import { provideAppBarState } from "@ui/components/organisms/vc-app/_internal/app-bar/composables/useAppBarState";
import { useShellBootstrap } from "@ui/components/organisms/vc-app/composables/useShellBootstrap";
import { useShellNavigation } from "@ui/components/organisms/vc-app/composables/useShellNavigation";
import { useShellLifecycle } from "@ui/components/organisms/vc-app/composables/useShellLifecycle";

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
const isEmbedded = route.query.EmbeddedMode === "true";

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
const internalRoutes = inject(BladeRoutesKey)!;
const dynamicModules = inject(DynamicModulesKey, undefined);
const aiAgentConfig = inject<IAiAgentConfig | undefined>("aiAgentConfig", undefined);
const aiAgentAddGlobalToolbarButton = inject<boolean>("aiAgentAddGlobalToolbarButton", true);

// Phase 2: module loading completion and error state
// Default ref(true) = backward-compatible: no dynamic modules means immediately ready
// Default ref(false) = backward-compatible: no dynamic modules means no error
const modulesReadyRef = inject(ModulesReadyKey, ref(true));
const modulesReady = computed(() => modulesReadyRef.value);
const modulesLoadErrorRef = inject(ModulesLoadErrorKey, ref(false));
const modulesLoadError = computed(() => modulesLoadErrorRef.value);

// Bootstrap: provide services + register default shell UI
useShellBootstrap({
  isEmbedded,
  internalRoutes,
  dynamicModules,
  aiAgentConfig,
  aiAgentAddGlobalToolbarButton,
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

    .vc-app--mobile & {
      @apply tw-p-0;
    }
  }

  &__modules-loading {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-full tw-gap-4;

    &-text {
      @apply tw-text-sm tw-font-normal;
      color: var(--neutrals-500);
    }
  }

  &__modules-error {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-full tw-gap-3;

    &-title {
      @apply tw-text-lg tw-font-semibold;
      color: var(--base-text-color, var(--neutrals-800));
    }

    &-text {
      @apply tw-text-sm tw-font-normal tw-text-center tw-max-w-md;
      color: var(--neutrals-500);
    }
  }

  &__user-dropdown-button {
    @apply tw-p-0 tw-mb-2 tw-w-full tw-h-auto;
  }

  &--mobile {
    .vc-app__main-content {
      @apply tw-flex-col;
    }
  }
}
</style>
