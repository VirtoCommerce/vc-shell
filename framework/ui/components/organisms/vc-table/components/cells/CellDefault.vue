<template>
  <!-- Editable mode -->
  <CellEditableWrapper
    v-if="editable"
    :label="label || ''"
    :field-name="fieldName || ''"
    :model-value="value"
    :rules="rules"
  >
    <template #default="{ errors, errorMessage }">
      <VcInput
        :model-value="value"
        class="vc-table-cell-default__input"
        :error="errors.length > 0"
        :error-message="isMobile ? errorMessage : undefined"
        @update:model-value="$emit('update', { field: fieldId || '', value: $event })"
        @blur="onBlur(errors)"
      >
        <template
          v-if="isDesktop && errors.length > 0"
          #append-inner
        >
          <VcIcon
            icon="material-error"
            class="vc-table-cell-default__error-icon"
          />
        </template>
      </VcInput>
    </template>
  </CellEditableWrapper>

  <!-- Display mode -->
  <span v-else class="vc-table-cell-default">{{ value }}</span>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import VcInput from "../../../../molecules/vc-input/vc-input.vue";
import { VcIcon } from "../../../../atoms";
import CellEditableWrapper from "./CellEditableWrapper.vue";

const props = defineProps<{
  /** The cell value to display or edit */
  value?: unknown;
  /** Whether the cell is in editable mode */
  editable?: boolean;
  /** Label for the editable field (used for validation) */
  label?: string;
  /** Field name for validation */
  fieldName?: string;
  /** Field identifier for update/blur events */
  fieldId?: string;
  /** Validation rules for the editable field */
  rules?: Record<string, unknown>;
  /** Row index for blur event payload */
  rowIndex?: number;
}>();

const emit = defineEmits<{
  /** Emitted when cell value is updated */
  (e: "update", payload: { field: string; value: unknown }): void;
  /** Emitted when editable cell loses focus (only if no validation errors) */
  (e: "blur", payload: { row: number | undefined; field: string }): void;
}>();

const isMobileRef = inject<Ref<boolean>>("isMobile", ref(false));
const isDesktopRef = inject<Ref<boolean>>("isDesktop", ref(true));
const isMobile = computed(() => isMobileRef.value);
const isDesktop = computed(() => isDesktopRef.value);

const onBlur = (errors: string[]) => {
  if (errors && errors.length > 0) return;
  emit("blur", { row: props.rowIndex, field: props.fieldId || "" });
};
</script>

<style lang="scss">
.vc-table-cell-default {
  @apply tw-truncate;

  &__input {
    @apply tw-w-full;
  }

  &__error-icon {
    @apply tw-text-[color:var(--danger-500)];
  }
}
</style>
