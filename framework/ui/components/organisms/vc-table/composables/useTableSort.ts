/**
 * useTableSort - Composable for table sorting functionality
 *
 * Handles single and multi-sort modes with removable sort support.
 * Extracted from VcDataTable.vue for better modularity.
 *
 * Inspired by PrimeVue DataTable sorting patterns.
 */
import { computed, ref, watch, type Ref, type ComputedRef } from "vue";
import type { SortMeta } from "../types";

export interface UseTableSortOptions {
  /** Current sort field (for single sort mode) */
  sortField: Ref<string | undefined>;
  /** Current sort order: 1 = asc, -1 = desc, 0 = none */
  sortOrder: Ref<number>;
  /** Sort mode: single or multiple */
  sortMode: Ref<"single" | "multiple">;
  /** Multi-sort metadata array */
  multiSortMeta: Ref<SortMeta[]>;
  /** Allow removing sort by cycling through asc -> desc -> none */
  removableSort: Ref<boolean>;
  /** Callback when sort changes */
  onSort?: (event: SortEvent) => void;
}

export interface SortEvent {
  sortField?: string;
  sortOrder?: number;
  multiSortMeta?: SortMeta[];
}

export interface UseTableSortReturn {
  /** Handle sort click on column header */
  handleSort: (field: string, event?: Event) => void;
  /** Get sort direction for a field */
  getSortDirection: (field: string) => "asc" | "desc" | undefined;
  /** Get sort index for multi-sort (1-based for display) */
  getSortIndex: (field: string) => number | undefined;
  /** Check if field is currently sorted */
  isSorted: (field: string) => boolean;
  /** Internal sort field state */
  internalSortField: Ref<string | undefined>;
  /** Internal sort order state */
  internalSortOrder: Ref<number>;
  /** Internal multi-sort meta state */
  internalMultiSortMeta: Ref<SortMeta[]>;
}

export function useTableSort(options: UseTableSortOptions): UseTableSortReturn {
  const {
    sortField,
    sortOrder,
    sortMode,
    multiSortMeta,
    removableSort,
    onSort,
  } = options;

  // Internal state (initialized from props, kept in sync via watchers below)
  const internalSortField = ref<string | undefined>(sortField.value);
  const internalSortOrder = ref<number>(sortOrder.value ?? 0);
  const internalMultiSortMeta = ref<SortMeta[]>([...(multiSortMeta.value || [])]);

  // Sync internal state when props change from the parent.
  // This is critical for adapter/controlled usage where the parent manages
  // the sort cycle independently (e.g. VcTableAdapter + legacy onHeaderClick).
  // Without these watchers, VcDataTable's internal sort state drifts from the
  // parent's props since both advance their own cycle on each click.
  watch(
    () => [sortField.value, sortOrder.value, multiSortMeta.value] as const,
    ([field, order, meta]) => {
      internalSortField.value = field;
      internalSortOrder.value = order ?? 0;
      internalMultiSortMeta.value = [...(meta || [])];
    },
  );

  /**
   * Handle sort click on column header
   */
  const handleSort = (field: string, event?: Event): void => {
    if (sortMode.value === "multiple") {
      handleMultiSort(field, event);
    } else {
      handleSingleSort(field);
    }
  };

  /**
   * Handle single sort mode
   */
  const handleSingleSort = (field: string): void => {
    let newOrder: 1 | -1 | 0 = 1;

    if (internalSortField.value === field) {
      if (internalSortOrder.value === 1) {
        newOrder = -1;
      } else if (internalSortOrder.value === -1) {
        newOrder = removableSort.value ? 0 : 1;
      }
    }

    internalSortField.value = newOrder === 0 ? undefined : field;
    internalSortOrder.value = newOrder;

    onSort?.({
      sortField: newOrder === 0 ? undefined : field,
      sortOrder: newOrder,
    });
  };

  /**
   * Handle multi-sort mode
   */
  const handleMultiSort = (field: string, event?: Event): void => {
    const currentMeta = [...internalMultiSortMeta.value];
    const existingIndex = currentMeta.findIndex((m) => m.field === field);
    const isCtrlClick = (event as MouseEvent | KeyboardEvent | undefined)?.ctrlKey || (event as MouseEvent | KeyboardEvent | undefined)?.metaKey;

    if (isCtrlClick) {
      // Ctrl+click: add to or toggle existing sort
      if (existingIndex >= 0) {
        const existing = currentMeta[existingIndex];
        if (existing.order === 1) {
          existing.order = -1;
        } else if (existing.order === -1) {
          if (removableSort.value) {
            // Remove from sort
            currentMeta.splice(existingIndex, 1);
          } else {
            existing.order = 1;
          }
        }
      } else {
        // Add new sort field
        currentMeta.push({ field, order: 1 });
      }
    } else {
      // Regular click: replace all sorts with this column
      if (existingIndex >= 0 && currentMeta.length === 1) {
        // Toggle existing single sort
        const existing = currentMeta[0];
        if (existing.order === 1) {
          existing.order = -1;
        } else if (existing.order === -1) {
          if (removableSort.value) {
            currentMeta.splice(0, 1);
          } else {
            existing.order = 1;
          }
        }
      } else {
        // Replace with new single sort
        currentMeta.length = 0;
        currentMeta.push({ field, order: 1 });
      }
    }

    internalMultiSortMeta.value = currentMeta;

    onSort?.({
      multiSortMeta: currentMeta,
    });
  };

  /**
   * Get sort direction for a field
   */
  const getSortDirection = (field: string): "asc" | "desc" | undefined => {
    if (sortMode.value === "multiple") {
      const meta = internalMultiSortMeta.value.find((m) => m.field === field);
      if (meta) {
        return meta.order === 1 ? "asc" : meta.order === -1 ? "desc" : undefined;
      }
      return undefined;
    }

    // Single sort mode
    if (internalSortField.value === field) {
      return internalSortOrder.value === 1
        ? "asc"
        : internalSortOrder.value === -1
          ? "desc"
          : undefined;
    }
    return undefined;
  };

  /**
   * Get sort index for multi-sort (1-based for display)
   */
  const getSortIndex = (field: string): number | undefined => {
    if (sortMode.value !== "multiple") return undefined;

    const meta = internalMultiSortMeta.value;
    if (meta.length <= 1) return undefined;

    const index = meta.findIndex((m) => m.field === field);
    return index >= 0 ? index + 1 : undefined;
  };

  /**
   * Check if field is currently sorted
   */
  const isSorted = (field: string): boolean => {
    return getSortDirection(field) !== undefined;
  };

  return {
    handleSort,
    getSortDirection,
    getSortIndex,
    isSorted,
    internalSortField,
    internalSortOrder,
    internalMultiSortMeta,
  };
}

export default useTableSort;
