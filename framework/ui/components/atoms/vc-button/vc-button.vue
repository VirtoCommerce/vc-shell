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
      :size="small ? 'xs' : iconSize"
    ></VcIcon>
    <span
      v-if="$slots['default']"
      class="vc-button__title"
    >
      <slot></slot>
    </span>
  </button>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from "vue";
import { VcIcon } from "./../vc-icon";
export interface Props {
  icon?: string;
  iconClass?: string;
  iconSize?: InstanceType<typeof VcIcon>["$props"]["size"];
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
  iconSize: "s",
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
  --button-primary-background-color: var(--primary-500);
  --button-primary-background-color-hover: var(--primary-600);
  --button-primary-background-color-disabled: var(--primary-300);
  --button-primary-text-color: var(--neutrals-50);
  --button-primary-text-color-outlined: var(--button-primary-background-color);
  --button-primary-text-color-hover: var(--button-primary-background-color-hover);

  --button-warning-background-color: var(--warning-500);
  --button-warning-background-color-hover: var(--warning-600);
  --button-warning-background-color-disabled: var(--warning-300);
  --button-warning-text-color: var(--neutrals-50);
  --button-warning-text-color-outlined: var(--button-warning-background-color);
  --button-warning-text-color-hover: var(--button-warning-background-color-hover);

  --button-danger-background-color: var(--danger-500);
  --button-danger-background-color-hover: var(--danger-600);
  --button-danger-background-color-disabled: var(--danger-300);
  --button-danger-text-color: var(--neutrals-50);
  --button-danger-text-color-outlined: var(--button-danger-background-color);
  --button-danger-text-color-hover: var(--button-danger-background-color-hover);

  --button-border-radius: 3px;
  --button-padding-hor: 14px;
  --button-padding-hor-small: 14px;
  --button-padding-vert: 10px;
  --button-padding-vert-small: 2px;

  --button-height: 36px;
  --button-height-small: 28px;

  --button-raised-shadow-color: var(--secondary-200);
  --button-raised-shadow: 1px 4px 10px rgb(from var(--button-raised-shadow-color) r g b / 100%);
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
      tw-bg-[color:var(--button-#{$variant}-background-color)]
      tw-flex tw-justify-center
      tw-text-[color:var(--button-#{$variant}-text-color)]
      hover:tw-bg-[color:var(--button-#{$variant}-background-color-hover)]
      focus:tw-bg-[color:var(--button-#{$variant}-background-color-hover)]
      disabled:tw-cursor-not-allowed
      disabled:tw-bg-[color:var(--button-#{$variant}-background-color-disabled)];

      &.vc-button_small {
        @apply tw-py-[var(--button-padding-vert-small)] tw-min-h-[var(--button-height-small)] tw-px-[var(--button-padding-hor-small)] tw-font-normal tw-text-xs;

        .vc-button__icon + .vc-button__title {
          @apply tw-ml-1;
        }
      }

      &.vc-button_outline {
        @apply tw-bg-transparent tw-border tw-border-[color:var(--button-#{$variant}-background-color)]
        tw-text-[color:var(--button-#{$variant}-text-color-outlined)]
        hover:tw-text-[color:var(--button-#{$variant}-text-color-hover)]
        hover:tw-bg-transparent
        hover:tw-border-[color:var(--button-#{$variant}-background-color-hover)]
        disabled:tw-text-[color:rgb(from_var(--button-#{$variant}-text-color-hover)_r_g_b/50%)]
        disabled:tw-border-[color:rgb(from_var(--button-#{$variant}-background-color)_r_g_b/50%)]
        disabled:tw-bg-transparent;
      }

      &.vc-button_text {
        @apply tw-border-none tw-bg-transparent tw-p-0 tw-min-h-0
        tw-text-[color:var(--button-#{$variant}-background-color)]
        hover:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
        focus:tw-text-[color:var(--button-#{$variant}-background-color-hover)]
        disabled:tw-text-[color:rgb(from_var(--button-#{$variant}-background-color)_r_g_b/50%)];
      }

      &.vc-button_raised {
        @apply [box-shadow:var(--button-raised-shadow)] tw-px-[var(--button-padding-hor)] tw-py-[var(--button-padding-vert)];

        &.vc-button_text:not(:disabled) {
          &:hover,
          &:focus {
            @apply tw-bg-[color:rgb(from_var(--button-#{$variant}-background-color-hover)_r_g_b/7%)];
          }
        }
      }

      &.vc-button_selected {
        @apply tw-bg-[color:var(--button-#{$variant}-background-color-hover)];

        &.vc-button_text {
          @apply tw-bg-[color:rgb(from_var(--button-#{$variant}-background-color-hover)_r_g_b/7%)] tw-p-1;
        }

        &.vc-button_outline {
          @apply tw-border-[color:var(--button-#{$variant}-background-color-hover)]  tw-bg-transparent  #{!important};
        }
      }
    }
  }
}
</style>
