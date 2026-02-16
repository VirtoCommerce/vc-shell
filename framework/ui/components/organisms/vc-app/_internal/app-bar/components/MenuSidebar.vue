<template>
  <component
    :is="wrapperComponent"
    v-bind="wrapperProps"
  >
    <div
      class="menu-sidebar__wrapper"
      :class="{
        'menu-sidebar__wrapper--desktop': isDesktop,
        'menu-sidebar__wrapper--expanded': isDesktop && expanded,
      }"
    >
      <div
        v-if="!isEmbedded"
        class="menu-sidebar__header"
        :class="{
          'menu-sidebar__header--mobile': isMobile,
        }"
      >
        <div class="menu-sidebar__widgets">
          <slot name="widgets" />
        </div>
        <div class="menu-sidebar__spacer" />
        <div
          v-if="isDesktop"
          class="menu-sidebar__close-button"
        >
          <VcButton
            icon-class="menu-sidebar__close-button-icon"
            icon="material-close"
            text
            @click.stop="$emit('update:is-opened', false)"
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

        <template v-if="isMobile">
          <!-- Scroll up arrow -->
          <div
            class="menu-sidebar__scroll-button"
            :class="{ 'menu-sidebar__scroll-button--hidden': !canScrollUp }"
            aria-hidden="true"
            @pointerenter="startScroll('up')"
            @pointerleave="stopScroll"
          >
            <VcIcon
              icon="lucide-chevron-up"
              size="xs"
            />
          </div>

          <div
            ref="navmenuRef"
            class="menu-sidebar__navmenu"
            @scroll="updateScrollState"
          >
            <slot name="navmenu" />
          </div>

          <!-- Scroll down arrow -->
          <div
            class="menu-sidebar__scroll-button"
            :class="{ 'menu-sidebar__scroll-button--hidden': !canScrollDown }"
            aria-hidden="true"
            @pointerenter="startScroll('down')"
            @pointerleave="stopScroll"
          >
            <VcIcon
              icon="lucide-chevron-down"
              size="xs"
            />
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
  </component>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch, nextTick, type MaybeRef, type Ref } from "vue";
import { EMBEDDED_MODE } from "../../../../../../../injection-keys";
import { VcButton, VcIcon, VcSidebar } from "../../../../../../components";
import { useScrollArrows } from "../../../../../../composables";

const props = defineProps<{
  isOpened: boolean;
  expanded: MaybeRef<boolean>;
}>();

const emit = defineEmits<{
  (e: "update:is-opened", value: boolean): void;
}>();

defineSlots<{
  navmenu: () => unknown;
  "user-dropdown": () => unknown;
  "app-switcher": () => unknown;
  "widgets-active-content": () => unknown;
  widgets: () => unknown;
}>();

const isEmbedded = inject(EMBEDDED_MODE, false);
const isMobile = inject<Ref<boolean>>("isMobile", ref(false));
const isDesktop = inject<Ref<boolean>>("isDesktop", ref(false));

const navmenuRef = ref<HTMLElement | null>(null);
const { canScrollUp, canScrollDown, startScroll, stopScroll, updateScrollState } =
  useScrollArrows(navmenuRef);

// Recalculate scroll state when sidebar opens
watch(
  () => props.isOpened,
  (opened) => {
    if (opened) {
      nextTick(updateScrollState);
    }
  },
);

const wrapperComponent = computed(() => (isMobile.value ? VcSidebar : "div"));

const wrapperProps = computed<Record<string, unknown>>(() => {
  if (!isMobile.value) {
    return {};
  }

  return {
    modelValue: props.isOpened,
    position: "left",
    closeButton: false,
    "onUpdate:modelValue": (value: boolean) => {
      if (!value) {
        emit("update:is-opened", false);
      }
    },
  };
});
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
    @apply tw-flex tw-flex-col tw-bg-[var(--app-bar-background)] tw-flex-1 tw-relative tw-overflow-hidden tw-min-h-0;
    height: calc(100vh - var(--app-bar-height));

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
    @apply tw-px-[var(--app-bar-padding)]  tw-flex tw-flex-col tw-flex-auto tw-bg-transparent tw-overflow-auto tw-min-h-0;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    // Make nested containers transparent — navmenu is the sole scroll viewport
    .vc-app-menu,
    .vc-container {
      @apply tw-h-auto tw-overflow-visible;
    }

    .vc-container__inner {
      @apply tw-overflow-visible;
    }
  }

  &__scroll-button {
    @apply tw-flex tw-items-center tw-justify-center tw-py-1
      tw-cursor-default tw-shrink-0
      tw-text-[color:var(--neutrals-400)]
      tw-transition-opacity tw-duration-150;

    &--hidden {
      @apply tw-opacity-0 tw-pointer-events-none;
    }
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
