<template>
  <template v-if="isExpanded">
    <div
      v-if="isExpanded"
      class="sidebar__overlay"
      @click.stop="$emit('close')"
    ></div>

    <div
      v-if="isExpanded"
      :class="[
        'sidebar__dropdown',
        {
          'sidebar__dropdown--mobile': $isMobile.value && render === 'mobile',
          'sidebar__dropdown--desktop': $isDesktop.value && render === 'desktop',
          'sidebar__dropdown--always': render === 'always',
          'sidebar__dropdown--left': position === 'left',
          'sidebar__dropdown--right': position === 'right',
        },
      ]"
    >
      <slot name="header">
        <div class="sidebar__header">
          <VcIcon
            icon="fas fa-times"
            size="xl"
            @click.stop="$emit('close')"
          ></VcIcon>
        </div>
      </slot>

      <slot name="content"></slot>
    </div>
  </template>
  <template v-else>
    <slot name="content"></slot>
  </template>
</template>

<script lang="ts" setup>
export interface Props {
  position?: "left" | "right";
  render: "always" | "mobile" | "desktop";
  isExpanded: boolean;
}

export interface Emits {
  (event: "close"): void;
}

defineEmits<Emits>();

withDefaults(defineProps<Props>(), {
  position: "right",
  render: "always",
});
</script>

<style lang="scss">
:root {
  --sidebar-mobile-bg-color: var(--neutral-500);
  --sidebar-dropdown-mobile-icon-color: var(--primary-500);
}

.sidebar {
  @apply tw-relative;

  &__overlay {
    @apply tw-fixed tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-z-[10000]
      tw-bg-[--sidebar-mobile-bg-color] tw-backdrop-blur-[3px];
  }
  &__header {
    @apply tw-text-[color:var(--sidebar-dropdown-mobile-icon-color)] tw-flex tw-justify-end tw-items-center tw-p-4 tw-cursor-pointer;
  }

  &__dropdown {
    @apply tw-absolute tw-top-[var(--app-bar-button-height)] tw-bg-[color:var(--app-bar-button-bg-color)] tw-z-[10000] tw-flex tw-flex-col;
    box-shadow: var(--app-bar-button-shadow);

    &--mobile,
    &--always,
    &--desktop {
      @apply tw-hidden tw-fixed tw-top-0 tw-max-h-full tw-max-w-[300px] tw-w-full tw-bottom-0 tw-z-[10000] tw-border-0;
      display: flex !important;
    }

    &--left {
      @apply tw-left-0 tw-right-auto;
    }

    &--right {
      @apply tw-right-0 tw-left-auto;
    }
  }
}
</style>
