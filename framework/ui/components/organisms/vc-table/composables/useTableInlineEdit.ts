import { ref, computed, Ref, toRaw } from "vue";
import { useForm } from "vee-validate";

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

export interface EditChange<T> {
  rowIndex: number;
  row: T;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface UseTableInlineEditOptions<T extends Record<string, any>> {
  /** Reactive array of table items */
  items: Ref<T[]>;
  /** Validation rules: field → validator function returning error string or `true` */
  rules?: Record<string, (value: unknown, row: T) => string | true>;
  /** Called on every cell update */
  onCellUpdate?: (rowIndex: number, field: string, value: unknown, row: T) => void;
  /** Called when user commits changes */
  onSave?: (changes: EditChange<T>[]) => void | Promise<void>;
  /** Called when user cancels editing */
  onCancel?: () => void;
}

/**
 * Composable for inline table editing.
 *
 * Uses VeeValidate's useForm for reliable dirty/valid state tracking and error management.
 * Provides `getCellEditProps()` to eliminate boilerplate when binding
 * editable cell formatters (`CellDefault`, `CellNumber`, `CellMoney`).
 *
 * @example
 * ```ts
 * const inlineEdit = useTableInlineEdit({ items: tableItems });
 *
 * // In template:
 * // <CellMoney v-bind="inlineEdit.getCellEditProps(index, 'price', { required: true })" />
 * ```
 */
export function useTableInlineEdit<T extends Record<string, any>>(
  options: UseTableInlineEditOptions<T>,
) {
  const { items, rules, onCellUpdate, onSave, onCancel } = options;

  const isEditing = ref(false);

  // Snapshot of original values before editing started (deep clone)
  let snapshot: T[] = [];

  // VeeValidate form for dirty/valid tracking and error management
  // We use useForm to leverage VeeValidate's built-in:
  // - meta.dirty for dirty state tracking
  // - meta.valid for validation state
  // - errors for error messages
  // - setFieldError for setting custom validation errors
  const { meta, resetForm, setFieldValue, setFieldError, errors: veeErrors } = useForm();

  // Track which cells have been modified (for pendingChanges calculation)
  const modifiedCells = ref<Map<string, unknown>>(new Map());

  const cellKey = (rowIndex: number, field: string) => `${rowIndex}:${field}`;

  // --- Lifecycle ---

  const startEditing = () => {
    snapshot = items.value.map((item) => safeClone(item));
    // Reset VeeValidate form state - this clears dirty, errors, and resets to initial state
    resetForm();
    // Clear modified cells tracking
    modifiedCells.value = new Map();
    isEditing.value = true;
  };

  const cancelEditing = () => {
    // Restore original values
    items.value.splice(0, items.value.length, ...snapshot.map((s) => safeClone(s)));
    // Reset VeeValidate form state
    resetForm();
    modifiedCells.value = new Map();
    isEditing.value = false;
    onCancel?.();
  };

  const saveChanges = async () => {
    // Run all validations first
    validateAll();
    if (!isValid.value) return;

    if (onSave) {
      await onSave(pendingChanges.value);
    }

    // Commit: clear dirty state, update snapshot
    snapshot = items.value.map((item) => safeClone(item));
    resetForm();
    modifiedCells.value = new Map();
    isEditing.value = false;
  };

  // --- Cell operations ---

  const updateCell = (rowIndex: number, field: string, value: unknown) => {
    if (rowIndex < 0 || rowIndex >= items.value.length) return;

    const key = cellKey(rowIndex, field);
    const row = items.value[rowIndex];

    // Update value in items array
    (row as any)[field] = value;

    // Track modified cell for pendingChanges
    const newModified = new Map(modifiedCells.value);
    newModified.set(key, value);
    modifiedCells.value = newModified;

    // Update VeeValidate field to trigger dirty tracking
    // This marks the form as dirty via VeeValidate's internal mechanism
    setFieldValue(key, value);

    // Validate with custom rules
    validateCell(rowIndex, field, value, row);

    onCellUpdate?.(rowIndex, field, value, row);
  };

  const getCellValue = (rowIndex: number, field: string): unknown => {
    if (rowIndex < 0 || rowIndex >= items.value.length) return undefined;
    return items.value[rowIndex][field];
  };

  const isCellDirty = (rowIndex: number, field: string): boolean => {
    return modifiedCells.value.has(cellKey(rowIndex, field));
  };

  // --- Validation ---

  const validateCell = (rowIndex: number, field: string, value: unknown, row: T) => {
    const key = cellKey(rowIndex, field);
    const rule = rules?.[field];

    if (rule) {
      const result = rule(value, row);
      if (result !== true) {
        // Set error via VeeValidate
        setFieldError(key, result);
        return;
      }
    }
    // Clear error via VeeValidate (passing undefined clears the error)
    setFieldError(key, undefined);
  };

  const validateAll = () => {
    if (!rules) return;
    for (let i = 0; i < items.value.length; i++) {
      const row = items.value[i];
      for (const field of Object.keys(rules)) {
        validateCell(i, field, row[field], row);
      }
    }
  };

  const getCellError = (rowIndex: number, field: string): string | undefined => {
    const key = cellKey(rowIndex, field);
    return veeErrors.value[key];
  };

  // Use VeeValidate's meta.valid for validation state
  const isValid = computed(() => meta.value.valid);

  // --- Computed changes ---

  const pendingChanges = computed<EditChange<T>[]>(() => {
    const changes: EditChange<T>[] = [];
    for (const [key, newValue] of modifiedCells.value.entries()) {
      const [rowStr, field] = key.split(":");
      const rowIndex = parseInt(rowStr, 10);
      const oldValue = snapshot[rowIndex]?.[field];
      if (oldValue !== newValue) {
        changes.push({
          rowIndex,
          row: items.value[rowIndex],
          field,
          oldValue,
          newValue,
        });
      }
    }
    return changes;
  });

  // isDirty based on actual changes (comparing with snapshot)
  // This is more reliable than VeeValidate's meta.dirty because:
  // 1. VeeValidate tracks all setFieldValue calls, but we don't set initial values
  // 2. Our snapshot comparison accurately reflects what the user has actually changed
  const isDirty = computed(() => pendingChanges.value.length > 0);

  // --- Row operations ---

  const addRow = (defaults?: Partial<T>) => {
    const newRow = (defaults ?? {}) as T;
    items.value.push(newRow);
  };

  const removeRow = (rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= items.value.length) return;
    items.value.splice(rowIndex, 1);

    // Clean up modified cells — rebuild keys above removed index
    const newModified = new Map<string, unknown>();
    for (const [key, val] of modifiedCells.value.entries()) {
      const [rowStr, field] = key.split(":");
      const idx = parseInt(rowStr, 10);
      if (idx === rowIndex) continue; // removed
      const newIdx = idx > rowIndex ? idx - 1 : idx;
      newModified.set(cellKey(newIdx, field), val);
    }
    modifiedCells.value = newModified;

    // Note: VeeValidate errors are keyed by the old cell keys.
    // After row removal, we need to re-validate to update error keys.
    // For simplicity, we clear all errors and re-validate modified cells.
    resetForm({ values: {}, errors: {} });
    for (const [key] of newModified.entries()) {
      const [rowStr, field] = key.split(":");
      const idx = parseInt(rowStr, 10);
      const row = items.value[idx];
      if (row) {
        validateCell(idx, field, row[field], row);
      }
    }
  };

  // --- Head props helper ---

  /**
   * Returns props to spread onto an editable cell formatter (`CellDefault`, `CellNumber`, `CellMoney`).
   *
   * Eliminates boilerplate for editable cells:
   * ```vue
   * <CellMoney v-bind="inlineEdit.getCellEditProps(index, 'price', { required: true })" />
   * ```
   */
  const getCellEditProps = (rowIndex: number, field: string, cellRules?: Record<string, unknown>) => ({
    editable: isEditing.value,
    fieldId: `items[${rowIndex}].${field}`,
    fieldName: `items[${rowIndex}].${field}`,
    label: field,
    rowIndex,
    rules: cellRules,
    onUpdate: (payload: { field: string; value: unknown }) => {
      updateCell(rowIndex, payload.field, payload.value);
    },
    onBlur: (_payload: { row: number | undefined; field: string }) => {
      // Trigger validation on blur
      const row = items.value[rowIndex];
      if (row) {
        validateCell(rowIndex, field, row[field], row);
      }
    },
  });

  return {
    isEditing,
    startEditing,
    cancelEditing,
    saveChanges,
    updateCell,
    getCellValue,
    isCellDirty,
    isDirty,
    errors: veeErrors,
    getCellError,
    isValid,
    pendingChanges,
    addRow,
    removeRow,
    getCellEditProps,
  };
}
