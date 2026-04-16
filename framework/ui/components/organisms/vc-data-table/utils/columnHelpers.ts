/**
 * Pure helper functions for VcColumn props.
 *
 * Extracted into a standalone module so they can be imported from anywhere
 * without creating composable init-order dependencies.
 */
import type { VcColumnProps } from "@ui/components/organisms/vc-data-table/types";

/**
 * A "special" column is one that's infrastructural (selection checkbox,
 * row reorder handle, row expander, row editor) rather than a data column.
 *
 * Special columns have hardcoded widths and are NOT part of the width engine.
 */
export function isSpecialColumn(col: VcColumnProps): boolean {
  return !!(col.selectionMode || col.rowReorder || col.expander || col.rowEditor);
}

/**
 * Hardcoded pixel widths for special columns.
 * These are rendered by VcColumn with fixed styles set in
 * useTableColumns.getHeaderStyle / getCellStyle.
 */
export const SPECIAL_COLUMN_WIDTHS = {
  selection: 40,
  rowReorder: 50,
  expander: 50,
  rowEditor: 100,
} as const;

/**
 * Returns the fixed pixel width of a special column, or 0 if not special.
 */
export function getSpecialColumnWidth(col: VcColumnProps): number {
  if (col.selectionMode) return SPECIAL_COLUMN_WIDTHS.selection;
  if (col.rowReorder) return SPECIAL_COLUMN_WIDTHS.rowReorder;
  if (col.expander) return SPECIAL_COLUMN_WIDTHS.expander;
  if (col.rowEditor) return SPECIAL_COLUMN_WIDTHS.rowEditor;
  return 0;
}
