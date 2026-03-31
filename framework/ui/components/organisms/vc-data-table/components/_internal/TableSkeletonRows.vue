<template>
  <div class="vc-data-table__skeleton">
    <!-- Column-aware skeleton when columns are available -->
    <template v-if="columns.length > 0">
      <TableRow
        v-for="rowIndex in rows"
        :key="rowIndex"
      >
        <TableCell
          v-if="showSelectionCell"
          class="vc-data-table__selection-cell"
          :line-clamp="0"
        >
          <VcSkeleton
            variant="circle"
            width="18px"
            height="18px"
          />
        </TableCell>
        <TableCell
          v-for="col in columns"
          :key="col.props.id"
          :width="getColumnWidth(col.props)"
          :style="getCellStyle(col.props)"
          :line-clamp="0"
        >
          <VcSkeleton v-bind="getSkeletonProps(col.props, rowIndex)" />
        </TableCell>
      </TableRow>
    </template>

    <!-- Fallback: simple full-width skeleton rows when columns aren't parsed yet -->
    <div
      v-for="rowIndex in rows"
      v-else
      :key="`fallback-${rowIndex}`"
      class="vc-data-table__skeleton-fallback-row"
    >
      <VcSkeleton
        variant="block"
        :width="ROW_WIDTHS[(rowIndex - 1) % ROW_WIDTHS.length]"
        height="16px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TableSkeletonRows — renders skeleton placeholder rows matching
 * the real column layout. Each cell gets a VcSkeleton shaped by
 * column type (image → square, status → badge, text → line, etc.).
 */
import type { ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";
import type { VcColumnProps } from "@ui/components/organisms/vc-data-table/types";
import TableRow from "@ui/components/organisms/vc-data-table/components/TableRow.vue";
import TableCell from "@ui/components/organisms/vc-data-table/components/TableCell.vue";
import VcSkeleton from "@ui/components/atoms/vc-skeleton/vc-skeleton.vue";

defineProps<{
  /** Visible columns to render skeleton cells for */
  columns: ColumnInstance[];
  /** Number of skeleton rows */
  rows: number;
  /** Column width resolver (same as used by real rows) */
  getColumnWidth: (col: VcColumnProps) => string | undefined;
  /** Cell style resolver (handles special columns: selection, expander, etc.) */
  getCellStyle: (col: VcColumnProps) => object | undefined;
  /** Whether to show a selection cell (checkbox/radio) before data cells */
  showSelectionCell?: boolean;
}>();

// Pseudo-random width per row index to avoid uniform look
const ROW_WIDTHS = ["95%", "80%", "88%", "72%", "90%"];

function getSkeletonProps(
  col: VcColumnProps,
  rowIndex: number,
): { variant: "block" | "circle"; width?: string; height?: string } {
  const type = col.type || "text";

  // Special columns: selection checkbox, expander, row reorder
  if (col.selectionMode) {
    return { variant: "circle", width: "18px", height: "18px" };
  }
  if (col.expander || col.rowReorder || col.rowEditor) {
    return { variant: "block", width: "20px", height: "20px" };
  }

  // Cell handles column width via getColumnWidth — skeleton fills the cell
  switch (type) {
    case "image":
      return { variant: "block", width: "36px", height: "36px" };
    case "status":
    case "status-icon":
      return { variant: "block", width: "100%", height: "22px" };
    default:
      return { variant: "block", width: "100%", height: "16px" };
  }
}
</script>

<style lang="scss">
.vc-data-table__skeleton {
  @apply tw-flex tw-flex-col tw-flex-auto tw-overflow-hidden;
}

.vc-data-table__skeleton-fallback-row {
  @apply tw-px-4 tw-py-[10px];
}
</style>
