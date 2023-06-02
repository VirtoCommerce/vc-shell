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
      :size="small ? 'xs' : 's'"
    ></VcIcon>
    <span
      v-if="$slots['default']"
      class="vc-button__title"
    >
      <slot></slot>
    </span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { VcIcon } from "./../vc-icon";
export interface Props {
  icon?: string;
  iconClass?: string;
  variant?: "primary" | "warning" | "danger";
  disabled?: boolean;
  small?: boolean;
  outline?: boolean;
  selected?: boolean;
  text?: boolean;
  raised?: boolean;
}

export interface Emits {
  /**
   * Emitted when component is clicked
   * */
  (event: "click", value: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
});

const emit = defineEmits<Emits>();

const buttonClass = computed(() => {
  return [
    "vc-button",
    {
      [`vc-button-${props.variant}`]: props.variant,
      "vc-button_small": props.small,
      "vc-button_outline": props.outline,
      "vc-button_selected": props.selected,
      "vc-button_text": props.text,
      "vc-button_raised": props.raised,
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
  --button-primary-background-color: 65, 175, 230;
  --button-primary-background-color-hover: 49, 158, 212;
  --button-primary-background-color-disabled: 169, 221, 246;
  --button-primary-text-color: 255, 255, 255;
  --button-primary-text-color-outlined: var(--button-primary-background-color);
  --button-primary-text-color-hover: var(--button-primary-background-color-hover);

  --button-warning-background-color: 248, 148, 6;
  --button-warning-background-color-hover: 235, 139, 3;
  --button-warning-background-color-disabled: 254, 212, 152;
  --button-warning-text-color: 255, 255, 255;
  --button-warning-text-color-outlined: var(--button-warning-background-color);
  --button-warning-text-color-hover: var(--button-warning-background-color-hover);

  --button-danger-background-color: 255, 74, 74;
  --button-danger-background-color-hover: 215, 58, 58;
  --button-danger-background-color-disabled: 255, 94, 94;
  --button-danger-text-color: 255, 255, 255;
  --button-danger-text-color-outlined: var(--button-danger-background-color);
  --button-danger-text-color-hover: var(--button-danger-background-color-hover);

  --button-border-radius: 3px;
  --button-padding-hor: 14px;
  --button-padding-hor-small: 14px;
  --button-padding-vert: 10px;
  --button-padding-vert-small: 2px;

  --button-height: 36px;
  --button-height-small: 28px;
}

$variants: primary, warning, danger;

.vc-button {
  &__icon + &__title {
    @apply tw-ml-2 tw-text-left;
  }

  @each $variant in $variants {
    &.vc-button-#{$variant} {
      @apply tw-inline-flex tw-items-center tw-font-medium tw-text-sm tw-cursor-pointer tw-box-border tw-transition tw-duration-200
      tw-rounded-[var(--button-border-radius)] tw-px-[var(--button-padding-hor)] tw-py-[var(--button-padding-vert)]
      tw-min-h-[var(--button-height)]
      tw-bg-[color:rgb(var(--button-#{$variant}-background-color))]
      tw-flex tw-justify-center
      tw-text-[color:rgb(var(--button-#{$variant}-text-color))]
      hover:tw-bg-[color:rgb(var(--button-#{$variant}-background-color-hover))]
      focus:tw-bg-[color:rgb(var(--button-#{$variant}-background-color-hover))]
      disabled:tw-cursor-not-allowed
      disabled:tw-bg-[color:rgb(var(--button-#{$variant}-background-color-disabled))];

      &.vc-button_small {
        @apply tw-py-[var(--button-padding-vert-small)] tw-min-h-[var(--button-height-small)] tw-px-[var(--button-padding-hor-small)] tw-font-normal tw-text-xs;

        .vc-button__icon + .vc-button__title {
          @apply tw-ml-1;
        }
      }

      &.vc-button_outline {
        @apply tw-bg-transparent tw-border tw-border-[color:rgb(var(--button-#{$variant}-background-color))]
        tw-text-[color:rgb(var(--button-#{$variant}-text-color-outlined))]
        hover:tw-text-[color:rgb(var(--button-#{$variant}-text-color-hover))]
        hover:tw-bg-transparent
        hover:tw-border-[color:rgb(var(--button-#{$variant}-background-color-hover))]
        disabled:tw-text-[color:rgba(var(--button-#{$variant}-text-color-hover),0.5)]
        disabled:tw-border-[color:rgba(var(--button-#{$variant}-background-color),0.5)]
        disabled:tw-bg-transparent;
      }

      &.vc-button_text {
        @apply tw-border-none tw-bg-transparent tw-p-0 tw-min-h-0
        tw-text-[color:rgb(var(--button-#{$variant}-background-color))]
        hover:tw-text-[color:rgb(var(--button-#{$variant}-background-color-hover))]
        focus:tw-text-[color:rgb(var(--button-#{$variant}-background-color-hover))]
        disabled:tw-text-[color:rgba(var(--button-#{$variant}-background-color),0.5)];
      }

      &.vc-button_raised {
        @apply tw-shadow-[1px_4px_10px_rgba(197,206,214,0.24)] tw-px-[var(--button-padding-hor)] tw-py-[var(--button-padding-vert)];

        &.vc-button_text:not(:disabled) {
          &:hover,
          &:focus {
            @apply tw-bg-[color:rgba(var(--button-#{$variant}-background-color-hover),0.07)];
          }
        }
      }

      &.vc-button_selected {
        @apply tw-bg-[color:rgb(var(--button-#{$variant}-background-color-hover))];

        &.vc-button_text {
          @apply tw-bg-[color:rgba(var(--button-#{$variant}-background-color-hover),0.07)];
        }
      }
    }
  }
}
</style>
