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
          'menu-sidebar__wrapper--desktop': $isDesktop.value,
          'menu-sidebar__wrapper--expanded': $isDesktop.value && expanded,
        }"
      >
        <div
          v-if="!isEmbedded"
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
              icon="material-close"
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
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { Sidebar } from "../../../../../../../shared/components/sidebar";
import { MaybeRef, inject } from "vue";
import { EMBEDDED_MODE } from "../../../../../../../injection-keys";

defineProps<{
  isOpened: boolean;
  expanded: MaybeRef<boolean>;
}>();

defineEmits<{
  (e: "update:isOpened", value: boolean): void;
}>();

defineSlots<{
  navmenu: (props: any) => any;
  "user-dropdown": (props: any) => any;
  "app-switcher": (props: any) => any;
  "widgets-active-content": (props: any) => any;
  widgets: (props: any) => any;
}>();

const isEmbedded = inject(EMBEDDED_MODE);
</script>

<style lang="scss">
.menu-sidebar {
  &__wrapper {
    @apply tw-absolute tw-top-0 tw-left-0 tw-w-full tw-bottom-0 tw-z-10 tw-flex tw-flex-col;

    &--desktop {
      @apply tw-w-[var(--app-bar-width)] tw-z-[12];
    }

    &--expanded {
      @apply tw-absolute tw-top-0 tw-left-0;
    }
  }

  &__content {
    @apply tw-flex tw-flex-col tw-h-[calc(100vh-var(--app-bar-height))] tw-bg-[var(--app-bar-background)] tw-flex-1 tw-relative;

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
    @apply tw-px-4 tw-flex tw-items-center tw-justify-center;

    &-icon {
      @apply tw-text-[color:var(--app-bar-button)];
    }
  }

  &__widgets {
    @apply tw-flex tw-flex-row tw-items-center tw-justify-between tw-overflow-auto;
  }
}
</style>
