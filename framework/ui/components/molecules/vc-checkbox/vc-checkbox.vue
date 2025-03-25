<template>
  <div
    class="vc-checkbox"
    :class="{
      'vc-checkbox--disabled': disabled,
      'vc-checkbox--error': !!errorMessage,
      'vc-checkbox--indeterminate': indeterminate,
      [`vc-checkbox--size-${size}`]: true,
    }"
  >
    <VcLabel
      v-if="label"
      class="vc-checkbox__label"
      :required="required"
      :error="!!errorMessage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <label class="vc-checkbox__container">
      <input
        ref="checkboxRef"
        v-model="value"
        type="checkbox"
        class="vc-checkbox__input"
        :disabled="disabled"
        :true-value="trueValue"
        :false-value="falseValue"
        tabindex="0"
      />

      <span class="vc-checkbox__custom-input">
        <slot name="icon">
          <svg
            v-if="checked && !indeterminate"
            class="vc-checkbox__check-icon"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.90927 3.80151C10.3113 3.3995 10.9631 3.3995 11.3651 3.80151C11.7671 4.20352 11.7671 4.85531 11.3651 5.25732L6.35527 10.2671C5.95326 10.6691 5.30148 10.6691 4.89947 10.2671L2.63476 8.00241C2.23275 7.6004 2.23275 6.94862 2.63476 6.54661C3.03677 6.14459 3.68856 6.14459 4.09057 6.54661L5.62737 8.08341L9.90927 3.80151Z"
              fill="var(--additional-50)"
            />
          </svg>

          <span
            v-if="indeterminate"
            class="vc-checkbox__indeterminate-line"
          ></span>
        </slot>
      </span>

      <span
        v-if="$slots.default"
        class="vc-checkbox__text"
      >
        <slot></slot>
      </span>

      <span
        v-if="!label && required"
        class="vc-checkbox__required"
        >*</span
      >
    </label>

    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-checkbox__error">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { MaybeRef, computed, unref, ref, watch, onMounted } from "vue";
import { VcHint } from "./../../atoms/vc-hint";
import { VcLabel } from "../../atoms/vc-label";

export interface Props {
  modelValue: MaybeRef<boolean>;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  errorMessage?: string;
  trueValue?: boolean;
  falseValue?: boolean;
  label?: string;
  tooltip?: string;
  size?: "s" | "m" | "l";
  outline?: boolean;
  indeterminate?: boolean;
}

export interface Emits {
  (event: "update:modelValue", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  name: "Field",
  trueValue: true,
  falseValue: false,
  size: "s",
  indeterminate: false,
});
const emit = defineEmits<Emits>();

defineSlots<{
  default: (props: Record<string, never>) => unknown;
  error: (props: Record<string, never>) => unknown;
  icon: (props: Record<string, never>) => unknown;
}>();

const checkboxRef = ref<HTMLInputElement | null>(null);

const value = computed({
  get() {
    return unref(props.modelValue);
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});

const checked = computed(() => {
  return value.value === props.trueValue;
});

// Управление indeterminate состоянием
watch(
  () => props.indeterminate,
  (val) => {
    if (checkboxRef.value) {
      checkboxRef.value.indeterminate = val;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (checkboxRef.value && props.indeterminate) {
    checkboxRef.value.indeterminate = props.indeterminate;
  }
});
</script>

<style lang="scss">
:root {
  /* Checkbox size */
  --checkbox-size-s: 14px;
  --checkbox-size-m: 18px;
  --checkbox-size-l: 24px;

  /* Main colors */
  --checkbox-border-color: var(--neutrals-400);
  --checkbox-bg-color: var(--additional-50);
  --checkbox-text-color: var(--neutrals-900);

  /* Checkbox checked state */
  --checkbox-checked-bg-color: var(--primary-500);
  --checkbox-checked-border-color: var(--primary-500);
  --checkbox-icon-color: var(--additional-50);

  /* Indeterminate state */
  --checkbox-indeterminate-bg-color: var(--neutrals-500);
  --checkbox-indeterminate-border-color: var(--neutrals-500);
  --checkbox-indeterminate-line-color: var(--additional-50);

  /* Error state */
  --checkbox-error-border-color: var(--danger-500);
  --checkbox-error-text-color: var(--danger-500);

  /* Disabled state */
  --checkbox-disabled-bg-color: var(--neutrals-200);
  --checkbox-disabled-border-color: var(--neutrals-200);
  --checkbox-disabled-opacity: 0.7;

  /* Focus */
  --checkbox-focus-shadow-color: var(--primary-50);
  --checkbox-focus-shadow-size: 2px;

  /* Other */
  --checkbox-border-radius: 2px;
  --checkbox-required-color: var(--danger-500);
  --checkbox-transition-duration: 0.2s;
  --checkbox-margin-spacing: 0.5rem;
  --checkbox-text-margin: 0.5rem;
}

.vc-checkbox {
  display: flex;
  flex-direction: column;

  &__label {
    margin-bottom: var(--checkbox-margin-spacing);
  }

  &__container {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:hover + .vc-checkbox__custom-input {
      outline: var(--checkbox-focus-shadow-size) solid var(--checkbox-focus-shadow-color);
    }

    &:disabled + .vc-checkbox__custom-input {
      background-color: var(--checkbox-disabled-bg-color);
      border-color: var(--checkbox-disabled-border-color);
      cursor: not-allowed;
    }
  }

  &__custom-input {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--checkbox-border-color);
    border-radius: var(--checkbox-border-radius);
    background-color: var(--checkbox-bg-color);
    transition: all var(--checkbox-transition-duration) ease-in-out;
    color: var(--checkbox-icon-color);

    .vc-checkbox--size-s & {
      width: var(--checkbox-size-s);
      height: var(--checkbox-size-s);
    }

    .vc-checkbox--size-m & {
      width: var(--checkbox-size-m);
      height: var(--checkbox-size-m);
    }

    .vc-checkbox--size-l & {
      width: var(--checkbox-size-l);
      height: var(--checkbox-size-l);
    }

    .vc-checkbox__input:checked + & {
      background-color: var(--checkbox-checked-bg-color);
      border-color: var(--checkbox-checked-border-color);
    }

    .vc-checkbox--indeterminate & {
      background-color: var(--checkbox-indeterminate-bg-color);
      border-color: var(--checkbox-indeterminate-border-color);
    }

    .vc-checkbox--disabled & {
      opacity: var(--checkbox-disabled-opacity);
      cursor: not-allowed;
    }
  }

  &__check-icon {
    width: 100%;
    height: 100%;
  }

  &__indeterminate-line {
    width: 65%;
    height: 2px;
    background-color: var(--checkbox-indeterminate-line-color);
    display: block;
  }

  &__text {
    margin-left: var(--checkbox-text-margin);
    font-size: 14px;
    line-height: 21px;
    color: var(--checkbox-text-color);
  }

  &__required {
    color: var(--checkbox-required-color);
    margin-left: 0.25rem;
  }

  &__error {
    --hint-color: var(--checkbox-error-text-color);
    margin-top: 0.25rem;
  }

  &--error {
    .vc-checkbox__custom-input {
      border-color: var(--checkbox-error-border-color);
    }
  }
}
</style>
