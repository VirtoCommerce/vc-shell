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
        v-if="showHeader"
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
      <div
        class="menu-sidebar__content"
        :class="{ 'menu-sidebar__content--without-header': !showHeader }"
      >
        <div
          v-if="$slots['widgets-active-content']"
          class="menu-sidebar__content-main"
        >
          <slot name="widgets-active-content" />
        </div>

        <template v-if="isMobile">
          <VcScrollableContainer
            ref="scrollContainer"
            class="menu-sidebar__navmenu-container"
          >
            <slot name="navmenu" />
          </VcScrollableContainer>

          <div class="menu-sidebar__user">
            <slot name="user-dropdown" />
          </div>
        </template>
        <template v-else>
          <div class="menu-sidebar__app-switcher-wrapper">
            <slot name="app-switcher" />
          </div>
        </template>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch, nextTick, useSlots, type MaybeRef, type Ref } from "vue";
import { EmbeddedModeKey, IsDesktopKey } from "@framework/injection-keys";
import { VcButton, VcScrollableContainer, VcSidebar } from "@ui/components";

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

const isEmbedded = inject(EmbeddedModeKey, false);
const isMobile = inject<Ref<boolean>>("isMobile", ref(false));
const isDesktop = inject(IsDesktopKey, ref(false));
const slots = useSlots();

const scrollContainer = ref<InstanceType<typeof VcScrollableContainer> | null>(null);
const showHeader = computed(() => !isEmbedded && (isDesktop.value || Boolean(slots.widgets)));

// Recalculate scroll state when sidebar opens
watch(
  () => props.isOpened,
  (opened) => {
    if (opened) {
      nextTick(() => scrollContainer.value?.updateScrollState());
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
    @apply tw-flex tw-flex-col tw-bg-[var(--app-bar-background)] tw-flex-1 tw-relative tw-overflow-x-hidden tw-min-h-0;
    height: calc(100dvh - var(--app-bar-height));

    &--without-header {
      height: 100dvh;
    }

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

  &__navmenu-container {
    @apply tw-flex-auto tw-min-h-0;

    .vc-scrollable-container__viewport {
      padding: 0 var(--app-bar-padding);
    }

    // Make nested containers transparent — the viewport is the sole scroll viewport
    .vc-app-menu,
    .vc-container {
      @apply tw-h-auto tw-overflow-visible;
    }

    .vc-container__inner {
      @apply tw-overflow-visible;
    }
  }

  &__user {
    @apply tw-mt-auto;
  }

  &__content-main {
    @apply tw-relative tw-flex-shrink-0 tw-overflow-y-auto;
    max-height: 40vh;

    &:not(:empty) {
      @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-border)] tw-z-[2];

      &:before {
        content: "";
        @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px] tw-bg-[color:var(--app-bar-content-visible-border)] tw-z-[1] #{!important};
      }
    }
  }

  &__app-switcher-wrapper {
    @apply tw-flex-1 tw-overflow-y-auto tw-min-h-0;
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
