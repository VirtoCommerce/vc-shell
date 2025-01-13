<template>
  <div
    class="app-bar-header"
    :class="{ 'app-bar-header--collapsed': !expanded, 'app-bar-header--mobile': $isMobile.value }"
  >
    <div class="app-bar-header__logo-container">
      <div class="app-bar-header__logo">
        <img
          class="app-bar-header__logo-image"
          :class="{ 'app-bar-header__logo-image--mobile': $isMobile.value }"
          alt="logo"
          :src="logo"
          @click="$emit('logo:click')"
        />
      </div>
    </div>

    <div
      ref="menuButtonRef"
      class="app-bar-header__menu-button"
      @click="$emit('toggle-menu')"
    >
      <div class="app-bar-header__menu-button-wrap">
        <VcIcon
          :icon="MenuBurgerIcon"
          size="xs"
        />
        <div
          v-if="hasUnreadNotifications"
          class="app-bar-header__menu-button-accent"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcButton, VcIcon } from "./../../../../../";
import { MenuBurgerIcon } from "./../../../../../atoms/vc-icon/icons";
import { computed } from "vue";
import { useNotifications } from "./../../../../../../../core/composables";

defineProps<{
  logo?: string;
  expanded: boolean;
}>();

defineEmits<{
  (e: "logo:click"): void;
  (e: "toggle-menu"): void;
}>();

const { notifications } = useNotifications();

const hasUnreadNotifications = computed(() => {
  return notifications.value.some((item) => item.isNew);
});
</script>

<style lang="scss">
.app-bar-header {
  @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-px-[var(--app-bar-padding)];
  border-bottom: 1px solid var(--app-bar-border-color);

  &__logo-container {
    @apply tw-flex tw-flex-row tw-gap-3;
  }

  &__logo {
    @apply tw-w-auto tw-h-[var(--app-bar-height)] tw-flex tw-items-center;

    &-image {
      @apply tw-cursor-pointer tw-max-w-[var(--app-bar-logo-width)] tw-max-h-[var(--app-bar-logo-height)] tw-mx-2;

      &--mobile {
        @apply tw-mx-1;
      }
    }
  }

  &__menu-button {
    @apply tw-cursor-pointer tw-relative;

    &-wrap {
      @apply tw-relative;
    }

    &-accent {
      @apply tw-block tw-absolute tw-right-[-7px] tw-top-[-5px]
             tw-w-[5px] tw-h-[5px]
             tw-bg-[color:var(--notification-dropdown-accent-color)]
             tw-rounded-full tw-z-[1];
    }
  }

  &--collapsed {
    @apply tw-flex-col tw-items-center tw-justify-center;
  }

  &--mobile {
    .app-bar-header__logo {
      @apply tw-h-[var(--app-bar-mobile-height)];
    }
  }
}
</style>
