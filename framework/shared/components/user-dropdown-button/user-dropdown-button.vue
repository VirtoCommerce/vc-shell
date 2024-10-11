<template>
  <AppBarButtonTemplate
    position="bottom-start"
    :before-open="beforeOpen"
  >
    <template #button="{ opened }">
      <div
        class="vc-user-dropdown-button"
        :class="{
          'vc-user-dropdown-button--active': opened,
          'vc-user-dropdown-button--auto-width': disabled,
          'vc-user-dropdown-button--mobile': $isMobile.value,
        }"
      >
        <div
          class="vc-user-dropdown-button__wrap"
          :class="{
            'vc-user-dropdown-button__wrap--active': opened,
          }"
        >
          <div
            v-if="avatarUrl"
            class="vc-user-dropdown-button__avatar"
            :style="imageHandler"
          ></div>
          <VcIcon
            v-else
            icon="fas fa-user-circle"
            size="xxl"
            class="vc-user-dropdown-button__icon"
          />
          <div class="vc-user-dropdown-button__info">
            <div class="vc-user-dropdown-button__name">
              {{ name || user?.userName }}
            </div>
            <div class="vc-user-dropdown-button__role">
              {{
                (role && $t(`SHELL.USER.ROLE.${role}`)) ||
                (user?.isAdministrator ? $t("SHELL.USER.ROLE.ADMINISTRATOR") : "")
              }}
            </div>
          </div>
          <div
            v-if="!disabled && menu && menu.length"
            class="vc-user-dropdown-button__chevron"
          >
            <VcIcon
              icon="fas fa-chevron-down"
              size="xl"
            ></VcIcon>
          </div>
        </div>
      </div>
    </template>
    <template #dropdown-content="{ opened, toggle }">
      <div
        v-if="menu && opened"
        class="vc-user-dropdown-button__menu"
        @click.stop="toggle"
      >
        <div
          v-for="(item, i) in menu"
          :key="`menu_item_${i}`"
          class="vc-user-dropdown-button__menu-item"
          @click="item.hasOwnProperty('clickHandler') ? item.clickHandler?.() : null"
        >
          <VcIcon
            v-if="item.icon"
            :icon="item.icon"
            size="l"
            class="vc-user-dropdown-button__menu-icon"
          ></VcIcon>
          <p>{{ item.title }}</p>
        </div>
      </div>
    </template>
  </AppBarButtonTemplate>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useUser } from "../../../core/composables";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { VcIcon } from "../../../ui/components";
import { BladeMenu } from "../../../core/types";
import { usePopup } from "../popup-handler/composables/usePopup";
import { ChangePassword } from "../change-password";
import { useBladeNavigation } from "..";
import { AppBarButtonTemplate } from "./../app-bar-button";

export interface Props {
  avatarUrl?: string | undefined;
  name?: string | undefined;
  role?: string | undefined;
  menuItems?: BladeMenu[];
  baseMenuItemsHandler?: (defaultMenuItems: BladeMenu[]) => BladeMenu[];
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  menuItems: () => [],
});

const { user, signOut } = useUser();
const router = useRouter();
const { t } = useI18n({ useScope: "global" });

const { open } = usePopup({
  component: ChangePassword,
});
const { closeBlade } = useBladeNavigation();

const defaultMenuItems = ref([
  {
    title: computed(() => t("SHELL.ACCOUNT.CHANGE_PASSWORD")),
    icon: "fas fa-key",
    clickHandler() {
      open();
    },
  },
  {
    title: computed(() => t("SHELL.ACCOUNT.LOGOUT")),
    icon: "fas fa-sign-out-alt",
    async clickHandler() {
      const isPrevented = await closeBlade(0);

      if (!isPrevented) {
        await signOut();
        router.push({ name: "Login" });
      }
    },
  },
]);

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

function beforeOpen() {
  return !props.disabled && menu.value?.length > 0;
}

const imageHandler = computed(() => {
  if (props.avatarUrl) {
    return `background-image: url(${CSS.escape(props.avatarUrl)})`;
  }
  return undefined;
});
</script>

<style lang="scss">
:root {
  --user-dropdown-account-info-name-color: var(--base-text-color, var(--neutrals-950));
  --user-dropdown-account-info-role-color: var(--secondary-600);
  --user-dropdown-divider-color: var(--base-border-color, var(--neutrals-200));
  --user-dropdown-border-color: var(--app-bar-divider-color);
  --user-dropdown-button-color: var(--primary-500);
  --user-dropdown-button-color-hover: var(--primary-700);
  --user-dropdown-menu-item-bg-hover: var(--primary-50);
  --user-dropdown-menu-item-bg: var(--additional-50);
  --user-dropdown-menu-text-color: var(--additional-950);
  --user-dropdown-chevron-color: var(--secondary-600);
  --user-dropdown-chevron-color-hover: var(--secondary-700);
  --user-dropdown-wrap-bg: var(--additional-50);
}

.vc-user-dropdown-button {
  @apply tw-border-l tw-border-solid tw-border-l-[color:var(--user-dropdown-border-color)]  tw-cursor-pointer
  tw-relative tw-flex tw-h-full tw-flex-col tw-select-none;

  .vc-app_mobile & {
    @apply tw-w-full #{!important};
  }

  &--mobile {
    @apply tw-h-[var(--app-bar-height)];
  }

  &--auto-width {
    @apply tw-w-auto;
  }

  &__wrap {
    @apply tw-flex tw-justify-between tw-items-center tw-flex-auto tw-px-4 tw-bg-[--user-dropdown-wrap-bg] tw-gap-3;
  }

  &__avatar {
    @apply tw-rounded-full tw-overflow-hidden tw-w-[34px] tw-h-[34px] tw-bg-[color:var(--user-dropdown-account-info-role-color)]
    tw-bg-cover tw-bg-center tw-shrink-0;
  }

  &__icon {
    @apply tw-text-[color:var(--user-dropdown-button-color)];
  }

  &__info {
    @apply tw-grow tw-basis-0 tw-overflow-hidden;
  }

  &__name {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-name-color)] tw-truncate;
  }

  &__role {
    @apply tw-text-sm tw-text-[color:var(--user-dropdown-account-info-role-color)];
  }

  &__chevron {
    @apply tw-text-[color:var(--user-dropdown-chevron-color)] tw-transition-colors tw-duration-200;
  }

  &:hover &__chevron {
    @apply tw-text-[color:var(--user-dropdown-chevron-color-hover)];
  }

  &--active &__chevron {
    @apply -tw-scale-y-100;
  }

  &__menu {
    @apply tw-w-full;

    &-item {
      @apply tw-p-3 tw-text-sm tw-text-[color:var(--user-dropdown-menu-text-color)] tw-border-solid tw-border-b tw-border-b-[color:var(--user-dropdown-divider-color)] tw-bg-[color:var(--user-dropdown-menu-item-bg)] tw-flex tw-flex-row tw-items-center tw-cursor-pointer;
      transition: background-color 0.2s;

      &:hover {
        @apply tw-bg-[color:var(--user-dropdown-menu-item-bg-hover)];

        .vc-user-dropdown-button__menu-icon {
          @apply tw-text-[color:var(--user-dropdown-button-color-hover)];
        }
      }

      &:last-of-type {
        @apply tw-border-b-0;
      }
    }
  }

  &__menu-icon {
    @apply tw-mr-3 tw-text-[color:var(--user-dropdown-button-color)];
  }

  .vc-app_mobile & {
    &__menu {
      @apply tw-static tw-shadow-none #{!important};
    }

    &__menu-item {
      @apply tw-border-none #{!important};
    }

    &__wrap--active {
      @apply tw-shadow-none;
    }
  }
}
</style>
