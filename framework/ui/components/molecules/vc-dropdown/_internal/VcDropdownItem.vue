<template>
  <div
    class="vc-dropdown-item"
    :class="{
      'vc-dropdown-item--active': active,
      'vc-dropdown-item--disabled': disabled,
    }"
  >
    <VcIcon
      v-if="active"
      icon="lucide-check"
      size="xs"
      class="vc-dropdown-item__icon"
    />
    <VcIcon
      v-else-if="icon"
      :icon="icon"
      size="xs"
      class="vc-dropdown-item__icon"
    />
    <span
      v-else
      class="vc-dropdown-item__icon-placeholder"
    />
    <span class="vc-dropdown-item__title">{{ title }}</span>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@ui/components/atoms/vc-icon";

export interface Props {
  /** Item label text */
  title: string;
  /** Optional leading Lucide icon name (e.g. "lucide-globe") */
  icon?: string;
  /** Show lucide-check indicator for active/selected state */
  active?: boolean;
  /** Visually disabled state */
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
});
</script>

<style lang="scss">
.vc-dropdown-item {
  @apply tw-flex tw-items-center tw-gap-2 tw-w-full tw-px-2 tw-py-[6px] tw-rounded-md
    tw-text-sm tw-cursor-pointer tw-transition-colors tw-duration-150;

  &:hover {
    background: var(--neutrals-100);
  }

  &--active {
    @apply tw-font-medium;
  }

  &--disabled {
    @apply tw-opacity-50 tw-pointer-events-none;
  }

  &__icon {
    @apply tw-w-3.5 tw-shrink-0;
  }

  &__icon-placeholder {
    @apply tw-w-3.5 tw-shrink-0;
  }

  &__title {
    @apply tw-truncate;
  }
}
</style>
