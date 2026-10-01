<template>
  <!-- In cell edit mode a field opens the same editor a table cell does; it stops the tap
       from reaching the card, which would treat it as a row click. -->
  <div
    :class="canEdit ? 'vc-mobile-cell-renderer--editable' : 'vc-mobile-cell-renderer--static'"
    :role="canEdit && !isEditing ? 'button' : undefined"
    :tabindex="canEdit && !isEditing ? 0 : undefined"
    @click="onClick"
    @keydown.enter.self.prevent="startEdit"
  >
    <DataTableCellRenderer
      v-if="isEditing"
      :column="config.column"
      :item="item"
      :editing-row-data="cellEdit!.getEditingRowData(item, index)"
      :index="index"
      is-cell-editing
      @edit-complete="cellEdit!.complete(item, fieldName, index, $event)"
      @edit-cancel="cellEdit!.cancel(item, fieldName, index)"
    />
    <template v-else>
      <!-- Custom body slot from VcColumn (takes priority) -->
      <template v-if="config.column.slots.body || config.column.slots.default">
        <SlotProxy
          :slot-fn="(config.column.slots.body || config.column.slots.default)!"
          :scope="{
            data: item,
            field: fieldName,
            index,
          }"
        />
      </template>

      <!-- Type-specific cell formatters -->
      <DynamicCellRenderer
        v-else
        :type="config.type || 'text'"
        :value="cellValue"
        :editable="isInlineEditing && config.column.props.editable"
        :label="config.column.props.title || fieldName"
        :field-name="uniqueFieldName"
        :field-id="fieldName"
        :rules="config.column.props.rules"
        :row-index="index"
        :currency="currency"
        :format="config.column.props.format"
        :variant="dateVariant"
        :validate-on-mount="validateOnMount"
        @update="$emit('update', $event)"
        @blur="$emit('blur', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * MobileCellRenderer - Renders cell content in mobile card view
 *
 * Simplified version of DataTableCellRenderer for mobile cards.
 * Edits only in cell edit mode, through DataTableCellRenderer. Selection and special columns
 * are handled separately.
 */
import { computed, inject } from "vue";
import { get } from "lodash-es";
import type { MobileColumnConfig } from "@ui/components/organisms/vc-data-table/types";
import DynamicCellRenderer from "@ui/components/organisms/vc-data-table/components/cells/DynamicCellRenderer.vue";
import { SlotProxy } from "@ui/components/organisms/vc-data-table/components/_internal/SlotProxy";
import DataTableCellRenderer from "@ui/components/organisms/vc-data-table/components/DataTableCellRenderer.vue";
import { MobileCellEditKey } from "@ui/components/organisms/vc-data-table/keys";

const props = defineProps<{
  /** Mobile column configuration */
  config: MobileColumnConfig;
  /** Row data item */
  item: T;
  /** Row index */
  index: number;
  /** Whether inline editing is active */
  isInlineEditing?: boolean;
  /** Unique field name for VeeValidate */
  uniqueFieldName?: string;
  /** Whether to validate on mount */
  validateOnMount?: boolean;
}>();

defineEmits<{
  (e: "update", payload: { field: string; value: unknown }): void;
  (e: "blur", payload: { row: number | undefined; field: string }): void;
}>();

// Field name from column
const fieldName = computed(() => props.config.field || props.config.id);

const cellEdit = inject(MobileCellEditKey, null);

const canEdit = computed(
  () => !!cellEdit?.enabled() && !!(props.config.column.slots.editor || props.config.column.props.editable),
);
const isEditing = computed(() => canEdit.value && cellEdit!.isCellEditing(props.index, fieldName.value));

const startEdit = () => cellEdit!.start(props.item, fieldName.value, props.index, props.config.column);

const onClick = (event: MouseEvent) => {
  if (!canEdit.value) return;
  event.stopPropagation();
  if (!isEditing.value) startEdit();
};

// Get cell value using lodash _.get for nested fields
const cellValue = computed(() => {
  return get(props.item, fieldName.value || "");
});

// Currency for money cells
const currency = computed(() => {
  const field = props.config.column.props.currencyField || "currency";
  return ((props.item as Record<string, unknown>)[field] as string) || "USD";
});

// Date variant based on column type
const dateVariant = computed<"date" | "time" | "date-time">(() => {
  const type = props.config.type;
  if (type === "time") return "time";
  if (type === "datetime") return "date-time";
  return "date";
});
</script>

<style lang="scss">
.vc-mobile-cell-renderer {
  &--static {
    display: contents;
  }

  &--editable {
    @apply tw-block tw-min-w-0 tw-cursor-pointer;
  }
}
</style>
