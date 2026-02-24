<template>
  <div
    v-if="isVisible"
    class="sidebar-header"
    :class="{
      'sidebar-header--collapsed': !expanded,
      'sidebar-header--mobile': isMobile,
    }"
  >
    <div class="sidebar-header__logo-container">
      <div class="sidebar-header__logo">
        <img
          class="sidebar-header__logo-image"
          :class="{ 'sidebar-header__logo-image--mobile': isMobile }"
          alt="logo"
          :src="logo"
          @click="$emit('logo:click')"
        />
        <div
          v-if="hasUnread && !expanded"
          class="sidebar-header__accent"
        />
      </div>

      <template v-if="isMobile && showMobileTitle">
        <p class="sidebar-header__blade-title">
          {{ mobileTitle }}
        </p>
      </template>
    </div>

    <button
      v-if="expanded && !isMobile"
      class="sidebar-header__notification-bell"
      @click="$emit('toggle-notifications', $event)"
    >
      <div class="sidebar-header__notification-bell-wrap">
        <VcIcon
          icon="lucide-bell"
          size="m"
        />
        <div
          v-if="hasUnread"
          class="sidebar-header__accent"
        />
      </div>
    </button>

    <div
      v-if="$slots.actions"
      class="sidebar-header__actions"
    >
      <slot name="actions" />
    </div>

    <button
      v-if="expanded && showBurger"
      class="sidebar-header__menu-button"
      @click="$emit('toggle-menu', $event)"
    >
      <div class="sidebar-header__menu-button-wrap">
        <Transition
          name="burger-fade"
          mode="out-in"
        >
          <VcIcon
            v-if="isMenuOpen"
            key="close"
            icon="lucide-x"
            size="m"
          />
          <VcIcon
            v-else
            key="burger"
            icon="lucide-menu"
            size="m"
          />
        </Transition>
        <div
          v-if="hasUnread && !isMenuOpen"
          class="sidebar-header__accent"
        />
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import { VcIcon } from "@ui/components";
import { MenuBurgerIcon } from "@ui/components/atoms/vc-icon/icons";
import { ShellIndicatorsKey } from "@framework/injection-keys";

export interface Props {
  logo?: string;
  expanded?: boolean;
  showBurger?: boolean;
  isMenuOpen?: boolean;
  isVisible?: boolean;
  isMobile?: boolean;
  mobileTitle?: string;
  showMobileTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  expanded: true,
  showBurger: false,
  isMenuOpen: false,
  isVisible: true,
  isMobile: false,
  mobileTitle: "",
  showMobileTitle: false,
});

defineEmits<{
  (e: "logo:click"): void;
  (e: "toggle-menu", event: MouseEvent): void;
  (e: "toggle-notifications", event: MouseEvent): void;
}>();

const hasUnread = inject(ShellIndicatorsKey, ref(false));
</script>

<style lang="scss">
:root {
  --app-bar-header-padding-top: 18px;
  --app-bar-header-blade-title: var(--neutrals-950);
  --app-bar-accent-color: var(--danger-500);

  --app-bar-header-actions-button-color: var(--neutrals-500);
  --app-bar-header-actions-button-active-color: var(--primary-500);
}

.sidebar-header {
  @apply tw-flex tw-flex-row tw-items-center tw-justify-between
    tw-px-[var(--app-bar-padding)] tw-h-[var(--app-bar-height)]
    tw-py-[var(--app-bar-header-padding-top,18px)];

  &--collapsed {
    @apply tw-items-center tw-justify-between tw-border-0 tw-gap-[16px];
  }

  &--mobile {
    @apply tw-h-[var(--app-bar-mobile-height)] tw-px-[var(--app-bar-padding-mobile)];
  }

  &__logo {
    @apply tw-w-auto tw-flex tw-items-center tw-h-full tw-relative;

    &-container {
      @apply tw-flex tw-flex-row tw-gap-3 tw-items-center;
    }

    &-image {
      @apply tw-cursor-pointer tw-max-w-[var(--app-bar-logo-width)] tw-max-h-[var(--app-bar-logo-height)]
        tw-overflow-hidden tw-w-full tw-shrink-0;

      &--mobile {
        @apply tw-mx-1 tw-max-w-[var(--app-bar-logo-mobile-width)] tw-max-h-[var(--app-bar-logo-mobile-height)] tw-rounded-full;
      }
    }
  }

  &__accent {
    @apply tw-block tw-absolute tw-right-[-7px] tw-top-[-5px]
      tw-w-[5px] tw-h-[5px] tw-rounded-full tw-z-[1]
      tw-bg-[var(--app-bar-accent-color,var(--danger-500))];
  }

  &__actions {
    @apply tw-flex tw-items-center;
  }

  &__blade-title {
    @apply tw-text-lg tw-font-bold tw-text-[var(--app-bar-header-blade-title)];
  }

  &__notification-bell {
    @apply tw-cursor-pointer tw-relative;

    &-wrap {
      @apply tw-relative;
    }
  }

  &__menu-button {
    @apply tw-cursor-pointer tw-relative;

    &-wrap {
      @apply tw-relative;
    }
  }
}

.burger-fade-enter-active,
.burger-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.burger-fade-enter-from {
  opacity: 0;
  transform: rotate(90deg);
}

.burger-fade-leave-to {
  opacity: 0;
  transform: rotate(-90deg);
}
</style>
