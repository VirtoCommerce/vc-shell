<template>
  <!-- Spacer: pushes main content to the right to account for fixed sidebar -->
  <div
    class="desktop-layout__spacer"
    :class="{
      'desktop-layout__spacer--expanded': sidebar.isPinned.value,
    }"
  />

  <!-- Fixed left sidebar -->
  <div
    class="desktop-layout"
    :class="{
      'desktop-layout--collapsed': !sidebar.isPinned.value,
      'desktop-layout--hover-expanded': sidebar.isHoverExpanded.value && !sidebar.isPinned.value,
      'desktop-layout--hover-collapsed': !sidebar.isHoverExpanded.value && !sidebar.isPinned.value,
    }"
    @mouseenter="!sidebar.isPinned.value && sidebar.setHoverExpanded(true)"
    @mouseleave="!sidebar.isPinned.value && sidebar.setHoverExpanded(false)"
  >
    <div
      class="desktop-layout__wrap"
      :class="{
        'desktop-layout__wrap--collapsed': !sidebar.isPinned.value,
        'desktop-layout__wrap--expanded': sidebar.isPinned.value,
        'desktop-layout__wrap--hover-expanded': sidebar.isHoverExpanded.value && !sidebar.isPinned.value,
        'desktop-layout__wrap--hover-collapsed': !sidebar.isHoverExpanded.value && !sidebar.isPinned.value,
      }"
    >
      <!-- Collapse/expand pin button (visible on hover) -->
      <SidebarCollapseButton
        v-show="!sidebar.isMenuOpen.value"
        :collapsed="!sidebar.isPinned.value"
        @click="sidebar.togglePin"
      />

      <slot
        name="sidebar-header"
        :logo="logo"
        :expanded="sidebar.isExpanded.value"
        :is-mobile="false"
      >
        <SidebarHeader
          v-if="showHeader"
          :logo="logo"
          :expanded="sidebar.isExpanded.value"
          :show-burger="sidebar.isExpanded.value"
          :is-menu-open="sidebar.isMenuOpen.value"
          class="desktop-layout__header"
          @logo:click="$emit('logo:click')"
          @toggle-menu="handleToggleMenu"
          @toggle-notifications="handleToggleNotifications"
        />
      </slot>

      <SidebarContent
        :expanded="sidebar.isExpanded.value"
        :avatar="avatar"
        :user-name="userName"
        :user-role="userRole"
        :disable-menu="disableMenu"
        :header-visible="showHeader"
        @item:click="$emit('item:click', $event)"
      >
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
          v-if="$slots['sidebar-footer']"
          #sidebar-footer="footerScope"
        >
          <slot
            name="sidebar-footer"
            v-bind="footerScope"
          />
        </template>
      </SidebarContent>
    </div>
  </div>

  <AppHubPopover
    :show="sidebar.isMenuOpen.value"
    :anchor-ref="appHubAnchorRef"
    :apps-list="appsList"
    :show-applications="!disableAppSwitcher"
    @update:show="handleAppHubVisibility"
    @switch-app="handleSwitchApp"
  >
    <template
      v-if="$slots['app-switcher'] && !disableAppSwitcher"
      #applications="{ appsList: slotAppsList, switchApp: slotSwitchApp }"
    >
      <slot
        name="app-switcher"
        :apps-list="slotAppsList"
        :switch-app="slotSwitchApp"
      />
    </template>
  </AppHubPopover>

  <VcDropdownPanel
    v-model:show="isNotificationsOpen"
    :anchor-ref="notificationAnchorRef"
    placement="right-start"
    width="320px"
    :title="$t('COMPONENTS.NOTIFICATION_DROPDOWN.TITLE')"
  >
    <NotificationDropdown />
  </VcDropdownPanel>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, inject, ref, watch } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import type { MenuItem } from "@core/types";
import { EmbeddedModeKey } from "@framework/injection-keys";
import { useSidebarState } from "@core/composables/useSidebarState";
import { useRoute } from "vue-router";
import SidebarHeader from "@ui/components/organisms/vc-app/_internal/sidebar/SidebarHeader.vue";
import SidebarContent from "@ui/components/organisms/vc-app/_internal/sidebar/SidebarContent.vue";
import SidebarCollapseButton from "@ui/components/organisms/vc-app/_internal/sidebar/SidebarCollapseButton.vue";
import AppHubPopover from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppHubPopover.vue";
import { NotificationDropdown } from "@shared/components";
import { VcDropdownPanel } from "@ui/components";

export interface Props {
  logo?: string;
  title?: string;
  avatar?: string;
  userName?: string;
  userRole?: string;
  disableMenu?: boolean;
  disableAppSwitcher?: boolean;
  appsList?: AppDescriptor[];
}

withDefaults(defineProps<Props>(), {
  disableMenu: false,
  disableAppSwitcher: false,
  appsList: () => [],
});

const emit = defineEmits<{
  (event: "logo:click"): void;
  (event: "item:click", item: MenuItem): void;
  (event: "switch-app", app: AppDescriptor): void;
}>();

defineSlots<{
  "app-switcher"?: (props: { appsList: AppDescriptor[]; switchApp: (app: AppDescriptor) => void }) => unknown;
  menu?: (props: { expanded: boolean; onItemClick: (item: MenuItem) => void }) => unknown;
  "sidebar-header"?: (props: { logo?: string; expanded: boolean; isMobile: boolean }) => unknown;
  "sidebar-footer"?: (props: { avatar?: string; name?: string; role?: string }) => unknown;
}>();

const sidebar = useSidebarState();
const isEmbedded = inject(EmbeddedModeKey, false);
const route = useRoute();
const appHubAnchorRef = ref<HTMLElement | null>(null);
const isNotificationsOpen = ref(false);
const notificationAnchorRef = ref<HTMLElement | null>(null);

const showHeader = computed(() => !isEmbedded);

watch(
  () => route.fullPath,
  () => {
    if (sidebar.isMenuOpen.value) {
      sidebar.closeMenu();
    }
    isNotificationsOpen.value = false;
  },
);

const handleToggleMenu = (event: MouseEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    appHubAnchorRef.value = event.currentTarget;
  }

  if (sidebar.isMenuOpen.value) {
    sidebar.closeMenu();
    return;
  }

  // Close notifications when opening AppHub
  isNotificationsOpen.value = false;

  sidebar.openMenu();
};

const handleToggleNotifications = (event: MouseEvent) => {
  if (event.currentTarget instanceof HTMLElement) {
    notificationAnchorRef.value = event.currentTarget;
  }

  isNotificationsOpen.value = !isNotificationsOpen.value;

  // Close AppHub when opening notifications
  if (isNotificationsOpen.value && sidebar.isMenuOpen.value) {
    sidebar.closeMenu();
  }
};

const handleAppHubVisibility = (value: boolean) => {
  if (!value) {
    sidebar.closeMenu();
    return;
  }

  if (!appHubAnchorRef.value && typeof document !== "undefined") {
    appHubAnchorRef.value = document.querySelector<HTMLElement>(".sidebar-header__menu-button");
  }

  sidebar.openMenu();
};

const handleSwitchApp = (app: AppDescriptor) => {
  sidebar.closeMenu();
  emit("switch-app", app);
};
</script>

<style lang="scss">
:root {
  // Sizes
  --app-bar-height: 70px;
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

.desktop-layout {
  @apply tw-relative tw-flex tw-flex-col;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--app-bar-width);
  background-color: var(--app-bar-background);
  z-index: 50;

  // Show collapse button on hover
  &:hover .sidebar-collapse-button {
    @apply tw-opacity-100;
  }

  &--collapsed {
    width: var(--app-bar-collapsed-width);
    transition:
      width var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function),
      transform var(--app-bar-hover-transition-duration) var(--app-bar-hover-transition-timing-function);
  }

  &--hover-expanded {
    width: var(--app-bar-width) !important;
    transition-duration: var(--app-bar-hover-transition-duration);
  }

  &--hover-collapsed {
    transition-duration: var(--app-bar-hover-leave-duration);
  }

  &__spacer {
    width: var(--app-bar-collapsed-width);

    &--expanded {
      width: var(--app-bar-width);
    }
  }

  &__wrap {
    @apply tw-h-full tw-relative;
    transition-property: width, transform, box-shadow;
    transition-timing-function: var(--app-bar-hover-transition-timing-function);
    transition-duration: var(--app-bar-hover-transition-duration);

    &--collapsed {
      width: var(--app-bar-collapsed-width);
    }

    &--expanded {
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

  &__header {
    transition-property: all, width, transform;
    transition-timing-function: var(--app-bar-hover-transition-timing-function);
    transition-duration: var(--app-bar-hover-transition-duration);
  }
}

// Overlay / menu transition animations
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
</style>
