<template>
  <div
    class="vc-checkbox"
    :class="{ 'vc-checkbox_disabled': disabled }"
  >
    <!-- Input label -->
    <VcLabel
      v-if="label"
      class="tw-mb-2"
      :required="required"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>
    <label class="tw-inline-flex tw-select-none tw-cursor-pointer tw-text-base tw-items-center">
      <input
        v-model="value"
        type="checkbox"
        class="vc-checkbox__input"
        :disabled="disabled"
        :true-value="trueValue"
        :false-value="falseValue"
        :class="{
          'vc-checkbox_error': errorMessage,
        }"
      />
      <span
        v-if="$slots['default']"
        class="tw-ml-2"
      >
        <slot></slot>
      </span>
      <span
        v-if="!label && required"
        class="tw-text-[color:var(--checkbox-required-color)] tw-ml-1"
        >*</span
      >
    </label>

    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-checkbox__error tw-mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { MaybeRef, computed, unref } from "vue";
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
}

export interface Emits {
  (event: "update:modelValue", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), { name: "Field", trueValue: true, falseValue: false });
const emit = defineEmits<Emits>();

defineSlots<{
  default: (props: any) => any;
  error: (props: any) => any;
}>();

const value = computed({
  get() {
    return unref(props.modelValue);
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});
</script>

<style lang="scss">
:root {
  --checkbox-size: 14px;
  --checkbox-border-radius: 2px;
  --checkbox-background-color: #ffffff;
  --checkbox-color-error: #f14e4e;
  --checkbox-required-color: #f14e4e;

  --checkbox-active: #43b0e6;
  --checkbox-active-inner: #fff;
  --checkbox-focus: 2px rgba(39, 94, 254, 0.3);
  --checkbox-border: #bbc1e1;
  --checkbox-border-hover: #43b0e6;
  --checkbox-background: #fff;
  --checkbox-disabled: #f6f8ff;
  --checkbox-disabled-inner: #e1e6f9;
  --checkbox-error: #f14e4e;
}

.vc-checkbox {
  input[type="checkbox"] {
    border-radius: 2px;
    appearance: none;
    height: var(--checkbox-size);
    outline: none;
    display: inline-block;
    vertical-align: top;
    position: relative;
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--checkbox-border-color, var(--checkbox-border));
    background: var(--checkbox-bg, var(--checkbox-background));
    width: var(--checkbox-size);
    border-radius: 3px;
    transition:
      background 0.3s,
      border-color 0.3s,
      box-shadow 0.2s;

    &:checked {
      --checkbox-bg: var(--checkbox-active);
      --checkbox-border-color: var(--checkbox-active);
      --checkbox-after-opacity-duration: 0.3s;
      --checkbox-after-transform-duration: 0.6s;
      --checkbox-after-transform-ease: cubic-bezier(0.2, 0.85, 0.32, 1.2);
      --checkbox-scale: 0.5;
      --checkbox-after-opacity: 1;
      --r: 43deg;
    }

    &:disabled {
      --checkbox-bg: var(--checkbox-disabled);
      cursor: not-allowed;
      opacity: 0.9;
      &:checked {
        --checkbox-bg: var(--checkbox-disabled-inner);
        --checkbox-border-color: var(--checkbox-border);
      }
      & + label {
        cursor: not-allowed;
      }
    }

    &:hover {
      &:not(:checked) {
        &:not(:disabled) {
          --checkbox-border-color: var(--checkbox-border-hover);
        }
      }
    }

    &:after {
      content: "";
      display: block;
      position: absolute;
      width: 5px;
      height: 9px;
      border: 2px solid var(--checkbox-background);
      border-top: 0;
      border-left: 0;
      left: 4px;
      top: 1px;
      transform: rotate(var(--r, 20deg));
      opacity: var(--checkbox-after-opacity, 0);
      transition:
        transform var(--checkbox-after-transform-duration, 0.3s) var(--checkbox-after-transform-ease, ease),
        opacity var(--checkbox-after-opacity-duration, 0.2s);
    }

    & + label {
      font-size: 14px;
      line-height: 21px;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      margin-left: 4px;
    }

    &.vc-checkbox_error {
      --checkbox-border-color: var(--checkbox-error);
    }
  }

  &_disabled &__label {
    cursor: auto;
  }

  &__error {
    --hint-color: var(--checkbox-error);
  }
}
</style>
