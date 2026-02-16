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
        class="vc-table-cell-number__input"
        type="number"
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
            class="vc-table-cell-number__error-icon"
          />
        </template>
      </VcInput>
    </template>
  </CellEditableWrapper>

  <!-- Display mode -->
  <span v-else-if="!isEmpty" class="vc-table-cell-number">{{ formatted }}</span>
  <span v-else class="vc-table-cell-number vc-table-cell-number--not-set">
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import VcInput from "../../../../molecules/vc-input/vc-input.vue";
import { VcIcon } from "../../../../atoms";
import CellEditableWrapper from "./CellEditableWrapper.vue";

const props = defineProps<{
  /** The numeric value to display or edit */
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

const { t } = useI18n({ useScope: "global" });

const isMobileRef = inject<Ref<boolean>>("isMobile", ref(false));
const isDesktopRef = inject<Ref<boolean>>("isDesktop", ref(true));
const isMobile = computed(() => isMobileRef.value);
const isDesktop = computed(() => isDesktopRef.value);

const isEmpty = computed(() => {
  if (props.value === null || props.value === undefined) return true;
  const num = Number(props.value);
  return isNaN(num) || num < 0;
});

const formatted = computed(() => {
  const num = Number(props.value);
  return isNaN(num) ? String(props.value) : num.toFixed(0);
});

const onBlur = (errors: string[]) => {
  if (errors && errors.length > 0) return;
  emit("blur", { row: props.rowIndex, field: props.fieldId || "" });
};
</script>

<style lang="scss">
.vc-table-cell-number {
  @apply tw-truncate tw-tabular-nums;

  &--not-set {
    @apply tw-font-normal;
    color: var(--neutrals-400);
  }

  &__input {
    @apply tw-w-full;
  }

  &__error-icon {
    @apply tw-text-[color:var(--danger-500)];
  }
}
</style>
