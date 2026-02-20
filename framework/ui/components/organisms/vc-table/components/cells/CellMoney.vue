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
      <VcInputCurrency
        :model-value="(value as number | null | undefined)"
        :options="[]"
        :option="currency || 'USD'"
        currency-display="symbol"
        class="vc-table-cell-money__input"
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
            class="vc-table-cell-money__error-icon"
          />
        </template>
      </VcInputCurrency>
    </template>
  </CellEditableWrapper>

  <!-- Display mode -->
  <span v-else-if="!isEmpty" class="vc-table-cell-money">{{ formatted }}</span>
  <span v-else class="vc-table-cell-money vc-table-cell-money--not-set">
    {{ t("COMPONENTS.ORGANISMS.VC_TABLE.NOT_SET") }}
  </span>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import VcInputCurrency from "@ui/components/molecules/vc-input-currency/vc-input-currency.vue";
import { VcIcon } from "@ui/components/atoms";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";
import CellEditableWrapper from "@ui/components/organisms/vc-table/components/cells/CellEditableWrapper.vue";

const props = defineProps<{
  /** The monetary value to display or edit */
  value?: unknown;
  /** Currency code (e.g., 'USD', 'EUR') for formatting */
  currency?: string;
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
const locale = window.navigator.language;

const isMobileRef = inject(IsMobileKey, ref(false));
const isDesktopRef = inject(IsDesktopKey, ref(true));
const isMobile = computed(() => isMobileRef.value);
const isDesktop = computed(() => isDesktopRef.value);

const isEmpty = computed(
  () => typeof props.value === "undefined" || props.value === null || Number(props.value) === 0,
);

const formatted = computed(() => {
  const num = Number(props.value);
  if (isNaN(num)) return String(props.value);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: props.currency || "USD",
  }).format(num);
});

const onBlur = (errors: string[]) => {
  if (errors && errors.length > 0) return;
  emit("blur", { row: props.rowIndex, field: props.fieldId || "" });
};
</script>

<style lang="scss">
.vc-table-cell-money {
  @apply tw-truncate tw-font-medium tw-tabular-nums;

  &--not-set {
    @apply tw-font-normal;
    color: var(--neutrals-400);
  }

  &__input {
    @apply tw-w-full;
  }

  &__error-icon {
    @apply tw-text-danger-500;
  }
}
</style>
