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
      <div class="mobile-layout__hub">
        <AppHubContent
          :apps-list="appsList"
          :show-applications="!disableAppSwitcher"
          mobile
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
        </AppHubContent>
      </div>

      <div
        v-if="!disableMenu"
        class="mobile-layout__menu"
      >
        <slot
          name="menu"
          :expanded="true"
          :on-item-click="handleMenuItemClick"
        >
          <VcAppMenu
            :expanded="true"
            @item:click="handleMenuItemClick"
          />
        </slot>
      </div>
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
  </MenuSidebar>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, inject, watch } from "vue";
import type { AppDescriptor } from "@core/api/platform";
import type { MenuItem } from "@core/types";
import { EmbeddedModeKey } from "@framework/injection-keys";
import { useBladeNavigation, UserDropdownButton } from "@shared/components";
import { useSidebarState } from "@core/composables/useSidebarState";
import SidebarHeader from "@ui/components/organisms/vc-app/_internal/sidebar/SidebarHeader.vue";
import AppBarMobileActions from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppBarMobileActions.vue";
import MenuSidebar from "@ui/components/organisms/vc-app/_internal/app-bar/components/MenuSidebar.vue";
import AppHubContent from "@ui/components/organisms/vc-app/_internal/app-bar/components/AppHubContent.vue";
import VcAppMenu from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";

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
const isEmbedded = inject(EmbeddedModeKey, false);
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
  sidebar.closeMenu();
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

  &__hub {
    @apply tw-py-2;
  }

  &__menu {
    @apply tw-mt-2 tw-pt-2 tw-border-t tw-border-solid;
    border-color: var(--app-bar-border);
  }
}
</style>
