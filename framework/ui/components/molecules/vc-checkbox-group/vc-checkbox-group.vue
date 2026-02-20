<template>
  <VcInputGroup
    class="vc-checkbox-group"
    :label="label"
    :tooltip="tooltip"
    :hint="hint"
    :error="error"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :orientation="orientation"
    role="group"
    :name="resolvedName"
  >
    <slot v-if="$slots.default" />

    <template v-else>
      <VcCheckbox
        v-for="(option, index) in options"
        :key="getOptionKey(option, index)"
        :model-value="normalizedModelValue"
        :value="option.value"
        :disabled="option.disabled"
        :name="resolvedName"
        :size="size"
        @update:model-value="onUpdate"
      >
        {{ option.label }}
      </VcCheckbox>
    </template>
  </VcInputGroup>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, useId } from "vue";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";

export interface CheckboxGroupOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface Props {
  modelValue?: any[];
  options?: CheckboxGroupOption[];
  label?: string;
  tooltip?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  name?: string;
  size?: "s" | "m" | "l";
}

export interface Emits {
  (event: "update:modelValue", value: any[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  orientation: "vertical",
  size: "s",
});

const emit = defineEmits<Emits>();

const uid = useId();
const generatedName = computed(() => `vc-checkbox-group-${uid}`);
const resolvedName = computed(() => props.name || generatedName.value);
const normalizedModelValue = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));

function onUpdate(value: any) {
  if (Array.isArray(value)) {
    emit("update:modelValue", value);
    return;
  }

  emit("update:modelValue", normalizedModelValue.value);
}

function getOptionKey(option: CheckboxGroupOption, index: number) {
  if (typeof option.value === "string" || typeof option.value === "number") {
    return `${option.value}`;
  }

  return `${index}`;
}
</script>

<style lang="scss">
.vc-checkbox-group {
  .vc-checkbox {
    @apply tw-min-h-5;
  }
}
</style>
