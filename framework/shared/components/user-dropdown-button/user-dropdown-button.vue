<template>
  <div class="vc-user-dropdown-button-container">
    <button
      ref="buttonRef"
      type="button"
      class="vc-user-dropdown-button"
      :class="{
        'vc-user-dropdown-button--active': isMenuOpened,
        'vc-user-dropdown-button--auto-width': disabled,
        'vc-user-dropdown-button--mobile': $isMobile.value,
        'vc-user-dropdown-button--collapsed': !isPinned && $isDesktop.value,
      }"
      @click="handleClick"
    >
      <div
        class="vc-user-dropdown-button__wrap"
        :class="{
          'vc-user-dropdown-button__wrap--active': isMenuOpened,
        }"
      >
        <UserInfo
          :avatar-url="avatarUrl"
          :name="name"
          :role="role"
          :is-expanded="isExpanded"
        />
        <div class="vc-user-dropdown-button__actions">
          <div class="vc-user-dropdown-button__trigger"></div>
        </div>
      </div>
    </button>

    <!-- Desktop: floating dropdown panel -->
    <VcDropdownPanel
      v-if="$isDesktop.value"
      v-model:show="isMenuOpened"
      :anchor-ref="buttonRef"
      placement="right"
      width="260px"
      max-width="300px"
    >
      <SettingsMenu />
    </VcDropdownPanel>

    <!-- Mobile: full sidebar fallback -->
    <UserSidebar
      v-else
      v-model:is-opened="isMenuOpened"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, provide } from "vue";
import { CloseSettingsMenuKey } from "@framework/injection-keys";
import { default as UserInfo } from "@shared/components/user-dropdown-button/_internal/user-info.vue";
import { default as UserSidebar } from "@shared/components/user-dropdown-button/_internal/user-sidebar.vue";
import { SettingsMenu } from "@shared/components/settings-menu";
import { VcDropdownPanel } from "@ui/components";
import { useSidebarState } from "@core/composables/useSidebarState";

export interface Props {
  avatarUrl?: string | undefined;
  name?: string | undefined;
  role?: string | undefined;
  disabled?: boolean;
}

defineProps<Props>();

const isMenuOpened = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const { isPinned, isExpanded } = useSidebarState();

function closeMenu() {
  isMenuOpened.value = false;
}

provide(CloseSettingsMenuKey, closeMenu);

function handleClick() {
  isMenuOpened.value = !isMenuOpened.value;
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
  --user-dropdown-account-info-name-color: var(--neutrals-950);
  --user-dropdown-account-info-role-color: var(--secondary-600);
  --user-dropdown-border-color: var(--app-bar-divider-color);
  --user-dropdown-button-color: var(--primary-500);
  --user-dropdown-wrap-bg: var(--neutrals-50);
  --user-dropdown-border-color: var(--neutrals-200);
  --user-dropdown-wrap-padding-left: 18px;
}

.vc-user-dropdown-button-container {
  @apply tw-flex tw-flex-col;
}

.vc-user-dropdown-button {
  @apply tw-w-full tw-cursor-pointer tw-relative tw-flex tw-h-[var(--user-dropdown-height)] tw-flex-col tw-select-none tw-overflow-hidden tw-border-solid tw-border-t tw-border-t-[var(--user-dropdown-border-color)] tw-pl-[var(--user-dropdown-wrap-padding-left)];

  &:hover {
    .vc-user-dropdown-button__trigger {
      @apply tw-visible tw-translate-x-0;
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
    @apply tw-flex tw-justify-between tw-items-center tw-flex-auto tw-bg-[--user-dropdown-wrap-bg] tw-gap-3;
  }

  &--collapsed {
  }

  &__actions {
    @apply tw-h-full;
  }

  &__trigger {
    @apply tw-invisible tw-absolute tw-right-0 tw-top-0 tw-h-full tw-w-1 tw-bg-[--user-dropdown-button-bg] tw-translate-x-full tw-transition-all tw-duration-300 tw-ease-in-out;
  }
}
</style>
