<template>
  <div
    class="vc-breadcrumbs-item"
    :class="{
      'vc-breadcrumbs-item--current': current,
      'vc-breadcrumbs-item--light': variant === 'light',
    }"
    @click="onClick"
  >
    <VcIcon
      v-if="icon"
      class="vc-breadcrumbs-item__icon"
      :icon="icon"
      size="s"
    />
    <div class="vc-breadcrumbs-item__title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Breadcrumbs } from "../../../../../types";
import { VcIcon } from "./../../../../";

export interface Props extends Breadcrumbs {
  current: boolean;
  variant?: "default" | "light";
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

function onClick(): void {
  if (!props.current) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      props.clickHandler(props.id);
    } else {
      emit("click");
    }
  }
}
</script>

<style lang="scss">
:root {
  --breadcrumbs-item-text-color: var(--secondary-300);
  --breadcrumbs-item-text-color-hover: var(--neutrals-500);
  --breadcrumbs-item-color: var(--neutrals-400);
  --breadcrumbs-item-color-current: var(--primary-500);
  --breadcrumbs-item-icon-color: var(--secondary-300);
}

.vc-breadcrumbs-item {
  @apply tw-box-border tw-text-sm tw-cursor-pointer tw-inline-flex tw-items-center;
  @apply tw-h-[var(--breadcrumbs-item-height)] tw-whitespace-nowrap;
  @apply tw-text-[color:var(--breadcrumbs-item-color)] tw-leading-normal;
  @apply tw-transition-colors tw-duration-300;

  &--current {
    @apply tw-text-[color:var(--breadcrumbs-item-color-current)] tw-cursor-default tw-mr-0;
  }

  &--light {
    @apply tw-px-1;
  }

  &__icon {
    @apply tw-mr-2 tw-text-[color:var(--breadcrumbs-item-icon-color)];
  }

  &__title {
    @apply tw-max-w-[150px] tw-truncate;
  }

  &--error {
    @apply tw-text-[color:var(--breadcrumbs-item-color-error)];
  }

  &:hover {
    @apply tw-text-[color:var(--breadcrumbs-item-text-color-hover)];
  }
}
</style>
