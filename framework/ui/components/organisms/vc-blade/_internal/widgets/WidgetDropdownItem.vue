<template>
  <div
    class="vc-widget-dropdown-item"
    :class="{
      'vc-widget-dropdown-item--disabled': disabled,
    }"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <VcIcon
      v-if="icon"
      :icon="icon"
      size="s"
      class="vc-widget-dropdown-item__icon"
      aria-hidden="true"
    />
    <span class="vc-widget-dropdown-item__title">{{ title }}</span>
    <span
      v-if="formattedBadge !== undefined"
      class="vc-widget-dropdown-item__badge"
    >
      {{ formattedBadge }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toValue, type MaybeRef } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { formatBadgeCount } from "@shared/utilities/formatBadgeCount";

export interface WidgetDropdownItemProps {
  icon?: string;
  title: string;
  badge?: MaybeRef<number | string | undefined>;
  disabled?: boolean;
}

const props = defineProps<WidgetDropdownItemProps>();
const emit = defineEmits<{
  (event: "click"): void;
}>();

const formattedBadge = computed(() => formatBadgeCount(toValue(props.badge)));

function handleClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
.vc-widget-dropdown-item {
  @apply tw-flex tw-items-center tw-gap-2 tw-w-full tw-px-3 tw-py-2 tw-rounded-md
    tw-text-sm tw-cursor-pointer tw-transition-colors tw-duration-150;

  &:hover:not(.vc-widget-dropdown-item--disabled) {
    background-color: var(--neutrals-50);
  }

  &:focus-visible {
    @apply tw-outline-none tw-ring-2 tw-ring-offset-1;
    ring-color: var(--primary-300);
  }

  &--disabled {
    @apply tw-opacity-50 tw-pointer-events-none tw-cursor-default;
  }

  &__icon {
    @apply tw-shrink-0;
    color: var(--neutrals-600);
  }

  &__title {
    @apply tw-truncate tw-flex-1;
    color: var(--neutrals-800);
  }

  &__badge {
    @apply tw-shrink-0 tw-text-xs tw-font-medium tw-px-1.5 tw-py-0.5 tw-rounded-full;
    background-color: var(--primary-50);
    color: var(--primary-700);
  }
}
</style>
