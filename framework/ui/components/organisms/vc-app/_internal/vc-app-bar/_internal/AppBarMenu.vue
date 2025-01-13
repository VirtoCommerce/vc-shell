<template>
  <div
    v-if="isOpen"
    v-on-click-outside="[handleClickOutside, { ignore: [menuButtonRef] }]"
    class="app-bar-menu"
    :class="{ 'app-bar-menu--mobile': $isMobile.value }"
  >
    <div class="app-bar-menu__header">
      <slot name="toolbar" />
      <div class="app-bar-menu__spacer" />
      <div class="app-bar-menu__close-button">
        <VcButton
          icon-class="app-bar-menu__close-button-icon"
          :icon="CrossSignIcon"
          icon-size="xs"
          text
          @click.stop="$emit('toggle-menu')"
        />
      </div>
    </div>

    <div class="app-bar-menu__content">
      <div
        id="app-bar-dropdown"
        class="app-bar-menu__dropdowns"
      />
      <template v-if="$isMobile.value">
        <div class="app-bar-menu__navmenu">
          <slot name="navmenu" />
        </div>
        <div class="app-bar-menu__user">
          <slot name="user-dropdown" />
        </div>
      </template>
      <template v-else>
        <slot name="app-switcher" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcButton } from "../../../../../";
import { CrossSignIcon } from "../../../../../atoms/vc-icon/icons";
import { vOnClickOutside } from "@vueuse/components";

defineProps<{
  isOpen: boolean;
  menuButtonRef: HTMLElement | null;
}>();

const emit = defineEmits<{
  (e: "toggle-menu"): void;
  (e: "update:isOpen", value: boolean): void;
}>();

const handleClickOutside = () => {
  emit("update:isOpen", false);
};
</script>

<style lang="scss">
.app-bar-menu {
  @apply tw-w-[var(--app-bar-width)] tw-h-full tw-absolute tw-top-0 tw-left-0 tw-z-[1001] tw-bg-[color:var(--app-bar-background-color)];

  &__close-button {
    @apply tw-pr-4 tw-flex tw-items-center tw-justify-center;

    &-icon {
      @apply tw-text-[color:var(--app-bar-button-color)];
    }
  }

  &__content {
    @apply tw-relative;

    &:before {
      content: "";
      @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px] tw-bg-[color:var(--app-bar-header-bottom-border-color)] tw-z-[1];
    }
  }

  &__header {
    @apply tw-flex tw-h-[var(--app-bar-height)];
  }

  &__dropdowns {
    @apply tw-w-full tw-h-full tw-invisible;

    &:not(:empty) {
      @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-header-bottom-border-color)] tw-z-[2];

      &:before {
        content: "";
        @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px] tw-bg-[color:var(--app-bar-content-visible-border-color)] tw-z-[1] #{!important};
      }
    }
  }

  &__spacer {
    @apply tw-grow tw-basis-0;
  }

  &--mobile {
    @apply tw-w-full tw-z-[1001] tw-fixed tw-top-0 tw-left-0;

    .app-bar-menu__header {
      @apply tw-h-[var(--app-bar-mobile-height)];
    }
  }

  &__navmenu {
    @apply tw-px-[var(--app-bar-padding)] tw-pt-6 tw-flex tw-flex-auto;
  }

  &__user {
    @apply tw-mt-auto;
  }

  &--mobile {
    @apply tw-w-full tw-z-[1001] tw-fixed tw-top-0 tw-left-0 tw-bottom-0;

    .app-bar-menu__content {
      @apply tw-flex tw-flex-col tw-h-[calc(100%-var(--app-bar-mobile-height))];
    }

    .app-bar-menu__header {
      @apply tw-h-[var(--app-bar-mobile-height)];
    }

    .app-bar-menu__dropdowns {
      @apply tw-h-auto;
    }
  }
}
</style>
