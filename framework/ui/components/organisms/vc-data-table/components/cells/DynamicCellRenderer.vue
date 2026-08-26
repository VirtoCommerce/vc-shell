<template>
  <component
    :is="cellComponent"
    v-bind="cellProps"
    @update="$emit('update', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script lang="ts">
import { registerBuiltinCells } from "@ui/components/organisms/vc-data-table/composables/builtinCells";

// Module scope on purpose: importing this component is enough to make every
// built-in cell type resolvable, so resolution no longer depends on a table
// having been mounted first.
registerBuiltinCells();
</script>

<script setup lang="ts">
/**
 * DynamicCellRenderer - Renders cell content based on registered cell types.
 *
 * Uses CellRegistry to lookup and render the appropriate cell component
 * based on the column type. This enables the Open/Closed Principle -
 * new cell types can be added without modifying this component.
 *
 * @example
 * ```vue
 * <DynamicCellRenderer
 *   type="money"
 *   :value="item.price"
 *   :currency="item.currency"
 *   :editable="isEditing"
 *   @update="handleUpdate"
 * />
 * ```
 */
import { computed, type Component } from "vue";
import { useCellRegistry } from "@ui/components/organisms/vc-data-table/composables/useCellRegistry";

// CellDefault is the fallback for unregistered types.
import CellDefault from "@ui/components/organisms/vc-data-table/components/cells/CellDefault.vue";

const { get } = useCellRegistry();

// A column `type` accepts custom names, so a typo in a built-in one renders the
// raw value through CellDefault instead of erroring. Say so, once per name.
const warnedCellTypes = new Set<string>();

function warnUnknownCellType(type: string): void {
  if (warnedCellTypes.has(type)) return;
  warnedCellTypes.add(type);
  console.warn(
    `[VcDataTable] Unknown cell type "${type}" — falling back to plain text. ` +
      `Check the spelling, or register it with useCellRegistry().register({ type: "${type}", component }).`,
  );
}

const props = defineProps<{
  /** Cell type to render */
  type: string;
  /** Cell value */
  value?: unknown;
  /** Whether the cell is in edit mode */
  editable?: boolean;
  /** Label for the field (used in validation) */
  label?: string;
  /** Field name for VeeValidate (unique per row) */
  fieldName?: string;
  /** Field identifier */
  fieldId?: string;
  /** Validation rules */
  rules?: Record<string, unknown>;
  /** Row index */
  rowIndex?: number;
  /** Currency for money cells */
  currency?: string;
  /** Date format for date cells */
  format?: string;
  /** Date variant (date, time, date-time) */
  variant?: "date" | "time" | "date-time";
  /** Whether to trigger validation on mount (for new rows) */
  validateOnMount?: boolean;
}>();

defineEmits<{
  /** Cell value updated during editing */
  (e: "update", payload: { field: string; value: unknown }): void;
  /** Cell input blurred */
  (e: "blur", payload: { row: number | undefined; field: string }): void;
}>();

/**
 * Get the component to render based on cell type.
 * Falls back to CellDefault if type is not registered.
 */
const cellComponent = computed<Component>(() => {
  const registration = get(props.type);

  if (import.meta.env.DEV && !registration) {
    warnUnknownCellType(props.type);
  }

  return registration?.component || CellDefault;
});

/**
 * Build props to pass to the cell component.
 * Only includes props relevant to the specific cell type.
 */
const cellProps = computed(() => {
  const registration = get(props.type);
  const isEditable = registration?.config?.editable ?? false;

  // Base props for all cells
  const baseProps: Record<string, unknown> = {
    value: props.value,
  };

  // Add editable props only if the cell type supports editing
  if (isEditable && props.editable) {
    baseProps.editable = props.editable;
    baseProps.label = props.label;
    baseProps.fieldName = props.fieldName;
    baseProps.fieldId = props.fieldId;
    baseProps.rules = props.rules;
    baseProps.rowIndex = props.rowIndex;
    if (props.validateOnMount) {
      baseProps.validateOnMount = true;
    }
  }

  // Add type-specific props
  if (props.type === "money" && props.currency) {
    baseProps.currency = props.currency;
  }

  if ((props.type === "date" || props.type === "time" || props.type === "datetime") && props.variant) {
    baseProps.variant = props.variant;
  }

  if (props.format) {
    baseProps.format = props.format;
  }

  return baseProps;
});
</script>
