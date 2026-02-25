<template>
  <span
    v-if="current"
    class="vc-breadcrumbs-item vc-breadcrumbs-item--current"
    :class="{ 'vc-breadcrumbs-item--light': variant === 'light' }"
    aria-current="page"
  >
    <VcIcon v-if="icon" class="vc-breadcrumbs-item__icon" :icon="icon" size="s" />
    <span class="vc-breadcrumbs-item__title" :title="resolvedTitle">{{ resolvedTitle }}</span>
  </span>
  <button
    v-else
    type="button"
    class="vc-breadcrumbs-item"
    :class="{ 'vc-breadcrumbs-item--light': variant === 'light' }"
    @click="onClick"
  >
    <VcIcon v-if="icon" class="vc-breadcrumbs-item__icon" :icon="icon" size="s" />
    <span class="vc-breadcrumbs-item__title" :title="resolvedTitle">{{ resolvedTitle }}</span>
  </button>
</template>

<script lang="ts" setup>
import { computed, toValue } from "vue";
import type { Breadcrumbs } from "../../../../../types/index";
import { VcIcon } from "@ui/components";

export interface Props extends Breadcrumbs {
  current: boolean;
  variant?: "default" | "light";
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const resolvedTitle = computed(() => toValue(props.title) ?? "");

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

button.vc-breadcrumbs-item {
  @apply tw-appearance-none tw-border-0 tw-bg-transparent tw-p-0 tw-cursor-pointer;
  font: inherit;
  color: inherit;
}
</style>
