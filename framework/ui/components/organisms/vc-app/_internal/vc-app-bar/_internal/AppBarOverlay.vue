<template>
  <Teleport to="body">
    <div
      class="app-bar-overlay"
      :class="{
        'app-bar-overlay--mobile': $isMobile.value,
        'app-bar-overlay--desktop': $isDesktop.value,
        'app-bar-overlay--sidebar': isSidebarMode,
        'app-bar-overlay--standalone-mobile': $isMobile.value && !isSidebarMode,
        'app-bar-overlay--collapsed': !expanded && !$isMobile.value,
      }"
    >
      <div class="app-bar-overlay__content app-bar-overlay__dropdowns">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
defineProps<{
  isSidebarMode: boolean;
  expanded: boolean;
}>();

defineEmits<{
  (e: "close"): void;
}>();
</script>

<style lang="scss">
.app-bar-overlay {
  @apply tw-w-auto tw-h-full tw-absolute tw-top-0 tw-right-0 tw-z-[11]
         tw-bg-[color:var(--app-bar-background)];

  &--standalone-mobile {
    @apply tw-w-full !important;
  }

  &--sidebar {
    @apply tw-w-[var(--app-bar-width)];
  }

  &--mobile {
    @apply tw-fixed tw-top-[var(--app-bar-mobile-height)] tw-left-0 tw-bottom-0 tw-flex-1 tw-w-[var(--app-bar-mobile-width)] tw-z-[10001];

    .app-bar-overlay__content {
      @apply tw-flex tw-flex-col tw-h-[calc(100%-var(--app-bar-mobile-height))];
    }
  }

  &--collapsed {
    @apply tw-z-[14];
  }

  &--desktop {
    @apply tw-fixed tw-top-[var(--app-bar-height)] tw-left-0 tw-bottom-0 tw-flex-1 tw-w-[var(--app-bar-width)];

    .app-bar-overlay__content {
      @apply tw-flex tw-flex-col tw-h-[calc(100%-var(--app-bar-height))];
    }
  }

  &__content {
    @apply tw-relative;

    &:before {
      content: "";
      @apply tw-absolute tw-left-0 tw-top-[-1px] tw-w-full tw-h-[1px]
             tw-bg-[color:var(--app-bar-border)] tw-z-[1];
    }
  }

  &__dropdowns {
    @apply tw-h-auto tw-relative;

    &:not(:empty) {
      @apply tw-visible tw-border-b-[2px] tw-border-[color:var(--app-bar-border)] tw-z-[2];

      &:before {
        content: "";
        @apply tw-absolute tw-left-0 tw-top-[-2px] tw-w-full tw-h-[2px]
               tw-bg-[color:var(--app-bar-content-visible-border)] tw-z-[1] #{!important};
      }
    }
  }
}
</style>
