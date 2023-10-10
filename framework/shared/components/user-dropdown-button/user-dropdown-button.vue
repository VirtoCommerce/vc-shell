<template>
  <div
    v-on-click-outside="onClose"
    class="user-dropdown-button"
    :class="{
      'user-dropdown-button_active': accountMenuVisible,
      'user-dropdown-button_no-pointer': $isMobile.value,
    }"
    @click.stop="toggleAccountMenuVisible"
  >
    <div
      class="user-dropdown-button__avatar"
      :style="imageHandler"
    ></div>
    <div class="tw-grow tw-basis-0 tw-ml-3 tw-overflow-hidden">
      <div class="user-dropdown-button__name tw-truncate">
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
      <VcIcon
        icon="fas fa-chevron-down"
        size="xl"
      ></VcIcon>
    </div>
    <div
      v-if="menuItems && accountMenuVisible"
      class="user-dropdown-button__menu"
      @click.stop="accountMenuVisible = false"
    >
      <div
        v-for="(item, i) in menuItems"
        :key="`menu_item_${i}`"
        class="user-dropdown-button__menu-item"
        @click="item.hasOwnProperty('clickHandler') ? item.clickHandler() : null"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { BladeMenu } from "./../../../core/types";

export interface Props {
  avatar: string;
  name: string;
  role: string;
  menuItems?: BladeMenu[];
}
const props = withDefaults(defineProps<Props>(), {
  menuItems: () => [],
});

const imageHandler = computed(() => {
  if (props.avatar) {
    return `background-image: url(${CSS.escape(props.avatar)})`;
  }
  return undefined;
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
  @apply tw-w-[240px] tw-border-l tw-border-solid tw-border-l-[color:var(--app-bar-divider-color)] tw-px-4 tw-cursor-pointer
    tw-relative tw-flex tw-justify-between tw-items-center tw-h-full;

  &_no-pointer {
    @apply tw-cursor-default;
  }

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
    @apply tw-text-[#7e8e9d] [transition:transform_0.2s_ease] [transition:color_0.2s_ease];
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
      @apply tw-p-3 tw-text-lg tw-text-black tw-border-l tw-border-solid tw-border-l-[#eef0f2] tw-border-b tw-border-b-[#eef0f2] tw-bg-white hover:tw-bg-[#eff7fc];
    }
  }
}
</style>