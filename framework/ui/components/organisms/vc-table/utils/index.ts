/**
 * VcDataTable Utilities
 *
 * Shared utility functions used across the VcDataTable ecosystem.
 */

// Deep cloning utility for reactive objects
export { deepClone } from "./deepClone";

// Column collection utility for declarative column API
export { ColumnCollector, type ColumnInstance } from "./ColumnCollector";

// Re-export registries from composables
export {
  useCellRegistry,
  type CellType,
  type CellTypeConfig,
  type CellRegistration,
} from "../composables/useCellRegistry";
