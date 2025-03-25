<template>
  <Sidebar
    :is-expanded="$isMobile.value ? isOpened : false"
    position="left"
    render="mobile"
    @close="$emit('update:isOpened', false)"
  >
    <template #header><span /></template>

    <template #content>
      <div
        class="menu-sidebar__wrapper"
        :class="{
          'menu-sidebar__wrapper--expanded': $isDesktop.value && expanded,
          'menu-sidebar__wrapper--collapsed': $isDesktop.value && !expanded,
        }"
      >
        <div
          class="menu-sidebar__header"
          :class="{
            'menu-sidebar__header--mobile': $isMobile.value,
          }"
        >
          <div class="menu-sidebar__widgets">
            <slot name="widgets" />
          </div>
          <div class="menu-sidebar__spacer" />
          <div
            v-if="$isDesktop.value"
            class="menu-sidebar__close-button"
          >
            <VcButton
              icon-class="menu-sidebar__close-button-icon"
              :icon="CrossSignIcon"
              icon-size="xs"
              text
              @click.stop="$emit('update:isOpened', false)"
            />
          </div>
        </div>
        <div class="menu-sidebar__content">
          <div
            v-if="$slots['widgets-active-content']"
            class="menu-sidebar__content-main"
          >
            <slot name="widgets-active-content" />
          </div>

          <template v-if="$isMobile.value">
            <div class="menu-sidebar__navmenu">
              <slot name="navmenu" />
            </div>
            <div class="menu-sidebar__user">
              <slot name="user-dropdown" />
            </div>
          </template>
          <template v-else>
            <slot name="app-switcher" />
          </template>
        </div>
      </div>
    </template>
  </Sidebar>
</template>

<script lang="ts" setup>
import { Sidebar } from "../../../../../../../shared/components/sidebar";
import { CrossSignIcon } from "../../../../../atoms/vc-icon/icons";
import { MaybeRef } from "vue";

defineProps<{
  isOpened: boolean;
  expanded: MaybeRef<boolean>;
}>();

defineEmits<{
  (e: "update:isOpened", value: boolean): void;
}>();

defineSlots<{
  navmenu: () => void;
  "user-dropdown": () => void;
  "app-switcher": () => void;
  "widgets-active-content": () => void;
  widgets: () => void;
}>();
</script>

<style lang="scss">
.menu-sidebar {
  &__wrapper {
    @apply tw-absolute tw-top-0 tw-left-0 tw-w-full  tw-bottom-0 tw-z-10 tw-flex tw-flex-col;

    &--expanded {
      @apply tw-absolute tw-top-0 tw-left-0;
    }

    &--collapsed {
      @apply tw-w-[var(--app-bar-width)] tw-z-[12];
    }
  }

  &__content {
    @apply tw-flex tw-flex-col tw-h-full tw-bg-[var(--app-bar-background)] tw-flex-1 tw-relative;

    &:before {
      content: "";
      @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px] tw-bg-[color:var(--app-bar-border)] tw-z-[1] #{!important};
    }
  }

  &__header {
    @apply tw-flex;
    background-color: var(--app-bar-background);
    height: var(--app-bar-height);

    &--mobile {
      height: var(--app-bar-mobile-height);
    }
  }

  &__dropdowns {
    @apply tw-w-full tw-h-full tw-invisible;

    &:not(:empty) {
      @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-border)] tw-z-[2];

      &:before {
        content: "";
        @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px] tw-bg-[color:var(--app-bar-content-visible-border)] tw-z-[1] #{!important};
      }
    }
  }

  &__navmenu {
    @apply tw-px-[var(--app-bar-padding)] tw-pt-6 tw-flex tw-flex-auto tw-bg-transparent;
  }

  &__user {
    @apply tw-mt-auto;
  }

  &__content-main {
    @apply tw-relative;

    &:not(:empty) {
      @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-border)] tw-z-[2];

      &:before {
        content: "";
        @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px] tw-bg-[color:var(--app-bar-content-visible-border)] tw-z-[1] #{!important};
      }
    }
  }

  &__spacer {
    @apply tw-grow tw-basis-0;
  }

  &__close-button {
    @apply tw-px-1 tw-flex tw-items-center tw-justify-center;

    &-icon {
      @apply tw-text-[color:var(--app-bar-button)];
    }
  }

  &__widgets {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-overflow-auto;
  }
}
</style>
