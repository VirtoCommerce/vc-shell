<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    @click="onClick"
  >
    <VcIcon
      v-if="icon"
      :class="['vc-button__icon', iconClass]"
      :icon="icon"
      :size="iconSize"
    ></VcIcon>
    <p
      v-if="$slots['default']"
      class="vc-button__title"
    >
      <slot></slot>
    </p>
  </button>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, type Component } from "vue";
import { VcIcon } from "./../vc-icon";
export interface Props {
  icon?: string | Component;
  iconClass?: string;
  iconSize?: InstanceType<typeof VcIcon>["$props"]["size"];
  variant?: "primary" | "secondary";
  disabled?: boolean;
  size?: "xs" | "sm" | "base";
  selected?: boolean;
  text?: boolean;
}

export interface Emits {
  /**
   * Emitted when component is clicked
   * */
  (event: "click", value: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  iconSize: "s",
  size: "base",
});

const emit = defineEmits<Emits>();

defineSlots<{
  default: (props?: any) => any;
}>();

const buttonClass = computed(() => {
  return [
    "vc-button",
    {
      [`vc-button-${props.variant}`]: props.variant,
      [`vc-button_${props.size}`]: props.size,
      "vc-button_selected": props.selected,
      "vc-button_text": props.text,
      "vc-button_disabled": props.disabled,
    },
  ];
});

function onClick(e: Event): void {
  if (!props.disabled) {
    e.preventDefault();
    emit("click", e);
  }
}
</script>

<style lang="scss">
:root {
  --button-primary-background-color: var(--primary-500);
  --button-primary-background-color-hover: var(--primary-600);
  --button-primary-background-color-disabled: var(--primary-300);
  --button-primary-text-color: var(--additional-50);
  --button-primary-text-color-disabled: var(--additional-50);
  --button-primary-border-color: var(--primary-500);
  --button-primary-border-color-hover: var(--primary-600);
  --button-primary-border-color-disabled: var(--primary-300);

  --button-secondary-background-color: var(--additional-50);
  --button-secondary-background-color-hover: var(--primary-100);
  --button-secondary-background-color-disabled: var(--additional-50);
  --button-secondary-text-color: var(--neutrals-700);
  --button-secondary-text-color-disabled: var(--neutrals-400);
  --button-secondary-border-color: var(--secondary-300);
  --button-secondary-border-color-hover: var(--secondary-400);
  --button-secondary-border-color-disabled: var(--secondary-300);

  --button-border-radius: 4px;

  --button-padding-hor: 14px;
  --button-padding-vert: 10px;

  --button-padding-hor-small: 12px;
  --button-padding-vert-small: 8px;

  --button-padding-vert-extra-small: 5px;
  --button-padding-hor-extra-small: 12px;

  --button-height: 36px;
  --button-height-small: 28px;
  --button-height-extra-small: 22px;
}

$variants: primary, secondary;

.vc-button {
  &__icon + &__title {
    @apply tw-ml-2 tw-text-left;
  }

  @each $variant in $variants {
    &.vc-button-#{$variant} {
      @apply tw-inline-flex tw-items-center tw-font-semibold tw-cursor-pointer tw-box-border tw-transition tw-duration-200
      tw-rounded-[var(--button-border-radius)]
      tw-min-h-[var(--button-height)]
      tw-bg-[color:var(--button-#{$variant}-background-color)]
      tw-border tw-border-[color:var(--button-#{$variant}-border-color)] tw-border-solid
      tw-flex tw-justify-center
      tw-text-[color:var(--button-#{$variant}-text-color)];

      &:hover {
        @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)] tw-border-[color:var(--button-#{$variant}-border-color-hover)];
      }

      &:focus {
        @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)] tw-border-[color:var(--button-#{$variant}-border-color-hover)];
      }

      &:disabled {
        @apply tw-text-[color:var(--button-#{$variant}-text-color-disabled)] tw-bg-[color:var(--button-#{$variant}-background-color-disabled)] tw-border-[color:var(--button-#{$variant}-border-color-disabled)] tw-cursor-not-allowed;
      }

      &.vc-button_text {
        @apply tw-border-none tw-bg-transparent
        tw-text-[color:var(--button-#{$variant}-background-color)]
        hover:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
        focus:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
        disabled:tw-text-[color:var(--button-#{$variant}-text-color-disabled)] disabled:tw-opacity-50;

        @apply tw-p-0 tw-min-h-0 #{!important};
      }

      &.vc-button_selected {
        @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)];

        &.vc-button_text {
          @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)] tw-bg-opacity-[0.07] tw-p-1;
        }
      }

      &.vc-button_xs {
        @apply tw-py-[var(--button-padding-vert-extra-small)] tw-min-h-[var(--button-height-extra-small)] tw-px-[var(--button-padding-hor-extra-small)] tw-text-xxs #{!important};
      }

      &.vc-button_sm {
        @apply tw-py-[var(--button-padding-vert-small)] tw-min-h-[var(--button-height-small)] tw-px-[var(--button-padding-hor-small)] tw-text-xs #{!important};
      }

      &.vc-button_base {
        @apply tw-py-[var(--button-padding-vert)] tw-min-h-[var(--button-height)] tw-px-[var(--button-padding-hor)] tw-text-sm tw-leading-4;
      }

      .vc-button__icon + .vc-button__title {
        @apply tw-ml-2;
      }
    }
  }
}
</style>
