<template>
  <div
    v-on-click-outside="onClose"
    class="user-dropdown-button"
    :class="{
      'user-dropdown-button_active': accountMenuVisible,
      'tw-w-auto': disabled,
    }"
    @click.stop="toggleAccountMenuVisible"
  >
    <div class="user-dropdown-button__wrap tw-flex tw-justify-between tw-items-center tw-flex-auto">
      <div
        v-if="avatarUrl"
        class="user-dropdown-button__avatar"
        :style="imageHandler"
      ></div>
      <VcIcon
        v-else
        icon="fas fa-user-circle"
        size="xxl"
        class="tw-text-[color:var(--app-bar-button-color)]"
      />
      <div class="tw-grow tw-basis-0 tw-ml-3 tw-overflow-hidden">
        <div class="user-dropdown-button__name tw-truncate">
          {{ name || user?.userName }}
        </div>
        <div class="user-dropdown-button__role">
          {{
            (role && $t(`SHELL.USER.ROLE.${role}`)) ||
            (user?.isAdministrator ? $t("SHELL.USER.ROLE.ADMINISTRATOR") : "")
          }}
        </div>
      </div>
      <div
        v-if="!disabled && menu && menu.length"
        class="user-dropdown-button__chevron"
      >
        <VcIcon
          icon="fas fa-chevron-down"
          size="xl"
        ></VcIcon>
      </div>
    </div>
    <div
      v-if="menu && accountMenuVisible"
      class="user-dropdown-button__menu"
      @click.stop="accountMenuVisible = false"
    >
      <div
        v-for="(item, i) in menu"
        :key="`menu_item_${i}`"
        class="user-dropdown-button__menu-item tw-group"
        @click="item.hasOwnProperty('clickHandler') ? item.clickHandler?.() : null"
      >
        <VcIcon
          v-if="item.icon"
          :icon="item.icon"
          size="l"
          class="tw-mr-3 tw-text-[color:var(--app-bar-button-color)] group-hover:tw-text-[color:var(--app-bar-button-color-hover)]"
        ></VcIcon>
        <p>{{ item.title }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useUser } from "../../../core/composables";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { VcIcon } from "../../../ui/components";
import { BladeMenu } from "../../../core/types";
import { usePopup } from "../popup-handler/composables/usePopup";
import { ChangePassword } from "../change-password";
import { useBladeNavigation } from "..";

export interface Props {
  avatarUrl?: string | undefined;
  name?: string | undefined;
  role?: string | undefined;
  menuItems?: BladeMenu[];
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
const accountMenuVisible = ref(false);
const menu = computed(() => [
  ...props.menuItems,
  {
    title: t("SHELL.ACCOUNT.CHANGE_PASSWORD"),
    icon: "fas fa-key",
    clickHandler() {
      open();
    },
  },
  {
    title: t("SHELL.ACCOUNT.LOGOUT"),
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

const toggleAccountMenuVisible = () => {
  if (!props.disabled && menu.value && menu.value.length) {
    accountMenuVisible.value = !accountMenuVisible.value;
  }
};

const onClose = () => {
  accountMenuVisible.value = false;
};

const imageHandler = computed(() => {
  if (props.avatarUrl) {
    return `background-image: url(${CSS.escape(props.avatarUrl)})`;
  }
  return undefined;
});
</script>

<style lang="scss">
.user-dropdown-button {
  @apply tw-w-[240px] tw-border-l tw-border-solid tw-border-l-[color:var(--app-bar-divider-color)] tw-px-4 tw-cursor-pointer
    tw-relative tw-flex tw-h-full tw-flex-col tw-select-none;

  &:hover,
  &_active {
    @apply tw-bg-[color:var(--app-bar-toolbar-icon-background-hover)];
  }

  &__avatar {
    @apply tw-rounded-full tw-overflow-hidden tw-w-[34px] tw-h-[34px] tw-bg-[color:var(--app-bar-account-info-role-color)]
      tw-bg-cover tw-bg-center tw-shrink-0;
  }

  &__name {
    @apply tw-text-base tw-text-[color:var(--app-bar-account-info-name-color)];
  }

  &__role {
    @apply tw-text-base tw-text-[color:var(--app-bar-account-info-role-color)];
  }

  &__chevron {
    @apply tw-text-[#7e8e9d] [transition:color_0.2s_ease];
  }

  &:hover &__chevron {
    @apply tw-text-[color:#34414f];
  }

  &_active &__chevron {
    @apply -tw-scale-y-100;
  }

  &__menu {
    @apply tw-absolute -tw-left-px tw-right-0 tw-top-[var(--app-bar-height)] tw-bg-white tw-z-[10000] tw-shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)];

    &-item {
      @apply tw-p-3 tw-text-lg tw-text-black tw-border-l tw-border-solid tw-border-l-[#eef0f2] tw-border-b tw-border-b-[#eef0f2] tw-bg-white hover:tw-bg-[#eff7fc] tw-flex tw-flex-row tw-items-center;
    }
  }

  .vc-app_mobile & {
    &__wrap {
      height: var(--app-bar-height);
    }

    &__menu {
      @apply tw-static tw-shadow-none #{!important};
    }

    &__menu-item {
      @apply tw-border-none #{!important};
    }
  }
}
</style>
