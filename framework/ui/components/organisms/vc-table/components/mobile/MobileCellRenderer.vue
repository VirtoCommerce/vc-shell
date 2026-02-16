<template>
  <!-- Custom body slot from VcColumn (takes priority) -->
  <template v-if="config.column.slots.body || config.column.slots.default">
    <SlotProxy
      :slot-fn="(config.column.slots.body || config.column.slots.default)!"
      :scope="{
        data: item,
        field: fieldName,
        index
      }"
    />
  </template>

  <!-- Type-specific cell formatters -->
  <DynamicCellRenderer
    v-else
    :type="config.type || 'text'"
    :value="cellValue"
    :currency="currency"
    :format="config.column.props.format"
    :variant="dateVariant"
  />
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * MobileCellRenderer - Renders cell content in mobile card view
 *
 * Simplified version of DataTableCellRenderer for mobile cards.
 * Does not support editing, selection, or special columns (those are handled separately).
 */
import { computed } from "vue";
import * as _ from "lodash-es";
import type { MobileColumnConfig } from "../../types";
import DynamicCellRenderer from "../cells/DynamicCellRenderer.vue";
import { SlotProxy } from "../_internal/SlotProxy";

const props = defineProps<{
  /** Mobile column configuration */
  config: MobileColumnConfig;
  /** Row data item */
  item: T;
  /** Row index */
  index: number;
}>();

// Field name from column
const fieldName = computed(() => props.config.field || props.config.id);

// Get cell value using lodash _.get for nested fields
const cellValue = computed(() => {
  return _.get(props.item, fieldName.value || "");
});

// Currency for money cells
const currency = computed(() => {
  const field = props.config.column.props.currencyField || "currency";
  return (props.item as Record<string, unknown>)[field] as string || "USD";
});

// Date variant based on column type
const dateVariant = computed<"date" | "time" | "date-time">(() => {
  const type = props.config.type;
  if (type === "time") return "time";
  if (type === "datetime") return "date-time";
  return "date";
});
</script>
