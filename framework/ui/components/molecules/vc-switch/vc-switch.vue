<template>
  <div
    class="vc-switch"
    :class="{
      'vc-switch--disabled': resolvedDisabled,
      'vc-switch--error': invalid,
    }"
  >
    <!-- Switch label -->
    <VcLabel
      v-if="label"
      :html-for="switchId"
      class="vc-switch__label"
      :required="required"
      :error="invalid"
    >
      <span>{{ label }}</span>
      <template
        v-if="labelTooltip"
        #tooltip
        >{{ labelTooltip }}</template
      >
    </VcLabel>

    <div class="vc-switch__track-wrapper">
      <label class="vc-switch__track-label">
        <input
          :id="switchId"
          type="checkbox"
          class="vc-switch__input"
          role="switch"
          :checked="invertValue(modelValue)"
          :disabled="resolvedDisabled"
          :aria-checked="!!invertValue(modelValue)"
          :aria-invalid="invalid || undefined"
          :aria-required="ariaRequired"
          :aria-describedby="ariaDescribedBy"
          tabindex="0"
          @input="onInput"
        />
        <span class="vc-switch__slider"></span>
      </label>
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="invalid && errorMessage">
        <slot name="error">
          <VcHint
            :id="errorId"
            class="vc-switch__error"
            :error="true"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
      <div v-else-if="hintText">
        <VcHint
          :id="hintId"
          class="vc-switch__hint"
        >
          {{ hintText }}
        </VcHint>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { VcLabel, VcHint } from "@ui/components";
import { useFormField } from "@ui/composables/useFormField";
import type { IFormFieldProps } from "@ui/types";

export interface Props extends IFormFieldProps {
  modelValue: boolean | undefined;
  /** Hint text displayed below the switch */
  hint?: string;
  /**
   * @deprecated Use `hint` instead. Kept for backward compatibility.
   * @override Overrides IFormFieldProps.tooltip — here it acts as hint text, not label tooltip.
   */
  tooltip?: string;
  /** Tooltip text shown on the label's info icon */
  labelTooltip?: string;
  trueValue?: boolean;
  falseValue?: boolean;
}

export interface Emits {
  (event: "update:modelValue", value: boolean | undefined): void;
}

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
});

const emit = defineEmits<Emits>();

defineSlots<{
  error: (props: Record<string, never>) => any;
}>();

const { fieldId: switchId, errorId, hintId, invalid, resolvedDisabled, ariaRequired, ariaDescribedBy } =
  useFormField(props);

// `tooltip` prop is kept for backward compat — treat as hint text
const hintText = computed(() => props.hint || props.tooltip);

if (import.meta.env.DEV) {
  onMounted(() => {
    if (props.tooltip) {
      console.warn('[VcSwitch] The "tooltip" prop is deprecated. Use "hint" for hint text or "labelTooltip" for the label info icon.');
    }
  });
}

const invertValue = (value: boolean | undefined) => {
  if (typeof value !== "undefined") {
    return props.trueValue ? value : !value;
  }
};

function onInput(e: Event) {
  const newValue = (e.target as HTMLInputElement).checked;
  emit("update:modelValue", invertValue(newValue));
}
</script>

<style lang="scss">
:root {
  --switch-width: 36px;
  --switch-height: 20px;
  --switch-thumb-size: 16px;
  --switch-translate: 16px;

  --switch-active-color: var(--primary-500);
  --switch-inactive-color: var(--neutrals-300);
  --switch-hover-active-color: var(--primary-600);
  --switch-hover-inactive-color: var(--neutrals-400);
  --switch-thumb-color: var(--additional-50);
  --switch-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --switch-focus-ring-color: var(--primary-100);
  --switch-error-ring-color: var(--danger-100);
  --switch-error-border-color: var(--danger-500);
  --switch-border-radius: 9999px;
  --switch-disabled-opacity: 0.5;
}

.vc-switch {
  @apply tw-flex tw-flex-col;

  &__label {
    @apply tw-mb-2;
  }

  &__track-wrapper {
    @apply tw-inline-flex tw-items-center;
  }

  &__track-label {
    @apply tw-relative tw-inline-block tw-cursor-pointer;
    width: var(--switch-width);
    height: var(--switch-height);
  }

  &__hint {
    @apply tw-mt-1;
  }

  &__error {
    @apply tw-mt-1 [--hint-error-color:var(--danger-500)];
  }

  &__input {
    @apply tw-w-0 tw-h-0 tw-opacity-0 tw-cursor-pointer;

    &:checked + .vc-switch__slider {
      background-color: var(--switch-active-color);

      &::before {
        @apply [transform:translateX(var(--switch-translate))_translateY(-50%)];
      }
    }

    &:checked:not(:disabled) + .vc-switch__slider:hover {
      background-color: var(--switch-hover-active-color);
    }

    &:not(:checked):not(:disabled) + .vc-switch__slider:hover {
      background-color: var(--switch-hover-inactive-color);
    }

    &:focus-visible + .vc-switch__slider {
      box-shadow: 0 0 0 3px var(--switch-focus-ring-color);
    }

    &:disabled + .vc-switch__slider {
      @apply tw-cursor-not-allowed;
      opacity: var(--switch-disabled-opacity);
    }

    &:disabled {
      @apply tw-cursor-not-allowed;
    }
  }

  &__slider {
    @apply tw-absolute tw-inset-0 tw-rounded-[var(--switch-border-radius)] tw-cursor-pointer;
    background-color: var(--switch-inactive-color);
    transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);

    &::before {
      @apply tw-absolute tw-left-[2px] tw-top-1/2 tw-rounded-full tw-w-[var(--switch-thumb-size)] tw-h-[var(--switch-thumb-size)] [content:''] [transform:translateX(0)_translateY(-50%)];
      background-color: var(--switch-thumb-color);
      box-shadow: var(--switch-thumb-shadow);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  &--error {
    .vc-switch__slider {
      box-shadow: 0 0 0 3px var(--switch-error-ring-color);
    }
  }

  &--disabled {
    @apply tw-pointer-events-none;
  }

}
</style>
