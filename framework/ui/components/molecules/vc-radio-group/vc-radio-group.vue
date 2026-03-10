<template>
  <VcInputGroup
    class="vc-radio-group"
    :label="label"
    :tooltip="tooltip"
    :hint="hint"
    :error="error"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :orientation="orientation"
    role="radiogroup"
    :name="resolvedName"
  >
    <slot v-if="$slots.default" />

    <template v-else>
      <VcRadioButton
        v-for="(option, index) in options"
        :key="getOptionKey(option, index)"
        :model-value="modelValue"
        :value="option.value"
        :label="option.label"
        :disabled="option.disabled"
        :name="resolvedName"
        @update:model-value="onUpdate"
      />
    </template>
  </VcInputGroup>
</template>

<script lang="ts" setup>
import { computed, useId } from "vue";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";
import type { IFormFieldProps } from "@ui/types/form-field";

export interface RadioGroupOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface VcRadioGroupProps extends IFormFieldProps {
  modelValue: string | number | boolean;
  options?: RadioGroupOption[];
  hint?: string;
  orientation?: "vertical" | "horizontal";
}

export interface VcRadioGroupEmits {
  (event: "update:modelValue", value: string | number | boolean): void;
}

const props = withDefaults(defineProps<VcRadioGroupProps>(), {
  options: () => [],
  orientation: "vertical",
});

const emit = defineEmits<VcRadioGroupEmits>();

const uid = useId();
const generatedName = computed(() => `vc-radio-group-${uid}`);
const resolvedName = computed(() => props.name || generatedName.value);

function onUpdate(value: string | number | boolean) {
  emit("update:modelValue", value);
}

function getOptionKey(option: RadioGroupOption, index: number) {
  if (typeof option.value === "string" || typeof option.value === "number") {
    return `${option.value}`;
  }

  return `${index}`;
}
</script>

<style lang="scss">
.vc-radio-group {
  .vc-radio-button {
    @apply tw-min-h-5;
  }
}
</style>
