/**
 * VcDataTable Utilities
 *
 * Shared utility functions used across the VcDataTable ecosystem.
 */

// Deep cloning utility for reactive objects
export { deepClone } from "@ui/components/organisms/vc-data-table/utils/deepClone";

// Column collection utility for declarative column API
export { ColumnCollector, type ColumnInstance } from "@ui/components/organisms/vc-data-table/utils/ColumnCollector";

// Pure helpers for VcColumn props — safe to import from anywhere
export {
  isSpecialColumn,
  getSpecialColumnWidth,
  SPECIAL_COLUMN_WIDTHS,
} from "@ui/components/organisms/vc-data-table/utils/columnHelpers";

// Re-export registries from composables
export {
  useCellRegistry,
  type CellType,
  type CellTypeConfig,
  type CellRegistration,
} from "@ui/components/organisms/vc-data-table/composables/useCellRegistry";
