<template>
  <component
    :is="cellComponent"
    v-bind="cellProps"
    @update="$emit('update', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

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
import { useCellRegistry } from "@ui/components/organisms/vc-table/composables/useCellRegistry";

// Import cell components for fallback and default registration
import CellDefault from "@ui/components/organisms/vc-table/components/cells/CellDefault.vue";
import CellMoney from "@ui/components/organisms/vc-table/components/cells/CellMoney.vue";
import CellNumber from "@ui/components/organisms/vc-table/components/cells/CellNumber.vue";
import CellDate from "@ui/components/organisms/vc-table/components/cells/CellDate.vue";
import CellDateAgo from "@ui/components/organisms/vc-table/components/cells/CellDateAgo.vue";
import CellImage from "@ui/components/organisms/vc-table/components/cells/CellImage.vue";
import CellStatus from "@ui/components/organisms/vc-table/components/cells/CellStatus.vue";
import CellStatusIcon from "@ui/components/organisms/vc-table/components/cells/CellStatusIcon.vue";
import CellLink from "@ui/components/organisms/vc-table/components/cells/CellLink.vue";
import CellHtml from "@ui/components/organisms/vc-table/components/cells/CellHtml.vue";

// Get composable methods
const { register, has, get } = useCellRegistry();

// Register built-in cell types if not already registered
if (!has("text")) {
  register({ type: "text", component: CellDefault, config: { editable: true } });
}
if (!has("number")) {
  register({ type: "number", component: CellNumber, config: { editable: true } });
}
if (!has("money")) {
  register({ type: "money", component: CellMoney, config: { editable: true } });
}
if (!has("date")) {
  register({ type: "date", component: CellDate, config: { editable: false } });
}
if (!has("time")) {
  register({ type: "time", component: CellDate, config: { editable: false } });
}
if (!has("datetime")) {
  register({ type: "datetime", component: CellDate, config: { editable: false } });
}
if (!has("date-ago")) {
  register({ type: "date-ago", component: CellDateAgo, config: { editable: false } });
}
if (!has("image")) {
  register({ type: "image", component: CellImage, config: { editable: false } });
}
if (!has("status")) {
  register({ type: "status", component: CellStatus, config: { editable: false } });
}
if (!has("status-icon")) {
  register({ type: "status-icon", component: CellStatusIcon, config: { editable: false } });
}
if (!has("link")) {
  register({ type: "link", component: CellLink, config: { editable: false } });
}
if (!has("html")) {
  register({ type: "html", component: CellHtml, config: { editable: false } });
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
