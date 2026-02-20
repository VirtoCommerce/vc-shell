/**
 * VcDataTable Utilities
 *
 * Shared utility functions used across the VcDataTable ecosystem.
 */

// Deep cloning utility for reactive objects
export { deepClone } from "@ui/components/organisms/vc-table/utils/deepClone";

// Column collection utility for declarative column API
export { ColumnCollector, type ColumnInstance } from "@ui/components/organisms/vc-table/utils/ColumnCollector";

// Re-export registries from composables
export {
  useCellRegistry,
  type CellType,
  type CellTypeConfig,
  type CellRegistration,
} from "@ui/components/organisms/vc-table/composables/useCellRegistry";
