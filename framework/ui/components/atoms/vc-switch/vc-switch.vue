<template>
  <div>
    <!-- Switch label -->
    <VcLabel
      v-if="label"
      class="tw-mb-2"
      :required="required"
    >
      <span>{{ label }}</span>
    </VcLabel>
    <div class="tw-relative tw-inline-block tw-w-[32px] tw-h-[18px]">
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
        class="tw-mt-2 tw-w-max"
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
  --switch-main-color: #43b0e6;
  --switch-secondary-color: #d2d4d7;
  --switch-transition: all 0.2s ease-in-out;
  --switch-icon-transition: opacity 0.3s ease-in-out;
}

.vc-switch {
  &__input {
    @apply tw-w-0 tw-h-0 tw-opacity-0;

    &:checked + .vc-switch__slider:before {
      @apply tw-translate-x-[14px];
    }

    &:checked + .vc-switch__slider {
      @apply tw-bg-[color:var(--switch-main-color)] after:tw-bg-[position:10px] after:tw-bg-[length:10px_7px];
    }

    &:disabled + .vc-switch__slider {
      @apply tw-bg-[color:var(--switch-secondary-color)];
    }
  }

  &__slider {
    @apply tw-absolute tw-top-0 tw-right-0 tw-bottom-0 tw-left-0 tw-bg-[color:var(--switch-secondary-color)] tw-rounded-[9999px] tw-cursor-pointer tw-transition  tw-duration-200 tw-shadow-[inset_0px_2px_4px_rgba(0,0,0,0.1)];

    &:before {
      @apply tw-absolute tw-bottom-px tw-left-px tw-flex tw-justify-center tw-items-center tw-w-[16px] tw-h-[16px] tw-bg-white tw-rounded-[9999px] tw-text-[color:#d2d2d2] tw-text-[10px] tw-transition tw-shadow-[0_2px_4px_rgba(0,0,0,0.1)] tw-duration-200 tw-content-[""];
    }
  }
}
</style>
