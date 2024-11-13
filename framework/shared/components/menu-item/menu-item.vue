<template>
  <div
    class="vc-menu-item"
    :class="{
      'vc-menu-item--active': isActive,
      'vc-menu-item--clickable': !disabled,
      'vc-menu-item--invisible': !isVisible,
    }"
    @click.stop="!disabled && $emit('click')"
  >
    <slot>
      <div class="vc-menu-item__content">
        <!-- Icon slot -->
        <slot name="icon">
          <VcIcon
            v-if="icon"
            :icon="icon"
            size="l"
            class="vc-menu-item__icon"
          />
          <VcImage
            v-else-if="image"
            :src="image"
            class="vc-menu-item__image"
            :empty-icon="emptyIcon"
          />
        </slot>

        <!-- Title slot -->
        <slot name="title">
          <p class="vc-menu-item__title">{{ title }}</p>
        </slot>

        <!-- Additional content slot -->
        <slot name="additional" />
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { Component } from "vue";
import { VcIcon, VcImage } from "../../../ui/components";

withDefaults(
  defineProps<{
    title?: string;
    icon?: string | Component;
    image?: string;
    emptyIcon?: string;
    isActive?: boolean;
    disabled?: boolean;
    isVisible?: boolean;
  }>(),
  {
    isVisible: true,
  },
);

defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss">
.vc-menu-item {
  @apply tw-p-3 tw-text-sm tw-text-[color:var(--menu-item-text-color,var(--user-dropdown-menu-text-color))]
    tw-border-solid tw-border-b tw-border-b-[color:var(--menu-item-border-color,var(--user-dropdown-divider-color))]
    tw-bg-[color:var(--menu-item-bg,var(--user-dropdown-menu-item-bg))] tw-flex tw-flex-row tw-items-center;

  &--clickable {
    @apply tw-cursor-pointer;

    &:hover {
      @apply tw-bg-[color:var(--menu-item-bg-hover,var(--user-dropdown-menu-item-bg-hover))];

      .vc-menu-item__icon {
        @apply tw-text-[color:var(--menu-item-icon-color-hover,var(--user-dropdown-button-color-hover))];
      }
    }
  }

  &--invisible {
    @apply tw-hidden;
  }

  &--active {
    @apply tw-bg-[color:var(--menu-item-bg-active,var(--user-dropdown-menu-item-bg-hover))];
  }

  &:last-of-type {
    @apply tw-border-b-0;
  }

  &__content {
    @apply tw-flex tw-items-center tw-w-full;
  }

  &__icon {
    @apply tw-w-6 tw-mr-3 tw-text-[color:var(--menu-item-icon-color,var(--user-dropdown-button-color))];
  }

  &__image {
    @apply tw-w-6 tw-h-6 tw-mr-3;
  }

  &__title {
    @apply tw-flex-grow;
  }
}
</style>
