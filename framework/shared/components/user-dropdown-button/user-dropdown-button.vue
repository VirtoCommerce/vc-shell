<template>
  <div>
    <div
      class="vc-user-dropdown-button"
      :class="{
        'vc-user-dropdown-button--active': false,
        'vc-user-dropdown-button--auto-width': disabled,
        'vc-user-dropdown-button--mobile': $isMobile.value,
        'vc-user-dropdown-button--collapsed': !isExpanded,
      }"
    >
      <div
        class="vc-user-dropdown-button__wrap"
        :class="{
          'vc-user-dropdown-button__wrap--active': false,
        }"
      >
        <UserInfo
          :avatar-url="avatarUrl"
          :name="name"
          :role="role"
          :is-expanded="isExpanded"
        />
        <UserActions
          :profile-menu="profileMenu"
          @action:click="handleActionClick"
        />
      </div>
    </div>

    <UserSidebar
      v-model:is-opened="isSidebarOpened"
      :menu-items="menu"
      @item:click="handleMenuItemClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type { IMenuItem } from "../../../core/types";
import { useUserActions } from "./composables/useUserActions";
import { default as UserInfo } from "./_internal/user-info.vue";
import { default as UserActions } from "./_internal/user-actions.vue";
import { default as UserSidebar } from "./_internal/user-sidebar.vue";
import * as _ from "lodash-es";
import { useLocalStorage } from "@vueuse/core";

export interface Props {
  avatarUrl?: string | undefined;
  name?: string | undefined;
  role?: string | undefined;
  menuItems?: IMenuItem[];
  baseMenuItemsHandler?: (defaultMenuItems: IMenuItem[]) => IMenuItem[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  menuItems: () => [],
});

const isSidebarOpened = ref(false);
const { profileMenu, defaultMenuItems, settingsButton } = useUserActions();

const isExpanded = useLocalStorage("VC_APP_MENU_EXPANDED", true);

const menu = computed(() => {
  const defaultItems = handleDefaultMenuItems();
  if (defaultItems?.length) {
    return [...props.menuItems, ...defaultItems];
  }
  return [...props.menuItems];
});

function handleDefaultMenuItems() {
  if (props.baseMenuItemsHandler && typeof props.baseMenuItemsHandler === "function") {
    return props.baseMenuItemsHandler(defaultMenuItems.value);
  }
  return defaultMenuItems.value;
}

function handleActionClick(item: IMenuItem) {
  if (_.isEqual(item, settingsButton.value)) {
    isSidebarOpened.value = true;
    return;
  }
  item.clickHandler?.();
}

function handleMenuItemClick(item: IMenuItem) {
  item.clickHandler?.();
}
</script>

<style lang="scss">
:root {
  --user-dropdown-height: 54px;
  --user-dropdown-button-bg: var(--primary-500);
  --user-dropdown-button-bg-hover: var(--primary-700);
  --user-dropdown-button-bg-logout: var(--danger-500);
  --user-dropdown-button-bg-logout-hover: var(--danger-700);
  --user-dropdown-button-icon-color: var(--additional-50);
  --user-dropdown-account-info-name-color: var(--base-text-color, var(--neutrals-950));
  --user-dropdown-account-info-role-color: var(--secondary-600);
  --user-dropdown-divider-color: var(--base-border-color, var(--neutrals-200));
  --user-dropdown-border-color: var(--app-bar-divider-color);
  --user-dropdown-button-color: var(--primary-500);
  --user-dropdown-button-color-hover: var(--primary-700);
  --user-dropdown-menu-item-bg-hover: var(--primary-50);
  --user-dropdown-menu-item-bg: transparent;
  --user-dropdown-menu-text-color: var(--additional-950);
  --user-dropdown-chevron-color: var(--secondary-600);
  --user-dropdown-chevron-color-hover: var(--secondary-700);
  --user-dropdown-wrap-bg: var(--neutrals-50);
  --user-dropdown-button-width: var(--app-bar-button-width);
  --user-dropdown-border-color: var(--neutrals-200);
  --user-dropdown-wrap-padding-left: 18px;
}

.vc-user-dropdown-button {
  @apply tw-relative tw-flex tw-h-[var(--user-dropdown-height)] tw-flex-col tw-select-none tw-overflow-hidden tw-border-solid tw-border-t tw-border-t-[var(--user-dropdown-border-color)];

  &:hover {
    .vc-user-actions__buttons {
      @apply tw-translate-x-0;
    }
  }

  .vc-app_mobile & {
    @apply tw-w-full #{!important};
  }

  &--mobile {
  }

  &--auto-width {
    @apply tw-w-auto;
  }

  &__wrap {
    @apply tw-flex tw-justify-between tw-items-center tw-flex-auto tw-pl-[var(--user-dropdown-wrap-padding-left)] tw-bg-[--user-dropdown-wrap-bg] tw-gap-3;
  }

  &--collapsed {
  }
}
</style>
