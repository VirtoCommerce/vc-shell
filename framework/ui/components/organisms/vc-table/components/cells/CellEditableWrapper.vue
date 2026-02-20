<template>
  <Field
    v-slot="{ errors, errorMessage }"
    :label="label"
    :name="fieldName"
    :model-value="modelValue"
    :rules="rules"
  >
    <VcTooltip placement="bottom">
      <template #default>
        <slot :errors="errors" :error-message="errorMessage" />
      </template>
      <template
        v-if="errorMessage"
        #tooltip
      >
        <div class="vc-table-cell-editable__error-tooltip">
          {{ errorMessage }}
        </div>
      </template>
    </VcTooltip>
  </Field>
</template>

<script setup lang="ts">
import { Field } from "vee-validate";
import VcTooltip from "@ui/components/atoms/vc-tooltip/vc-tooltip.vue";

defineProps<{
  /** Label for the editable field (used for validation) */
  label: string;
  /** Field name for validation */
  fieldName: string;
  /** Current value of the field */
  modelValue?: unknown;
  /** Validation rules for the field */
  rules?: Record<string, unknown>;
}>();
</script>

<style lang="scss">
.vc-table-cell-editable {
  &__error-tooltip {
    @apply tw-text-danger-500;
  }
}
</style>
