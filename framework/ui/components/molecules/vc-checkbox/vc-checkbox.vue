<template>
  <div
    class="vc-checkbox"
    :class="{
      'vc-checkbox--disabled': resolvedDisabled,
      'vc-checkbox--error': invalid,
      'vc-checkbox--indeterminate': indeterminate,
      [`vc-checkbox--size-${size}`]: true,
    }"
  >
    <VcLabel
      v-if="label"
      class="vc-checkbox__label"
      :required="required"
      :error="invalid"
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
        :id="checkboxId"
        ref="checkboxRef"
        v-model="model"
        :value="value"
        type="checkbox"
        class="vc-checkbox__input"
        :name="resolvedName"
        :disabled="resolvedDisabled"
        :true-value="trueValue"
        :false-value="falseValue"
        :aria-invalid="invalid || undefined"
        :aria-describedby="ariaDescribedBy"
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
        aria-hidden="true"
        >*</span
      >
    </label>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-checkbox__error"
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
import { MaybeRef, computed, unref, ref, watch, onMounted } from "vue";
import { VcHint } from "@ui/components/atoms/vc-hint";
import { VcLabel } from "@ui/components/atoms/vc-label";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types";

export interface Props extends IFormFieldProps {
  modelValue: MaybeRef<boolean | any[]>;
  value?: any;
  trueValue?: boolean;
  falseValue?: boolean;
  size?: "s" | "m" | "l";
  outline?: boolean;
  indeterminate?: boolean;
}

export interface Emits {
  (event: "update:modelValue", value: boolean | any[]): void;
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
  default: (props: Record<string, never>) => any;
  error: (props: Record<string, never>) => any;
  icon: (props: Record<string, never>) => any;
}>();

const { fieldId: checkboxId, errorId, invalid, resolvedDisabled, resolvedName, ariaDescribedBy } = useFormField(props);

const checkboxRef = ref<HTMLInputElement | null>(null);

const model = computed({
  get() {
    return unref(props.modelValue);
  },
  set(newValue) {
    emit("update:modelValue", newValue as boolean | any[]);
  },
});

const checked = computed(() => {
  const modelVal = unref(props.modelValue);
  if (Array.isArray(modelVal)) {
    return modelVal.includes(props.value);
  }
  return modelVal === props.trueValue;
});

// Managing indeterminate state
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
  --checkbox-size-s: 16px;
  --checkbox-size-m: 20px;
  --checkbox-size-l: 24px;

  /* Main colors */
  --checkbox-border-color: var(--neutrals-300);
  --checkbox-border-color-hover: var(--neutrals-400);
  --checkbox-bg-color: var(--additional-50);
  --checkbox-text-color: var(--neutrals-900);

  /* Checkbox checked state */
  --checkbox-checked-bg-color: var(--primary-500);
  --checkbox-checked-border-color: var(--primary-500);
  --checkbox-icon-color: var(--additional-50);

  /* Indeterminate state */
  --checkbox-indeterminate-bg-color: var(--primary-500);
  --checkbox-indeterminate-border-color: var(--primary-500);
  --checkbox-indeterminate-line-color: var(--additional-50);

  /* Error state */
  --checkbox-error-border-color: var(--danger-500);
  --checkbox-error-text-color: var(--danger-500);
  --checkbox-error-ring-color: var(--danger-100);

  /* Disabled state */
  --checkbox-disabled-opacity: 0.5;

  /* Focus */
  --checkbox-focus-ring-color: var(--primary-100);

  /* Other */
  --checkbox-border-radius: 4px;
  --checkbox-required-color: var(--danger-500);
  --checkbox-transition-duration: 200ms;
  --checkbox-label-spacing: 0.5rem;
  --checkbox-text-margin: 0.5rem;
}

.vc-checkbox {
  @apply tw-flex tw-flex-col;

  &__label {
    @apply tw-mb-[var(--checkbox-label-spacing)];
  }

  &__container {
    @apply tw-inline-flex tw-items-center tw-cursor-pointer tw-select-none;
  }

  &__input {
    @apply tw-absolute tw-opacity-0 tw-w-0 tw-h-0;

    &:focus-visible + .vc-checkbox__custom-input {
      @apply tw-ring-[3px] tw-ring-[color:var(--checkbox-focus-ring-color)] tw-outline-none;
    }

    &:not(:disabled):not(:checked) + .vc-checkbox__custom-input:hover {
      border-color: var(--checkbox-border-color-hover);
    }

    &:disabled + .vc-checkbox__custom-input {
      @apply tw-cursor-not-allowed;
    }
  }

  &__custom-input {
    @apply tw-flex tw-items-center tw-justify-center tw-shrink-0
      tw-border tw-border-solid
      tw-rounded-[var(--checkbox-border-radius)]
      tw-transition-all tw-duration-200 tw-ease-in-out;
    border-color: var(--checkbox-border-color);
    background-color: var(--checkbox-bg-color);
    color: var(--checkbox-icon-color);

    .vc-checkbox--size-s & {
      @apply tw-w-[var(--checkbox-size-s)] tw-h-[var(--checkbox-size-s)];
    }

    .vc-checkbox--size-m & {
      @apply tw-w-[var(--checkbox-size-m)] tw-h-[var(--checkbox-size-m)];
    }

    .vc-checkbox--size-l & {
      @apply tw-w-[var(--checkbox-size-l)] tw-h-[var(--checkbox-size-l)];
    }

    .vc-checkbox__input:checked + & {
      background-color: var(--checkbox-checked-bg-color);
      border-color: var(--checkbox-checked-border-color);
    }

    .vc-checkbox--indeterminate & {
      background-color: var(--checkbox-indeterminate-bg-color);
      border-color: var(--checkbox-indeterminate-border-color);
    }
  }

  &__check-icon {
    @apply tw-w-full tw-h-full;
    animation: checkbox-check-in var(--checkbox-transition-duration) ease-out;
  }

  &__indeterminate-line {
    @apply tw-block tw-rounded-full;
    width: 65%;
    height: 2px;
    background-color: var(--checkbox-indeterminate-line-color);
  }

  &__text {
    @apply tw-text-sm tw-leading-[21px];
    color: var(--checkbox-text-color);
    margin-left: var(--checkbox-text-margin);
  }

  &__required {
    @apply tw-ml-1;
    color: var(--checkbox-required-color);
  }

  &__error {
    @apply tw-mt-1 [--hint-error-color:var(--checkbox-error-text-color)];
  }

  &--error {
    .vc-checkbox__custom-input {
      @apply tw-ring-[3px] tw-ring-[color:var(--checkbox-error-ring-color)];
      border-color: var(--checkbox-error-border-color);
    }
  }

  &--disabled {
    @apply tw-cursor-not-allowed tw-pointer-events-none;
    opacity: var(--checkbox-disabled-opacity);
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    @apply tw-transition-all tw-duration-[250ms] tw-ease-out;
  }

  .slide-up-enter-from {
    @apply tw-opacity-0 tw-translate-y-[5px];
  }

  .slide-up-leave-to {
    @apply tw-opacity-0 tw--translate-y-[5px];
  }
}

@keyframes checkbox-check-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
