import { ref, computed, Ref, toRaw } from "vue";
import { useForm, useFormContext } from "vee-validate";

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

  // VeeValidate form context:
  // If a parent form exists (e.g. blade's useForm), reuse it so <Field>
  // components register with the parent — blade.meta.valid then reflects
  // table cell errors. Only create own form when no parent exists.
  const parentForm = useFormContext();
  const ownForm = parentForm ? undefined : useForm();
  const activeForm = (parentForm ?? ownForm)!;
  const { meta, setFieldValue, errors: veeErrors, validate } = activeForm;

  // resetForm is only safe on our own form — resetting the parent
  // would wipe non-table fields (blade inputs, etc.).
  const safeResetForm = () => {
    if (ownForm) {
      ownForm.resetForm();
    }
  };

  // Track which cells have been modified (for pendingChanges calculation)
  const modifiedCells = ref<Map<string, unknown>>(new Map());

  // Track indices of newly added rows (for eager validation on mount)
  const newRowIndices = ref<Set<number>>(new Set());

  const clearNewRowFlag = (rowIndex: number) => {
    if (newRowIndices.value.has(rowIndex)) {
      const next = new Set(newRowIndices.value);
      next.delete(rowIndex);
      newRowIndices.value = next;
    }
  };

  const cellKey = (rowIndex: number, field: string) => `${rowIndex}:${field}`;

  // --- Lifecycle ---

  const startEditing = () => {
    snapshot = items.value.map((item) => safeClone(item));
    // Reset VeeValidate form state - this clears dirty, errors, and resets to initial state
    safeResetForm();
    // Clear modified cells tracking
    modifiedCells.value = new Map();
    isEditing.value = true;
  };

  const cancelEditing = () => {
    // Restore original values
    items.value.splice(0, items.value.length, ...snapshot.map((s) => safeClone(s)));
    // Reset VeeValidate form state
    safeResetForm();
    modifiedCells.value = new Map();
    isEditing.value = false;
    onCancel?.();
  };

  const saveChanges = async () => {
    // Run all validations via VeeValidate form context
    const { valid } = await validate();
    if (!valid) return;

    if (onSave) {
      await onSave(pendingChanges.value);
    }

    // Commit: clear dirty state, update snapshot
    snapshot = items.value.map((item) => safeClone(item));
    safeResetForm();
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

    const newIndex = items.value.length - 1;
    const next = new Set(newRowIndices.value);
    next.add(newIndex);
    newRowIndices.value = next;
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

    // Rebuild newRowIndices — shift indices above removed row
    const newNewRowIndices = new Set<number>();
    for (const idx of newRowIndices.value) {
      if (idx === rowIndex) continue;
      newNewRowIndices.add(idx > rowIndex ? idx - 1 : idx);
    }
    newRowIndices.value = newNewRowIndices;
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
    fieldId: field,
    fieldName: `${field}_${rowIndex}`,
    label: field,
    rowIndex,
    rules: cellRules,
    onUpdate: (payload: { field: string; value: unknown }) => {
      updateCell(rowIndex, payload.field, payload.value);
    },
    onBlur: (_payload: { row: number | undefined; field: string }) => {
      // No manual validation needed — Field handles it
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
    isValid,
    pendingChanges,
    addRow,
    removeRow,
    getCellEditProps,
    newRowIndices,
    clearNewRowFlag,
  };
}
