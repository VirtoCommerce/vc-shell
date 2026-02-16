/**
 * useTableEditing - Composable for cell and row editing (PrimeVue-style)
 *
 * Supports two editing modes:
 * - cell: Click on a cell to edit it inline
 * - row: Edit/Save/Cancel buttons per row
 *
 * This is different from useTableInlineEdit which handles bulk editing mode.
 * Extracted from VcDataTable.vue for better modularity.
 *
 * Inspired by PrimeVue DataTable editMode patterns.
 */
import { ref, watch, toRaw, type Ref, type ComputedRef } from "vue";

/**
 * Safe deep clone that handles Date objects and other non-serializable types.
 * Falls back to JSON serialization with Date support when structuredClone fails.
 */
function safeClone<T>(obj: T): T {
  try {
    return structuredClone(toRaw(obj));
  } catch {
    // Fallback: deep clone with Date support
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => {
        if (value instanceof Date) {
          return { __type: "Date", value: value.toISOString() };
        }
        return value;
      }),
      (_key, value) => {
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      }
    );
  }
}

export interface UseTableEditingOptions<T> {
  /** Editing mode: cell or row */
  editMode: Ref<"cell" | "row" | undefined>;
  /** External editing rows (v-model:editingRows) */
  editingRows?: Ref<T[] | undefined>;
  /** Data key field for item identification */
  dataKey: string;
  /** Function to get unique key for an item */
  getItemKey: (item: T, index: number) => string;
}

export interface CellEditEvent<T> {
  data: T;
  field: string;
  index: number;
}

export interface CellEditCompleteEvent<T> extends CellEditEvent<T> {
  newValue: unknown;
}

export interface RowEditEvent<T> {
  data: T;
  index: number;
}

export interface RowEditSaveEvent<T> extends RowEditEvent<T> {
  newData: T;
}

/** Editing metadata for a row - stores copy of data being edited */
export interface EditingMeta<T> {
  data: T;
  fields: string[];
}

export interface UseTableEditingReturn<T> {
  // State
  /** Currently editing cell (for cell mode) */
  editingCell: Ref<{ rowIndex: number; field: string } | null>;
  /** Internal array of rows being edited (for row mode) */
  internalEditingRows: Ref<T[]>;
  /** Snapshot of row data before editing (for cancel) */
  editingRowSnapshot: Ref<Map<string, T>>;
  /** Editing metadata - stores copies of rows being edited (PrimeVue-style) */
  editingMeta: Ref<Record<number, EditingMeta<T>>>;

  // Cell editing methods
  /** Check if a specific cell is being edited */
  isCellEditing: (rowIndex: number, field: string) => boolean;
  /** Start editing a cell */
  startCellEdit: (item: T, field: string, rowIndex: number) => CellEditEvent<T>;
  /** Complete cell editing with new value */
  completeCellEdit: (item: T, field: string, rowIndex: number, newValue: unknown) => CellEditCompleteEvent<T>;
  /** Cancel cell editing */
  cancelCellEdit: (item: T, field: string, rowIndex: number) => CellEditEvent<T>;
  /** Get the editing data for a row (copy that user edits) */
  getEditingRowData: (item: T, rowIndex: number) => T;

  // Row editing methods
  /** Check if a specific row is being edited */
  isRowEditing: (item: T) => boolean;
  /** Start editing a row */
  startRowEdit: (item: T, rowIndex: number) => RowEditEvent<T>;
  /** Save row editing */
  saveRowEdit: (item: T, rowIndex: number) => RowEditSaveEvent<T>;
  /** Cancel row editing (restores original data) */
  cancelRowEdit: (item: T, rowIndex: number) => RowEditEvent<T>;
}

export function useTableEditing<T extends Record<string, unknown>>(
  options: UseTableEditingOptions<T>
): UseTableEditingReturn<T> {
  const { editMode, editingRows, getItemKey } = options;

  // ============================================================================
  // Cell Editing State
  // ============================================================================

  /** Currently editing cell: { rowIndex, field } */
  const editingCell = ref<{ rowIndex: number; field: string } | null>(null);

  /**
   * Editing metadata - stores copies of rows being edited.
   * Key is rowIndex, value is { data: copy of row, fields: array of fields being edited }
   * This prevents re-renders when user types - they edit the copy, not the original.
   */
  const editingMeta = ref<Record<number, EditingMeta<T>>>({}) as Ref<Record<number, EditingMeta<T>>>;

  // ============================================================================
  // Row Editing State
  // ============================================================================

  /** Internal array of rows currently being edited */
  const internalEditingRows = ref<T[]>([]) as Ref<T[]>;

  /** Snapshot of row data before editing (for cancel/restore) */
  const editingRowSnapshot = ref<Map<string, T>>(new Map()) as Ref<Map<string, T>>;

  // Sync editingRows with external prop
  watch(
    () => editingRows?.value,
    (newVal) => {
      if (newVal !== undefined) {
        internalEditingRows.value = [...newVal];
      }
    },
    { immediate: true }
  );

  // ============================================================================
  // Cell Editing Methods
  // ============================================================================

  /**
   * Check if a specific cell is being edited
   */
  const isCellEditing = (rowIndex: number, field: string): boolean => {
    if (editMode.value === "cell") {
      return (
        editingCell.value?.rowIndex === rowIndex &&
        editingCell.value?.field === field
      );
    }
    return false;
  };

  /**
   * Start editing a cell - creates a copy of the row data in editingMeta
   */
  const startCellEdit = (item: T, field: string, rowIndex: number): CellEditEvent<T> => {
    if (editMode.value !== "cell") {
      return { data: item, field, index: rowIndex };
    }

    editingCell.value = { rowIndex, field };

    // Create or update editingMeta for this row (PrimeVue pattern)
    const meta = editingMeta.value[rowIndex];
    if (!meta) {
      // Create a copy of the row data - user will edit this copy
      editingMeta.value = {
        ...editingMeta.value,
        [rowIndex]: {
          data: safeClone(item),
          fields: [field],
        },
      };
    } else {
      // Add field to existing meta
      if (!meta.fields.includes(field)) {
        meta.fields.push(field);
      }
    }

    return { data: item, field, index: rowIndex };
  };

  /**
   * Get the editing data for a row.
   * Returns the copy from editingMeta if editing, otherwise the original item.
   * This is what should be passed to editor slot - edits go to the copy, not the original.
   */
  const getEditingRowData = (item: T, rowIndex: number): T => {
    const meta = editingMeta.value[rowIndex];
    return meta ? meta.data : item;
  };

  /**
   * Complete cell editing with new value.
   * Clears editingMeta for this row - the new value should be applied by the parent.
   */
  const completeCellEdit = (
    item: T,
    field: string,
    rowIndex: number,
    newValue: unknown
  ): CellEditCompleteEvent<T> => {
    if (editMode.value !== "cell") {
      return { data: item, field, newValue, index: rowIndex };
    }

    // Get the edited data from meta before clearing
    const meta = editingMeta.value[rowIndex];
    const editedData = meta?.data;

    // Clear editing state
    editingCell.value = null;

    // Clean up editingMeta
    if (meta) {
      const fields = meta.fields.filter((f) => f !== field);
      if (fields.length === 0) {
        const newMeta = { ...editingMeta.value };
        delete newMeta[rowIndex];
        editingMeta.value = newMeta;
      } else {
        editingMeta.value = {
          ...editingMeta.value,
          [rowIndex]: { ...meta, fields },
        };
      }
    }

    // Return event with both original and new value
    // newValue comes from editingMeta if available
    const finalNewValue = editedData ? (editedData as Record<string, unknown>)[field] : newValue;
    return { data: item, field, newValue: finalNewValue, index: rowIndex };
  };

  /**
   * Cancel cell editing - discards the copy in editingMeta
   */
  const cancelCellEdit = (item: T, field: string, rowIndex: number): CellEditEvent<T> => {
    if (editMode.value !== "cell") {
      return { data: item, field, index: rowIndex };
    }

    // Clear editing state
    editingCell.value = null;

    // Clean up editingMeta (discard the copy)
    const meta = editingMeta.value[rowIndex];
    if (meta) {
      const fields = meta.fields.filter((f) => f !== field);
      if (fields.length === 0) {
        const newMeta = { ...editingMeta.value };
        delete newMeta[rowIndex];
        editingMeta.value = newMeta;
      } else {
        editingMeta.value = {
          ...editingMeta.value,
          [rowIndex]: { ...meta, fields },
        };
      }
    }

    return { data: item, field, index: rowIndex };
  };

  // ============================================================================
  // Row Editing Methods
  // ============================================================================

  /**
   * Check if a specific row is being edited
   */
  const isRowEditing = (item: T): boolean => {
    const key = getItemKey(item, -1);
    return internalEditingRows.value.some(
      (row) => getItemKey(row, -1) === key
    );
  };

  /**
   * Start editing a row
   */
  const startRowEdit = (item: T, rowIndex: number): RowEditEvent<T> => {
    if (editMode.value !== "row") {
      return { data: item, index: rowIndex };
    }

    const key = getItemKey(item, rowIndex);

    // Store snapshot for cancel
    editingRowSnapshot.value.set(key, safeClone(item));

    // Add to editing rows
    internalEditingRows.value = [...internalEditingRows.value, item];

    return { data: item, index: rowIndex };
  };

  /**
   * Save row editing
   */
  const saveRowEdit = (item: T, rowIndex: number): RowEditSaveEvent<T> => {
    if (editMode.value !== "row") {
      return { data: item, newData: item, index: rowIndex };
    }

    const key = getItemKey(item, rowIndex);
    const originalData = editingRowSnapshot.value.get(key);

    // Remove from editing
    internalEditingRows.value = internalEditingRows.value.filter(
      (row) => getItemKey(row, -1) !== key
    );
    editingRowSnapshot.value.delete(key);

    return {
      data: originalData || item,
      newData: item,
      index: rowIndex,
    };
  };

  /**
   * Cancel row editing (restores original data)
   */
  const cancelRowEdit = (item: T, rowIndex: number): RowEditEvent<T> => {
    if (editMode.value !== "row") {
      return { data: item, index: rowIndex };
    }

    const key = getItemKey(item, rowIndex);
    const originalData = editingRowSnapshot.value.get(key);

    // Restore original data
    if (originalData) {
      Object.assign(item, originalData);
    }

    // Remove from editing
    internalEditingRows.value = internalEditingRows.value.filter(
      (row) => getItemKey(row, -1) !== key
    );
    editingRowSnapshot.value.delete(key);

    return { data: item, index: rowIndex };
  };

  return {
    // State
    editingCell,
    internalEditingRows,
    editingRowSnapshot,
    editingMeta,

    // Cell editing
    isCellEditing,
    startCellEdit,
    completeCellEdit,
    cancelCellEdit,
    getEditingRowData,

    // Row editing
    isRowEditing,
    startRowEdit,
    saveRowEdit,
    cancelRowEdit,
  };
}

export default useTableEditing;
