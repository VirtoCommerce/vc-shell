<template>
  <!-- Skeleton mode -->
  <div
    v-if="bladeLoading"
    class="vc-checkbox-group vc-checkbox-group--skeleton"
  >
    <div
      v-for="i in options?.length || 3"
      :key="i"
      class="vc-checkbox-group__skeleton-item"
    >
      <VcSkeleton
        variant="block"
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

<script lang="ts" setup generic="T extends string | number | boolean = string">
import { computed, useId } from "vue";
import { VcCheckbox } from "@ui/components/molecules/vc-checkbox";
import { VcInputGroup } from "@ui/components/molecules/vc-input-group";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { useBladeLoading } from "@ui/composables/useBladeLoading";
import type { IFormFieldProps } from "@ui/types/form-field";

export interface CheckboxGroupOption<V = string | number | boolean> {
  label: string;
  value: V;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<
    IFormFieldProps & {
      modelValue?: T[];
      options?: CheckboxGroupOption<T>[];
      hint?: string;
      orientation?: "vertical" | "horizontal";
      size?: "s" | "m" | "l";
    }
  >(),
  {
    modelValue: () => [],
    options: () => [],
    orientation: "vertical",
    size: "s",
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: T[]): void;
}>();

const bladeLoading = useBladeLoading();

const uid = useId();
const generatedName = computed(() => `vc-checkbox-group-${uid}`);
const resolvedName = computed(() => props.name || generatedName.value);
const normalizedModelValue = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));

function onUpdate(value: boolean | T[]) {
  if (Array.isArray(value)) {
    emit("update:modelValue", value as T[]);
    return;
  }

  emit("update:modelValue", normalizedModelValue.value);
}

function getOptionKey(option: CheckboxGroupOption<T>, index: number) {
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

  &--skeleton {
    @apply tw-flex tw-flex-col tw-gap-2;
  }

  &__skeleton-item {
    @apply tw-flex tw-flex-row tw-items-center tw-gap-2;
  }
}
</style>
