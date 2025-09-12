<template>
  <div class="vc-radio-button">
    <label class="vc-radio-button__label">
      <input
        type="radio"
        :name="name"
        :value="value"
        :checked="checked"
        :disabled="disabled"
        :class="{
          'vc-radio-button_error': error,
        }"
        tabindex="0"
        @change="onChange"
      />

      {{ label }}
    </label>
    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-radio-button__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import * as _ from "lodash-es";
import { computed } from "vue";

export interface Props {
  /**
   * Value of the radio button.
   */
  value: any;
  /**
   * Value binding of the radio button.
   */
  modelValue: any;
  /**
   * Allows to select a boolean value.
   */
  binary?: boolean;
  /**
   * Specifies that the radio button should be selected.
   */
  checked?: boolean;
  /**
   * Disables the radio button.
   */
  disabled?: boolean;
  /**
   * Name of the radio button.
   */
  name?: string;
  /**
   * Label of the radio button.
   */
  label?: string;
  /**
   * Specifies that the component should have error state style.
   */
  error?: boolean;
  /**
   * Error message to display.
   */
  errorMessage?: string;
}

export interface Emits {
  /**
   * Emits when the radio button is changed.
   */
  (event: "update:modelValue", value: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  name: "RadioField",
});
const emit = defineEmits<Emits>();

const checked = computed(() => {
  return props.modelValue != null && (props.binary ? !!props.modelValue : _.isEqual(props.modelValue, props.value));
});

function onChange() {
  if (!props.disabled) {
    const model = props.binary ? !checked.value : props.value;

    emit("update:modelValue", model);
  }
}
</script>

<style lang="scss">
:root {
  --radio-active: var(--primary-500);
  --radio-active-inner: var(--additional-50);
  --radio-border: var(--neutrals-400);

  --radio-background: var(--additional-50);
  --radio-disabled: var(--secondary-100);
  --radio-disabled-inner: var(--secondary-200);
  --radio-error: var(--danger-500);
  --radio-size: 20px;

  // Outline
  --radio-border-outline: var(--primary-50);
}

.vc-radio-button {
  &__label {
    @apply tw-text-base tw-flex tw-items-center tw-gap-1.5;
  }

  input[type="radio"] {
    flex-shrink: 0;
    border-radius: 50%;
    appearance: none;
    height: var(--radio-size);
    outline: none;
    display: inline-block;
    vertical-align: top;
    position: relative;
    margin: 0;
    cursor: pointer;
    border: 2px solid var(--radio-border-color, var(--radio-border));
    background: var(--radio-bg, var(--radio-background));
    width: var(--radio-size);
    transition:
      background 0.3s,
      border-color 0.3s,
      box-shadow 0.2s;

    &:after {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--radio-active-inner);
      opacity: 0;
      transform: scale(var(--radio-scale, 0.7));
      opacity: var(--radio-after-opacity, 0);
      content: "";
      display: block;
      left: 0;
      top: 0;
      position: absolute;
      transition:
        transform var(--radio-after-transform-duration, 0.3s) var(--radio-after-transform-ease, ease),
        opacity var(--radio-after-opacity-duration, 0.2s);
    }

    &:checked {
      --radio-bg: var(--radio-active);
      --radio-border-color: var(--radio-active);
      --radio-after-opacity-duration: 0.3s;
      --radio-after-transform-duration: 0.6s;
      --radio-after-transform-ease: cubic-bezier(0.2, 0.85, 0.32, 1.2);
      --radio-scale: 0.5;
      --radio-after-opacity: 1;
    }

    &:disabled {
      --radio-bg: var(--radio-disabled);
      cursor: not-allowed;
      opacity: 0.9;
      &:checked {
        --radio-bg: var(--radio-disabled-inner);
        --radio-border-color: var(--radio-border);
      }
      & + label {
        cursor: not-allowed;
      }
    }

    &:hover {
      &:not(:checked) {
        &:not(:disabled) {
          --radio-border-color: var(--radio-border-hover);
          outline: 3px solid var(--radio-border-outline);
        }
      }
    }

    &.vc-radio-button_error {
      --radio-border-color: var(--radio-error);
    }
  }

  &__error {
    @apply tw-mt-1 [--hint-color:var(--radio-error)];
  }
}
</style>
