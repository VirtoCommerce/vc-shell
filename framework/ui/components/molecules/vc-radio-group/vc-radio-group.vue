<template>
  <!-- Skeleton mode -->
  <div
    v-if="bladeLoading"
    class="vc-radio-group vc-radio-group--skeleton"
  >
    <div
      v-for="i in options?.length || 3"
      :key="i"
      class="vc-radio-group__skeleton-item"
    >
      <VcSkeleton
        variant="circle"
        :width="16"
        :height="16"
      />
      <VcSkeleton
        variant="block"
        :width="60 + i * 12"
        :height="12"
      />
    </div>
  </div>

  <VcInputGroup
    v-else
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

<script lang="ts" setup generic="T extends string | number | boolean = string">
import { computed, useId } from "vue";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";
import { VcRadioButton } from "@ui/components/molecules/vc-radio-button";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import type { IFormFieldProps } from "@ui/types/form-field";

export interface RadioGroupOption<V = string | number | boolean> {
  label: string;
  value: V;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<
    IFormFieldProps & {
      modelValue?: T;
      options?: RadioGroupOption<T>[];
      hint?: string;
      orientation?: "vertical" | "horizontal";
    }
  >(),
  {
    options: () => [],
    orientation: "vertical",
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: T): void;
}>();

const bladeLoading = useBladeLoading();

const uid = useId();
const generatedName = computed(() => `vc-radio-group-${uid}`);
const resolvedName = computed(() => props.name || generatedName.value);

function onUpdate(value: T) {
  emit("update:modelValue", value);
}

function getOptionKey(option: RadioGroupOption<T>, index: number) {
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

  &--skeleton {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__skeleton-item {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-2;
  }
}
</style>
