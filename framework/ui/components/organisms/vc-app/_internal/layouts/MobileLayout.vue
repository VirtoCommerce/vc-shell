<template>
  <!-- Top bar -->
  <div
    v-if="showHeader"
    class="mobile-layout"
  >
    <slot
      name="sidebar-header"
      :logo="logo"
      :expanded="false"
      :is-mobile="true"
    >
      <SidebarHeader
        :logo="logo"
        :expanded="false"
        :is-mobile="true"
        :mobile-title="viewTitle"
        :show-mobile-title="blades.length === 1"
        class="mobile-layout__header"
        @logo:click="sidebar.openMenu"
      >
        <template #actions>
          <AppBarMobileActions
            :is-sidebar-mode="sidebar.isMenuOpen.value"
            :expanded="false"
          />
        </template>
      </SidebarHeader>
    </slot>
  </div>

  <!-- Slide-out sidebar overlay (no v-if — VcSidebar manages visibility internally via Transition) -->
  <MenuSidebar
    :is-opened="sidebar.isMenuOpen.value"
    :expanded="true"
    @update:is-opened="!$event && sidebar.closeMenu()"
  >
    <template #navmenu>
      <slot
        name="menu"
        :expanded="true"
        :on-item-click="handleMenuItemClick"
      >
        <VcAppMenu
          v-if="!disableMenu"
          :expanded="true"
          @item:click="handleMenuItemClick"
        />
      </slot>
    </template>
    <template #user-dropdown>
      <slot
        name="sidebar-footer"
        :avatar="avatar"
        :name="userName"
        :role="userRole"
      >
        <UserDropdownButton
          v-if="!isEmbedded"
          :avatar-url="avatar"
          :name="userName"
          :role="userRole"
        />
      </slot>
    </template>
    <template #widgets>
      <AppBarWidgetsMenu />
    </template>
    <template #widgets-active-content>
      <AppBarWidgetContent mobile />
    </template>
    <template #app-switcher>
      <slot
        v-if="!disableAppSwitcher"
        name="app-switcher"
        :apps-list="appsList"
        :switch-app="handleSwitchApp"
      >
        <component
          :is="appSwitcherComponents.VcAppSwitcher"
          :apps-list="appsList"
          @on-click="handleSwitchApp"
        />
      </slot>
    </template>
  </MenuSidebar>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, inject, watch } from "vue";
import type { AppDescriptor } from "../../../../../../core/api/platform";
import type { MenuItem } from "../../../../../../core/types";
import { EMBEDDED_MODE } from "../../../../../../injection-keys";
import { useBladeNavigation, UserDropdownButton } from "../../../../../../shared/components";
import { components as appSwitcherComponents } from "../../../../../../shared/components/app-switcher";
import { useSidebarState } from "../../composables/useSidebarState";
import SidebarHeader from "../sidebar/SidebarHeader.vue";
import AppBarMobileActions from "../app-bar/components/AppBarMobileActions.vue";
import MenuSidebar from "../app-bar/components/MenuSidebar.vue";
import AppBarWidgetsMenu from "../app-bar/components/AppBarWidgetsMenu.vue";
import AppBarWidgetContent from "../app-bar/components/AppBarWidgetContent.vue";
import VcAppMenu from "../menu/VcAppMenu.vue";

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
const isEmbedded = inject(EMBEDDED_MODE, false);
const { blades, currentBladeNavigationData } = useBladeNavigation();

const showHeader = computed(() => blades.value.length <= 1);

const viewTitle = computed(() => {
  const currentTitle = currentBladeNavigationData.value?.instance?.title;
  const lastBladeTitle = blades.value[blades.value.length - 1]?.props?.navigation?.instance?.title;
  return currentTitle ?? lastBladeTitle ?? "";
});

watch(showHeader, (nextValue) => {
  if (!nextValue && sidebar.isMenuOpen.value) {
    sidebar.closeMenu();
  }
});

const handleMenuItemClick = (item: MenuItem) => {
  sidebar.closeMenu();
  emit("item:click", item);
};

const handleSwitchApp = (app: AppDescriptor) => {
  emit("switch-app", app);
};
</script>

<style lang="scss">
.mobile-layout {
  @apply tw-w-full tw-shrink-0;

  &__header {
    @apply tw-h-[var(--app-bar-mobile-height)] tw-px-[var(--app-bar-padding-mobile,28px)];
    background-color: var(--app-bar-background);
  }
}
</style>
