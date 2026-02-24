<template>
  <div class="vc-radio-button">
    <label class="vc-radio-button__label">
      <input
        :id="radioId"
        type="radio"
        :name="resolvedName"
        :value="value"
        :checked="checked"
        :disabled="resolvedDisabled"
        :aria-invalid="invalid || undefined"
        :aria-required="ariaRequired"
        :aria-describedby="ariaDescribedBy"
        :class="{ 'vc-radio-button--error': invalid }"
        tabindex="0"
        @change="onChange"
      />

      {{ label }}
    </label>
    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-radio-button__error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { isEqual } from "lodash-es";
import { computed } from "vue";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types";

export interface Props extends IFormFieldProps {
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

defineSlots<{
  error: (props: Record<string, never>) => any;
}>();

const { fieldId: radioId, errorId, invalid, resolvedDisabled, resolvedName, ariaRequired, ariaDescribedBy } =
  useFormField(props);

const checked = computed(() => {
  return props.modelValue != null && (props.binary ? !!props.modelValue : isEqual(props.modelValue, props.value));
});

function onChange() {
  if (!resolvedDisabled.value) {
    const model = props.binary ? !checked.value : props.value;

    emit("update:modelValue", model);
  }
}
</script>

<style lang="scss">
:root {
  --radio-size: 16px;
  --radio-dot-size: 8px;
  --radio-border-color: var(--neutrals-300);
  --radio-border-color-hover: var(--neutrals-400);
  --radio-background: var(--additional-50);
  --radio-active: var(--primary-500);
  --radio-active-inner: var(--additional-50);
  --radio-disabled-bg: var(--neutrals-100);
  --radio-disabled-opacity: 0.5;
  --radio-error: var(--danger-500);
  --radio-error-ring-color: var(--danger-100);
  --radio-focus-ring-color: var(--primary-100);
}

.vc-radio-button {
  &__label {
    @apply tw-text-sm tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-select-none;
  }

  input[type="radio"] {
    flex-shrink: 0;
    border-radius: 9999px;
    appearance: none;
    height: var(--radio-size);
    width: var(--radio-size);
    outline: none;
    display: inline-block;
    vertical-align: top;
    position: relative;
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--radio-border-color);
    background: var(--radio-background);
    transition:
      border-color 200ms ease,
      box-shadow 200ms ease;

    &::after {
      width: var(--radio-dot-size);
      height: var(--radio-dot-size);
      border-radius: 9999px;
      background: var(--radio-active);
      transform: scale(0);
      opacity: 0;
      content: "";
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: calc(var(--radio-dot-size) / -2);
      margin-top: calc(var(--radio-dot-size) / -2);
      transition:
        transform 200ms cubic-bezier(0.2, 0.85, 0.32, 1.2),
        opacity 200ms ease;
    }

    &:checked {
      border-color: var(--radio-active);

      &::after {
        transform: scale(1);
        opacity: 1;
      }
    }

    &:disabled {
      background: var(--radio-disabled-bg);
      cursor: not-allowed;
      opacity: var(--radio-disabled-opacity);

      & + label {
        cursor: not-allowed;
      }
    }

    &:hover:not(:disabled):not(:checked) {
      border-color: var(--radio-border-color-hover);
    }

    &:focus-visible {
      @apply tw-ring-[3px] tw-ring-[color:var(--radio-focus-ring-color)] tw-outline-none;
    }

    &.vc-radio-button--error {
      border-color: var(--radio-error);
      @apply tw-ring-[3px] tw-ring-[color:var(--radio-error-ring-color)];
    }
  }

  &__error {
    @apply tw-mt-1 [--hint-error-color:var(--radio-error)];
  }

}
</style>
