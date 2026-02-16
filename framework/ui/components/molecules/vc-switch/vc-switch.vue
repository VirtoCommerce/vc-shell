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
          :id="switchId"
          type="checkbox"
          class="vc-switch__input"
          role="switch"
          :checked="invertValue(modelValue)"
          :disabled="disabled"
          :aria-checked="!!invertValue(modelValue)"
          tabindex="0"
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
import { useId, computed } from "vue";
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

const uid = useId();
const switchId = computed(() => `vc-switch-${uid}`);

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
  --switch-height: 22px;
  --switch-thumb-size: 16px;
  --switch-translate: 14px;

  --switch-active-color: var(--primary-500);
  --switch-inactive-color: var(--neutrals-300);
  --switch-thumb-color: var(--additional-50);
  --switch-focus-ring-color: rgba(59, 130, 246, 0.3);
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
      @apply tw-bg-[color:var(--switch-active-color)];

      &::before {
        @apply [transform:translateX(var(--switch-translate))_translateY(-50%)];
      }
    }

    &:focus-visible + .vc-switch__slider {
      box-shadow: 0 0 0 3px var(--switch-focus-ring-color);
    }

    &:disabled + .vc-switch__slider {
      @apply tw-bg-[color:var(--switch-inactive-color)] tw-cursor-not-allowed tw-opacity-50;
    }

    &:disabled {
      @apply tw-cursor-not-allowed;
    }
  }

  &__slider {
    @apply tw-absolute tw-inset-0 tw-bg-[color:var(--switch-inactive-color)] tw-rounded-full tw-transition tw-duration-200 tw-cursor-pointer;

    &::before {
      @apply tw-absolute tw-left-[3px] tw-top-1/2 tw-transition tw-duration-200 tw-bg-[color:var(--switch-thumb-color)] tw-rounded-full tw-w-[var(--switch-thumb-size)] tw-h-[var(--switch-thumb-size)] [content:''] [transform:translateX(0)_translateY(-50%)];
    }
  }
}
</style>
