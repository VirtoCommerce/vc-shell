<template>
  <div class="vc-switch">
    <!-- Switch label -->
    <VcLabel
      v-if="label"
      class="vc-switch__label"
      :required="required"
    >
      <span>{{ label }}</span>
    </VcLabel>
    <div class="vc-switch__container">
      <label>
        <input
          type="checkbox"
          class="vc-switch__input"
          :checked="invertValue(modelValue)"
          :disabled="disabled"
          @input="onInput"
        />
        <span class="vc-switch__slider"></span>
      </label>
      <VcHint
        v-if="tooltip"
        class="vc-switch__hint"
      >
        {{ tooltip }}
      </VcHint>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcLabel, VcHint } from "./../../";
export interface Props {
  modelValue: boolean | undefined;
  disabled?: boolean;
  tooltip?: string;
  required?: boolean;
  label?: string;
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
  --switch-width: 32px;
  --switch-height: 18px;
  --switch-thumb-size: 16px;
  --switch-translate: 14px;

  --switch-main-color: var(--primary-500);
  --switch-secondary-color: var(--neutrals-300);
  --switch-icon-background: var(--additional-50);
  --switch-icon-color: var(--neutrals-400);
  --switch-shadow-color: var(--additional-950);
  --switch-shadow: inset 0px 2px 4px rgb(from var(--switch-shadow-color) r g b / 10%);
  --switch-transition: all 0.2s ease-in-out;
}

.vc-switch {
  &__label {
    @apply tw-mb-2;
  }

  &__container {
    @apply tw-relative tw-inline-block tw-w-[var(--switch-width)] tw-h-[var(--switch-height)];
  }

  &__hint {
    @apply tw-mt-2 tw-w-max;
  }

  &__input {
    @apply tw-w-0 tw-h-0 tw-opacity-0 tw-cursor-pointer;

    &:checked + .vc-switch__slider {
      @apply tw-bg-[color:var(--switch-main-color)];

      &::before {
        @apply [transform:translateX(var(--switch-translate))_translateY(-50%)];
      }
    }

    &:disabled + .vc-switch__slider {
      @apply tw-bg-[color:var(--switch-secondary-color)] tw-cursor-not-allowed;
    }

    &:disabled {
      @apply tw-cursor-not-allowed;
    }
  }

  &__slider {
    @apply tw-absolute tw-inset-0 tw-bg-[color:var(--switch-secondary-color)] tw-rounded-full tw-transition tw-duration-200 [box-shadow:var(--switch-shadow)] tw-cursor-pointer;

    &::before {
      @apply tw-absolute tw-left-px tw-top-1/2 tw-transition tw-duration-200 tw-bg-[color:var(--switch-icon-background)] tw-rounded-full tw-w-[var(--switch-thumb-size)] tw-h-[var(--switch-thumb-size)] [content:''] [box-shadow:var(--switch-shadow)] [transform:translateX(0)_translateY(-50%)];
    }
  }
}
</style>
