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
  --breadcrumbs-item-height: 28px;
  --breadcrumbs-item-height-light: 20px;
  --breadcrumbs-item-border-color: var(--secondary-300);
  --breadcrumbs-item-border-color-hover: var(--secondary-400);
  --breadcrumbs-item-border-color-current: var(--secondary-500);
  --breadcrumbs-item-color: var(--primary-500);
  --breadcrumbs-item-color-current: var(--primary-600);
  --breadcrumbs-item-icon-color: var(--secondary-300);
}

.vc-breadcrumbs-item {
  @apply tw-box-border tw-rounded-[3px] tw-border tw-border-solid tw-text-sm tw-cursor-pointer tw-inline-flex tw-items-center;
  @apply tw-h-[var(--breadcrumbs-item-height)] tw-px-3 tw-whitespace-nowrap;
  @apply tw-border-[color:var(--breadcrumbs-item-border-color)] tw-text-[color:var(--breadcrumbs-item-color)];
  @apply tw-transition-colors tw-duration-300;

  &--current {
    @apply tw-text-[color:var(--breadcrumbs-item-color-current)] tw-border-[color:var(--breadcrumbs-item-border-color-current)] tw-cursor-default tw-mr-0;
  }

  &--light {
    @apply tw-px-1 tw-h-[var(--breadcrumbs-item-height-light)];
  }

  &__icon {
    @apply tw-mr-2 tw-text-[color:var(--breadcrumbs-item-icon-color)];
  }

  &__title {
    @apply tw-max-w-[150px] tw-truncate;
  }

  &--error {
    @apply tw-border-[color:var(--breadcrumbs-item-border-color-error)] tw-text-[color:var(--breadcrumbs-item-color-error)];
  }

  &:hover {
    @apply tw-border tw-border-solid tw-border-[color:var(--breadcrumbs-item-border-color-hover)];
  }
}
</style>
