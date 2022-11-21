<template>
  <div
    class="user-dropdown-button"
    :class="{
      'user-dropdown-button_active': accountMenuVisible,
      'user-dropdown-button_no-pointer': $isMobile.value,
    }"
    @click.stop="toggleAccountMenuVisible"
    v-click-outside="onClose"
  >
    <div
      class="user-dropdown-button__avatar"
      :style="{ 'background-image': `url(${avatar})` }"
    ></div>
    <div class="grow basis-0 ml-3 overflow-hidden">
      <div class="user-dropdown-button__name truncate">
        {{ name }}
      </div>
      <div class="user-dropdown-button__role">
        {{ role }}
      </div>
    </div>
    <div
      v-if="menuItems && menuItems.length"
      class="user-dropdown-button__chevron"
    >
      <VcIcon icon="fas fa-chevron-down" size="xl"></VcIcon>
    </div>
    <div
      v-if="menuItems && accountMenuVisible"
      class="user-dropdown-button__menu"
      @click.stop="accountMenuVisible = false"
    >
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="user-dropdown-button__menu-item"
        @click="
          item.hasOwnProperty('clickHandler') ? item.clickHandler() : null
        "
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { IMenuItems } from "../types";

export interface Props {
  avatar: string;
  name: string;
  role: string;
  menuItems: IMenuItems[];
}
const props = withDefaults(defineProps<Props>(), {
  avatar: undefined,
  name: undefined,
  role: undefined,
  menuItems: () => [],
});

const accountMenuVisible = ref(false);

const toggleAccountMenuVisible = () => {
  if (props.menuItems && props.menuItems.length) {
    accountMenuVisible.value = !accountMenuVisible.value;
  }
};

const onClose = () => {
  accountMenuVisible.value = false;
};
</script>

<style lang="scss">
.user-dropdown-button {
  @apply w-[240px] border-l border-solid border-l-[color:var(--app-bar-divider-color)] px-4 mr-4 cursor-pointer
    relative flex justify-between items-center h-full;

  &_no-pointer {
    @apply cursor-default;
  }

  &:hover,
  &_active {
    @apply bg-[color:var(--app-bar-toolbar-icon-background-hover)];
  }

  &__avatar {
    @apply rounded-full overflow-hidden w-[34px] h-[34px] bg-[color:var(--app-bar-account-info-role-color)]
      bg-cover bg-center shrink-0;
  }

  &__name {
    @apply text-base text-[color:var(--app-bar-account-info-name-color)];
  }

  &__role {
    @apply text-base text-[color:var(--app-bar-account-info-role-color)];
  }

  &__chevron {
    @apply text-[#7e8e9d] [transition:transform_0.2s_ease] [transition:color_0.2s_ease];
  }

  &:hover &__chevron {
    @apply text-[color:#34414f];
  }

  &_active &__chevron {
    @apply -scale-y-100;
  }

  &__menu {
    @apply absolute -left-px right-0 top-[var(--app-bar-height)] bg-white z-[10000] shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)];

    &-item {
      @apply p-3 text-lg text-black border-l border-solid border-l-[#eef0f2] border-b border-b-[#eef0f2] bg-white hover:bg-[#eff7fc];
    }
  }
}
</style>
