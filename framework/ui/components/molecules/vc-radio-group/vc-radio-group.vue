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

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, useId } from "vue";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";

export interface RadioGroupOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface Props {
  modelValue: any;
  options?: RadioGroupOption[];
  label?: string;
  tooltip?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  name?: string;
}

export interface Emits {
  (event: "update:modelValue", value: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  orientation: "vertical",
});

const emit = defineEmits<Emits>();

const uid = useId();
const generatedName = computed(() => `vc-radio-group-${uid}`);
const resolvedName = computed(() => props.name || generatedName.value);

function onUpdate(value: any) {
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
